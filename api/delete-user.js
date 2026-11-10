// POST /api/delete-user  { username, uid }   (khusus admin)
// Menghapus akun pengguna (login) beserta data profil, status penjual, dan produk jualannya.
// Riwayat pesanan dibiarkan agar catatan transaksi tetap ada.
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
    let u;
    try { u = await auth.getUserByEmail(emailOf(username)); }
    catch (e) { return send(res, 404, { error: "Username tidak ditemukan" }); }
    const uid = u.uid;
    if (req.body.uid && req.body.uid !== uid) return send(res, 400, { error: "Data tidak cocok" });
    if ((await db.doc("admins/" + uid).get()).exists) return send(res, 403, { error: "Akun admin tidak boleh dihapus" });

    const products = await delQuery(db.collection("products").where("sid", "==", uid));
    await delQuery(db.collection("slugs").where("u", "==", uid));
    await Promise.all([
      db.doc("users/" + uid).delete(),
      db.doc("sellers/" + uid).delete(),
      db.doc("sellerReq/" + uid).delete(),
    ]);
    await auth.deleteUser(uid);
    return send(res, 200, { ok: true, products });
  } catch (e) {
    return send(res, e.code >= 400 && e.code < 600 ? e.code : 500, { error: e.message || "Gagal" });
  }
};
