// Inisialisasi Firebase Admin (hanya berjalan di server Vercel)
const admin = require("firebase-admin");

if (!admin.apps.length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("Environment FIREBASE_SERVICE_ACCOUNT belum diisi");
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
}

const auth = admin.auth();
const db = admin.firestore();

// Memastikan pemanggil adalah admin: token Firebase valid + terdaftar di koleksi "admins"
async function needAdmin(req) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) throw Object.assign(new Error("Tidak ada token login"), { code: 401 });
  let dec;
  try { dec = await auth.verifyIdToken(token); }
  catch (e) { throw Object.assign(new Error("Token tidak valid, masuk ulang sebagai admin"), { code: 401 }); }
  const snap = await db.doc("admins/" + dec.uid).get();
  if (!snap.exists) throw Object.assign(new Error("Akun ini bukan admin"), { code: 403 });
  return dec.uid;
}

const USER_RE = /^[a-z0-9_.]{3,20}$/;
const emailOf = (u) => u + "@only4u.app";

function send(res, code, body) {
  res.status(code).setHeader("Cache-Control", "no-store");
  res.json(body);
}

module.exports = { admin, auth, db, needAdmin, USER_RE, emailOf, send };
