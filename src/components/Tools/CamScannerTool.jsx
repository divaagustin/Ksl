import React, { useState, useRef } from 'react';
import { ScanLine, Camera, Upload, Download, FileSpreadsheet, FileUp, X } from 'lucide-react';
import { applySauvolaAdaptiveThreshold } from '../../utils/scanner';
import AdBanner from '../Monetization/AdBanner';

export default function CamScannerTool({ onRequestDownload }) {
  const [sourceImg, setSourceImg] = useState(null);
  const [filterMode, setFilterMode] = useState('sauvola'); // 'sauvola', 'gray', 'magic', 'original'
  const [processedCanvas, setProcessedCanvas] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef(null);
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
      alert('Silakan pilih file foto dokumen (PNG, JPG, WebP)');
      return;
    }
    const img = new Image();
    img.onload = () => {
      setSourceImg(img);
      applyFilterToImage(img, filterMode);
    };
    img.src = URL.createObjectURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      alert('Tidak dapat mengakses kamera: ' + err.message);
    }
  };

  const captureCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const img = new Image();
    img.onload = () => {
      setSourceImg(img);
      applyFilterToImage(img, filterMode);
    };
    img.src = canvas.toDataURL('image/jpeg');

    // Stop camera stream
    if (video.srcObject) {
      video.srcObject.getTracks().forEach((t) => t.stop());
    }
    setIsCameraActive(false);
  };

  const applyFilterToImage = (img, mode) => {
    if (!img) return;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (mode === 'sauvola') {
      // Sauvola Adaptive Binarization (Crisp document without dark shadows)
      applySauvolaAdaptiveThreshold(imgData, 15, 0.2, 128);
      ctx.putImageData(imgData, 0, 0);
    } else if (mode === 'gray') {
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        d[i] = d[i + 1] = d[i + 2] = g;
      }
      ctx.putImageData(imgData, 0, 0);
    } else if (mode === 'magic') {
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        for (let c = 0; c < 3; c++) {
          d[i + c] = Math.min(255, Math.max(0, (d[i + c] - 128) * 1.35 + 145));
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    setProcessedCanvas(canvas);
  };

  const handleFilterChange = (mode) => {
    setFilterMode(mode);
    if (sourceImg) {
      applyFilterToImage(sourceImg, mode);
    }
  };

  const handleExportJpg = () => {
    if (!processedCanvas) return;
    processedCanvas.toBlob((blob) => {
      onRequestDownload(blob, 'scanned-document.jpg');
    }, 'image/jpeg', 0.95);
  };

  const handleExportPdf = async () => {
    if (!processedCanvas) return;
    try {
      const { jsPDF } = await import('jspdf');
      const w = processedCanvas.width;
      const h = processedCanvas.height;
      const pdf = new jsPDF(w > h ? 'l' : 'p', 'pt', [w, h]);
      pdf.addImage(processedCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, w, h);
      const pdfBlob = pdf.output('blob');
      onRequestDownload(pdfBlob, 'scanned-document.pdf');
    } catch (err) {
      alert('Gagal membuat PDF: ' + err.message);
    }
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
          <ScanLine class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-white">Cam Scanner (Digitasi Dokumen)</h2>
          <p class="text-xs text-slate-400">Scan dokumen fisik via kamera/foto menjadi file PDF/JPG bersih (Adaptive B&amp;W).</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="flex flex-col gap-4">
          <div
            onClick={() => !isCameraActive && fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            class={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden transition-all duration-200 select-none ${
              !isCameraActive ? 'cursor-pointer' : ''
            } ${
              isDragging
                ? 'border-indigo-400 bg-indigo-500/20 ring-4 ring-indigo-500/20 scale-[1.01]'
                : sourceImg && !isCameraActive
                ? 'border-indigo-500/50 bg-indigo-950/20'
                : 'border-slate-700 hover:border-indigo-500 bg-slate-950/50 hover:bg-indigo-500/5'
            }`}
          >
            {isDragging ? (
              <div class="flex flex-col items-center animate-bounce pointer-events-none py-6">
                <div class="w-12 h-12 bg-indigo-500/30 text-indigo-300 rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-indigo-500/30">
                  <FileUp class="w-6 h-6" />
                </div>
                <p class="text-sm font-bold text-indigo-300">Lepaskan foto dokumen di sini!</p>
                <p class="text-xs text-indigo-400/80 mt-0.5">Siap di-scan &amp; dioptimalkan</p>
              </div>
            ) : isCameraActive ? (
              <video ref={videoRef} autoPlay playsInline class="w-full max-h-52 object-cover rounded-xl" />
            ) : sourceImg ? (
              <div class="relative w-full flex flex-col items-center py-2">
                <img src={sourceImg.src} alt="Original" class="max-h-48 object-contain rounded-lg shadow-md" />
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
                      setSourceImg(null);
                      setProcessedCanvas(null);
                    }}
                    class="text-[11px] font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20 transition flex items-center gap-1"
                  >
                    <X class="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ) : (
              <div class="flex flex-col items-center py-6">
                <div class="w-12 h-12 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-2">
                  <Camera class="w-6 h-6" />
                </div>
                <p class="text-sm font-semibold text-slate-200">
                  Buka kamera atau <span class="text-indigo-400">seret foto dokumen</span> ke sini
                </p>
                <p class="text-xs text-slate-500 mt-1">PNG, JPG, WebP</p>
              </div>
            )}
          </div>

          <div class="flex gap-2">
            {!isCameraActive ? (
              <button
                onClick={startCamera}
                class="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Camera class="w-4 h-4" />
                <span>Buka Kamera</span>
              </button>
            ) : (
              <button
                onClick={captureCamera}
                class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Camera class="w-4 h-4" />
                <span>Jepret Foto Dokumen</span>
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              class="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <Upload class="w-4 h-4" />
              <span>Unggah Foto</span>
            </button>

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
          </div>

          <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
            <span class="text-[11px] text-slate-400 block">Mode Filter Dokumen:</span>
            <div class="grid grid-cols-4 gap-1.5">
              {[
                { id: 'sauvola', label: 'B&W Adaptive' },
                { id: 'gray', label: 'Grayscale' },
                { id: 'magic', label: 'Magic Color' },
                { id: 'original', label: 'Original' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleFilterChange(f.id)}
                  class={`py-2 rounded-lg text-[10px] font-bold transition border cursor-pointer ${
                    filterMode === f.id
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="border border-slate-800 bg-slate-950/80 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[240px]">
            {processedCanvas ? (
              <img src={processedCanvas.toDataURL('image/jpeg')} alt="Scanned" class="max-h-56 object-contain rounded-lg" />
            ) : (
              <p class="text-xs text-slate-500">Hasil scan dokumen akan muncul di sini</p>
            )}
          </div>

          <div class="flex gap-3">
            <button
              onClick={handleExportPdf}
              disabled={!processedCanvas}
              class="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
            >
              <FileSpreadsheet class="w-4 h-4" />
              <span>Export PDF Dokumen</span>
            </button>

            <button
              onClick={handleExportJpg}
              disabled={!processedCanvas}
              class="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Download class="w-4 h-4" />
              <span>Export JPG Dokumen</span>
            </button>
          </div>
        </div>
      </div>

      <AdBanner slot="cam-scanner-bottom" />
    </div>
  );
}
