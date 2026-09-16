import React from 'react';
import { Server, Heart } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export default function ServerCostProgressBar({ onOpenDonation }) {
  const { config } = useAdmin();
  const { currentCollected, monthlyTarget, showServerProgressBar } = config.donation;

  if (!showServerProgressBar) return null;

  const percentage = Math.min(100, Math.round((currentCollected / monthlyTarget) * 100));

  return (
    <div class="w-full max-w-xl mx-auto bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 my-6">
      <div class="flex items-center justify-between text-xs text-slate-300 mb-2">
        <div class="flex items-center gap-1.5 font-medium">
          <Server class="w-3.5 h-3.5 text-indigo-400" />
          <span>Biaya Operasional Server Bulan Ini:</span>
        </div>
        <span class="font-bold text-amber-400">
          Rp {currentCollected.toLocaleString('id-ID')} / Rp {monthlyTarget.toLocaleString('id-ID')} ({percentage}%)
        </span>
      </div>

      {/* Progress Bar Container */}
      <div class="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
        <div
          class="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div class="flex items-center justify-between mt-2">
        <span class="text-[10px] text-slate-500">100% didukung oleh komunitas &amp; iklan</span>
        <button
          onClick={onOpenDonation}
          class="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition"
        >
          <Heart class="w-3 h-3 fill-amber-400" />
          <span>Bantu Biaya Server</span>
        </button>
      </div>
    </div>
  );
}
