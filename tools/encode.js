// Membuat index.html (versi tersamar Base64) dari source/index.readable.html
// Cara pakai: node tools/encode.js
const fs = require("fs");
const path = require("path");
const TEMPLATE = "<!DOCTYPE html>\n<html lang=\"id\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover\"><title>ONLY4U – Topup Game Murah &amp; Cepat</title><meta name=\"color-scheme\" content=\"dark\"><style>html{background:#0a0d14}</style></head><body><noscript>Aktifkan JavaScript untuk membuka ONLY4U.</noscript><script>(function(){var d=\"__PAYLOAD__\";var s=atob(d),u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i);var h=new TextDecoder(\"utf-8\").decode(u);document.open();document.write(h);document.close()})();</script></body></html>";
const root = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(root, "source", "index.readable.html"), "utf8");
const payload = Buffer.from(src, "utf8").toString("base64");
fs.writeFileSync(path.join(root, "index.html"), TEMPLATE.replace("__PAYLOAD__", payload));
console.log("index.html dibuat ulang dari source/index.readable.html (" + Math.round(payload.length / 1024) + " KB)");
