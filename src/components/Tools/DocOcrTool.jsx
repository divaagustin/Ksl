import React, { useState, useRef } from 'react';
import { FileText, Upload, Download, Loader2, RefreshCw, FileUp, File, X } from 'lucide-react';
import AdBanner from '../Monetization/AdBanner';

export default function DocOcrTool({ onRequestDownload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [selectedLang, setSelectedLang] = useState('ind');
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
    if (!file) return;
    setSelectedFile(file);
    setExtractedText('');
  };

  const processDocConverter = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setProgressStatus('Membaca dokumen...');
    let textResult = '';

    try {
      if (selectedFile.type === 'application/pdf') {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;

        for (let i = 1; i <= totalPages; i++) {
          setProgressStatus(`Mengekstrak Halaman ${i}/${totalPages}...`);
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((t) => t.str).join(' ').trim();

          if (pageText.length > 20) {
            textResult += `[Halaman ${i}]\n${pageText}\n\n`;
          } else {
            // PDF is image-based / scanned! Fallback to OCR Canvas rendering
            setProgressStatus(`Halaman ${i} adalah gambar scan. Menjalankan OCR...`);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;

            const Tesseract = await import('tesseract.js');
            const res = await Tesseract.recognize(canvas, selectedLang);
            textResult += `[Halaman ${i} - OCR Scan]\n${res.data.text}\n\n`;
          }
        }
      } else {
        // Image OCR
        setProgressStatus('Menjalankan OCR pada gambar...');
        const Tesseract = await import('tesseract.js');
        const res = await Tesseract.recognize(selectedFile, selectedLang);
        textResult = res.data.text;
      }

      setExtractedText(textResult.trim() || 'Tidak ada teks yang dapat diekstrak.');
    } catch (err) {
      console.error(err);
      alert('Gagal memproses dokumen: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!extractedText) return;
    try {
      const docx = await import('docx');
      const paragraphs = extractedText.split('\n').map((line) => {
        return new docx.Paragraph({
          children: [new docx.TextRun({ text: line, font: 'Calibri', size: 24 })],
        });
      });

      const doc = new docx.Document({ sections: [{ children: paragraphs }] });
      const blob = await docx.Packer.toBlob(doc);
      onRequestDownload(blob, 'converted-document.docx');
    } catch (err) {
      alert('Gagal membuat file .docx: ' + err.message);
    }
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
          <FileText class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-white">PDF &amp; Image to Word (.docx) OCR</h2>
          <p class="text-xs text-slate-400">Ekstrak teks dari PDF digital, PDF scan, atau foto menjadi file Word.</p>
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
            class={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[220px] select-none ${
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
              accept="application/pdf,image/*"
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
                <div class="w-12 h-12 bg-indigo-500/30 text-indigo-300 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/30">
                  <FileUp class="w-6 h-6" />
                </div>
                <p class="text-sm font-bold text-indigo-300">Lepaskan dokumen atau gambar di sini!</p>
                <p class="text-xs text-indigo-400/80 mt-1">Siap diekstrak ke format teks / Word</p>
              </div>
            ) : selectedFile ? (
              <div class="w-full flex flex-col items-center">
                <div class="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-2">
                  <File class="w-6 h-6" />
                </div>
                <p class="text-sm font-bold text-white max-w-full truncate px-4">
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
                    Ganti Dokumen
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setExtractedText('');
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
                <div class="w-12 h-12 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-3">
                  <Upload class="w-6 h-6" />
                </div>
                <p class="text-sm font-semibold text-slate-200">
                  Klik untuk jelajah atau <span class="text-indigo-400">seret PDF / foto</span> ke sini
                </p>
                <p class="text-xs text-slate-500 mt-1">PDF, PNG, JPG (Mendukung OCR Scan)</p>
              </div>
            )}
          </div>

          <div class="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span class="text-xs font-medium text-slate-300">Bahasa OCR:</span>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              class="bg-slate-900 text-white text-xs rounded-lg px-3 py-1.5 border border-slate-700 outline-none flex-1"
            >
              <option value="ind">Bahasa Indonesia</option>
              <option value="eng">English</option>
            </select>
          </div>

          <button
            onClick={processDocConverter}
            disabled={!selectedFile || isProcessing}
            class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 class="w-4 h-4 animate-spin" />
                <span>{progressStatus || 'Memproses OCR...'}</span>
              </>
            ) : (
              <>
                <RefreshCw class="w-4 h-4" />
                <span>Konversi &amp; Ekstrak Teks</span>
              </>
            )}
          </button>
        </div>

        <div class="flex flex-col gap-4">
          <textarea
            readOnly
            value={extractedText}
            placeholder="Hasil ekstrak teks akan tampil di sini..."
            class="w-full h-[220px] bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 outline-none resize-none leading-relaxed"
          />

          <button
            onClick={handleDownloadDocx}
            disabled={!extractedText || isProcessing}
            class="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <Download class="w-4 h-4" />
            <span>Unduh File Word (.docx)</span>
          </button>
        </div>
      </div>

      <AdBanner slot="doc-ocr-bottom" />
    </div>
  );
}
