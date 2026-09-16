import React, { useState, useRef, useEffect } from 'react';
import { Sparkle, Download, Loader2, FileUp, Image as ImageIcon, X } from 'lucide-react';
import AdBanner from '../Monetization/AdBanner';

export default function ImageHdTool({ onRequestDownload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [scale, setScale] = useState(2);
  const [sharpenStrength, setSharpenStrength] = useState(75);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultCanvas, setResultCanvas] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const workerRef = useRef(null);

  useEffect(() => {
    // Instantiate Web Worker for offloading pixel calculations off main thread
    workerRef.current = new Worker(new URL('../../workers/sharpen.worker.js', import.meta.url), {
      type: 'module',
    });

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

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
    setResultCanvas(null);
  };

  const processImageHd = () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const w = img.width * scale;
      const h = img.height * scale;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);

      const imgData = ctx.getImageData(0, 0, w, h);

      if (workerRef.current) {
        workerRef.current.onmessage = (e) => {
          const processedBuffer = new Uint8ClampedArray(e.data.data);
          const newImgData = new ImageData(processedBuffer, w, h);
          ctx.putImageData(newImgData, 0, 0);
          setResultCanvas(canvas);
          setIsProcessing(false);
        };

        workerRef.current.postMessage(
          {
            data: imgData.data.buffer,
            width: w,
            height: h,
            strength: sharpenStrength,
          },
          [imgData.data.buffer]
        );
      }
    };
    img.src = URL.createObjectURL(selectedFile);
  };

  const handleDownload = () => {
    if (!resultCanvas) return;
    resultCanvas.toBlob((blob) => {
      onRequestDownload(blob, `hd-sharpen-${scale}x.png`);
    }, 'image/png');
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
          <Sparkle class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-white">Image HD &amp; Super Sharpening</h2>
          <p class="text-xs text-slate-400">Tingkatkan kejernihan dan ketajaman foto tanpa lag (Web Worker Powered).</p>
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
                <p class="text-xs text-indigo-400/80 mt-0.5">Siap untuk ditingkatkan ketajamannya</p>
              </div>
            ) : selectedFile ? (
              <div class="w-full flex flex-col items-center">
                <div class="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-2">
                  <ImageIcon class="w-5 h-5" />
                </div>
                <p class="text-sm font-bold text-white max-w-full truncate px-3">
                  {selectedFile.name}
                </p>
                <span class="text-xs text-indigo-400 font-semibold mt-0.5">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
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
                      setResultCanvas(null);
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
                  <Sparkle class="w-5 h-5" />
                </div>
                <p class="text-sm font-semibold text-slate-200">
                  Klik untuk jelajah atau <span class="text-indigo-400">seret foto</span> ke sini
                </p>
                <p class="text-xs text-slate-500 mt-1">PNG, JPG, WebP</p>
              </div>
            )}
          </div>

          <div class="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div class="flex justify-between text-xs">
              <span class="text-slate-300">Tingkat Penajaman (Sharpening):</span>
              <span class="font-bold text-indigo-400">{sharpenStrength}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={sharpenStrength}
              onChange={(e) => setSharpenStrength(Number(e.target.value))}
              class="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div class="flex gap-2">
            {[2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                class={`flex-1 py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  scale === s
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Upscale {s}x
              </button>
            ))}
          </div>

          <button
            onClick={processImageHd}
            disabled={!selectedFile || isProcessing}
            class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 class="w-4 h-4 animate-spin" />
                <span>Memproses Web Worker...</span>
              </>
            ) : (
              <span>Pertajam Foto Sekarang</span>
            )}
          </button>
        </div>

        <div class="flex flex-col gap-4">
          <div class="border border-slate-800 bg-slate-950/80 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[240px]">
            {resultCanvas ? (
              <img src={resultCanvas.toDataURL('image/png')} alt="HD Result" class="max-h-56 object-contain rounded-lg" />
            ) : (
              <p class="text-xs text-slate-500">Preview hasil foto HD akan muncul di sini</p>
            )}
          </div>

          <button
            onClick={handleDownload}
            disabled={!resultCanvas || isProcessing}
            class="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Download class="w-4 h-4" />
            <span>Unduh Foto HD (PNG)</span>
          </button>
        </div>
      </div>

      <AdBanner slot="image-hd-bottom" />
    </div>
  );
}
