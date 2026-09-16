import React from 'react';
import { Sparkles, Lock, Coffee } from 'lucide-react';

export default function Header({ onOpenDonation }) {
  return (
    <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <img 
              src="/img/logo.png" 
              alt="KitsLight Logo" 
              class="w-full h-full object-contain p-1"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-lg text-white tracking-tight">KitsLight</span>
              <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v2.0 Client-AI
              </span>
            </div>
            <p class="text-xs text-slate-400 hidden sm:block">Alat produktivitas ringan &amp; 100% gratis</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
            <Lock class="w-3.5 h-3.5 text-emerald-400" />
            <span>100% In-Browser Privacy</span>
          </div>

          <button
            onClick={onOpenDonation}
            class="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <Coffee class="w-4 h-4 fill-slate-950" />
            <span>Sawer Kopi</span>
          </button>
        </div>
      </div>
    </header>
  );
}
