import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  LayoutDashboard,
  Wrench,
  Megaphone,
  Coffee,
  KeyRound,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  Save,
  Users,
  MousePointerClick,
  Download,
  TrendingUp,
  Activity,
  ArrowLeft,
  Clock,
  Sparkles,
  BarChart3,
  HardDrive,
  UploadCloud,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export default function AdminDashboard({ onReturnToApp }) {
  const {
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
  } = useAdmin();

  const [activeTab, setActiveTab] = useState('analytics');
  const [inputPasscode, setInputPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  // Handle Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginAdmin(inputPasscode)) {
      setLoginError('');
      setInputPasscode('');
    } else {
      setLoginError('Passcode salah. Akses ditolak.');
    }
  };

  const showSaveSuccess = (msg = 'Perubahan berhasil disimpan!') => {
    setSavedSuccessMsg(msg);
    setTimeout(() => setSavedSuccessMsg(''), 3000);
  };

  const handleChangePasscodeSubmit = (e) => {
    e.preventDefault();
    if (!newPasscode || newPasscode.length < 4) {
      alert('Passcode minimal 4 karakter.');
      return;
    }
    if (newPasscode !== confirmPasscode) {
      alert('Konfirmasi passcode tidak cocok.');
      return;
    }
    changePasscode(newPasscode);
    setNewPasscode('');
    setConfirmPasscode('');
    showSaveSuccess('Passcode Admin berhasil diperbarui!');
  };

  // Compute Traffic Analytics Numbers
  const totalPageviews = config.stats.totalPageviews || 1;
  const activeUsersCount = config.stats.activeUsersCount || 0;
  const totalDownloads = config.stats.totalDownloads || 0;

  // Percentage of visitors who actually perform an activity (Conversion Rate)
  const activityConversionRate = Math.min(100, Math.round((activeUsersCount / totalPageviews) * 100));

  // Render Full-Page Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div class="text-center space-y-2">
            <div class="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/25">
              <ShieldCheck class="w-8 h-8" />
            </div>
            <h1 class="text-2xl font-extrabold text-white">Author Portal</h1>
            <p class="text-xs text-slate-400">
              Dashboard Kontrol &amp; Analitik Trafik Pengunjung KitsLight
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} class="space-y-4">
            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-300">Passcode Keamanan Admin:</label>
              <div class="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  placeholder="Masukkan Passcode Keamanan..."
                  value={inputPasscode}
                  onChange={(e) => setInputPasscode(e.target.value)}
                  class="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  class="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPasscode ? <EyeOff class="w-4 h-4" /> : <Eye class="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div class="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                <AlertCircle class="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              Masuk Dashboard Admin
            </button>
          </form>

          <div class="pt-4 border-t border-slate-800 text-center">
            <button
              onClick={onReturnToApp}
              class="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
              <span>Kembali ke Website Utama KitsLight</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full-Page Standalone Author Dashboard Portal
  return (
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Full Page Header Navigation */}
      <header class="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur">
        <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
              <ShieldCheck class="w-6 h-6" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-lg text-white">KitsLight Author Portal</span>
                <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live Traffic &amp; Control
                </span>
              </div>
              <p class="text-xs text-slate-400">Pantau pengunjung sekadar melihat vs pengunjung aktif bertransaksi.</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button
              onClick={logoutAdmin}
              class="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-3 py-2 rounded-xl transition border border-slate-700 cursor-pointer"
            >
              <LogOut class="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>

            <button
              onClick={onReturnToApp}
              class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg cursor-pointer"
            >
              <ArrowLeft class="w-4 h-4" />
              <span>Ke Website Utama</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Full Page Body */}
      <div class="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Left Sidebar Nav */}
        <aside class="w-full md:w-64 space-y-2 shrink-0">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-1">
            {[
              { id: 'analytics', label: 'Trafik & Aktivitas', icon: BarChart3 },
              { id: 'tools', label: 'Kontrol Fitur & Tools', icon: Wrench },
              { id: 'r2storage', label: 'Cloudflare R2 Storage', icon: HardDrive },
              { id: 'ads', label: 'Iklan (Adsterra / Monetag)', icon: Megaphone },
              { id: 'donation', label: 'Akun Donasi & Target', icon: Coffee },
              { id: 'security', label: 'Keamanan & Reset', icon: KeyRound },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  class={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon class="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
            <span class="text-slate-400 font-semibold block">Status Sistem Host</span>
            <div class="flex items-center justify-between text-slate-300">
              <span>Client AI Engine:</span>
              <span class="text-emerald-400 font-bold">WASM Ready</span>
            </div>
            <div class="flex items-center justify-between text-slate-300">
              <span>Web Worker:</span>
              <span class="text-emerald-400 font-bold">Active</span>
            </div>
            <div class="flex items-center justify-between text-slate-300">
              <span>Biaya Server:</span>
              <span class="text-amber-400 font-bold">Rp 0 / bln</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main class="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {savedSuccessMsg && (
            <div class="bg-emerald-500/15 border border-emerald-500/30 px-5 py-3 rounded-2xl flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <CheckCircle class="w-4 h-4" />
              <span>{savedSuccessMsg}</span>
            </div>
          )}

          {/* TAB 1: DETAILED TRAFFIC & ACTIVITY ANALYTICS */}
          {activeTab === 'analytics' && (
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 class="w-5 h-5 text-indigo-400" /> Analitik Pengunjung &amp; Aktivitas Real-time
                </h3>
                <span class="text-xs text-slate-400 flex items-center gap-1">
                  <Clock class="w-3.5 h-3.5 text-indigo-400" /> Auto-Updated
                </span>
              </div>

              {/* Metric Cards Grid */}
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Pageviews (Hanya Melihat) */}
                <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
                  <div class="flex items-center justify-between text-slate-400 mb-2">
                    <span class="text-xs font-semibold">Total Pengunjung (Melihat)</span>
                    <Users class="w-4 h-4 text-blue-400" />
                  </div>
                  <p class="text-2xl font-extrabold text-white">{totalPageviews.toLocaleString()}</p>
                  <p class="text-[10px] text-slate-500 mt-1">Pengunjung yang membuka web</p>
                </div>

                {/* 2. Active Users (Pengunjung Aktif) */}
                <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
                  <div class="flex items-center justify-between text-slate-400 mb-2">
                    <span class="text-xs font-semibold">Pengunjung Aktif (Pakai Tool)</span>
                    <MousePointerClick class="w-4 h-4 text-emerald-400" />
                  </div>
                  <p class="text-2xl font-extrabold text-emerald-400">{activeUsersCount.toLocaleString()}</p>
                  <p class="text-[10px] text-emerald-500/80 mt-1">Melakukan aksi/pemrosesan</p>
                </div>

                {/* 3. Conversion Rate (%) */}
                <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
                  <div class="flex items-center justify-between text-slate-400 mb-2">
                    <span class="text-xs font-semibold">Tingkat Aktivitas (Conversion)</span>
                    <TrendingUp class="w-4 h-4 text-amber-400" />
                  </div>
                  <p class="text-2xl font-extrabold text-amber-400">{activityConversionRate}%</p>
                  <p class="text-[10px] text-amber-500/80 mt-1">Pengunjung aktif vs melihat</p>
                </div>

                {/* 4. Total Downloads */}
                <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
                  <div class="flex items-center justify-between text-slate-400 mb-2">
                    <span class="text-xs font-semibold">Total File Diunduh</span>
                    <Download class="w-4 h-4 text-indigo-400" />
                  </div>
                  <p class="text-2xl font-extrabold text-indigo-300">{totalDownloads.toLocaleString()}</p>
                  <p class="text-[10px] text-indigo-400/80 mt-1">Hasil olahan diunduh</p>
                </div>
              </div>

              {/* Tool Usage Breakdown */}
              <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 class="text-sm font-bold text-white">Distribusi Pemakaian Tools oleh Pengunjung</h4>
                <div class="space-y-3">
                  {Object.entries(config.tools).map(([id, tool]) => {
                    const count = config.stats.toolUsage?.[id] || 0;
                    const maxUsage = Math.max(...Object.values(config.stats.toolUsage || { a: 1 }));
                    const pct = Math.round((count / (maxUsage || 1)) * 100);

                    return (
                      <div key={id} class="space-y-1 text-xs">
                        <div class="flex justify-between text-slate-300">
                          <span class="font-semibold">{tool.name}</span>
                          <span class="font-bold text-indigo-400">{count}x dipakai</span>
                        </div>
                        <div class="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            class="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Activity Feed Stream */}
              <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 class="text-sm font-bold text-white flex items-center gap-2">
                  <Activity class="w-4 h-4 text-emerald-400" /> Log Aktivitas Pengunjung Terbaru
                </h4>
                <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {(config.stats.activityLog || []).map((item) => (
                    <div
                      key={item.id}
                      class="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div class="flex items-center gap-2.5">
                        <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <div>
                          <span class="font-bold text-white">{item.action}</span>
                          <span class="text-slate-400 ml-2">via tool <span class="text-indigo-400">{item.tool}</span></span>
                        </div>
                      </div>
                      <span class="text-[11px] text-slate-500 font-mono">{item.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TOOLS MANAGEMENT */}
          {activeTab === 'tools' && (
            <div class="space-y-6">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <Wrench class="w-5 h-5 text-indigo-400" /> Kontrol Keaktifan Fitur &amp; Batas File
              </h3>

              <div class="space-y-3">
                {Object.entries(config.tools).map(([id, tool]) => (
                  <div
                    key={id}
                    class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-bold text-white">{tool.name}</span>
                        <span class="text-[10px] font-mono text-slate-500">ID: {id}</span>
                      </div>
                      <p class="text-xs text-slate-400">
                        Batas maksimal ukuran upload: {tool.maxFileSizeMB} MB
                      </p>
                    </div>

                    <div class="flex items-center gap-3 w-full sm:w-auto">
                      <div class="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5">
                        <span class="text-xs text-slate-400">Max MB:</span>
                        <input
                          type="number"
                          value={tool.maxFileSizeMB}
                          onChange={(e) =>
                            updateToolsConfig(id, { maxFileSizeMB: Number(e.target.value) })
                          }
                          class="w-12 bg-transparent text-xs text-white font-bold outline-none text-right"
                        />
                      </div>

                      <button
                        onClick={() => {
                          updateToolsConfig(id, { enabled: !tool.enabled });
                          showSaveSuccess(`Status ${tool.name} diperbarui!`);
                        }}
                        class={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          tool.enabled
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-red-600/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {tool.enabled ? 'Aktif (Enabled)' : 'Nonaktif (Disabled)'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CLOUDFLARE R2 STORAGE MANAGEMENT */}
          {activeTab === 'r2storage' && (
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                  <HardDrive class="w-5 h-5 text-indigo-400" /> Konfigurasi Cloudflare R2 Storage (Cloud Temp)
                </h3>
                <span class="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  S3-Compatible Object Storage
                </span>
              </div>

              {/* Status Toggle Card */}
              <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="space-y-1">
                  <h4 class="text-sm font-bold text-white flex items-center gap-2">
                    <UploadCloud class="w-4 h-4 text-emerald-400" /> Status Koneksi Cloudflare R2
                  </h4>
                  <p class="text-xs text-slate-400">
                    Aktifkan penyimpanan R2 agar file temporary pengguna tersimpan di cloud storage resmi.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newStatus = !config.r2Storage?.enabled;
                    updateR2Config({ enabled: newStatus });
                    showSaveSuccess(
                      newStatus
                        ? 'Cloudflare R2 Storage diaktifkan!'
                        : 'Cloudflare R2 Storage dinonaktifkan (Gunakan Fallback IndexedDB).'
                    );
                  }}
                  class={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    config.r2Storage?.enabled
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {config.r2Storage?.enabled ? 'R2 Storage: AKTIF' : 'R2 Storage: NONAKTIF (Fallback Local)'}
                </button>
              </div>

              {/* R2 Credentials Form */}
              <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div class="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 class="text-sm font-bold text-white">
                      Kredensial API &amp; Bucket Cloudflare R2
                    </h4>
                    <p class="text-xs text-slate-400">
                      Masukkan data yang Anda lihat di Cloudflare Dashboard di bawah ini.
                    </p>
                  </div>
                  <span class="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                    S3 API Compatible
                  </span>
                </div>

                {/* S3 API URL Auto-Parser Box */}
                <div class="bg-indigo-950/30 border border-indigo-500/30 p-4 rounded-xl space-y-2">
                  <label class="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles class="w-3.5 h-3.5 text-indigo-400" />
                    Tempel S3 API Endpoint URL dari Cloudflare (Otomatis Ekstrak Account ID &amp; Bucket):
                  </label>
                  <input
                    type="text"
                    placeholder="https://a1b2c3d4e5f67890.r2.cloudflarestorage.com/nama-bucket"
                    value={config.r2Storage?.s3ApiUrl || ''}
                    onChange={(e) => {
                      const urlVal = e.target.value.trim();
                      const updates = { s3ApiUrl: urlVal };

                      // Auto extract Account ID and Bucket Name from S3 API URL pattern
                      // e.g. https://<account_id>.r2.cloudflarestorage.com/<bucket_name>
                      const match = urlVal.match(/https:\/\/([a-zA-Z0-9]+)\.r2\.cloudflarestorage\.com\/?([a-zA-Z0-9_\-\.]*)/i);
                      if (match) {
                        if (match[1]) updates.accountId = match[1];
                        if (match[2]) updates.bucketName = match[2];
                      }

                      updateR2Config(updates);
                    }}
                    class="w-full bg-slate-900 border border-indigo-500/40 text-white text-xs font-mono rounded-xl px-4 py-2.5 outline-none focus:border-indigo-400"
                  />
                  <p class="text-[11px] text-slate-400">
                    💡 <strong>Tips:</strong> Cukup salin tulisan <i>S3 API</i> yang tertera di Cloudflare Dashboard ke kotak di atas, maka <strong>Account ID</strong> &amp; <strong>Nama Bucket</strong> akan otomatis terisi!
                  </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Public Domain / R2 Public URL */}
                  <div class="md:col-span-2">
                    <label class="text-xs font-bold text-slate-200 block mb-1">
                      1. Public Domain / Dev R2 URL (Dari Tab Settings Bucket):
                    </label>
                    <input
                      type="text"
                      placeholder="https://pub-xxxxxxxx.r2.dev atau https://dl.kitslight.com"
                      value={config.r2Storage?.publicDomain || ''}
                      onChange={(e) => updateR2Config({ publicDomain: e.target.value })}
                      class="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500"
                    />
                    <p class="text-[11px] text-slate-400 mt-1">
                      Dapatkan dari Cloudflare: Masuk ke Bucket R2 &rarr; Tab <strong>Settings</strong> &rarr; <strong>Public Access</strong> (Salin Public Development URL).
                    </p>
                  </div>

                  {/* Account ID */}
                  <div>
                    <label class="text-xs font-medium text-slate-300 block mb-1">
                      2. Cloudflare Account ID:
                    </label>
                    <input
                      type="text"
                      placeholder="Terisi otomatis dari S3 API URL"
                      value={config.r2Storage?.accountId || ''}
                      onChange={(e) => updateR2Config({ accountId: e.target.value })}
                      class="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Bucket Name */}
                  <div>
                    <label class="text-xs font-medium text-slate-300 block mb-1">
                      3. Nama Bucket R2:
                    </label>
                    <input
                      type="text"
                      placeholder="kitslight-temp-files"
                      value={config.r2Storage?.bucketName || ''}
                      onChange={(e) => updateR2Config({ bucketName: e.target.value })}
                      class="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Callout Info for API Token */}
                  <div class="md:col-span-2 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs space-y-1">
                    <span class="font-bold text-amber-400 flex items-center gap-1.5">
                      <HelpCircle class="w-4 h-4" /> Di mana menemukan Access Key ID &amp; Secret Access Key?
                    </span>
                    <p class="text-slate-300 text-[11px]">
                      Halaman Bucket hanya menampilkan Nama &amp; S3 API. Untuk membuat <strong>Access Key ID</strong> dan <strong>Secret Access Key</strong>:
                    </p>
                    <ol class="list-decimal list-inside text-slate-400 text-[11px] space-y-0.5 pt-0.5">
                      <li>Buka halaman utama <strong>R2 Overview</strong> (klik menu <strong>R2</strong> di sidebar paling kiri).</li>
                      <li>Di sebelah kanan atas, klik tombol <strong>"Manage R2 API Tokens"</strong>.</li>
                      <li>Klik <strong>"Create API Token"</strong> (Pilih Permission: <i>Object Read &amp; Write</i>).</li>
                      <li>Cloudflare akan menampilkan <strong>Access Key ID</strong> dan <strong>Secret Access Key</strong> Anda!</li>
                    </ol>
                  </div>

                  {/* Access Key ID */}
                  <div>
                    <label class="text-xs font-medium text-slate-300 block mb-1">
                      4. R2 Access Key ID:
                    </label>
                    <input
                      type="text"
                      placeholder="Access Key ID dari Cloudflare Token"
                      value={config.r2Storage?.accessKeyId || ''}
                      onChange={(e) => updateR2Config({ accessKeyId: e.target.value })}
                      class="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Secret Access Key */}
                  <div>
                    <label class="text-xs font-medium text-slate-300 block mb-1">
                      5. R2 Secret Access Key:
                    </label>
                    <div class="relative">
                      <input
                        type={showSecretKey ? 'text' : 'password'}
                        placeholder="Secret Access Key dari Cloudflare Token"
                        value={config.r2Storage?.secretAccessKey || ''}
                        onChange={(e) => updateR2Config({ secretAccessKey: e.target.value })}
                        class="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecretKey(!showSecretKey)}
                        class="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showSecretKey ? <EyeOff class="w-4 h-4" /> : <Eye class="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Worker URL (Recommended Method) */}
                  <div class="md:col-span-2 p-4 bg-indigo-950/40 border border-indigo-500/40 rounded-xl space-y-2">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <Sparkles class="w-4 h-4" /> Cloudflare Worker URL (Metode Rekomendasi &amp; Paling Mudah):
                      </label>
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        100% Bekerja Lintas-Browser
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="https://kitslight-r2-api.username.workers.dev"
                      value={config.r2Storage?.workerUrl || ''}
                      onChange={(e) => updateR2Config({ workerUrl: e.target.value })}
                      class="w-full bg-slate-900 border border-indigo-500/50 text-white text-xs font-mono rounded-xl px-4 py-2.5 outline-none focus:border-indigo-400"
                    />
                    <p class="text-[11px] text-slate-300">
                      File script Worker siap pakai sudah saya buatkan di proyek Anda: <code class="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-300 font-mono">cloudflare-worker.js</code>. Cukup salin isinya ke Cloudflare Worker gratis, hubungkan R2, lalu tempel URL-nya di sini!
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => showSaveSuccess('Pengaturan Cloudflare R2 berhasil disimpan!')}
                  class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  <Save class="w-4 h-4" />
                  <span>Simpan Pengaturan Cloudflare R2</span>
                </button>
              </div>

              {/* Step-by-Step Tutorial Guide Card */}
              <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div class="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <HelpCircle class="w-5 h-5" />
                  <span>Panduan Cara Membuat Cloudflare R2 Bucket &amp; Mendapatkan Keys</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                  <div class="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <span class="font-bold text-indigo-400 block">Langkah 1: Buat Bucket R2</span>
                    <ol class="list-decimal list-inside space-y-1 text-slate-400">
                      <li>Buka <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" class="text-indigo-400 underline font-semibold inline-flex items-center gap-1">Cloudflare Dashboard <ExternalLink class="w-3 h-3 inline" /></a>.</li>
                      <li>Pilih menu <strong>R2 Object Storage</strong> di sidebar kiri.</li>
                      <li>Klik tombol <strong>Create Bucket</strong>.</li>
                      <li>Beri nama bucket (contoh: <code class="bg-slate-950 px-1 py-0.5 rounded text-indigo-300">kitslight-temp-files</code>).</li>
                    </ol>
                  </div>

                  <div class="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <span class="font-bold text-indigo-400 block">Langkah 2: Aktifkan Public URL</span>
                    <ol class="list-decimal list-inside space-y-1 text-slate-400">
                      <li>Masuk ke bucket yang baru dibuat &rarr; tab <strong>Settings</strong>.</li>
                      <li>Cari bagian <strong>Public Access</strong>.</li>
                      <li>Klik <strong>Allow Access</strong> di <i>Public Development URL</i> (atau hubungkan Custom Domain milik Anda).</li>
                      <li>Salin URL (contoh: <code class="bg-slate-950 px-1 py-0.5 rounded text-indigo-300">https://pub-xxx.r2.dev</code>).</li>
                    </ol>
                  </div>

                  <div class="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 md:col-span-2">
                    <span class="font-bold text-indigo-400 block">Langkah 3: Buat API Token (Access Key &amp; Secret Key)</span>
                    <ol class="list-decimal list-inside space-y-1 text-slate-400">
                      <li>Kembali ke halaman utama R2 &rarr; klik link <strong>Manage R2 API Tokens</strong> di sisi kanan.</li>
                      <li>Klik <strong>Create API Token</strong>.</li>
                      <li>Atur Permissions ke <strong>Object Read &amp; Write</strong>.</li>
                      <li>Klik <strong>Create API Token</strong> lalu salin <strong>Account ID</strong>, <strong>Access Key ID</strong>, dan <strong>Secret Access Key</strong> ke dalam form di atas!</li>
                    </ol>
                  </div>

                  <div class="p-4 bg-slate-900 rounded-xl border border-indigo-500/30 space-y-2 md:col-span-2 bg-indigo-950/20">
                    <span class="font-bold text-emerald-400 block">Langkah 4 (PENTING): Atur CORS Policy pada Bucket R2</span>
                    <p class="text-slate-300">
                      Agar browser pengguna diizinkan mengunggah file langsung ke R2, masuk ke Bucket R2 &rarr; Tab <strong>Settings</strong> &rarr; <strong>CORS Policy</strong> &rarr; Klik <strong>Add CORS Policy</strong> dan tempel JSON berikut:
                    </p>
                    <pre class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-indigo-300 font-mono overflow-x-auto select-all">{`[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"]
  }
]`}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADS MANAGEMENT */}
          {activeTab === 'ads' && (
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-bold text-white flex items-center gap-2">
                    <Megaphone class="w-5 h-5 text-amber-400" /> Integrasi Iklan (Adsterra &amp; Monetag)
                  </h3>
                  <p class="text-xs text-slate-400">
                    Konfigurasi jaringan periklanan CPM tinggi (Adsterra &amp; Monetag) atau Google AdSense.
                  </p>
                </div>
                <button
                  onClick={() => {
                    updateAdsConfig({ enabled: !config.ads.enabled });
                    showSaveSuccess('Status tayangan iklan diperbarui!');
                  }}
                  class={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    config.ads.enabled
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {config.ads.enabled ? 'Iklan AKTIF' : 'Iklan NONAKTIF'}
                </button>
              </div>

              {/* Provider Selection Tabs */}
              <div class="grid grid-cols-3 gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
                {[
                  { id: 'adsterra', label: 'Adsterra', desc: 'Direct Link & Banner' },
                  { id: 'monetag', label: 'Monetag', desc: 'MultiTag & Popunder' },
                  { id: 'adsense', label: 'Google AdSense', desc: 'Display Banners' },
                ].map((item) => {
                  const isCurrent = (config.ads.provider || 'adsterra') === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        updateAdsConfig({ provider: item.id });
                        showSaveSuccess(`Jaringan iklan aktif: ${item.label}`);
                      }}
                      class={`p-3 rounded-xl text-left transition cursor-pointer border ${
                        isCurrent
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-xs font-bold">{item.label}</span>
                        {isCurrent && <span class="w-2 h-2 rounded-full bg-emerald-400"></span>}
                      </div>
                      <span class="text-[10px] text-slate-400 block">{item.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* 1. ADSTERRA PANEL */}
              {(!config.ads.provider || config.ads.provider === 'adsterra') && (
                <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-indigo-500"></span>
                    <h4 class="text-sm font-bold text-white">Pengaturan Format Iklan Adsterra</h4>
                  </div>

                  <div class="space-y-4">
                    <div>
                      <label class="text-xs font-medium text-slate-300 block mb-1">
                        Adsterra Direct Link / Smartlink URL:
                      </label>
                      <input
                        type="url"
                        placeholder="Contoh: https://www.highrevenuegate.com/abcdefgh"
                        value={config.ads.adsterraDirectLink || ''}
                        onChange={(e) => updateAdsConfig({ adsterraDirectLink: e.target.value })}
                        class="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500"
                      />
                      <span class="text-[11px] text-slate-500 mt-1 block">
                        Direct Link dapat dibuka otomatis saat pengguna menekan tombol "Unduh Hasil".
                      </span>
                    </div>

                    <div>
                      <label class="text-xs font-medium text-slate-300 block mb-1">
                        Adsterra Banner Script / HTML Code (300x250 / 728x90):
                      </label>
                      <textarea
                        rows={3}
                        placeholder={`Contoh: <script type="text/javascript">atOptions = {...};</script><script src="//www.topcreativeformat.com/..."></script>`}
                        value={config.ads.adsterraBannerCode || ''}
                        onChange={(e) => updateAdsConfig({ adsterraBannerCode: e.target.value })}
                        class="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl p-3 outline-none focus:border-indigo-500 resize-y"
                      />
                    </div>

                    <div>
                      <label class="text-xs font-medium text-slate-300 block mb-1">
                        Adsterra Social Bar Code:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Contoh: <script type='text/javascript' src='//pl12345678.highrevenuegate.com/...'></script>"
                        value={config.ads.adsterraSocialBarCode || ''}
                        onChange={(e) => updateAdsConfig({ adsterraSocialBarCode: e.target.value })}
                        class="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl p-3 outline-none focus:border-indigo-500 resize-y"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. MONETAG PANEL */}
              {config.ads.provider === 'monetag' && (
                <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <h4 class="text-sm font-bold text-white">Pengaturan Format Iklan Monetag</h4>
                  </div>

                  <div class="space-y-4">
                    <div>
                      <label class="text-xs font-medium text-slate-300 block mb-1">
                        Monetag Direct Link URL:
                      </label>
                      <input
                        type="url"
                        placeholder="Contoh: https://alwingulla.com/..."
                        value={config.ads.monetagDirectLink || ''}
                        onChange={(e) => updateAdsConfig({ monetagDirectLink: e.target.value })}
                        class="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label class="text-xs font-medium text-slate-300 block mb-1">
                        Monetag MultiTag Script Code:
                      </label>
                      <textarea
                        rows={3}
                        placeholder={`Contoh: <script>(function(s,u,z,p){...})(window,document,'script','https://alwingulla.com/tag.min.js',12345);</script>`}
                        value={config.ads.monetagMultiTagCode || ''}
                        onChange={(e) => updateAdsConfig({ monetagMultiTagCode: e.target.value })}
                        class="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl p-3 outline-none focus:border-emerald-500 resize-y"
                      />
                    </div>

                    <div>
                      <label class="text-xs font-medium text-slate-300 block mb-1">
                        Monetag Banner / In-Page Push Code:
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Kode HTML / Script banner Monetag"
                        value={config.ads.monetagBannerCode || ''}
                        onChange={(e) => updateAdsConfig({ monetagBannerCode: e.target.value })}
                        class="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl p-3 outline-none focus:border-emerald-500 resize-y"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. GOOGLE ADSENSE PANEL */}
              {config.ads.provider === 'adsense' && (
                <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-amber-500"></span>
                    <h4 class="text-sm font-bold text-white">Pengaturan Google AdSense</h4>
                  </div>

                  <div class="space-y-3">
                    <div>
                      <label class="text-xs font-medium text-slate-300 block mb-1">
                        AdSense Publisher Client ID (`ca-pub-XXXXXXXXXX`):
                      </label>
                      <input
                        type="text"
                        value={config.ads.adsenseClientId || ''}
                        onChange={(e) => updateAdsConfig({ adsenseClientId: e.target.value })}
                        class="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl px-4 py-2.5 outline-none"
                      />
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label class="text-[11px] text-slate-400 block mb-1">Slot Iklan Header (728x90):</label>
                        <input
                          type="text"
                          value={config.ads.headerSlot || ''}
                          onChange={(e) => updateAdsConfig({ headerSlot: e.target.value })}
                          class="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl px-3 py-2 outline-none"
                        />
                      </div>
                      <div>
                        <label class="text-[11px] text-slate-400 block mb-1">Slot Iklan In-Tool Action:</label>
                        <input
                          type="text"
                          value={config.ads.inToolSlot || ''}
                          onChange={(e) => updateAdsConfig({ inToolSlot: e.target.value })}
                          class="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl px-3 py-2 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* High-CTR Monetization & Countdown Settings */}
              <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h4 class="text-sm font-bold text-white">Strategi Monetisasi High-CTR</h4>

                {/* Direct Link on Download Toggle */}
                <div class="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div>
                    <span class="text-xs font-bold text-white block">Buka Direct Link saat Klik Unduh</span>
                    <span class="text-[11px] text-slate-400">
                      Membuka link sponsor Adsterra/Monetag di tab baru saat pengguna mengklik tombol unduh.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      updateAdsConfig({ enableDirectLinkOnDownload: !config.ads.enableDirectLinkOnDownload });
                      showSaveSuccess('Pengaturan Direct Link diperbarui!');
                    }}
                    class={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      config.ads.enableDirectLinkOnDownload
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {config.ads.enableDirectLinkOnDownload ? 'AKTIF' : 'NONAKTIF'}
                  </button>
                </div>

                {/* Countdown Modal Toggle */}
                <div class="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <div>
                    <span class="text-xs font-bold text-white block">Download Interstitial Countdown</span>
                    <span class="text-[11px] text-slate-400">Jeda hitung mundur sebelum mengunduh untuk penayangan iklan.</span>
                  </div>
                  <button
                    onClick={() => {
                      updateAdsConfig({ enableDownloadCountdown: !config.ads.enableDownloadCountdown });
                      showSaveSuccess('Status Interstitial Countdown diperbarui!');
                    }}
                    class={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      config.ads.enableDownloadCountdown
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {config.ads.enableDownloadCountdown ? 'Countdown AKTIF' : 'NONAKTIF'}
                  </button>
                </div>

                <div class="flex items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span class="text-xs text-slate-300">Durasi Countdown (Detik):</span>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={config.ads.downloadCountdownSeconds || 3}
                    onChange={(e) =>
                      updateAdsConfig({ downloadCountdownSeconds: Number(e.target.value) })
                    }
                    class="w-16 bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-lg px-3 py-1 text-center outline-none"
                  />
                  <span class="text-xs text-slate-500">Detik (Rekomendasi: 3 detik)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DONATION SETTINGS */}
          {activeTab === 'donation' && (
            <div class="space-y-6">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <Coffee class="w-5 h-5 text-amber-400" /> Pengaturan Donasi Saweria / Trakteer
              </h3>

              <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div class="space-y-3">
                  <div>
                    <label class="text-xs font-medium text-slate-300 block mb-1">URL Saweria (QRIS / E-Wallet):</label>
                    <input
                      type="text"
                      value={config.donation.saweriaUrl}
                      onChange={(e) => updateDonationConfig({ saweriaUrl: e.target.value })}
                      class="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl px-4 py-2.5 outline-none"
                    />
                  </div>

                  <div>
                    <label class="text-xs font-medium text-slate-300 block mb-1">URL Trakteer.id:</label>
                    <input
                      type="text"
                      value={config.donation.trakteerUrl}
                      onChange={(e) => updateDonationConfig({ trakteerUrl: e.target.value })}
                      class="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl px-4 py-2.5 outline-none"
                    />
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label class="text-[11px] text-slate-400 block mb-1">Target Biaya Server (Rp):</label>
                      <input
                        type="number"
                        value={config.donation.monthlyTarget}
                        onChange={(e) => updateDonationConfig({ monthlyTarget: Number(e.target.value) })}
                        class="w-full bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none"
                      />
                    </div>
                    <div>
                      <label class="text-[11px] text-slate-400 block mb-1">Donasi Terkumpul (Rp):</label>
                      <input
                        type="number"
                        value={config.donation.currentCollected}
                        onChange={(e) => updateDonationConfig({ currentCollected: Number(e.target.value) })}
                        class="w-full bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => showSaveSuccess('Pengaturan Donasi berhasil disimpan!')}
                  class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer mt-4 shadow-lg shadow-amber-500/20"
                >
                  <Save class="w-4 h-4" />
                  <span>Simpan Pengaturan Donasi</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY & RESET */}
          {activeTab === 'security' && (
            <div class="space-y-6">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <KeyRound class="w-5 h-5 text-indigo-400" /> Keamanan Admin &amp; Reset System
              </h3>

              <form onSubmit={handleChangePasscodeSubmit} class="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h4 class="text-sm font-bold text-white">Ganti Passcode Login Admin</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="password"
                    placeholder="Passcode Baru"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    class="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Konfirmasi Passcode Baru"
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    class="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Perbarui Passcode Admin
                </button>
              </form>

              <div class="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 space-y-3">
                <h4 class="text-sm font-bold text-red-400 flex items-center gap-2">
                  <RotateCcw class="w-4 h-4" /> Reset Konfigurasi ke Default
                </h4>
                <p class="text-xs text-slate-400">
                  Kembalikan seluruh status tools, ID iklan AdSense, link donasi, dan passcode ke pengaturan awal.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin me-reset seluruh konfigurasi admin ke default?')) {
                      resetToDefault();
                      showSaveSuccess('Konfigurasi berhasil di-reset ke default.');
                    }
                  }}
                  class="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-lg"
                >
                  Reset Konfigurasi Sekarang
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
