import { Mail, PhoneCall, BookOpen, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function HelpdeskPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = createAdminClient();

  // Query documents dynamically from Supabase
  const { data: docs } = await supabase
    .from('support_documents')
    .select('slug, title, last_updated_at')
    .order('slug');

  return (
    <div className="animate-fade-in space-y-12">
      <div>
        <h1 className="text-4xl font-extrabold text-[#131b2e] mb-3 Atkinson-font" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
          Pusat Bantuan & Legalitas
        </h1>
        <p className="text-xl text-slate-500 font-medium">
          Temukan panduan kepatuhan, kebijakan perlindungan data privasi, dan alur integrasi kami.
        </p>
      </div>

      {/* Dynamic Documentation Bento Grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider Atkinson-font">
          Dokumen Resmi Terintegrasi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {docs?.map((doc) => {
            let icon = <BookOpen className="w-6 h-6" />;
            let desc = "Pusat informasi dan alur sistem untuk memaksimalkan penggunaan LifeBloom.";
            let colorClass = "bg-indigo-50/70 border-indigo-100 hover:border-indigo-300 text-indigo-950";
            let iconBgClass = "bg-indigo-100 text-indigo-700";

            if (doc.slug === 'terms') {
              icon = <FileText className="w-6 h-6" />;
              desc = "Ketentuan layanan, hak cipta konten, batasan tanggung jawab hukum, dan aturan keanggotaan.";
              colorClass = "bg-[#f5fff7] border-[#006948]/15 hover:border-[#006948]/40 text-[#006948]";
              iconBgClass = "bg-[#d8f3e5] text-[#006948]";
            } else if (doc.slug === 'privacy') {
              icon = <ShieldCheck className="w-6 h-6" />;
              desc = "Kebijakan perlindungan privasi data pribadi medis, enkripsi kalkulator, dan kepatuhan GDPR/HIPAA.";
              colorClass = "bg-orange-50/70 border-orange-100 hover:border-orange-300 text-[#904d00]";
              iconBgClass = "bg-orange-100 text-[#904d00]";
            }

            return (
              <Link 
                key={doc.slug}
                href={`/${locale}/support/${doc.slug}`}
                className={`border rounded-2xl p-6 hover:shadow-soft-ambient transition-all duration-200 flex flex-col justify-between group ${colorClass}`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-inner ${iconBgClass}`}>
                    {icon}
                  </div>
                  <h3 className="font-extrabold text-xl mb-2 Atkinson-font leading-tight">{doc.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mt-1">{desc}</p>
                </div>
                <div className="flex items-center gap-1 mt-6 text-sm font-bold text-slate-800 group-hover:translate-x-1 transition-transform">
                  Selengkapnya <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Support Methods */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider Atkinson-font">
          Hubungi Layanan Dukungan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 flex items-start gap-4 hover:border-brand-green/30 transition-colors">
            <div className="p-3 bg-brand-blue/10 rounded-xl text-brand-blue shadow-inner shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Email Support</h3>
              <p className="text-slate-500 mt-1">Dapatkan tanggapan komprehensif dalam waktu 24 jam.</p>
              <p className="font-bold text-[#006948] mt-2">support@lifebloomhub.vercel.app</p>
            </div>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 flex items-start gap-4 hover:border-brand-green/30 transition-colors">
            <div className="p-3 bg-brand-green/10 rounded-xl text-[#006948] shadow-inner shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Layanan Telepon</h3>
              <p className="text-slate-500 mt-1">Tersedia Senin-Jumat, 9:00 - 17:00 WIB.</p>
              <p className="font-bold text-[#006948] mt-2">1-800-LIFE-BLOOM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable FAQs */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider Atkinson-font">
          Pertanyaan yang Sering Diajukan
        </h2>
        <div className="space-y-4">
          {[
            { q: "Bagaimana cara menyetel ulang kata sandi?", a: "Klik pada 'Lupa Kata Sandi' di halaman masuk dan ikuti petunjuk verifikasi satu kali (OTP) yang dikirimkan ke email Anda secara instan." },
            { q: "Apakah kalkulator LifeBloom 100% bebas biaya?", a: "Ya, seluruh kalkulator basic kami sepenuhnya gratis dan tidak memungut biaya apapun. Pengguna premium mendapatkan benefit untuk menyimpan riwayat kalkulasi tanpa batas." },
            { q: "Bagaimana data medis dan keuangan saya dilindungi?", a: "Seluruh data perhitungan dijalankan di sisi browser Anda dan data sensitif dienkripsi secara kaku sebelum disimpan di database Supabase kami. Kami memegang janji mutlak: zero cookies sales." }
          ].map((faq, idx) => (
            <details key={idx} className="group border border-slate-200 rounded-xl bg-white [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer p-4 font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors min-h-[52px]">
                {faq.q}
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="p-4 pt-0 text-slate-500 leading-relaxed border-t border-slate-100 mt-2 pt-4">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
