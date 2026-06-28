# HOLOTYPE — pustaka kartu AR

WebXR AR viewer dengan pustaka aset yang bisa dibagikan sebagai **kartu holografik**: tiap kartu punya thumbnail, QR code, dan link. Pindai QR-nya → aset langsung terbuka di AR (GLB di Android/WebXR/Scene Viewer, USDZ di iOS Quick Look). Mendukung audio, dan **video sebagai tekstur** di dalam sesi WebXR. Penyimpanan permanen pakai **Vercel Blob**, dengan login sederhana (password) untuk unggah/hapus.

## Isi proyek

```
index.html        # seluruh frontend (UI, viewer, kartu, WebXR video)
api/upload.js      # token client-upload Vercel Blob (cek password)
api/library.js     # GET daftar aset (publik) · POST tambah aset (password)
api/delete.js      # hapus aset + filenya (password)
api/_lib.js        # baca/tulis manifest library/index.json di Blob
package.json
.env.example
```

## Cara deploy ke Vercel

1. **Push** folder ini ke sebuah repo Git (GitHub/GitLab/Bitbucket) lalu **Import** di [vercel.com/new](https://vercel.com/new). Framework Preset: **Other** (biarkan default — `index.html` disajikan statis, folder `api/` jadi serverless functions).

2. **Buat Blob store**: di project Vercel → tab **Storage** → **Create Database** → **Blob**. Vercel otomatis menambahkan env var `BLOB_READ_WRITE_TOKEN` ke project.

3. **Set password**: project → **Settings → Environment Variables** → tambahkan
   ```
   APP_PASSWORD = kata-sandi-pilihanmu
   ```

4. **Redeploy** (Deployments → ⋯ → Redeploy) agar env var terbaca.

Selesai. Buka URL-nya, klik **Masuk**, masukkan `APP_PASSWORD`, lalu **Unggah**.

## Menjalankan lokal

```bash
npm install -g vercel
vercel link
vercel env pull        # ambil BLOB_READ_WRITE_TOKEN + APP_PASSWORD ke .env
vercel dev
```

> Catatan: callback `onUploadCompleted` Vercel Blob tidak terpanggil di `localhost`. Aplikasi ini sengaja **tidak** bergantung padanya — manifest ditulis lewat `POST /api/library` setelah semua file terunggah, jadi unggah tetap jalan saat `vercel dev`.

## Cara pakai

- **Unggah** — GLB wajib. USDZ, audio, video, dan thumbnail opsional. Kalau thumbnail kosong, dibuatkan otomatis dari render model. File diunggah langsung dari browser ke Blob (client upload) sehingga aman untuk file besar (jauh di atas batas 4.5 MB serverless).
- **Lihat di AR** — tombol AR memakai `<model-viewer>`: Android → WebXR/Scene Viewer, iOS → Quick Look (butuh file USDZ).
- **AR + Video** — sesi WebXR (Three.js) yang menempatkan video sebagai tekstur di permukaan nyata lewat hit-test. Berjalan di perangkat yang mendukung `immersive-ar` (umumnya Android Chrome).
- **Bagikan / Buka kartu** — pop-up flashcard holografik berisi thumbnail, QR, dan link. **Simpan ke Foto** memakai Web Share (di HP muncul opsi "Simpan Gambar"), atau mengunduh PNG di desktop. **Salin** menyalin link. QR & link menuju `?asset=<id>` yang otomatis membuka kartu aset itu.

## Batasan yang perlu diketahui

- **Login sederhana**: ini gerbang berbasis satu password (env `APP_PASSWORD`), bukan sistem akun. Cukup untuk membatasi unggah/hapus, bukan untuk data sensitif.
- **Video tekstur di iOS**: Safari belum mendukung `immersive-ar` WebXR, jadi fitur "AR + Video" berlaku untuk Android/perangkat WebXR. Di iOS gunakan "Lihat di AR" (Quick Look via USDZ).
- **Audio**: diputar di tampilan web/WebXR; mode Quick Look & Scene Viewer tidak memutar audio web.
- Library disimpan sebagai `library/index.json` di Blob (last-write-wins).

## Dependensi (via CDN, tak perlu build)

`@google/model-viewer`, `three` (+ GLTFLoader), `qrcode`, `@vercel/blob/client` (esm.sh), Google Fonts (Space Grotesk / Inter / Space Mono).
