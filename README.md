# ONLY4U – Website Topup Game

Website topup game (HTML + Firebase) dengan server kecil di Vercel untuk fitur admin
(ubah password pengguna dan link masuk).

## Isi repo

```
only4u-repo/
├─ index.html              ← website (versi tersamar Base64) – inilah yang tampil di domain
├─ api/                    ← fungsi server Vercel (HARUS di root repo)
│  ├─ _fb.js               ← koneksi Firebase Admin (dipakai 3 file di bawah)
│  ├─ ping.js              ← tes server aktif: /api/ping
│  ├─ reset-password.js    ← admin ubah password pengguna
│  ├─ login-link.js        ← admin membuat link masuk sekali pakai
│  └─ link-login.js        ← halaman /id/<kode> menukar link jadi login
├─ package.json            ← daftar library server (firebase-admin)
├─ vercel.json             ← semua alamat diarahkan ke index.html, kecuali /api
├─ firebase/firestore.rules← aturan keamanan Firestore (tempel di Firebase Console)
├─ source/index.readable.html ← versi terbaca untuk diedit (tidak ikut dipublikasikan)
├─ tools/encode.js         ← membuat index.html dari versi terbaca
├─ .gitignore  .vercelignore
```

## 1. Upload ke GitHub

```bash
cd only4u-repo
git init
git add .
git commit -m "ONLY4U pertama"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

Pastikan di GitHub terlihat folder `api/` dan file `package.json` **di tampilan paling luar repo**
(bukan di dalam folder lain).

## 2. Deploy di Vercel

1. vercel.com → **Add New… → Project** → pilih repo GitHub tadi → **Import**.
2. **Framework Preset: Other**. Build Command dan Output Directory **dikosongkan**.
   **Root Directory: `./`** (jangan diubah ke folder lain).
3. Klik **Deploy**.

## 3. Isi kunci server (wajib untuk fitur admin)

1. Firebase Console → ⚙️ **Project settings → Service accounts → Generate new private key**.
   Sebuah file `.json` akan terunduh. **Rahasia, jangan di-upload ke GitHub.**
2. Vercel → proyek → **Settings → Environment Variables** → tambah:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** buka file `.json` tadi, salin **seluruh isinya**, tempel.
   - Environments: centang Production, Preview, Development.
3. **Deployments** → titik tiga pada deploy terakhir → **Redeploy** (wajib, agar kunci terbaca).

## 4. Pengaturan Firebase Console

- **Authentication → Sign-in method:** aktifkan **Email/Password** dan **Anonymous**.
- **Firestore Database → Rules:** tempel isi `firebase/firestore.rules` → **Publish**.
- **Akun admin:** Authentication → Users → Add user: email `admin@only4u.app` + password.
  Salin UID-nya, lalu di Firestore buat koleksi `admins`, **Document ID = UID tadi**, isi 1 field bebas
  (mis. `role` = `admin`).

## 5. Tes

| Yang dites | Cara | Hasil benar |
|---|---|---|
| Server aktif | buka `https://domain-anda/api/ping` | `{"ok":true,"env":true,...}` |
| Website | buka `https://domain-anda` | halaman login/beranda |
| Panel admin | buka `https://domain-anda/admin/404notfound/panel`, login `admin` | menu admin tampil |
| Fitur pengguna | Panel admin → tab **Pengguna → 🔌 Cek koneksi server** | ✅ Server admin aktif |

Arti hasil `/api/ping`:
- **404** → folder `api/` tidak ikut ter-deploy / salah tempat → cek langkah 1–2, lalu Redeploy.
- **`"env":false`** → kunci belum diisi atau belum Redeploy → ulangi langkah 3.

## Mengedit website

1. Edit `source/index.readable.html`.
2. Jalankan `node tools/encode.js` (butuh Node.js) → `index.html` diperbarui.
3. `git add . && git commit -m "update" && git push` → Vercel otomatis deploy.

## Keamanan

- **Jangan** commit file kunci service account (`.gitignore` sudah menolaknya).
- Kalau kunci pernah ter-upload ke GitHub: Firebase Console → Service accounts → hapus kunci lama
  lalu buat yang baru, dan perbarui di Vercel.
- Base64 pada `index.html` hanya menyamarkan kode, bukan mengamankan. Keamanan data dijaga oleh
  Firestore Rules dan login admin.
