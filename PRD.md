# Product Requirements Document (PRD)
## Project Name: KitsLight — All-in-One Lightweight Productivity Micro-Tools

---

## 1. Executive Summary & Vision

### 1.1 Overview
**KitsLight** adalah platform web micro-tools produktivitas ringan, cepat, dan mengutamakan privasi (100% *In-Browser Processing* untuk mayoritas alat). Platform ini dirancang untuk menyelesaikan kebutuhan harian pengguna (hapus background foto, konversi PDF/OCR, resize gambar, cam scanner, dan penyimpanan file sementara) tanpa berbayar dan tanpa instalasi aplikasi.

### 1.2 Business Model & Monetization Strategy
KitsLight mengusung model bisnis **100% Gratis untuk Pengguna** dengan 2 sumber pendapatan utama:
1. **Iklan (Google AdSense / Ezoic)**: Monetisasi berbasis trafik tinggi dari pencarian organik Google (SEO) melalui penempatan iklan strategis (banner in-tool & countdown download modal).
2. **Donasi & Saweran (Saweria / Trakteer / Buy Me a Coffee)**: Monetisasi berbasis mikro-tips sukarela dari pengguna yang terbantu melalui modal ucapan terima kasih (*Success Download Modal*) dan transparansi biaya server (*Server Cost Progress Bar*).

### 1.3 Core Value Proposition
- **Super Fast & Lightweight**: Menggunakan Vite & Web Workers, memuat halaman dalam waktu < 1 detik.
- **100% Privacy-First**: Pemrosesan file (gambar & dokumen) dilakukan di browser lokal pengguna (Client-Side WASM/Canvas), tidak pernah diunggah ke server (kecuali fitur Cloud Temp).
- **Zero Server Operating Cost ($0/month)**: Di-deploy di atas Cloudflare Pages & Cloudflare R2 (Bebas biaya bandwidth & hosting statis gratis).

---

## 2. Target Audience & SEO Growth Strategy

### 2.1 Target Audience
- **Mahasiswa & Pelajar**: Butuh kompresi foto, scan dokumen tugas, konversi PDF ke Word.
- **Pekerja Kantor & Freelancer**: Butuh hapus background pas foto, OCR scan dokumen cepat.
- **Pelaku UMKM / Online Shop**: Butuh resize foto produk, peningkatan kualitas gambar HD, dan berbagi file sementara.

### 2.2 SEO & Multi-Route Traffic Acquisition
Untuk memandu trafik pencarian Google langsung ke tool yang tepat:
- **Multi-Route URL**: Setiap tool memiliki URL independen yang dioptimalkan untuk SEO:
  - `/tools/hapus-background-foto` (Keyword: *hapus bg gratis online*)
  - `/tools/convert-pdf-ke-word` (Keyword: *cara ubah pdf ke word*)
  - `/tools/kompres-resize-gambar` (Keyword: *resize foto pasfoto 4x6*)
  - `/tools/scan-dokumen-pdf` (Keyword: *camscanner web tanpa aplikasi*)
  - `/tools/cloud-temporary` (Keyword: *kirim file sementara anonim*)

---

## 3. Detailed Feature Specifications

### 3.1 Feature 1: AI Background Removal
- **Deskripsi**: Menghapus background foto secara otomatis.
- **Engine**: Client-Side WASM (`@imgly/background-removal`).
- **Input**: PNG, JPG, WebP (Max 15 MB).
- **Output**: PNG Transparan.
- **Fallback UX**: Menampilkan pesan error ramah jika WebGL/WASM gagal dimuat (tanpa merusak gambar).

### 3.2 Feature 2: PDF & Image OCR to Word (.docx)
- **Deskripsi**: Mengkstrak teks dari PDF atau Gambar dan mengunduhnya dalam format `.docx`.
- **Engine**: `pdf.js` untuk PDF digital + `Tesseract.js` untuk OCR Gambar/PDF Scan.
- **Alur Cerdas**:
  1. Jika PDF digital (berisi teks), ekstrak langsung via `pdf.js`.
  2. Jika PDF scan (berisi gambar), konversi tiap halaman ke Canvas lalu jalankan `Tesseract.js` OCR.
- **Output**: File Word (.docx) via `docx.js`.

### 3.3 Feature 3: Image Resizer & Format Converter
- **Deskripsi**: Mengubah resolusi (pixel) dan format file gambar.
- **Fitur**: Lock Aspect Ratio, Kualitas Kompresi (0.1 - 1.0), Ubah Format (WebP, JPEG, PNG).
- **Format Output Fix**: Ekstensi file menyesuaikan format pilihan (bukan hardcoded).

### 3.4 Feature 4: Image HD / Sharpener (Super-Resolution Filter)
- **Deskripsi**: Meningkatkan ketajaman foto dan scaling (2x / 4x).
- **Engine**: Canvas 2D + Unsharp Masking Kernel (Laplacian) di dalam **Web Worker** agar UI tidak *freeze*.

### 3.5 Feature 5: Cam Scanner (Document Digitalizer)
- **Deskripsi**: Merubah foto dokumen kertas menjadi file PDF/JPG bersih layaknya scanner fisik.
- **Filter**: Black & White (Sauvola Adaptive Thresholding), Grayscale, Magic Color.
- **Output**: PDF atau JPG.

### 3.6 Feature 6: Cloud Temporary (File Sharing Sementara)
- **Deskripsi**: Berbagi file secara sementara hingga 24 jam dengan link pendek.
- **Engine**: Cloudflare Workers (Backend) + Cloudflare R2 (Object Storage) + Cloudflare KV (Metadata).
- **Batas**: Max 25 MB per file, Auto-Delete 24 Jam via R2 Lifecycle Rules.

---

## 4. Monetization & UX Design Requirements

### 4.1 Ad Placements (Non-Intrusive Layout)
- **In-Tool Action Banner**: Tepat di bawah tombol utama (Process/Download).
- **Download Interstitial Modal**: Countdown 3-5 detik saat mengklik "Download" yang menampilkan banner iklan.
- **Header & Footer Banner**: Banner standar (728x90 & 320x50).

### 4.2 Donation Flow (High Conversion UX)
- **Success Download Modal**: Pop-up ucapan selamat & ajakan sawer via Saweria/Trakteer setelah download sukses.
- **Server Cost Progress Bar**: Transparansi biaya bulanan server di footer (misal: *Target Biaya: Rp 0 / Rp 150.000 (0%)*).

---

## 5. Non-Functional Requirements (NFR)

- **Performance**: Time to Interactive (TTI) < 1.2 detik, Google Lighthouse Score > 90.
- **Security**: Sanitasi XSS pada nama file (`originalName`), Rate Limiting pada API Cloud Temp, No Executable File Upload.
- **Scalability**: Sanggup menampung 500.000+ kunjungan harian tanpa crash.
- **Cost Efficiency**: Biaya operasional hosting & bandwidth Rp 0/bulan di tier gratis Cloudflare.
