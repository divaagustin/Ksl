import React from 'react';
import { Scissors, FileText, UploadCloud, Scaling, Sparkle, ScanLine } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab }) {
  const tools = [
    { id: 'remove-bg', label: 'Remove BG', icon: Scissors, desc: 'Hapus Background AI' },
    { id: 'doc-converter', label: 'To Word (.docx)', icon: FileText, desc: 'Konversi & OCR PDF' },
    { id: 'cloud-temp', label: 'Cloud Temp', icon: UploadCloud, desc: 'File Sharing 24 Jam' },
    { id: 'image-resize', label: 'Image Resize', icon: Scaling, desc: 'Ubah Ukuran & Format' },
    { id: 'image-hd', label: 'Image HD', icon: Sparkle, desc: 'Pertajam Foto' },
    { id: 'cam-scanner', label: 'Cam Scanner', icon: ScanLine, desc: 'Scan Dokumen PDF' },
  ];

  return (
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" id="toolNav">
      {tools.map((t) => {
        const Icon = t.icon;
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            class={`flex flex-col items-center p-3.5 rounded-2xl border transition-all text-center cursor-pointer ${
              isActive
                ? 'border-indigo-500 bg-indigo-600/15 text-indigo-300 shadow-lg shadow-indigo-500/10'
                : 'border-slate-800 bg-slate-900/70 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon class={`w-5 h-5 mb-1.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
            <span class="text-xs font-bold text-slate-100">{t.label}</span>
            <span class="text-[10px] text-slate-500 mt-0.5">{t.desc}</span>
          </button>
        );
      })}
    </div>
  );
}
