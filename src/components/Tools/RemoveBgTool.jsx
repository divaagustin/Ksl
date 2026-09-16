import React, { useState, useRef } from 'react';
import { Scissors, Upload, Download, Loader2, Image as ImageIcon, AlertCircle, FileUp, X } from 'lucide-react';
import AdBanner from '../Monetization/AdBanner';

export default function RemoveBgTool({ onRequestDownload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [resultBlob, setResultBlob] = useState(null);
  const [resultSrc, setResultSrc] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleFileChange = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar (PNG, JPG, WebP)');
      return;
    }
    setSelectedFile(file);
    setPreviewSrc(URL.createObjectURL(file));
    setResultBlob(null);
    setResultSrc(null);
    setErrorMessage('');
  };

  const processRemoveBg = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setProgressStatus('Memuat model AI di browser...');
    setErrorMessage('');

    try {
      // Dynamic import to handle loading graceful errors
      const imgly = await import('@imgly/background-removal');
      setProgressStatus('Menghapus background gambar...');
      
      const blob = await imgly.removeBackground(selectedFile, {
        progress: (key, current, total) => {
          if (total) {
            const pct = Math.round((current / total) * 100);
            setProgressStatus(`Memproses AI: ${pct}%`);
          }
        }
      });

      setResultBlob(blob);
      setResultSrc(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      setErrorMessage(
        'Gagal menghapus background secara otomatis (WASM/WebGL tidak didukung browser). Coba gunakan browser Chrome/Firefox versi terbaru.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    onRequestDownload(resultBlob, 'nobg-image.png');
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
          <Scissors class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-white">AI Background Removal</h2>
          <p class="text-xs text-slate-400">Hapus background foto secara instan 100% di browser tanpa diunggah ke server.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Area */}
        <div class="flex flex-col gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            class={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[260px] relative overflow-hidden select-none ${
              isDragging
                ? 'border-indigo-400 bg-indigo-500/20 ring-4 ring-indigo-500/20 scale-[1.01]'
                : previewSrc
                ? 'border-indigo-500/50 bg-indigo-950/20'
                : 'border-slate-700 hover:border-indigo-500 bg-slate-950/50 hover:bg-indigo-500/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              class="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileChange(e.target.files[0]);
                }
                e.target.value = '';
              }}
            />

            {isDragging ? (
              <div class="flex flex-col items-center animate-bounce pointer-events-none">
                <div class="w-14 h-14 bg-indigo-500/30 text-indigo-300 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/30">
                  <FileUp class="w-7 h-7" />
                </div>
                <p class="text-sm font-bold text-indigo-300">Lepaskan foto di sini!</p>
                <p class="text-xs text-indigo-400/80 mt-1">Foto akan langsung disiapkan untuk dihapus background-nya</p>
              </div>
            ) : previewSrc ? (
              <div class="relative w-full flex flex-col items-center">
                <img src={previewSrc} alt="Original" class="max-h-56 object-contain rounded-lg shadow-md" />
                <div class="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    class="text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                  >
                    Ganti Foto
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setPreviewSrc(null);
                      setResultBlob(null);
                      setResultSrc(null);
                    }}
                    class="text-[11px] font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20 transition flex items-center gap-1"
                  >
                    <X class="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ) : (
              <div class="flex flex-col items-center">
                <div class="w-14 h-14 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-3">
                  <Upload class="w-6 h-6" />
                </div>
                <p class="text-sm font-semibold text-slate-200">
                  Klik untuk jelajah atau <span class="text-indigo-400">seret &amp; lepas foto</span> ke sini
                </p>
                <p class="text-xs text-slate-500 mt-1">PNG, JPG, WebP hingga 15 MB</p>
              </div>
            )}
          </div>

          <button
            onClick={processRemoveBg}
            disabled={!selectedFile || isProcessing}
            class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 class="w-4 h-4 animate-spin" />
                <span>{progressStatus || 'Memproses AI...'}</span>
              </>
            ) : (
              <>
                <Scissors class="w-4 h-4" />
                <span>Hapus Background Sekarang</span>
              </>
            )}
          </button>
        </div>

        {/* Output Area */}
        <div class="flex flex-col gap-4">
          <div class="border border-slate-800 bg-slate-950/80 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[260px] relative checkerboard">
            {resultSrc ? (
              <img src={resultSrc} alt="Result" class="max-h-56 object-contain rounded-lg" />
            ) : (
              <div class="flex flex-col items-center text-slate-500">
                <ImageIcon class="w-10 h-10 mb-2 opacity-40" />
                <p class="text-xs">Hasil tanpa background akan muncul di sini</p>
              </div>
            )}
          </div>

          {errorMessage && (
            <div class="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs text-red-400">
              <AlertCircle class="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            onClick={handleDownload}
            disabled={!resultBlob || isProcessing}
            class="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <Download class="w-4 h-4" />
            <span>Unduh PNG Transparan</span>
          </button>
        </div>
      </div>

      <AdBanner slot="remove-bg-bottom" />
    </div>
  );
}
