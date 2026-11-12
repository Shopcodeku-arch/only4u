// POST /api/login-link  { username }   (khusus admin)
// Membuat link masuk sekali pakai: https://domain/id/<kode>?username=<username>
const crypto = require("crypto");
const { auth, db, needAdmin, USER_RE, emailOf, send } = require("./_fb");

const TTL_MS = 60 * 60 * 1000; // berlaku 60 menit

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "Gunakan metode POST" });
  try {
    const adminUid = await needAdmin(req);
    const username = String((req.body && req.body.username) || "").toLowerCase().replace(/^@/, "");
    if (!USER_RE.test(username)) return send(res, 400, { error: "Username tidak valid" });
    let u;
    try { u = await auth.getUserByEmail(emailOf(username)); }
    catch (e) { return send(res, 404, { error: "Username tidak ditemukan" }); }
    const id = crypto.randomBytes(18).toString("base64url");
    const now = Date.now();
    await db.doc("links/" + id).set({ uid: u.uid, username, exp: now + TTL_MS, used: false, by: adminUid, t: now });
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    return send(res, 200, { url: "https://" + host + "/id/" + id + "?username=" + username, exp: now + TTL_MS });
  } catch (e) {
    return send(res, e.code >= 400 && e.code < 600 ? e.code : 500, { error: e.message || "Gagal" });
  }
};
