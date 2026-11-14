// GET /api/ping : tes cepat apakah fungsi server aktif (tidak memakai firebase-admin)
module.exports = (req, res) => {
  res.status(200).setHeader("Cache-Control", "no-store");
  res.json({ ok: true, env: !!process.env.FIREBASE_SERVICE_ACCOUNT, node: process.version });
};
