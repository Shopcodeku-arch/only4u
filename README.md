# ONLY4U – Website Topup Game + Marketplace Penjual

Website topup game (HTML + Firebase) dengan server kecil di Vercel untuk fitur admin
(ubah password pengguna, link masuk, hapus pengguna).

## Isi proyek

```
only4u/
├─ index.html                 ← website (versi tersamar Base64) – inilah yang tampil di domain
├─ api/                       ← fungsi server Vercel (HARUS di root repo, sejajar package.json)
│  ├─ _fb.js                  ← koneksi Firebase Admin (dipakai file di bawah)
│  ├─ ping.js                 ← tes server aktif: /api/ping
│  ├─ reset-password.js       ← admin ubah password pengguna
│  ├─ login-link.js           ← admin membuat link masuk sekali pakai
│  ├─ link-login.js           ← halaman /id/<kode> menukar link jadi login
│  └─ delete-user.js          ← admin menghapus pengguna
├─ package.json               ← library server (firebase-admin)
├─ vercel.json                ← semua alamat ke index.html, kecuali /api
├─ firebase/firestore.rules   ← aturan keamanan Firestore (tempel di Firebase Console)
├─ source/index.readable.html ← versi terbaca untuk diedit (tidak ikut dipublikasikan)
├─ tools/encode.js            ← membuat index.html dari versi terbaca
└─ .gitignore  .vercelignore
```

## 1. Upload ke GitHub

```bash
cd only4u
git init
git add .
git commit -m "ONLY4U"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

Pastikan di GitHub folder `api/` dan `package.json` terlihat di halaman paling luar repo.

## 2. Deploy di Vercel

1. vercel.com → **Add New… → Project** → pilih repo → **Import**.
2. **Framework Preset: Other**. Build Command dan Output Directory **dikosongkan**. Root Directory `./`.
3. **Deploy**.

## 3. Kunci server (wajib untuk fitur admin pengguna)

1. Firebase Console → ⚙️ **Project settings → Service accounts → Generate new private key** (file `.json`, **rahasia**).
2. Vercel → **Settings → Environment Variables** → `FIREBASE_SERVICE_ACCOUNT` = isi lengkap file `.json`.
3. **Deployments → Redeploy** (wajib agar kunci terbaca).

## 4. Pengaturan Firebase Console

- **Authentication → Sign-in method:** aktifkan **Google** (wajib). Anonymous boleh dibiarkan mati.
- **Authentication → Settings → Authorized domains:** tambahkan `login.gimoystudio.my.id` (dan domain Vercel/produksi lain yang dipakai).
- Config Firebase di `source/index.readable.html` sudah memakai proyek **lunaai-dde0f** (sementara). Karena proyek baru, database mulai kosong: publish rules, daftarkan admin, lalu isi game/produk dari panel.
- `FIREBASE_SERVICE_ACCOUNT` di Vercel harus service account milik proyek **lunaai-dde0f**, lalu Redeploy.
- **Firestore Database → Rules:** tempel isi `firebase/firestore.rules` → **Publish** (WAJIB tiap ada pembaruan).
- **Akun admin (Google):** buka `/admin/404notfound/panel`, klik *Masuk admin dengan Google*. Layar akan menampilkan **UID** akunmu.
  Di Firestore buat koleksi `admins`, **Document ID = UID itu**, isi 1 field (mis. `role` = `admin`). Setelah itu login ulang.

## 5. Tes

| Yang dites | Cara | Hasil benar |
|---|---|---|
| Server aktif | buka `https://domain-anda/api/ping` | `{"ok":true,"env":true,...}` |
| Website | `https://domain-anda` | halaman login/beranda |
| Panel admin | `https://domain-anda/admin/404notfound/panel` | menu admin tampil |
| Server admin | Panel admin → **Pengguna → Cek koneksi server** | ✅ aktif |

`/api/ping` → **404**: folder `api/` salah tempat/belum ter-deploy. `"env":false`: kunci belum diisi / belum Redeploy.

## Fitur utama

**Pembeli**: daftar/masuk dengan Google, dashboard akun, riwayat,
referral, QRIS + upload bukti transfer, live chat.

**Admin** (tab): Pesanan (cari & filter), Live chat, Pengguna (ubah password, link masuk, hapus user),
Penjual (setujui/tolak pengajuan, nonaktifkan), Produk (semua produk, stok, kategori, gambar sendiri),
Game & kategori (tambah game, ikon/profil/banner sendiri), Flash sale, Berita, Gambar, Situs
(logo/favicon, media sosial sendiri, **QRIS**).

**Penjual (marketplace)**: Dashboard akun → **MULAI JUALAN** → syarat (join grup WhatsApp dengan nomor yang sama,
testimoni sendiri, follow TikTok) → verifikasi admin → popup "AKUN MU BERHASIL DI VERIFIKASI" → setting toko
(nama bisnis, logo, banner, **QRIS sendiri**) → dashboard penjual (pesanan, live chat pembeli, produk, profil toko).
Toko pembeli akses di `/toko/<nama-toko>`; pembayaran ke QRIS penjual, penjual yang menyetujui pesanannya.

**Gambar**: semua foto/ikon/banner/logo bisa diunggah (otomatis dikecilkan) atau ditempel linknya.
Disimpan langsung di Firestore (tanpa Firebase Storage berbayar), batas ±400 KB per gambar.

## Mengedit website

1. Edit `source/index.readable.html`.
2. `node tools/encode.js` → `index.html` diperbarui.
3. `git add . && git commit -m "update" && git push` → Vercel otomatis deploy.

## Keamanan

- **Jangan** commit kunci service account (`.gitignore` sudah menolaknya). Jika pernah ter-upload: hapus kuncinya di Firebase dan buat baru.
- Base64 pada `index.html` hanya menyamarkan kode. Keamanan data dijaga oleh Firestore Rules dan login admin.
- Setelah mengubah Rules, **uji alurnya** (daftar, order, penjual) karena Rules tidak bisa diuji otomatis tanpa Firebase Emulator.

## Pembaruan v2 (ringkas)
- Tidak ada produk/game bawaan: semua dimuat dari Firestore (admin: tab Game & Produk; penjual: menu PRODUK & ISI PRODUK).
- Sidebar kiri (ikon ☰): pembeli = Inbox, Riwayat, Leaderboard, Check-in; penjual = Pesanan, Peraturan Toko, Produk, Isi Produk, Flash Sale (24 jam WIB), Inbox.
- Follow, rating & komentar toko; centang biru penjual terverifikasi.
- **WAJIB**: publikasikan ulang `firebase/firestore.rules` dan redeploy Vercel (api/delete-user.js berubah).
- Leaderboard hanya menghitung order yang disetujui setelah update ini (data `lb/`).

## Pembaruan putaran 2
- Login/daftar hanya **Google** (tanpa username/password). Nama akun = nama Google.
- Beranda: hero dihapus, diganti **slider iklan 16:9** (geser otomatis ke kiri, bisa digeser). Atur di Panel Admin → tab **Iklan** (gambar + tujuan: tidak ada / game / toko / link).
- Penjual: kategori produk bisa ditambah di **PRODUK** (per produk) dan di **ISI PRODUK** (tombol *Tambah kategori*).
- Produk tanpa data akun (voucher/langganan): saat pesanan disetujui, chat otomatis terkirim dari pembeli ke penjual (admin jika produk milik admin).
- Rules baru: koleksi `ads`, field `email` di `users`, field `ac` di `orders`; `admins` kini hanya dibuat manual lewat Console.
