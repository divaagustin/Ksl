import React, { useEffect, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';

export default function AdBanner({ slot = 'in-tool', className = '' }) {
  const { config } = useAdmin();
  const bannerContainerRef = useRef(null);

  const provider = config.ads.provider || 'adsterra';
  const isEnabled = config.ads.enabled;

  // Execute Adsterra or Monetag dynamic scripts cleanly using DOM Range
  useEffect(() => {
    if (!isEnabled || !bannerContainerRef.current) return;

    let bannerCode = '';
    if (provider === 'adsterra') {
      bannerCode = config.ads.adsterraBannerCode || '';
    } else if (provider === 'monetag') {
      bannerCode = config.ads.monetagBannerCode || '';
    }

    if (bannerCode.trim()) {
      try {
        bannerContainerRef.current.innerHTML = '';
        const range = document.createRange();
        range.selectNode(bannerContainerRef.current);
        const documentFragment = range.createContextualFragment(bannerCode);
        bannerContainerRef.current.appendChild(documentFragment);
      } catch (err) {
        console.warn('AdBanner script execution error:', err);
      }
    }
  }, [isEnabled, provider, config.ads.adsterraBannerCode, config.ads.monetagBannerCode, slot]);

  // If ads are disabled globally by Admin, do not render ad container
  if (!isEnabled) return null;

  const hasCode = (provider === 'adsterra' && config.ads.adsterraBannerCode) ||
                  (provider === 'monetag' && config.ads.monetagBannerCode) ||
                  (provider === 'adsense' && config.ads.adsenseClientId);

  return (
    <div class={`w-full bg-slate-900/40 border border-dashed border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center my-4 overflow-hidden ${className}`}>
      <span class="text-[10px] uppercase font-bold tracking-wider text-slate-600 mb-2">
        Sponsor / Iklan ({provider.toUpperCase()})
      </span>

      {/* Dynamic Ad Container */}
      <div 
        ref={bannerContainerRef}
        class="w-full max-w-xl min-h-[90px] flex flex-col items-center justify-center overflow-hidden"
      >
        {!hasCode && (
          <div class="w-full py-4 px-3 bg-slate-950/60 rounded-xl border border-slate-800/60 flex flex-col items-center justify-center text-center">
            <p class="text-xs text-slate-400 font-medium">
              Slot Iklan {provider === 'adsterra' ? 'Adsterra Banner' : provider === 'monetag' ? 'Monetag Banner' : 'Google AdSense'}
            </p>
            <span class="text-[10px] text-slate-500 mt-1">
              Pasang kode banner melalui Author Portal (<code class="text-indigo-400">/author</code>)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
