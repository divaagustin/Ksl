import React from 'react';
import { Coffee, Heart, X, ExternalLink, CheckCircle } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export default function DonationModal({ isOpen, onClose, isAfterDownload = false }) {
  const { config } = useAdmin();

  if (!isOpen || !config.donation.enabled) return null;

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div class="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          class="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>

        <div class="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-slate-950 mx-auto mb-4 shadow-lg shadow-amber-500/20">
          <Coffee class="w-8 h-8 fill-slate-950" />
        </div>

        {isAfterDownload && (
          <div class="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400 mb-2">
            <CheckCircle class="w-4 h-4" />
            <span>File Berhasil Diunduh!</span>
          </div>
        )}

        <h3 class="text-xl font-bold text-center text-white mb-2">
          {isAfterDownload ? 'Terbantu Dengan Tool Ini?' : 'Dukung KitsLight Tetap Gratis!'}
        </h3>

        <p class="text-sm text-slate-300 text-center mb-6 leading-relaxed">
          KitsLight 100% gratis tanpa biaya langganan. Jika tools ini membantu tugas atau pekerjaan Anda hari ini, pertimbangkan untuk menyawer kopi segelas ☕
        </p>

        <div class="flex flex-col gap-3 mb-6">
          <a
            href={config.donation.saweriaUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-between bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-5 py-3.5 rounded-xl transition shadow-lg cursor-pointer"
          >
            <div class="flex items-center gap-2">
              <span class="text-lg">💛</span>
              <span>Sawer via Saweria (QRIS / E-Wallet)</span>
            </div>
            <ExternalLink class="w-4 h-4" />
          </a>

          <a
            href={config.donation.trakteerUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-between bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-3.5 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <div class="flex items-center gap-2">
              <span class="text-lg">🔴</span>
              <span>Traktir Kopi via Trakteer.id</span>
            </div>
            <ExternalLink class="w-4 h-4 text-slate-400" />
          </a>
        </div>

        <p class="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
          Made with <Heart class="w-3 h-3 text-red-500 fill-red-500" /> for daily productivity.
        </p>
      </div>
    </div>
  );
}
