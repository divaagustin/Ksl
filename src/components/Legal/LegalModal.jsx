import React from 'react';
import { X, ShieldCheck, FileText, Lock, AlertTriangle, Eye, CheckCircle2 } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, defaultTab = 'privacy' }) {
  const [activeTab, setActiveTab] = React.useState(defaultTab);

  React.useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, isOpen]);

  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div class="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              {activeTab === 'privacy' ? <ShieldCheck class="w-5 h-5" /> : <FileText class="w-5 h-5" />}
            </div>
            <div>
              <h2 class="text-base sm:text-lg font-bold text-white">
                {activeTab === 'privacy' ? 'Kebijakan Privasi (Privacy Policy)' : 'Syarat & Ketentuan Layanan (Terms of Service)'}
              </h2>
              <p class="text-xs text-slate-400">
                Transparansi privasi data, teknologi client-side, dan kepatuhan hukum KitsLight.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Tutup Modal"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div class="px-6 pt-3 pb-2 bg-slate-900/50 border-b border-slate-800 flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('privacy')}
            class={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck class="w-4 h-4" />
            <span>Kebijakan Privasi</span>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            class={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText class="w-4 h-4" />
            <span>Syarat &amp; Ketentuan</span>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div class="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed custom-scrollbar">
          {activeTab === 'privacy' ? (
            <>
              <div class="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-3">
                <Lock class="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div class="text-xs">
                  <p class="font-bold text-indigo-300 mb-1">Prinsip Utama: Zero Server Knowledge &amp; 100% In-Browser Processing</p>
                  <p class="text-indigo-200/80">
                    File gambar dan dokumen yang Anda olah (Remove Background, Resize, HD Sharpener, OCR PDF, Cam Scanner) diproses secara lokal di perangkat Anda menggunakan WebAssembly (WASM) &amp; Web Worker. File Anda <strong>TIDAK PERNAH dikirim, disimpan, atau dipelajari oleh server kami</strong>.
                  </p>
                </div>
              </div>

              <section class="space-y-2">
                <h3 class="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 class="w-4 h-4 text-emerald-400" /> 1. Pengolahan Data &amp; Berkas Pengguna
                </h3>
                <p class="text-slate-400">
                  KitsLight tidak memerlukan registrasi akun, pendaftaran nomor telepon, atau data pribadi apapun. Seluruh berkas yang Anda pilih tetap berada di dalam memori peramban (RAM browser) Anda sendiri, kecuali jika Anda secara sadar menggunakan fitur Cloud Temporary.
                </p>
              </section>

              <section class="space-y-2">
                <h3 class="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 class="w-4 h-4 text-emerald-400" /> 2. Layanan Berbagi File Sementara (Cloud Temporary)
                </h3>
                <p class="text-slate-400">
                  Untuk fitur Cloud Temporary, berkas yang Anda unggah disimpan secara terenkripsi sementara di Cloudflare R2 Storage semata-mata untuk memfasilitasi pengunduhan melalui tautan pendek. Berkas tersebut memiliki masa aktif maksimal 24 jam dan <strong>dihapus secara otomatis dan permanen</strong> setelah waktu kedaluwarsa habis. Kami tidak membagikan, memindai isi, atau menjual data berkas tersebut.
                </p>
              </section>

              <section class="space-y-2">
                <h3 class="text-sm font-bold text-white flex items-center gap-2">
                  <Eye class="w-4 h-4 text-indigo-400" /> 3. Jaringan Iklan &amp; Cookies Pihak Ketiga (Ad Networks)
                </h3>
                <p class="text-slate-400">
                  Untuk menjaga agar semua alat di KitsLight tetap 100% gratis tanpa biaya langganan, kami dapat menampilkan iklan dari mitra periklanan tepercaya (seperti <strong>Adsterra</strong>, <strong>Monetag</strong>, atau <strong>Google AdSense</strong>).
                </p>
                <ul class="list-disc list-inside space-y-1 text-slate-400 ml-2">
                  <li>Mitra periklanan pihak ketiga dapat menggunakan cookies, web beacons, atau script penargetan anonim untuk menayangkan iklan yang relevan berdasarkan riwayat kunjungan umum.</li>
                  <li>KitsLight tidak memberikan data pribadi apapun kepada pengiklan.</li>
                  <li>Anda bebas menonaktifkan atau memblokir cookies melalui pengaturan browser Anda kapan saja tanpa mengganggu fungsi utama pemrosesan alat.</li>
                </ul>
              </section>

              <section class="space-y-2">
                <h3 class="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 class="w-4 h-4 text-emerald-400" /> 4. Penyimpanan Lokal (Local Storage)
                </h3>
                <p class="text-slate-400">
                  Kami menggunakan Local Storage pada browser Anda hanya untuk menyimpan preferensi tampilan (misalnya status mode gelap) dan riwayat tautan unggahan Cloud Temp yang Anda buat sendiri. Anda dapat membersihkan data ini sewaktu-waktu melalui fitur *Clear Site Data* di browser Anda.
                </p>
              </section>

              <section class="space-y-2">
                <h3 class="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 class="w-4 h-4 text-emerald-400" /> 5. Hubungi Kami
                </h3>
                <p class="text-slate-400">
                  Jika Anda memiliki pertanyaan seputar Kebijakan Privasi atau keamanan data platform KitsLight, Anda dapat menghubungi tim kami melalui Author Portal resmi atau email dukungan pengembang.
                </p>
              </section>
            </>
          ) : (
            <>
              <div class="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div class="text-xs">
                  <p class="font-bold text-amber-300 mb-1">Ketentuan Penggunaan Platform</p>
                  <p class="text-amber-200/80">
                    Dengan mengakses dan menggunakan KitsLight, Anda menyetujui syarat &amp; ketentuan yang berlaku di bawah ini. Jika Anda tidak menyetujui sebagian atau seluruh ketentuan ini, harap tidak menggunakan layanan kami.
                  </p>
                </div>
              </div>

              <section class="space-y-2">
                <h3 class="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 class="w-4 h-4 text-indigo-400" /> 1. Layanan Gratis &amp; Ketersediaan
                </h3>
                <p class="text-slate-400">
                  KitsLight menyediakan alat utilitas digital secara gratis berbasis *as is* (sebagaimana adanya). Meskipun kami berupaya memberikan keandalan maksimal, kami tidak menjamin bahwa layanan akan bebas dari interupsi atau kesalahan di semua spesifikasi perangkat.
                </p>
              </section>

              <section class="space-y-2">
                <h3 class="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 class="w-4 h-4 text-indigo-400" /> 2. Larangan Penggunaan Ilegal
                </h3>
                <p class="text-slate-400">
                  Pengguna dilarang keras menggunakan fitur KitsLight (khususnya Cloud Temporary File Sharing) untuk:
                </p>
                <ul class="list-disc list-inside space-y-1 text-slate-400 ml-2">
                  <li>Mengunggah, menyimpan, atau menyebarkan malware, virus trojan, exploit, phising, atau kode berbahaya.</li>
                  <li>Menyebarkan materi pornografi anak, eksploitasi kekerasan ekstrem, atau materi yang melanggar hukum perundang-undangan Republik Indonesia dan hukum internasional.</li>
                  <li>Menyebarkan materi yang melanggar hak cipta, merek dagang, atau kekayaan intelektual pihak lain tanpa izin yang sah.</li>
                </ul>
                <p class="text-slate-400 mt-1">
                  KitsLight berhak menghapus file yang dilaporkan melanggar ketentuan tanpa pemberitahuan sebelumnya.
                </p>
              </section>

              <section class="space-y-2">
                <h3 class="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 class="w-4 h-4 text-indigo-400" /> 3. Hak Kepemilikan Konten
                </h3>
                <p class="text-slate-400">
                  Seluruh hak cipta dan kepemilikan atas berkas, foto, atau dokumen yang Anda olah di KitsLight tetap sepenuhnya menjadi milik Anda. KitsLight tidak mengklaim kepemilikan apapun atas hasil olahan berkas Anda.
                </p>
              </section>

              <section class="space-y-2">
                <h3 class="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 class="w-4 h-4 text-indigo-400" /> 4. Batasan Tanggung Jawab
                </h3>
                <p class="text-slate-400">
                  KitsLight dan pengembangnya tidak bertanggung jawab atas segala kerugian material maupun non-material yang timbul dari kegagalan sistem, kehilangan berkas akibat masa aktif kedaluwarsa di Cloud Temp, atau kesalahan interpretasi OCR dokumen. Pengguna disarankan selalu menyimpan salinan cadangan (*backup*) berkas asli masing-masing.
                </p>
              </section>

              <section class="space-y-2">
                <h3 class="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 class="w-4 h-4 text-indigo-400" /> 5. Perubahan Syarat &amp; Ketentuan
                </h3>
                <p class="text-slate-400">
                  Kami dapat memperbarui Syarat &amp; Ketentuan ini sewaktu-waktu demi menyesuaikan dengan perkembangan fitur teknologi dan regulasi yang berlaku. Versi terbaru akan selalu tersedia di halaman ini.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div class="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <span class="text-[11px] text-slate-500">Terakhir diperbarui: September 2026</span>
          <button
            onClick={onClose}
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
