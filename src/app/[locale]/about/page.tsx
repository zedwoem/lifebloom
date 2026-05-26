import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, Users, EyeOff, Award, ArrowRight } from 'lucide-react';

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isIndonesian = locale === 'id';

  // Localized Content Map
  const content = {
    heroBadge: isIndonesian ? "Tentang LifeBloom Hub" : "About LifeBloom Hub",
    heroTitle: isIndonesian ? "Kejelasan Di Atas Kebisingan." : "Clarity Over Noise.",
    heroTitleSpan: isIndonesian ? "Solusi Di Atas Iklan." : "Solutions Over Ads.",
    heroSubtitle: isIndonesian ? 
      "Kami percaya teknologi harus bekerja untuk Anda, bukan mengeksploitasi data Anda. LifeBloom Hub adalah pelabuhan aman yang bebas adware untuk keluarga dan lansia." : 
      "We believe everyday technology should serve you, not exploit your profile. LifeBloom Hub is a clean, ad-free sanctuary for multigenerational families.",
    
    sectionTitle: isIndonesian ? "Prinsip Utama Kami" : "Our Core Principles",
    
    card1Title: isIndonesian ? "Tanpa Adware & Cookies Pihak Ketiga" : "Ad-Free & Tracker-Free",
    card1Desc: isIndonesian ? 
      "Kami tidak menjual cookie, memajang iklan pop-up yang mengganggu, atau membagikan riwayat pencarian medis/keuangan Anda kepada pihak ketiga." : 
      "We never display tracking ads, compile profiles, or sell your medical/financial inputs. Your calculations are private by design.",
    
    card2Title: isIndonesian ? "Metrik Klinis & Finansial Terverifikasi" : "Verified E-E-A-T Standards",
    card2Desc: isIndonesian ? 
      "Seluruh kalkulator dan artikel kesehatan/keuangan kami ditinjau oleh pakar terakreditasi (terintegrasi ORCID & Wikidata) untuk akurasi tertinggi." : 
      "Our tools, calculators, and articles are curated and reviewed by accredited experts (integrated with ORCID & Wikidata) for maximum trust.",

    card3Title: isIndonesian ? "Kejelasan Aksesibilitas Universal" : "Universal Accessibility",
    card3Desc: isIndonesian ? 
      "Dirancang dengan kontras warna tinggi, navigasi keyboard lengkap, dan antarmuka ramah lansia yang memenuhi kepatuhan standar WCAG." : 
      "Built with high color contrast, full keyboard navigation, and cognitive-friendly interfaces aligned with WCAG accessibility standards.",

    teamTitle: isIndonesian ? "Visi Multigenerasional Kami" : "Our Multigenerational Vision",
    teamP1: isIndonesian ? 
      "Didirikan untuk menjembatani kesenjangan antara teknologi modern dan kebutuhan lansia, LifeBloom Hub menyediakan alat hitung praktis untuk membantu perencanaan masa depan, kesejahteraan keluarga, dan perawatan rumah tinggal yang ramah aksesibilitas." : 
      "Founded to bridge the gap between modern digital tools and senior citizens, LifeBloom Hub provides robust, high-utility tools to calculate retirement funds, assess drug safety, and plan accessible smart home renovations.",
    teamP2: isIndonesian ? 
      "Kami berkomitmen untuk terus menyediakan platform yang tenang, bersih, dan tepercaya untuk membantu Anda merawat mereka yang bergantung pada Anda." : 
      "We are committed to maintaining a calm, clean, and reliable harbor to assist you in managing the security of those who depend on you.",

    ctaTitle: isIndonesian ? "Ingin Berkolaborasi?" : "Interested in Collaborating?",
    ctaDesc: isIndonesian ? 
      "Apakah Anda seorang praktisi kesehatan terverifikasi atau instansi yang ingin menyajikan solusi terintegrasi secara etis?" : 
      "Are you an accredited clinical expert or a brand seeking to embed highly contextual solutions natively?",
    ctaButtonPrimary: isIndonesian ? "Ajukan Kemitraan / Pakar" : "Join as Expert / Partner",
    ctaButtonSecondary: isIndonesian ? "Hubungi Dukungan" : "Contact Support"
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] py-24 font-sans selection:bg-[#85f8c4] selection:text-[#002114]">
      
      {/* Ambient backgrounds */}
      <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-[#006948]/5 rounded-br-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-[#904d00]/5 rounded-tl-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1120px] mx-auto px-6 relative z-10">
        
        {/* HERO SECTION */}
        <header className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-bold text-sm tracking-wide border border-slate-200 shadow-sm mb-6">
            {content.heroBadge}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            {content.heroTitle}<br/>
            <span className="text-[#006948]">{content.heroTitleSpan}</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed font-medium">
            {content.heroSubtitle}
          </p>
        </header>

        {/* CORE PRINCIPLES BENTO GRID */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight text-center mb-12" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            {content.sectionTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Privacy */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 mb-6 text-[#006948]">
                <EyeOff className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                {content.card1Title}
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {content.card1Desc}
              </p>
            </div>

            {/* Card 2: E-E-A-T */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 mb-6 text-indigo-600">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                {content.card2Title}
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {content.card2Desc}
              </p>
            </div>

            {/* Card 3: Accessibility */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100 mb-6 text-[#904d00]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                {content.card3Title}
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {content.card3Desc}
              </p>
            </div>

          </div>
        </section>

        {/* STORY / VISION SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24 bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
              {content.teamTitle}
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>{content.teamP1}</p>
              <p>{content.teamP2}</p>
            </div>
          </div>
          
          <div className="relative h-[300px] w-full bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200">
            {/* Visual aesthetic - High contrast abstract representing longevity and safety */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#006948]/10 via-[#904d00]/5 to-transparent z-0" />
            <div className="text-center p-8 z-10">
              <Heart className="w-16 h-16 text-[#006948] mx-auto mb-4 animate-pulse" />
              <p className="text-slate-800 font-extrabold text-lg" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                LifeBloom Hub
              </p>
              <p className="text-xs text-slate-500 mt-1">Care & Accuracy Under One Safe Roof</p>
            </div>
          </div>
        </section>

        {/* B2B / EXPERT CALL TO ACTION */}
        <section className="bg-slate-900 text-white rounded-3xl p-10 md:p-16 border border-slate-800 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-amber-500/10 opacity-30 z-0" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <Users className="w-12 h-12 text-[#85f8c4] mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
              {content.ctaTitle}
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              {content.ctaDesc}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={`/${locale}/join-us`} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 h-[56px] bg-[#85f8c4] hover:bg-[#68e0ac] text-[#002114] font-bold rounded-xl text-base transition-colors flex items-center justify-center gap-2">
                  {content.ctaButtonPrimary} <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              
              <Link href={`/${locale}/support/contact`} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 h-[56px] bg-transparent border-2 border-slate-700 hover:border-slate-500 text-white font-bold rounded-xl text-base transition-colors">
                  {content.ctaButtonSecondary}
                </button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
