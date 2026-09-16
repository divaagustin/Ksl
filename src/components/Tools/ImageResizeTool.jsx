import React, { useState, useRef } from 'react';
import { Scaling, Download, Lock, Unlock, FileUp, Image as ImageIcon, X } from 'lucide-react';
import AdBanner from '../Monetization/AdBanner';

export default function ImageResizeTool({ onRequestDownload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockRatio, setLockRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [targetFormat, setTargetFormat] = useState('image/png');
  const [quality, setQuality] = useState(90);
  const [processedCanvas, setProcessedCanvas] = useState(null);
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
    const img = new Image();
    img.onload = () => {
      setOriginalWidth(img.width);
      setOriginalHeight(img.height);
      setWidth(img.width);
      setHeight(img.height);
      setAspectRatio(img.width / img.height);
      setProcessedCanvas(null);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleWidthChange = (val) => {
    const w = parseInt(val) || 0;
    setWidth(w);
    if (lockRatio && aspectRatio > 0) {
      setHeight(Math.round(w / aspectRatio));
    }
  };

  const handleHeightChange = (val) => {
    const h = parseInt(val) || 0;
    setHeight(h);
    if (lockRatio && aspectRatio > 0) {
      setWidth(Math.round(h * aspectRatio));
    }
  };

  const processResize = () => {
    if (!selectedFile || width <= 0 || height <= 0) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      setProcessedCanvas(canvas);
    };
    img.src = URL.createObjectURL(selectedFile);
  };

  const handleDownload = () => {
    if (!processedCanvas) return;
    const extMap = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/webp': 'webp',
    };
    const ext = extMap[targetFormat] || 'png';
    processedCanvas.toBlob(
      (blob) => {
        onRequestDownload(blob, `resized-image.${ext}`);
      },
      targetFormat,
      quality / 100
    );
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
          <Scaling class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-white">Image Resizer &amp; Format Converter</h2>
          <p class="text-xs text-slate-400">Ubah ukuran piksel gambar dan konversi format (PNG, JPG, WebP).</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="flex flex-col gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            class={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[160px] select-none ${
              isDragging
                ? 'border-indigo-400 bg-indigo-500/20 ring-4 ring-indigo-500/20 scale-[1.01]'
                : selectedFile
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
                <div class="w-12 h-12 bg-indigo-500/30 text-indigo-300 rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-indigo-500/30">
                  <FileUp class="w-6 h-6" />
                </div>
                <p class="text-sm font-bold text-indigo-300">Lepaskan gambar di sini!</p>
                <p class="text-xs text-indigo-400/80 mt-0.5">Siap diubah ukuran piksel atau formatnya</p>
              </div>
            ) : selectedFile ? (
              <div class="w-full flex flex-col items-center">
                <div class="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-2">
                  <ImageIcon class="w-5 h-5" />
                </div>
                <p class="text-sm font-bold text-white max-w-full truncate px-3">
                  {selectedFile.name}
                </p>
                {originalWidth > 0 && (
                  <p class="text-xs text-indigo-400 mt-0.5">Ukuran Asli: {originalWidth} &times; {originalHeight} px</p>
                )}
                <div class="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    class="text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                  >
                    Ganti Gambar
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setProcessedCanvas(null);
                      setOriginalWidth(0);
                      setOriginalHeight(0);
                      setWidth(0);
                      setHeight(0);
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
                <div class="w-10 h-10 bg-indigo-600/20 text-indigo-400 rounded-xl flex items-center justify-center mb-2">
                  <Scaling class="w-5 h-5" />
                </div>
                <p class="text-sm font-semibold text-slate-200">
                  Klik untuk jelajah atau <span class="text-indigo-400">seret foto</span> ke sini
                </p>
                <p class="text-xs text-slate-500 mt-1">PNG, JPG, WebP</p>
              </div>
            )}
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <label class="text-[11px] text-slate-400 block mb-1">Lebar (Width px)</label>
              <input
                type="number"
                value={width || ''}
                onChange={(e) => handleWidthChange(e.target.value)}
                class="w-full bg-slate-900 text-white text-sm px-3 py-1.5 rounded-lg border border-slate-700 outline-none"
              />
            </div>
            <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <label class="text-[11px] text-slate-400 block mb-1">Tinggi (Height px)</label>
              <input
                type="number"
                value={height || ''}
                onChange={(e) => handleHeightChange(e.target.value)}
                class="w-full bg-slate-900 text-white text-sm px-3 py-1.5 rounded-lg border border-slate-700 outline-none"
              />
            </div>
          </div>

          <div class="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setLockRatio(!lockRatio)}
              class={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                lockRatio ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-900 text-slate-400'
              }`}
            >
              {lockRatio ? <Lock class="w-3.5 h-3.5" /> : <Unlock class="w-3.5 h-3.5" />}
              <span>Kunci Rasio (Proposional)</span>
            </button>

            <select
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value)}
              class="bg-slate-900 text-white text-xs rounded-lg px-3 py-1.5 border border-slate-700 outline-none"
            >
              <option value="image/png">PNG (.png)</option>
              <option value="image/jpeg">JPEG (.jpg)</option>
              <option value="image/webp">WebP (.webp)</option>
            </select>
          </div>

          <button
            onClick={processResize}
            disabled={!selectedFile}
            class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition cursor-pointer shadow-lg"
          >
            Ubah Ukuran Gambar
          </button>
        </div>

        <div class="flex flex-col gap-4">
          <div class="border border-slate-800 bg-slate-950/80 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[240px]">
            {processedCanvas ? (
              <img
                src={processedCanvas.toDataURL(targetFormat, quality / 100)}
                alt="Resized"
                class="max-h-56 object-contain rounded-lg"
              />
            ) : (
              <p class="text-xs text-slate-500">Preview gambar baru akan muncul di sini</p>
            )}
          </div>

          <button
            onClick={handleDownload}
            disabled={!processedCanvas}
            class="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Download class="w-4 h-4" />
            <span>Unduh Gambar ({targetFormat.split('/')[1].toUpperCase()})</span>
          </button>
        </div>
      </div>

      <AdBanner slot="image-resize-bottom" />
    </div>
  );
}
