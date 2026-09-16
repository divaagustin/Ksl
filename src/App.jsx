import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import RemoveBgTool from './components/Tools/RemoveBgTool';
import DocOcrTool from './components/Tools/DocOcrTool';
import CloudTempTool from './components/Tools/CloudTempTool';
import ImageResizeTool from './components/Tools/ImageResizeTool';
import ImageHdTool from './components/Tools/ImageHdTool';
import CamScannerTool from './components/Tools/CamScannerTool';
import DownloadPage from './components/DownloadPage';
import AdBanner from './components/Monetization/AdBanner';
import DonationModal from './components/Monetization/DonationModal';
import DownloadCountdownModal from './components/Monetization/DownloadCountdownModal';
import ServerCostProgressBar from './components/Monetization/ServerCostProgressBar';
import AdminDashboard from './components/Admin/AdminDashboard';
import LegalModal from './components/Legal/LegalModal';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { autoCleanupExpiredFiles } from './services/cloudTempService';
import { Wrench } from 'lucide-react';

function MainAppContent() {
  const { config, recordUserActivity } = useAdmin();
  const [activeTab, setActiveTab] = useState('remove-bg');
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isAfterDownloadDonation, setIsAfterDownloadDonation] = useState(false);
  const [isAuthorPage, setIsAuthorPage] = useState(false);
  const [downloadShortId, setDownloadShortId] = useState(null);
  const [pendingDownload, setPendingDownload] = useState(null);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState('privacy');

  // Trigger auto cleanup of expired files on mount
  useEffect(() => {
    autoCleanupExpiredFiles();
  }, []);

  // Inject global Adsterra / Monetag script (Social Bar / MultiTag) if configured
  useEffect(() => {
    if (!config.ads.enabled) return;

    let globalScriptCode = '';
    let scriptId = '';

    if (config.ads.provider === 'adsterra' && config.ads.adsterraSocialBarCode) {
      globalScriptCode = config.ads.adsterraSocialBarCode;
      scriptId = 'adsterra-socialbar-script';
    } else if (config.ads.provider === 'monetag' && config.ads.monetagMultiTagCode) {
      globalScriptCode = config.ads.monetagMultiTagCode;
      scriptId = 'monetag-multitag-script';
    }

    if (globalScriptCode.trim() && !document.getElementById(scriptId)) {
      try {
        const container = document.createElement('div');
        container.id = scriptId;
        const range = document.createRange();
        range.selectNode(document.body);
        const fragment = range.createContextualFragment(globalScriptCode);
        container.appendChild(fragment);
        document.body.appendChild(container);
      } catch (e) {
        console.warn('Global ad script injection failed:', e);
      }
    }
  }, [config.ads.enabled, config.ads.provider, config.ads.adsterraSocialBarCode, config.ads.monetagMultiTagCode]);

  // Check hidden Author Route (/author or #author), Legal Route (#privacy / #terms), & Short Download Route (/s/:shortId)
  useEffect(() => {
    const checkRoutes = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      // 1. Author Admin Route
      if (path.endsWith('/author') || path.endsWith('/author/') || hash === '#author') {
        setIsAuthorPage(true);
        setDownloadShortId(null);
        return;
      }
      setIsAuthorPage(false);

      // 2. Legal Policy Routes (#privacy or #terms)
      if (hash === '#privacy') {
        setLegalTab('privacy');
        setIsLegalModalOpen(true);
      } else if (hash === '#terms') {
        setLegalTab('terms');
        setIsLegalModalOpen(true);
      }

      // 2. Short Download Link Route (/s/:shortId or #s/:shortId)
      const pathMatch = window.location.pathname.match(/\/s\/([a-zA-Z0-9]+)/i);
      const hashMatch = window.location.hash.match(/#s\/([a-zA-Z0-9]+)/i);
      if (pathMatch && pathMatch[1]) {
        setDownloadShortId(pathMatch[1]);
      } else if (hashMatch && hashMatch[1]) {
        setDownloadShortId(hashMatch[1]);
      } else {
        setDownloadShortId(null);
      }
    };

    checkRoutes();

    window.addEventListener('popstate', checkRoutes);
    window.addEventListener('hashchange', checkRoutes);

    // Secret Key Shortcut: Ctrl + Shift + A
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAuthorPage((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', checkRoutes);
      window.removeEventListener('hashchange', checkRoutes);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const activeToolConfig = config.tools[activeTab] || { enabled: true };

  const handleRequestDownload = (blob, filename) => {
    // Record user activity for live analytics tracking
    const toolNames = {
      'remove-bg': 'Remove BG',
      'doc-converter': 'To Word OCR',
      'image-resize': 'Image Resize',
      'image-hd': 'Image HD',
      'cam-scanner': 'Cam Scanner',
    };
    recordUserActivity(activeTab, toolNames[activeTab] || activeTab, `Mengunduh ${filename}`);

    if (!config.ads.enableDownloadCountdown) {
      // Direct download if countdown disabled
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      setIsAfterDownloadDonation(true);
      setIsDonationOpen(true);
    } else {
      setPendingDownload({ blob, filename });
    }
  };

  const handleConfirmDownload = () => {
    if (!pendingDownload) return;
    const { blob, filename } = pendingDownload;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);

    setPendingDownload(null);
    setIsAfterDownloadDonation(true);
    setIsDonationOpen(true);
  };

  const returnToMainApp = () => {
    setIsAuthorPage(false);
    if (window.location.hash === '#author') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // If visiting /author, render standalone Author Portal Page
  if (isAuthorPage) {
    return <AdminDashboard onReturnToApp={returnToMainApp} />;
  }

  // If visiting /s/:shortId, render standalone File Download Page
  if (downloadShortId) {
    return (
      <DownloadPage
        shortId={downloadShortId}
        onReturnToHome={() => {
          setDownloadShortId(null);
          window.history.pushState(null, '', window.location.origin);
        }}
      />
    );
  }

  return (
    <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Header onOpenDonation={() => { setIsAfterDownloadDonation(false); setIsDonationOpen(true); }} />

      <main class="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        <div class="text-center max-w-2xl mx-auto space-y-2">
          <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Alat Produktivitas Ringan &amp; <span class="text-indigo-400">Powerful</span>
          </h1>
          <p class="text-slate-400 text-sm">
            Semua tools diproses 100% di browser tanpa biaya langganan dan tanpa batas pemakaian.
          </p>
        </div>

        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Active Tool Panel */}
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {!activeToolConfig.enabled ? (
            <div class="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div class="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/20">
                <Wrench class="w-7 h-7" />
              </div>
              <h3 class="text-lg font-bold text-white">Fitur Sedang Dalam Pemeliharaan</h3>
              <p class="text-xs text-slate-400 max-w-md">
                Tool ini sementara waktu dinonaktifkan oleh Admin. Silakan coba fitur lain yang tersedia.
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'remove-bg' && <RemoveBgTool onRequestDownload={handleRequestDownload} />}
              {activeTab === 'doc-converter' && <DocOcrTool onRequestDownload={handleRequestDownload} />}
              {activeTab === 'cloud-temp' && <CloudTempTool />}
              {activeTab === 'image-resize' && <ImageResizeTool onRequestDownload={handleRequestDownload} />}
              {activeTab === 'image-hd' && <ImageHdTool onRequestDownload={handleRequestDownload} />}
              {activeTab === 'cam-scanner' && <CamScannerTool onRequestDownload={handleRequestDownload} />}
            </>
          )}
        </div>

        {/* Server Cost Progress Bar Transparency */}
        <ServerCostProgressBar
          onOpenDonation={() => { setIsAfterDownloadDonation(false); setIsDonationOpen(true); }}
        />

        <AdBanner slot="footer-main" />
      </main>

      <footer class="border-t border-slate-800/80 bg-slate-900/60 py-6 text-center text-xs text-slate-500">
        <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 KitsLight — 100% In-Browser Privacy Tools.</p>
          <div class="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => { setLegalTab('privacy'); setIsLegalModalOpen(true); }}
              class="hover:text-white transition cursor-pointer text-xs"
            >
              Kebijakan Privasi
            </button>
            <button
              onClick={() => { setLegalTab('terms'); setIsLegalModalOpen(true); }}
              class="hover:text-white transition cursor-pointer text-xs"
            >
              Syarat &amp; Ketentuan
            </button>
            <button onClick={() => { setIsAfterDownloadDonation(false); setIsDonationOpen(true); }} class="text-amber-400 font-bold hover:underline cursor-pointer">
              Sawer Kopi ☕
            </button>
          </div>
        </div>
      </footer>

      {/* Interstitial Download Countdown Modal */}
      <DownloadCountdownModal
        isOpen={!!pendingDownload}
        onConfirmDownload={handleConfirmDownload}
        onCancel={() => setPendingDownload(null)}
      />

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
        isAfterDownload={isAfterDownloadDonation}
      />

      {/* Legal & Privacy Policy Modal */}
      <LegalModal
        isOpen={isLegalModalOpen}
        defaultTab={legalTab}
        onClose={() => {
          setIsLegalModalOpen(false);
          if (window.location.hash === '#privacy' || window.location.hash === '#terms') {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <MainAppContent />
    </AdminProvider>
  );
}
