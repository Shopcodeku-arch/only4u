// POST /api/reset-password  { username, newPassword }   (khusus admin)
const { auth, needAdmin, USER_RE, emailOf, send } = require("./_fb");

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "Gunakan metode POST" });
  try {
    await needAdmin(req);
    const username = String((req.body && req.body.username) || "").toLowerCase().replace(/^@/, "");
    const pw = String((req.body && req.body.newPassword) || "");
    if (!USER_RE.test(username)) return send(res, 400, { error: "Username tidak valid" });
    if (pw.length < 6 || pw.length > 64) return send(res, 400, { error: "Password harus 6-64 karakter" });
    let u;
    try { u = await auth.getUserByEmail(emailOf(username)); }
    catch (e) { return send(res, 404, { error: "Username tidak ditemukan" }); }
    await auth.updateUser(u.uid, { password: pw });
    await auth.revokeRefreshTokens(u.uid); // keluarkan sesi lama di perangkat lain
    return send(res, 200, { ok: true });
  } catch (e) {
    return send(res, e.code >= 400 && e.code < 600 ? e.code : 500, { error: e.message || "Gagal" });
  }
};
