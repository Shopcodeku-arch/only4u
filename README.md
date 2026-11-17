# ONLY4U – Website Topup Game + Marketplace Penjual

Website topup game (HTML + Firebase) dengan server kecil di Vercel untuk fitur admin
(hapus pengguna).

## Isi proyek

```
only4u/
├─ index.html                 ← website (versi tersamar Base64) – inilah yang tampil di domain
├─ api/                       ← fungsi server Vercel (HARUS di root repo, sejajar package.json)
│  ├─ _fb.js                  ← koneksi Firebase Admin (dipakai file di bawah)
│  ├─ ping.js                 ← tes server aktif: /api/ping
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
- **Authentication → Settings → Authorized domains:** tambahkan `login.only4u.my.id` (dan domain Vercel/produksi lain yang dipakai).
- Config Firebase di `source/index.readable.html` sudah memakai proyek **only4u-ce173**. Publish rules terbaru dan daftarkan admin (UID akun Google) di koleksi `admins`.
- `FIREBASE_SERVICE_ACCOUNT` di Vercel harus service account milik proyek **only4u-ce173**, lalu Redeploy.
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

**Admin** (tab): Pesanan (cari & filter), Live chat, Pengguna (hapus user),
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

## Domain login (authDomain = login.only4u.my.id)
Agar popup Google tampil di `login.only4u.my.id` (bukan `*.firebaseapp.com`):
1. Firebase Console → Hosting → Add custom domain → `login.only4u.my.id` (isi DNS sesuai petunjuk, tunggu SSL aktif). Hosting wajib diaktifkan agar `/__/auth/handler` tersedia di domain itu.
2. Authentication → Settings → Authorized domains: tambahkan `login.only4u.my.id` dan `only4u.my.id` / `www.only4u.my.id`.
3. Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Web client (milik Firebase) → Authorized redirect URIs: tambahkan `https://login.only4u.my.id/__/auth/handler`. Authorized JavaScript origins: `https://login.only4u.my.id`.

## Pembaruan putaran 3
- Banner toko: penjual bisa mengisi hingga 5 gambar (PERATURAN TOKO), tampil sebagai slide otomatis di halaman toko. Disimpan di koleksi `shopbn` (id `uid_0`..`uid_4`).
- Profil: nama & foto otomatis dari akun Google, bisa diganti di Dashboard → Edit profil (field `username`, `photo` di `users`).
- Flash sale penjual: daftar langsung ter-update setelah disimpan (sebelumnya hanya admin yang auto-refresh).
- Flash sale di beranda menampilkan nama toko penjual.
- Rules baru: `shopbn`, update `users` (username/photo). Publish ulang `firestore.rules`.


## Revisi fitur ONLY4U (November 2026)
- Centang biru toko tampil otomatis mulai 100 pengikut; admin juga dapat memberi/mencabut verifikasi melalui Panel Admin → Penjual.
- Profil toko menampilkan status online/offline dan perkiraan lama sejak aktivitas terakhir. Status online memakai heartbeat 30 detik.
- Navigasi halaman mengembalikan posisi ke bagian paling atas saat berpindah halaman.
- Katalog produk tetap memakai data Game & Produk yang dikelola admin di Firestore; produk penjual ditautkan ke game/kategori yang tersedia di katalog tersebut.
- Menu percakapan penjual menggunakan label Inbox. Saat penjual membuka pesan pembeli, status baca dicatat untuk centang terkirim/dibaca.
- **WAJIB:** publikasikan ulang `firebase/firestore.rules` setelah update ini agar pengaturan presence dan tanda pesan dibaca diizinkan.

## Pembaruan putaran 4
- Foto & nama profil pengguna tampil di ulasan penjual, inbox, sidebar, leaderboard, dan daftar pengguna admin (data publik di `publicProfiles/{uid}`).
- Ganti profil (nama/foto) dibatasi **7 hari sekali**, dijaga di UI dan di `firestore.rules` (`pfAt`).
- Cek nama otomatis saat mengetik: centang hijau = bisa dipakai, silang merah = sudah terpakai (klaim unik di `usernames/{nama}`). Nama dari Google yang bentrok diberi akhiran angka.
- Semua "✓" diganti ikon SVG.
- Kode tak terpakai dihapus: `api/username.js`, `reset-password.js`, `login-link.js`, `link-login.js` dan login password/link/anonim.
- **WAJIB:** publikasikan ulang `firebase/firestore.rules` (koleksi `usernames`, `publicProfiles`, aturan `users`) lalu deploy ulang di Vercel.
- Revisi akhir putaran 4: avatar tanpa huruf inisial (ikon user), ikon cari SVG, leaderboard berbentuk papan 1-2-3, pratinjau pesan terakhir di daftar inbox (field `lx` di dokumen `chats`; **publikasikan ulang `firestore.rules`**).
- Cek username Mobile Legends memakai https://cek-username.onrender.com/game/mobilelegends?uid=ID&zone=ZONE (centang hijau jika ketemu, silang merah jika tidak).
- Perbaikan: badge inbox mengabaikan chat ke diri sendiri & chat tertutup; parser cek ML lebih fleksibel.
- Cek ML: format respons asli API = {"message":"Success","data":"<nick>"}.
- Template otomatis: penjual menambah game dengan nama mirip game template admin (mis. 'Mobile Legend', 'mlbb') -> data akun, satuan, gambar mengikuti template, disimpan di field `tp`. Cek username ML tetap memakai API bawaan. **Publikasikan ulang firestore.rules** (field tp). Perbaikan bug daftar inbox penjual (lastTx).

## Pembaruan putaran 5
- Berita > 3: tombol "Baca artikel lainnya" ke `/artikel?src=berita` (semua berita + pencarian).
- Toko mitra > 3: tombol "Kunjungi seluruh toko" ke `/tokomitra?src=marketplace` (semua toko + pencarian).
- "Cara order" digabung ke halaman Bantuan & FAQ (`/bantuan`), isi FAQ diperbarui.
- Halaman `/ketentuan`: Ketentuan Pengguna & Kebijakan Privasi (publik, bisa dibuka tanpa login; cocok untuk layar persetujuan OAuth Google). Teks bersifat umum, mohon ditinjau sesuai kebutuhan bisnis/hukum Anda.
- Referral dipindah dari beranda ke halaman Akun (`/dashboard`).
- Tidak ada perubahan Firestore Rules di putaran ini.

## Pembaruan putaran 6
- "Toko Mitra" diganti menjadi "Toko Lainnya"; alamat `/tokolainnya?src=marketplace`. Menu sidebar TOKO LAINNYA ditambahkan dan semua label sidebar huruf kapital.
- Live chat tampil seperti WhatsApp (lebih besar, bubble hijau/abu, header, kolom ketik membulat). Bisa kirim gambar (hanya JPG/PNG/WEBP/GIF, maks. 10 MB; otomatis dikompres sebelum dikirim). Berlaku di chat pembeli, admin, dan inbox penjual.
- **WAJIB:** publikasikan ulang `firebase/firestore.rules` (field `im` pada pesan chat).
- Warna live chat diganti ke tema gelap (tanpa hijau).
- Centang chat per pesan: 2 centang abu = terkirim, 2 centang biru = sudah dibaca penjual/admin.
- Status Online/Offline toko (titik hijau/abu, bukan emoji) di kartu Toko Lainnya & halaman toko; sidebar BERITA & ARTIKEL dengan ikon koran.
- Fix game 'hilang': semua dokumen games kini tampil di panel (tidak ada game hantu), semua game bisa dihapus (produk & gambarnya ikut dibersihkan), edit memakai update agar game yang sudah dihapus tidak hidup lagi, batas kategori 30 -> 100. **Publikasikan ulang firestore.rules.**
- Fix hapus game: rules memakai 'allow write' dengan request.resource sehingga DELETE selalu ditolak (games, gimg, articles, pov) -> dipisah menjadi create/update dan delete. Judul beranda 'Game populer' -> 'Populer'. **Publikasikan ulang firestore.rules.**

## Update ronde 7
- Navbar (logo, search, profil): transparan blur gelap dan ikut saat scroll (sticky).
- Game voucher / langganan (tanpa field akun): pembeli wajib isi email ATAU centang "Gunakan email dari penjual" (input jadi abu-abu). Tombol Beli aktif hanya jika salah satu terpenuhi. Email/penanda tersimpan di field `acc` pesanan (terlihat di kartu pesanan penjual/admin), jadi aturan Firestore TIDAK berubah.
- Chat otomatis setelah pesanan disetujui kini menyebut email pembeli / email penjual; penjual membalas data voucher lewat INBOX.
- Tidak perlu publish ulang firestore.rules.
