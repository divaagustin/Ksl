import React, { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_CONFIG = {
  adminPasscode: 'Xas2356S@',
  tools: {
    'remove-bg': { enabled: true, name: 'AI Background Removal', maxFileSizeMB: 15 },
    'doc-converter': { enabled: true, name: 'PDF & Image OCR to Word', maxFileSizeMB: 20 },
    'cloud-temp': { enabled: true, name: 'Cloud Temporary File Sharing', maxFileSizeMB: 25, maxDurationHours: 24 },
    'image-resize': { enabled: true, name: 'Image Resizer & Converter', maxFileSizeMB: 20 },
    'image-hd': { enabled: true, name: 'Image HD & Super Sharpening', maxFileSizeMB: 15 },
    'cam-scanner': { enabled: true, name: 'Cam Scanner Digitalizer', maxFileSizeMB: 15 },
  },
  ads: {
    enabled: true,
    provider: 'adsterra', // 'adsterra' | 'monetag' | 'adsense' | 'custom'
    // Adsterra Settings
    adsterraDirectLink: '',
    adsterraBannerCode: '',
    adsterraSocialBarCode: '',
    // Monetag Settings
    monetagDirectLink: '',
    monetagBannerCode: '',
    monetagMultiTagCode: '',
    // Common Action triggers
    enableDirectLinkOnDownload: false,
    enableDownloadCountdown: true,
    downloadCountdownSeconds: 3,
    // Google AdSense Legacy
    adsenseClientId: '',
    headerSlot: '',
    inToolSlot: '',
    downloadModalSlot: '',
    footerSlot: '',
  },
  donation: {
    enabled: true,
    saweriaUrl: 'https://saweria.co/kitslight',
    trakteerUrl: 'https://trakteer.id/kitslight',
    monthlyTarget: 150000,
    currentCollected: 45000,
    showServerProgressBar: true,
  },
  r2Storage: {
    enabled: true,
    accountId: '',
    accessKeyId: '',
    secretAccessKey: '',
    bucketName: 'kitslight-temp-files',
    publicDomain: '',
    workerUrl: 'https://kitslight-r2-api.divaagustinpurba.workers.dev',
  },
  stats: {
    totalPageviews: 3480,
    activeUsersCount: 1240,
    totalDownloads: 890,
    totalAdImpressions: 5120,
    toolUsage: {
      'remove-bg': 410,
      'doc-converter': 230,
      'cloud-temp': 180,
      'image-resize': 310,
      'image-hd': 160,
      'cam-scanner': 150,
    },
    activityLog: [
      { id: '1', action: 'Unduh Hasil PNG Transparan', tool: 'Remove BG', timestamp: '2 menit lalu' },
      { id: '2', action: 'Konversi PDF ke Word (.docx)', tool: 'To Word', timestamp: '5 menit lalu' },
      { id: '3', action: 'Mengubah Ukuran Foto ke 1080x1080', tool: 'Image Resize', timestamp: '8 menit lalu' },
      { id: '4', action: 'Mengunggah File Temporary (12 MB)', tool: 'Cloud Temp', timestamp: '12 menit lalu' },
      { id: '5', action: 'Penajaman Foto Upscale 2x', tool: 'Image HD', timestamp: '15 menit lalu' },
      { id: '6', action: 'Scan Dokumen PDF (Sauvola B&W)', tool: 'Cam Scanner', timestamp: '20 menit lalu' },
    ]
  }
};

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('kitslight_admin_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.adminPasscode === 'admin123') {
          parsed.adminPasscode = 'Xas2356S@';
        }
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          ads: {
            ...DEFAULT_CONFIG.ads,
            ...(parsed.ads || {}),
          },
        };
      }
      return DEFAULT_CONFIG;
    } catch (e) {
      return DEFAULT_CONFIG;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('kitslight_admin_config', JSON.stringify(config));
      if (config.r2Storage?.workerUrl) {
        fetch('/api/set-worker-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workerUrl: config.r2Storage.workerUrl }),
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Failed to save admin config to localStorage:', e);
    }
  }, [config]);

  // Track Pageview once per browser session
  useEffect(() => {
    if (!sessionStorage.getItem('kitslight_visited')) {
      sessionStorage.setItem('kitslight_visited', 'true');
      setConfig((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          totalPageviews: (prev.stats.totalPageviews || 0) + 1,
        },
      }));
    }
  }, []);

  const loginAdmin = (passcode) => {
    if (passcode === config.adminPasscode) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAuthenticated(false);
  };

  const updateToolsConfig = (toolId, updates) => {
    setConfig((prev) => ({
      ...prev,
      tools: {
        ...prev.tools,
        [toolId]: { ...prev.tools[toolId], ...updates },
      },
    }));
  };

  const updateAdsConfig = (updates) => {
    setConfig((prev) => ({
      ...prev,
      ads: { ...prev.ads, ...updates },
    }));
  };

  const updateDonationConfig = (updates) => {
    setConfig((prev) => ({
      ...prev,
      donation: { ...prev.donation, ...updates },
    }));
  };

  const updateR2Config = (updates) => {
    setConfig((prev) => ({
      ...prev,
      r2Storage: { ...(prev.r2Storage || {}), ...updates },
    }));
  };

  const changePasscode = (newPasscode) => {
    setConfig((prev) => ({ ...prev, adminPasscode: newPasscode }));
  };

  const resetToDefault = () => {
    setConfig(DEFAULT_CONFIG);
  };

  // Track user interaction & activity log
  const recordUserActivity = (toolId, toolName, actionName) => {
    const newLogItem = {
      id: Date.now().toString(),
      action: actionName,
      tool: toolName,
      timestamp: 'Baru saja',
    };

    setConfig((prev) => {
      const toolCount = prev.stats.toolUsage[toolId] || 0;
      const updatedLog = [newLogItem, ...(prev.stats.activityLog || [])].slice(0, 15);

      return {
        ...prev,
        stats: {
          ...prev.stats,
          activeUsersCount: (prev.stats.activeUsersCount || 0) + 1,
          toolUsage: {
            ...prev.stats.toolUsage,
            [toolId]: toolCount + 1,
          },
          activityLog: updatedLog,
        },
      };
    });
  };

  return (
    <AdminContext.Provider
      value={{
        config,
        isAuthenticated,
        loginAdmin,
        logoutAdmin,
        updateToolsConfig,
        updateAdsConfig,
        updateDonationConfig,
        updateR2Config,
        changePasscode,
        resetToDefault,
        recordUserActivity,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
