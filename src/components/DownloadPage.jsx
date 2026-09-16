import React, { useState, useEffect } from 'react';
import {
  Download,
  FileCheck,
  AlertTriangle,
  Clock,
  HardDrive,
  Coffee,
  ArrowLeft,
  ShieldCheck,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { getTempFileMetadata, getTempFileBlob } from '../services/cloudTempService';
import AdBanner from './Monetization/AdBanner';
import DonationModal from './Monetization/DonationModal';

export default function DownloadPage({ shortId, onReturnToHome }) {
  const { config, recordUserActivity } = useAdmin();
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);

  // Ad & Interstitial Countdown state
  const countdownDuration = config.ads?.enableDownloadCountdown
    ? config.ads?.downloadCountdownSeconds || 3
    : 0;
  const [countdown, setCountdown] = useState(countdownDuration);
  const [canDownload, setCanDownload] = useState(countdownDuration === 0);

  // Load File Metadata on Mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const meta = await getTempFileMetadata(shortId);
        if (!meta) {
          setErrorMessage('File dengan ID ini tidak ditemukan atau telah dihapus.');
        } else {
          setMetadata(meta);
        }
      } catch (err) {
        setErrorMessage('Gagal memuat informasi file. Silakan coba lagi.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [shortId]);

  // Handle Interstitial Countdown Timer
  useEffect(() => {
    if (!metadata || metadata.isExpired || countdownDuration === 0) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanDownload(true);
    }
  }, [metadata, countdown, countdownDuration]);

  // Trigger File Download
  const handleDownloadFile = async () => {
    if (!metadata || metadata.isExpired || isDownloading) return;

    setIsDownloading(true);
    try {
      const blob = await getTempFileBlob(shortId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = metadata.fileName || `file-${shortId}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      setDownloadSuccess(true);
      recordUserActivity('cloud-temp', 'Cloud Temp', `Mengunduh ${metadata.fileName} via /s/${shortId}`);

      // Optionally show donation popup after download
      setTimeout(() => setIsDonationOpen(true), 1500);
    } catch (err) {
      console.error('Download error:', err);
      setErrorMessage(err.message || 'Gagal mengunduh file.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header class="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur">
        <div class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div class="flex items-center gap-3 cursor-pointer" onClick={onReturnToHome}>
            <div class="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center text-white font-extrabold shadow-lg shadow-indigo-500/20">
              K
            </div>
            <div>
              <span class="font-extrabold text-base text-white">KitsLight</span>
              <span class="text-[10px] text-slate-400 block -mt-1">Cloud Temporary Download Portal</span>
            </div>
          </div>

          <button
            onClick={onReturnToHome}
            class="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-3 py-2 rounded-xl transition border border-slate-700 cursor-pointer"
          >
            <ArrowLeft class="w-3.5 h-3.5" />
            <span>Semua Tools Gratis</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main class="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6">
        <AdBanner slot="download-page-top" />

        {isLoading ? (
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <Loader2 class="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
            <p class="text-sm text-slate-400 font-medium">Memeriksa ketersediaan file sementara...</p>
          </div>
        ) : errorMessage || !metadata ? (
          <div class="bg-slate-900 border border-red-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-2xl">
            <div class="w-16 h-16 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
              <AlertTriangle class="w-8 h-8" />
            </div>
            <h2 class="text-xl font-bold text-white">File Tidak Tersedia / Kadaluarsa</h2>
            <p class="text-xs text-slate-400 max-w-md mx-auto">
              {errorMessage || 'File sementara ini telah otomatis dihapus oleh sistem setelah masa aktif berakhir demi alasan privasi.'}
            </p>
            <button
              onClick={onReturnToHome}
              class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition cursor-pointer shadow-lg shadow-indigo-600/25 mt-2"
            >
              <ArrowLeft class="w-4 h-4" />
              <span>Kembali ke Halaman Utama</span>
            </button>
          </div>
        ) : (
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* File Header Details */}
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0">
                  <FileCheck class="w-7 h-7" />
                </div>
                <div>
                  <h1 class="text-lg sm:text-xl font-bold text-white break-all">{metadata.fileName}</h1>
                  <div class="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>Ukuran: <strong class="text-white">{metadata.sizeMB} MB</strong></span>
                    <span>•</span>
                    <span class="flex items-center gap-1">
                      <HardDrive class="w-3.5 h-3.5 text-indigo-400" />
                      {metadata.storageType === 'r2' ? 'Cloudflare R2' : 'Local Cloud'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div class="shrink-0">
                {metadata.isExpired ? (
                  <span class="px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1.5">
                    <AlertTriangle class="w-3.5 h-3.5" />
                    <span>Kadaluarsa</span>
                  </span>
                ) : (
                  <span class="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                    <CheckCircle class="w-3.5 h-3.5" />
                    <span>File Aktif &amp; Ready</span>
                  </span>
                )}
              </div>
            </div>

            {/* Expiration Notice Box */}
            <div class="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between text-xs">
              <div class="flex items-center gap-2 text-slate-300">
                <Clock class="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Otomatis terhapus pada: <strong class="text-white">{metadata.expiresAtFormatted}</strong></span>
              </div>
              <span class="text-[10px] font-mono text-slate-500">ID: {metadata.shortId}</span>
            </div>

            {/* Download Action Section */}
            <div class="space-y-4 py-2">
              {metadata.isExpired ? (
                <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center text-xs text-red-400 font-semibold">
                  Masa aktif file ini telah habis. File telah terhapus permanen dari server.
                </div>
              ) : (
                <div class="space-y-3">
                  <button
                    onClick={handleDownloadFile}
                    disabled={!canDownload || isDownloading}
                    class="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold py-4 px-6 rounded-2xl transition shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 text-base cursor-pointer"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 class="w-5 h-5 animate-spin" />
                        <span>Mengunduh File...</span>
                      </>
                    ) : !canDownload ? (
                      <>
                        <Clock class="w-5 h-5 text-indigo-200 animate-pulse" />
                        <span>Menyiapkan Tombol Unduh... ({countdown}s)</span>
                      </>
                    ) : (
                      <>
                        <Download class="w-5 h-5" />
                        <span>Unduh File Sekarang ({metadata.sizeMB} MB)</span>
                      </>
                    )}
                  </button>

                  {downloadSuccess && (
                    <div class="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400">
                      <CheckCircle class="w-4 h-4" />
                      <span>Unduhan dimulai! Terima kasih telah menggunakan KitsLight.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Donation Support Box */}
            <div class="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div class="space-y-1 text-center sm:text-left">
                <div class="flex items-center justify-center sm:justify-start gap-2 text-amber-400 font-bold text-xs">
                  <Coffee class="w-4 h-4" />
                  <span>Dukung Pemeliharaan Cloud Temporary Gratis!</span>
                </div>
                <p class="text-xs text-slate-400">
                  Semua file temporary disajikan tanpa biaya langganan. Traktir kopi admin agar layanan terus aktif.
                </p>
              </div>

              <button
                onClick={() => setIsDonationOpen(true)}
                class="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 shadow-lg shadow-amber-500/20"
              >
                Sawer Kopi ☕
              </button>
            </div>
          </div>
        )}

        <AdBanner slot="download-page-bottom" />
      </main>

      {/* Footer */}
      <footer class="border-t border-slate-800/80 bg-slate-900/60 py-6 text-center text-xs text-slate-500">
        <p>© 2026 KitsLight Temporary File Sharing. Privacy Preserved.</p>
      </footer>

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
        isAfterDownload={true}
      />
    </div>
  );
}
