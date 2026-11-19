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

## Update ronde 8: logo = favicon + SEO
- Letakkan logo di `/favicon/favicon.png` (atau `.webp`, `.jpg`, `.jpeg`, dicoba berurutan). Gambar itu dipakai HANYA untuk favicon tab, apple-touch-icon, dan gambar preview SEO. Logo di dalam website (navbar/footer/splash) tetap diatur lewat panel admin dan terpisah dari favicon. Kalau file belum ada, tampilan lama tetap jalan.
- Ganti gambar: timpa file lalu deploy (cache 1 hari).
- SEO: meta description/keywords/robots, canonical, Open Graph, Twitter Card, JSON-LD (Organization, WebSite, Store) ada di `<head>` statis (`tools/head.html`, dipakai `tools/encode.js`) supaya terbaca crawler tanpa JS. Judul, deskripsi, canonical, og:url per halaman diperbarui otomatis; halaman admin/penjual/dashboard/riwayat/inbox otomatis `noindex`.
- Baru: `robots.txt`, `sitemap.xml`, `vercel.json` (rewrite tidak menimpa robots/sitemap/favicon + cache & header keamanan). Domain di file SEO diasumsikan `https://www.only4u.my.id`; ganti jika beda.
- Setelah deploy: daftarkan domain di Google Search Console dan kirim `https://www.only4u.my.id/sitemap.xml`.
- Firestore rules tidak berubah.

## Update ronde 9: form "Mulai jualan" jadi langkah-langkah
- Indikator di atas: 1 WhatsApp - 2 Testimoni - 3 TikTok - Selesai (garis progres terisi, langkah selesai berwarna oranye).
- Tiap langkah divalidasi dulu sebelum Lanjut. Lanjut: panel lama geser ke kiri, panel baru masuk dari kanan. Kembali: kebalikannya. Data yang sudah diisi tidak hilang.
- Langkah 2 ada centang "Saya tidak punya testimoni" (area unggah jadi abu-abu, tidak wajib upload). Langkah Selesai menampilkan ringkasan lalu tombol Kirim pengajuan.
- Pengajuan tanpa testimoni menyimpan field baru `nt:true`; di panel admin muncul label "Tanpa testimoni".
- WAJIB publish ulang `firebase/firestore.rules` (aturan sellerReq: field `nt` diizinkan, bukti testimoni boleh kosong jika `nt` true).

## Update ronde 10
- "Syarat jualan" dipindah ke bawah form langkah-langkah (tidak mengganggu saat scroll).
- Semua efek glow oranye dihapus: box-shadow/text-shadow berwarna oranye (tombol, kartu, item terpilih, indikator langkah, dll.), drop-shadow oranye, dan cahaya oranye di latar belakang. Garis tepi tipis oranye pada item terpilih tetap ada. Glow hijau (indikator online/pulse) tidak disentuh.
- Firestore rules tidak berubah dari update sebelumnya (tetap harus sudah dipublish).

## Update ronde 11
- Halaman game: banner tanpa nama; gambar profil game menempel di bawah banner (menumpuk di tengah), lalu nama game, lalu deskripsi. Deskripsi lebih dari 100 huruf otomatis dipotong dengan tombol "Baca selengkapnya" / "Tutup". Jika admin belum mengisi, dipakai deskripsi bawaan.
- Deskripsi game diisi admin di tab Gambar game (kolom "Deskripsi game", maks 600 huruf), disimpan di dokumen `gimg` (field `d`).
- Beranda: tab kategori di atas "Cari game" (Populer = semua game, plus kategori buatan admin dengan ikon). Atur di panel admin > Situs > kotak "Kategori beranda": nama, pilih ikon (template), centang game, simpan (maks 10). Jika belum ada kategori, tampil judul "Populer" seperti biasa.
- WAJIB publish ulang `firebase/firestore.rules` (settings/site boleh field `cats`, gimg boleh field `d`).

## Update ronde 12 (revisi kategori beranda)
- Tab "Populer" dan semua kategori bawaan dihapus. Kategori sekarang hanya buatan admin (Admin > Situs > Kategori beranda).
- Tiap kategori tampil sebagai bagian terpisah ("kubu") di beranda, di ATAS kolom Cari game: judul + ikon + kartu game kategori tsb, tanpa kolom pencarian.
- Di bawah semua kategori: kolom "Cari game" lalu SELURUH game (tanpa kategori); pencarian hanya memfilter bagian ini.
- Kalau belum ada kategori, beranda hanya Cari game + semua game. Rules tidak berubah dari ronde 11.

## Update ronde 13
- Link join grup WhatsApp di form Mulai jualan diganti ke https://chat.whatsapp.com/KwVyE2Mw0MmCXYDFngaKXi (konstanta JOINWA).

## Update ronde 14: tamu bisa lihat, klik = diminta login
- Pengguna yang belum login tidak lagi dipaksa ke halaman login. Beranda, kategori, daftar game, Toko Lainnya, artikel, halaman game, dan Ketentuan bisa dilihat.
- Klik apa pun yang interaktif (kartu game, produk, tombol, tautan, menu) memunculkan popup "Tunggu! Login untuk melanjutkan" dengan tombol Google dan tautan Ketentuan & Privasi. Tutup dengan tombol X, klik area gelap, atau Esc. Setelah login berhasil popup menutup otomatis.
- Halaman yang butuh akun (riwayat, dashboard, jualan, penjual, inbox, check-in, leaderboard, bantuan/live chat) otomatis kembali ke beranda dan memunculkan popup jika dibuka langsung oleh tamu.
- WAJIB publish ulang `firebase/firestore.rules`: koleksi products, sellers, gimg, flash, articles, ads, games, pov, shopbn, slugs, reviews, follows kini boleh dibaca tanpa login (data profil pengguna, pesanan, chat, dll tetap perlu login).

## Update ronde 15
- Undangan referral (Akun/Dashboard): hanya 3 teman pertama yang tampil; jika lebih dari 3 muncul tombol "Tampilkan semua (N)" yang membuka seluruh daftar, lalu berubah menjadi "Tampilkan lebih sedikit".
- Panel admin > Produk: tiap produk (bawaan maupun buatan admin) punya 2 tombol on/off (switch geser: on = knob ke kanan/oranye, off = ke kiri/abu-abu): "Diskon referral" dan "Diskon lain (check-in)". Keduanya on = perilaku lama; salah satu off = sumber diskon itu tidak berlaku; keduanya off = produk tidak dapat diskon apa pun. Flash sale tidak terpengaruh. Tersimpan langsung saat tombol diklik (field `dr` dan `dk`, default on).
- Berlaku untuk produk admin/bawaan (produk toko penjual memang tidak pernah kena diskon situs).
- WAJIB publish ulang `firebase/firestore.rules` (koleksi products dan pov menerima field `dr`, `dk`).

## Update ronde 16: daftar produk lebih rapi
- Setiap produk di panel (admin: Produk, dan penjual: Produk/Item toko saya) kini tampil ringkas: gambar/nomor, nama, game, harga, dan stok, dengan tombol "Edit". Form edit (nama, harga, stok, urutan, gambar, switch diskon, Simpan/Sembunyikan/Hapus) baru muncul saat Edit diklik, tombol berubah jadi "Tutup". Beberapa produk boleh dibuka bersamaan; produk yang terbuka tetap terbuka saat data tersegarkan.
- Rules tidak berubah dari ronde 15.

## Update ronde 17: pusat notifikasi (lonceng)
- Lonceng di header, di samping ikon search. Angka merah = jumlah notifikasi belum dibaca: balasan inbox yang belum dibuka + teman referral baru + pesan/hadiah admin baru.
- Klik lonceng: panel daftar notifikasi (klik item untuk membuka Inbox/Dashboard), tombol "Tandai dibaca", dan browser meminta izin notifikasi (jika belum pernah dijawab). Jika diblokir, panel menjelaskan cara mengizinkannya.
- Notifikasi baru: lonceng bergoyang + bunyi "ding" + notifikasi sistem HP/desktop (jika diizinkan) lewat `sw.js` (service worker). Klik notifikasi sistem membuka website.
- BATASAN: notifikasi sistem muncul selama website masih terbuka di browser (tab aktif atau di latar belakang). Notifikasi saat browser/tab benar-benar tertutup butuh server Web Push/FCM terpisah (belum dibuat).
- Admin: tab baru "Notifikasi" untuk kirim pesan / hadiah ke semua pengguna atau satu username, plus daftar terkirim (hapus 2x klik).
- Rapi-rapi: ikon "bell" ditambahkan ke set ikon; elemen chip mata uang di header yang selalu disembunyikan CSS dihapus; header tidak lagi memuat markup tak terpakai.
- File baru: `sw.js` (taruh di root, sejajar index.html). `vercel.json` diperbarui agar `sw.js` tidak tertimpa rewrite.
- WAJIB publish ulang `firebase/firestore.rules` (koleksi baru `notifs`).

## Update ronde 18
- Admin > Notifikasi: penerima kini berupa pilihan "Semua pengguna" / "Pilih pengguna". Pada "Pilih pengguna" ada kolom cari username (pencarian saat mengetik) dari seluruh pengguna terdaftar ONLY4U, menampilkan foto + @username, jumlah pengguna terdaftar, dan penerima terpilih bisa diganti.
- Loading memuat data kini berupa shimmer (kerangka banner, profil, kolom cari, dan kartu produk) menggantikan spinner. Selama muncul (termasuk "Memuat toko" dan "Memuat dashboard penjual"), tidak ada yang bisa diklik; otomatis terbuka lagi paling lama 9-10 detik agar tidak pernah terkunci.
- Perbaikan: centang "Gunakan email dari penjual" di form voucher/langganan sebelumnya turun ke bawah kotak; kini digambar sebagai SVG tepat di tengah.
- Notifikasi (lonceng) sekarang lengkap untuk PENJUAL dan PEMBELI:
  - Penjual: pesan baru dari pembeli, pembayaran menunggu verifikasi, pesanan baru masuk ke toko (klik membuka panel penjual).
  - Pembeli: balasan inbox, pesanan berhasil, pesanan ditolak/kedaluwarsa (klik membuka Inbox / Riwayat).
  - Semua pengguna: teman referral baru dan pesan/hadiah dari admin.
  - Status baca kini per notifikasi (disimpan di perangkat), bukan per waktu; notifikasi lama saat pertama kali dibuka dianggap sudah dibaca.
- Rules tidak berubah dari ronde 17 (koleksi `notifs` tetap harus sudah dipublish).

## Update ronde 19
- Cek ID Mobile Legends: bila respon API berisi "AxiosError"/error, hasilnya otomatis "ID tidak ditemukan / gagal ditemukan" (tanda x merah).
- Lonceng notifikasi wajib izin: sebelum notifikasi diizinkan lonceng redup (tidak aktif, tanpa badge/bunyi). Klik lonceng -> muncul permintaan izin; panel terbuka hanya setelah diizinkan. Jika diblokir/tidak didukung, muncul pesan petunjuk.
- firestore.rules TIDAK berubah (tidak perlu publish ulang).
