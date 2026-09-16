# System Architecture & Technical Specifications (SYSTEM.md)
## Project: KitsLight — All-in-One Lightweight Productivity Micro-Tools

---

## 1. System Architecture Overview

KitsLight menerapkan arsitektur **Hybrid Client-Side Heavy & Serverless Edge**. 90% komputasi (pengolahan gambar, konversi dokumen, OCR, dan scanning) dieksekusi di browser pengguna (Client-Side). Fitur penyimpanan sementara (Cloud Temp) dialihkan ke infrastruktur serverless Edge berbasis **Cloudflare Workers & R2 Storage**.

```
+-------------------------------------------------------------------------------+
|                           CLIENT BROWSER (Vite Single Page App)              |
|                                                                               |
|  +-------------------+  +------------------+  +----------------------------+  |
|  |  AI Remove BG     |  |  Cam Scanner     |  |  Doc OCR / PDF Engine      |  |
|  |  (WASM / WebGL)   |  |  (Adaptive Thresh|  |  (Tesseract.js + pdf.js)   |  |
|  +-------------------+  +------------------+  +----------------------------+  |
|  +-------------------+  +------------------+  +----------------------------+  |
|  |  Image Resizer    |  |  Image HD        |  |  Standalone Author Portal  |  |
|  |  (Canvas 2D API)  |  |  (Web Worker)    |  |  (Hidden Page: /author)    |  |
|  +-------------------+  +------------------+  +----------------------------+  |
+---------------------------------------+---------------------------------------+
                                        | (Khusus Cloud Temp Upload)
                                        v
+-------------------------------------------------------------------------------+
|                       CLOUDFLARE EDGE INFRASTRUCTURE                         |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  | Cloudflare Pages (Static Hosting - HTML/JS/CSS Distributable)             |  |
|  +-------------------------------------------------------------------------+  |
|  +-------------------------------------------------------------------------+  |
|  | Cloudflare Workers (Serverless API Handler for /api/temp-cloud/*)       |  |
|  +-------------------------------------------------------------------------+  |
|  +-----------------------------------+  +----------------------------------+  |
|  | Cloudflare KV                     |  | Cloudflare R2 Storage            |  |
|  | (Metadata: ShortID -> Expiry/Name)|  | (Object Storage with Auto-Delete)|  |
|  +-----------------------------------+  +----------------------------------+  |
+-------------------------------------------------------------------------------+
```

---

## 2. Technology Stack Specifications

| Layer | Technology | Function |
| :--- | :--- | :--- |
| **Frontend Framework** | **Vite + React / Vanilla JS** | Fast bundler, HMR, & Static Production Build |
| **Styling & UI** | **Tailwind CSS + Lucide Icons** | Responsive modern dark-mode design system |
| **Static Deployment** | **Cloudflare Pages** | Zero-cost global CDN static hosting |
| **Client-Side AI/WASM** | `@imgly/background-removal` | In-browser Background Removal |
| **Client-Side OCR** | `Tesseract.js` + `pdf.js` | Optical Character Recognition & PDF Parsing |
| **Doc Processing** | `docx.js` + `jspdf` | Client-side Word & PDF file generation |
| **Multi-Threading** | **Web Workers API** | Non-blocking Canvas Image HD Filter calculations |
| **Standalone Author Portal**| **Dedicated Page (`/author`)** | Analytics traffic pengunjung (melihat vs aktif), AdSense & Donasi |

---

## 3. Hidden Admin Access Protocols & Traffic Analytics

- **Halaman Standalone Rahasia**: Navigasi ke `domain.com/author` atau `#author`.
- **Shortcut Keyboard Rahasia**: `Ctrl + Shift + A`.
- **Analitik Trafik Pengunjung**:
  1. *Total Pageviews*: Pengunjung yang sekadar membuka/melihat website.
  2. *Pengunjung Aktif*: Pengunjung yang mengeksekusi tools / mengunduh file.
  3. *Activity Conversion Rate (%)*: Rasio persentase pengunjung aktif vs pembaca biasa.
  4. *Live Activity Log*: Feed real-time aktivitas pemrosesan file oleh pengunjung.
- **Passcode Keamanan Default**: `admin123`.
