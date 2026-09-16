import React, { useState, useRef } from 'react';
import { UploadCloud, Copy, Check, Clock, FileCheck, AlertTriangle, ExternalLink, HardDrive, FileUp, File, X } from 'lucide-react';
import { sanitizeHTML, isSafeFileType } from '../../utils/security';
import { copyTextToClipboard } from '../../utils/clipboard';
import { useAdmin } from '../../context/AdminContext';
import { uploadTempFile } from '../../services/cloudTempService';
import AdBanner from '../Monetization/AdBanner';

export default function CloudTempTool() {
  const { config, recordUserActivity } = useAdmin();
  const [selectedFile, setSelectedFile] = useState(null);
  const [durationHours, setDurationHours] = useState(24);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [copied, setCopied] = useState(false);
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
    // Only set dragging false if leaving the drop container itself
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
    if (!isSafeFileType(file.name)) {
      setErrorMessage('File dengan ekstensi ini tidak diperbolehkan demi alasan keamanan.');
      return;
    }
    const maxMB = config.tools['cloud-temp']?.maxFileSizeMB || 25;
    if (file.size > maxMB * 1024 * 1024) {
      setErrorMessage(`Ukuran file maksimal adalah ${maxMB} MB.`);
      return;
    }
    setSelectedFile(file);
    setErrorMessage('');
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setErrorMessage('');

    try {
      const result = await uploadTempFile(selectedFile, durationHours, config.r2Storage || {});
      setUploadResult(result);
      recordUserActivity('cloud-temp', 'Cloud Temp', `Mengunggah ${selectedFile.name} (${result.sizeMB} MB)`);
    } catch (err) {
      console.error('Upload Error:', err);
      setErrorMessage(err.message || 'Gagal mengunggah file. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!uploadResult || !uploadResult.shortUrl) return;
    const success = await copyTextToClipboard(uploadResult.shortUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      alert('Gagal menyalin otomatis. Silakan salin manual teks dari kolom tautan.');
    }
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
          <UploadCloud class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-white">Cloud Temporary (File Sharing 24 Jam)</h2>
          <p class="text-xs text-slate-400">Bagikan file sementara yang otomatis terhapus setelah masa aktif habis.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="flex flex-col gap-4">
          {/* Drag and Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            class={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[220px] select-none ${
              isDragging
                ? 'border-indigo-400 bg-indigo-500/20 ring-4 ring-indigo-500/20 scale-[1.01]'
                : selectedFile
                ? 'border-indigo-500/50 bg-indigo-950/20 hover:border-indigo-400'
                : 'border-slate-700 hover:border-indigo-500 bg-slate-950/50 hover:bg-indigo-500/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              class="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileChange(e.target.files[0]);
                }
                // Reset so same file can be re-selected if removed
                e.target.value = '';
              }}
            />

            {isDragging ? (
              <div class="flex flex-col items-center animate-bounce pointer-events-none">
                <div class="p-3 bg-indigo-500/30 rounded-2xl text-indigo-300 mb-2 shadow-lg shadow-indigo-500/30">
                  <FileUp class="w-10 h-10" />
                </div>
                <p class="text-sm font-bold text-indigo-300">Lepaskan file di sini!</p>
                <p class="text-xs text-indigo-400/80 mt-1">File akan langsung disiapkan untuk diunggah</p>
              </div>
            ) : selectedFile ? (
              <div class="w-full flex flex-col items-center">
                <div class="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl mb-2">
                  <FileCheck class="w-10 h-10" />
                </div>
                <p class="text-sm font-bold text-white max-w-full truncate px-4">
                  {selectedFile.name}
                </p>
                <span class="text-xs text-indigo-400 font-semibold mt-0.5">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>

                <div class="flex items-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    class="text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                  >
                    Ganti File
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setUploadResult(null);
                      setErrorMessage('');
                    }}
                    class="text-[11px] font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20 transition flex items-center gap-1"
                  >
                    <X class="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div class="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl mb-3">
                  <UploadCloud class="w-10 h-10 opacity-80" />
                </div>
                <p class="text-sm font-semibold text-slate-200">
                  Klik untuk jelajah atau <span class="text-indigo-400">seret &amp; lepas file</span> di sini
                </p>
                <p class="text-xs text-slate-500 mt-1.5">Maksimal 25 MB (Bebas format aman)</p>
              </>
            )}
          </div>

          <div class="flex items-center justify-between bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <span class="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Clock class="w-4 h-4 text-indigo-400" /> Masa Aktif File:
            </span>
            <select
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              class="bg-slate-900 text-white text-xs rounded-lg px-3 py-1.5 border border-slate-700 outline-none"
            >
              <option value={1}>1 Jam</option>
              <option value={6}>6 Jam</option>
              <option value={12}>12 Jam</option>
              <option value={24}>24 Jam (Maksimal)</option>
            </select>
          </div>

          {errorMessage && (
            <div class="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs text-red-400">
              <AlertTriangle class="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            {isUploading ? 'Mengunggah File...' : 'Upload File & Buat Link Pendek'}
          </button>
        </div>

        <div class="flex flex-col gap-4 border border-slate-800 bg-slate-950/80 rounded-2xl p-6 justify-between">
          {uploadResult ? (
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <FileCheck class="w-4 h-4" />
                  <span>File Berhasil Diunggah!</span>
                </div>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                  <HardDrive class="w-3 h-3" />
                  {uploadResult.storageType === 'r2' ? 'Cloudflare R2' : 'Local IndexedDB'}
                </span>
              </div>

              <div class="space-y-1.5 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <p class="text-slate-400">Nama File: <span class="text-white font-semibold">{uploadResult.fileName}</span></p>
                <p class="text-slate-400">Ukuran File: <span class="text-white font-semibold">{uploadResult.sizeMB} MB</span></p>
                <p class="text-slate-400">Kadaluarsa Pada: <span class="text-indigo-400 font-semibold">{uploadResult.expiresAtFormatted || uploadResult.expiresAt}</span></p>
              </div>

              <div class="space-y-2">
                <label class="text-[11px] text-slate-400 font-semibold block">Tautan Pendek Berbagi File:</label>
                <div class="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={uploadResult.shortUrl}
                    onClick={(e) => e.target.select()}
                    class="bg-slate-900 border border-slate-700 text-indigo-300 text-xs rounded-xl px-3 py-2.5 flex-1 outline-none font-mono select-all cursor-pointer"
                  />
                  <button
                    onClick={copyToClipboard}
                    class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copied ? <Check class="w-4 h-4" /> : <Copy class="w-4 h-4" />}
                    <span>{copied ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>

                <a
                  href={uploadResult.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  class="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer text-center"
                >
                  <ExternalLink class="w-3.5 h-3.5" />
                  <span>Buka Pratinjau Halaman Unduh (`/s/${uploadResult.shortId}`)</span>
                </a>
              </div>
            </div>
          ) : (
            <div class="h-full flex flex-col items-center justify-center text-center text-slate-500 py-8">
              <UploadCloud class="w-12 h-12 mb-2 opacity-30" />
              <p class="text-xs">Tautan pendek unduhan akan muncul di sini setelah upload.</p>
            </div>
          )}
        </div>
      </div>

      <AdBanner slot="cloud-temp-bottom" />
    </div>
  );
}
