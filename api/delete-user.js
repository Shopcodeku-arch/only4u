// POST /api/delete-user  { username, uid }   (khusus admin)
// Menghapus akun pengguna beserta data profil, status penjual, produk, dan check-in.
// Jika akunnya sudah tidak ada di Firebase Auth (mis. dihapus manual), data sisa di database
// tetap dibersihkan dan hasilnya sukses (tidak error) -> daftar user di website ikut bersih.
const { auth, db, needAdmin, USER_RE, emailOf, send } = require("./_fb");

async function delQuery(q) {
  const snap = await q.get();
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += 400) {
    const b = db.batch();
    docs.slice(i, i + 400).forEach((d) => b.delete(d.ref));
    await b.commit();
  }
  return docs.length;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "Gunakan metode POST" });
  try {
    await needAdmin(req);
    const username = String((req.body && req.body.username) || "").toLowerCase().replace(/^@/, "");
    if (!USER_RE.test(username)) return send(res, 400, { error: "Username tidak valid" });
    let uid = null, ghost = false;
    try { uid = (await auth.getUserByEmail(emailOf(username))).uid; }
    catch (e) {
      if (e.code !== "auth/user-not-found") throw e;
      ghost = true;
      // Akun login sudah tidak ada: cari sisa dokumen di database (berdasarkan uid kiriman admin / username)
      const reqUid = String((req.body && req.body.uid) || "");
      if (reqUid) {
        const d = await db.doc("users/" + reqUid).get();
        if (d.exists && String(d.data().username || "").toLowerCase() === username) uid = reqUid;
      }
      if (!uid) {
        const q = await db.collection("users").where("username", "==", username).limit(1).get();
        if (!q.empty) uid = q.docs[0].id;
      }
      if (!uid) return send(res, 200, { ok: true, ghost: true, products: 0 });
    }
    if (!ghost && req.body.uid && req.body.uid !== uid) return send(res, 400, { error: "Data tidak cocok" });
    if ((await db.doc("admins/" + uid).get()).exists) return send(res, 403, { error: "Akun admin tidak boleh dihapus" });

    const products = await delQuery(db.collection("products").where("sid", "==", uid));
    await delQuery(db.collection("slugs").where("u", "==", uid));
    await delQuery(db.collection("follows").where("u", "==", uid));
    await delQuery(db.collection("reviews").where("u", "==", uid));
    await Promise.all([
      db.doc("users/" + uid).delete(),
      db.doc("sellers/" + uid).delete(),
      db.doc("sellerReq/" + uid).delete(),
      db.doc("checkins/" + uid).delete(),
    ]);
    if (!ghost) { try { await auth.deleteUser(uid); } catch (e) { if (e.code !== "auth/user-not-found") throw e; } }
    return send(res, 200, { ok: true, ghost, products });
  } catch (e) {
    return send(res, e.code >= 400 && e.code < 600 ? e.code : 500, { error: e.message || "Gagal" });
  }
};
