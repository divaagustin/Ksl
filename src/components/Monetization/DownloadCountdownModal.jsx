import React, { useState, useEffect } from 'react';
import { Download, Loader2, Sparkles } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import AdBanner from './AdBanner';

export default function DownloadCountdownModal({ isOpen, onConfirmDownload, onCancel }) {
  const { config } = useAdmin();
  const initialSeconds = config.ads.downloadCountdownSeconds || 3;
  const [countdown, setCountdown] = useState(initialSeconds);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(initialSeconds);
      return;
    }

    // If countdown is disabled by Admin, confirm immediately
    if (!config.ads.enableDownloadCountdown) {
      onConfirmDownload();
      return;
    }

    setCountdown(initialSeconds);
  }, [isOpen, initialSeconds, config.ads.enableDownloadCountdown]);

  useEffect(() => {
    if (!isOpen || !config.ads.enableDownloadCountdown) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, countdown, config.ads.enableDownloadCountdown]);

  const handleDownloadClick = () => {
    // High-CTR monetization: open Direct Link in new tab if enabled
    if (config.ads.enabled && config.ads.enableDirectLinkOnDownload) {
      let directLink = '';
      if (config.ads.provider === 'adsterra' && config.ads.adsterraDirectLink) {
        directLink = config.ads.adsterraDirectLink;
      } else if (config.ads.provider === 'monetag' && config.ads.monetagDirectLink) {
        directLink = config.ads.monetagDirectLink;
      }

      if (directLink && directLink.trim()) {
        try {
          window.open(directLink.trim(), '_blank', 'noopener,noreferrer');
        } catch (e) {
          console.warn('Direct link open failed:', e);
        }
      }
    }
    onConfirmDownload();
  };

  if (!isOpen || !config.ads.enableDownloadCountdown) return null;

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div class="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl">
        <div class="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Sparkles class="w-6 h-6" />
        </div>

        <h3 class="text-lg font-bold text-white mb-1">File Anda Sedang Disiapkan</h3>
        <p class="text-xs text-slate-400 mb-4">
          Tunggu sejenak untuk memulai pengunduhan otomatis...
        </p>

        {/* Ad slot during download waiting time */}
        <AdBanner slot="download-modal" className="my-3" />

        <div class="mt-4">
          {countdown > 0 ? (
            <div class="flex items-center justify-center gap-2 py-3 bg-slate-800 rounded-xl text-slate-300 text-sm font-semibold">
              <Loader2 class="w-4 h-4 animate-spin text-indigo-400" />
              <span>Mengunduh dalam {countdown} detik...</span>
            </div>
          ) : (
            <button
              onClick={handleDownloadClick}
              class="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition cursor-pointer"
            >
              <Download class="w-4 h-4" />
              <span>Unduh File Sekarang</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
