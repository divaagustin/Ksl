# Project Context & Progress Log (MEMORY.md)
## Project: KitsLight — All-in-One Lightweight Productivity Micro-Tools

---

## 1. Project Context & Evolution History

### 1.1 Initial State (Legacy Node.js Monolith)
- **Repo State**: Node.js Express server (`server.js`) dengan frontend statis di `/public`.

### 1.2 Architectural Decision Record (ADR)
- **ADR-001: Pivot ke Vite + Cloudflare Ecosystem**
  - *Keputusan*: Mengubah arsitektur menjadi **Vite (Frontend Statis)** di-host di **Cloudflare Pages**, dan **Cloudflare R2 + Workers** untuk backend *Cloud Temp*.
  - *Alasan*: Menjamin biaya operasional Rp 0/bulan (0 Egress fee), tahan terhadap trafik raksasa, dan memaksimalkan *profit margin* dari monetisasi Iklan (AdSense) & Donasi (Saweria/Trakteer).
- **ADR-002: Standalone Author Portal Page via `/author` Route**
  - *Keputusan*: Mengubah modal popup admin menjadi **Halaman Terpisah (Standalone Page)** yang dapat diakses via `/author` / `#author` atau `Ctrl + Shift + A`.
  - *Alasan*: Memungkinkan pemantauan **Trafik Pengunjung (Melihat vs Aktif bertransaksi)** secara visual & terpisah dari UI publik.

---

## 2. Monetization & Business Setup Log

| Revenue Stream | Channel | Placement / Strategy | Status |
| :--- | :--- | :--- | :--- |
| **Iklan Utama** | Google AdSense | Banner In-Tool & Header | Configurable via Admin |
| **Iklan High-CTR**| Countdown Modal | Pop-up 3-5 detik saat tombol Download diklik | Configurable via Admin |
| **Donasi Mikro** | Saweria / Trakteer.id | Success Download Modal + Progress Bar Biaya Server | Configurable via Admin |

---

## 3. Audit & Resolution Status

- [x] **Refactoring Frontend (Vite Migration)**: Migrasi frontend ke React + Vite + Tailwind CSS.
- [x] **Perbaikan Bug Logic**: Web Worker untuk Image HD, Sauvola Binarization untuk Cam Scanner.
- [x] **Halaman Standalone Author Portal**: Halaman penuh khusus `/author` lengkap dengan analitik trafik pengunjung (Melihat vs Aktif) & kontrol sistem.
