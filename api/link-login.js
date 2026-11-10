// POST /api/link-login  { id, username }   (publik, dipakai halaman /id/<kode>)
// Menukar link sekali pakai menjadi token masuk Firebase.
const { auth, db, send } = require("./_fb");

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "Gunakan metode POST" });
  try {
    const id = String((req.body && req.body.id) || "");
    const username = String((req.body && req.body.username) || "").toLowerCase();
    if (!/^[A-Za-z0-9_-]{16,40}$/.test(id) || !username) return send(res, 400, { error: "Link tidak valid" });
    const ref = db.doc("links/" + id);
    const uid = await db.runTransaction(async (tx) => {
      const s = await tx.get(ref);
      if (!s.exists) throw Object.assign(new Error("Link tidak valid atau sudah dipakai"), { code: 400 });
      const d = s.data();
      if (d.used) throw Object.assign(new Error("Link ini sudah pernah dipakai"), { code: 400 });
      if (d.exp < Date.now()) throw Object.assign(new Error("Link sudah kedaluwarsa, minta admin membuat link baru"), { code: 400 });
      if (d.username !== username) throw Object.assign(new Error("Link tidak cocok dengan username"), { code: 400 });
      tx.update(ref, { used: true, usedAt: Date.now() });
      return d.uid;
    });
    const token = await auth.createCustomToken(uid);
    return send(res, 200, { token });
  } catch (e) {
    return send(res, e.code >= 400 && e.code < 600 ? e.code : 500, { error: e.message || "Gagal" });
  }
};
