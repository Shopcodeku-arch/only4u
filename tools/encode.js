// Membuat index.html (versi tersamar Base64) dari source/index.readable.html
// Cara pakai: node tools/encode.js
const fs = require("fs");
const path = require("path");
const HEAD = fs.readFileSync(path.join(__dirname, "head.html"), "utf8");
const TEMPLATE = "<!DOCTYPE html>\n<html lang=\"id\"><head>" + HEAD.replace(/\n/g, "") + "</head><body><noscript><h1>ONLY4U – Topup Game Murah &amp; Cepat</h1><p>Top up Mobile Legends, Roblox (Robux), Fish It! dan voucher game dengan pembayaran QRIS, proses cepat, buka 24 jam. Aktifkan JavaScript untuk membuka ONLY4U.</p><nav><a href=\"/ml\">Top up Mobile Legends</a> <a href=\"/roblox\">Beli Robux</a> <a href=\"/fishit\">Top up Fish It!</a> <a href=\"/artikel\">Berita &amp; Artikel</a> <a href=\"/tokolainnya\">Toko Lainnya</a> <a href=\"/bantuan\">Bantuan &amp; FAQ</a> <a href=\"/ketentuan\">Ketentuan &amp; Privasi</a></nav></noscript><script>(function(){var d=\"__PAYLOAD__\";var s=atob(d),u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i);var h=new TextDecoder(\"utf-8\").decode(u);document.open();document.write(h);document.close()})();</script></body></html>";
const root = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(root, "source", "index.readable.html"), "utf8");
const payload = Buffer.from(src, "utf8").toString("base64");
fs.writeFileSync(path.join(root, "index.html"), TEMPLATE.replace("__PAYLOAD__", payload));
console.log("index.html dibuat ulang dari source/index.readable.html (" + Math.round(payload.length / 1024) + " KB)");
