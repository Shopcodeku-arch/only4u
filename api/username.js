const { auth, db, USER_RE, emailOf, send } = require('./_fb');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') {
    const username = String(req.query.check || '').trim().toLowerCase();
    if (!USER_RE.test(username) || /^admin/.test(username)) return send(res, 200, { available: false });
    try {
      const claim = await db.doc('usernameClaims/' + username).get();
      const users = await db.collection('users').get();
      const used = users.docs.some(d => String(d.get('username') || '').trim().toLowerCase() === username);
      return send(res, 200, { available: !claim.exists && !used });
    } catch (e) { return send(res, 500, { error: 'Tidak dapat mengecek username' }); }
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'Method tidak diizinkan' });
  try {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : '';
    if (!token) return send(res, 401, { error: 'Silakan masuk ulang' });
    const decoded = await auth.verifyIdToken(token);
    const uid = decoded.uid;
    const username = String((req.body || {}).username || '').trim().toLowerCase();
    const initialRequested = !!(req.body || {}).initial;
    const photo = typeof req.body.photo === 'string' ? req.body.photo : '';
    if (!USER_RE.test(username) || /^admin/.test(username)) return send(res, 400, { error: 'Format username tidak valid' });
    if (photo.length > 150000 || (photo && !/^https:\/\//.test(photo) && !/^data:image\//.test(photo))) return send(res, 400, { error: 'Foto profil tidak valid' });

    const userRef = db.doc('users/' + uid);
    const oldSnap = await userRef.get();
    if (!oldSnap.exists) return send(res, 404, { error: 'Profil akun tidak ditemukan' });
    const oldName = String(oldSnap.get('username') || '').toLowerCase();
    const initial = initialRequested && oldName === username;
    const now = Date.now();
    if (username !== oldName && !initial) {
      const last = Number(oldSnap.get('lastUsernameChange') || 0);
      const remaining = 7 * 24 * 60 * 60 * 1000 - (now - last);
      if (remaining > 0) return send(res, 429, { error: 'Username hanya bisa diganti setiap 7 hari. Coba lagi dalam ' + Math.ceil(remaining / 86400000) + ' hari.' });
    }

    const authUser = await auth.getUser(uid);
    const hasPassword = (authUser.providerData || []).some(p => p.providerId === 'password');
    const oldEmail = authUser.email;
    const newEmail = emailOf(username);
    let emailChanged = false;
    if (hasPassword && oldEmail !== newEmail) {
      await auth.updateUser(uid, { email: newEmail, emailVerified: false });
      emailChanged = true;
    }
    try {
      await db.runTransaction(async tx => {
        const newClaimRef = db.doc('usernameClaims/' + username);
        const claimSnap = await tx.get(newClaimRef);
        const matches = await tx.get(db.collection('users')); 
        if (claimSnap.exists && claimSnap.get('uid') !== uid) throw new Error('USERNAME_TAKEN');
        if (matches.docs.some(d => d.id !== uid && String(d.get('username') || '').trim().toLowerCase() === username)) throw new Error('USERNAME_TAKEN');
        const current = await tx.get(userRef);
        const currentName = String(current.get('username') || '').toLowerCase();
        if (currentName !== username && !initial) {
          const last = Number(current.get('lastUsernameChange') || 0);
          if (now - last < 7 * 86400000) throw new Error('COOLDOWN');
        }
        tx.set(newClaimRef, { uid, username, updatedAt: now });
        if (currentName && currentName !== username) {
          const oldClaimRef = db.doc('usernameClaims/' + currentName);
          const oldClaim = await tx.get(oldClaimRef);
          if (oldClaim.exists && oldClaim.get('uid') === uid) tx.delete(oldClaimRef);
        }
        const patch = { username, photo, updatedAt: now };
        if (currentName !== username && !initial) patch.lastUsernameChange = now;
        tx.set(userRef, patch, { merge: true });
        tx.set(db.doc('publicProfiles/' + uid), { username, photo, updatedAt: now }, { merge: true });
      });
    } catch (e) {
      if (emailChanged && oldEmail) await auth.updateUser(uid, { email: oldEmail }).catch(() => {});
      if (e.message === 'USERNAME_TAKEN') return send(res, 409, { error: 'Username sudah dipakai pengguna lain' });
      if (e.message === 'COOLDOWN') return send(res, 429, { error: 'Username hanya bisa diganti setiap 7 hari' });
      throw e;
    }
    return send(res, 200, { ok: true, username });
  } catch (e) {
    return send(res, e.code === 'auth/id-token-expired' ? 401 : 500, { error: e.message || 'Gagal memperbarui username' });
  }
};
