import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, Users, EyeOff, Award, ArrowRight, Sparkles, Accessibility } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Built for Care, Built for Trust | About LifeBloom Hub',
  description: 'Learn about LifeBloom Hub, an ad-free, tracking-free digital harbor designed for multigenerational families. Explore our core principles of privacy, expert oversight, and universal accessibility.',
  alternates: {
    canonical: '/about',
  }
};

export default async function AboutPage() {
  const content = {
    heroBadge: "About LifeBloom Hub",
    heroTitle: "Built for Care.",
    heroTitleSpan: "Built for Trust.",
    heroSubtitle: "We believe technology should support your family, not exploit your data. LifeBloom Hub is a clean, ad-free digital harbor designed for multigenerational families seeking calm, expert answers.",
    
    sectionTitle: "Our Core Principles",
    
    card1Title: "Your Privacy is Sacred",
    card1Desc: "We don't track your calculations, record your health queries, or sell your financial entries to advertisers. Your personal data stays entirely yours, secure by design.",
    
    card2Title: "Accredited Expert Oversight",
    card2Desc: "Every medical-grade checker, financial projection, and active-aging guideline is rigorously reviewed by certified specialists and curators for absolute peace of mind.",

    card3Title: "Designed for Everyone",
    card3Desc: "Built with comfortable text sizing, high-contrast toggles, clean interfaces, and screen-reader accessibility. No digital noise or cognitive clutter—just clear guidance.",
 
    visionTitle: "Why We Created LifeBloom Hub",
    visionP1: "Technology should empower our parents, grandparents, pets, and children—not confuse or overwhelm them. We realized that families planning for the future were constantly bombarded with tracker cookies, intrusive ads, and unreliable advice.",
    visionP2: "That is why we gathered clinical prescription checkers, compound retirement tools, and accessible travel planners into a single peaceful sanctuary. We are committed to maintaining a quiet, clean, and reliable harbor to assist you in managing the wellness of those who depend on you.",

    ctaTitle: "Let's Build a Safer Digital Harbor Together",
    ctaDesc: "Are you a licensed clinician, certified financial advisor, or accessible brand dedicated to helping families plan safely? Join our active caregiver network.",
    ctaButtonPrimary: "Partner With Us",
    ctaButtonSecondary: "Explore Helpdesk"
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] py-16 md:py-24 font-sans selection:bg-[#85f8c4] selection:text-[#002114]">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-emerald-500/5 rounded-br-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-amber-500/5 rounded-tl-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1120px] mx-auto px-6 relative z-10">
        
        {/* HERO SECTION */}
        <header className="text-center max-w-3xl mx-auto mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs uppercase tracking-wider border border-emerald-100/60 shadow-sm mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            {content.heroBadge}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            {content.heroTitle}<br/>
            <span className="text-[#006948]">{content.heroTitleSpan}</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
            {content.heroSubtitle}
          </p>
        </header>

        {/* CORE PRINCIPLES BENTO GRID */}
        <section className="mb-24" aria-label="Our Core Principles">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight text-center mb-12" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            {content.sectionTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Privacy */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100/50 mb-6 text-[#006948] shadow-2xs">
                <EyeOff className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                {content.card1Title}
              </h3>
              <p className="text-slate-500 leading-relaxed text-sm font-medium">
                {content.card1Desc}
              </p>
            </div>

            {/* Card 2: E-E-A-T */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100/50 mb-6 text-indigo-600 shadow-2xs">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                {content.card2Title}
              </h3>
              <p className="text-slate-500 leading-relaxed text-sm font-medium">
                {content.card2Desc}
              </p>
            </div>

            {/* Card 3: Accessibility */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100/50 mb-6 text-[#904d00] shadow-2xs">
                <Accessibility className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                {content.card3Title}
              </h3>
              <p className="text-slate-500 leading-relaxed text-sm font-medium">
                {content.card3Desc}
              </p>
            </div>

          </div>
        </section>

        {/* STORY / VISION SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24 bg-white rounded-3xl p-8 md:p-12 border border-slate-200/60 shadow-sm">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
              {content.visionTitle}
            </h2>
            <div className="space-y-4 text-slate-500 leading-relaxed text-sm md:text-base font-medium">
              <p>{content.visionP1}</p>
              <p>{content.visionP2}</p>
            </div>
          </div>
          
          <div className="relative h-[300px] w-full bg-slate-50/50 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200/60">
            {/* Elegant micro-art placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-amber-500/5 to-transparent z-0" />
            <div className="text-center p-8 z-10">
              <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm animate-pulse">
                <Heart className="w-10 h-10 text-[#006948] fill-current" />
              </div>
              <h3 className="text-slate-800 font-extrabold text-lg" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                LifeBloom Sanctuary
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">Ad-Free • Care-First • Trusted</p>
            </div>
          </div>
        </section>

        {/* B2B / EXPERT CALL TO ACTION */}
        <section className="bg-slate-900 text-white rounded-3xl p-10 md:p-16 border border-slate-800 text-center relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-40 z-0" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <Users className="w-12 h-12 text-[#85f8c4] mx-auto" />
            <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
              {content.ctaTitle}
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              {content.ctaDesc}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href={`/join-us`} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-3 bg-[#85f8c4] hover:bg-[#68e0ac] text-[#002114] font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer">
                  {content.ctaButtonPrimary} <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              
              <Link href={`/support`} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer border border-white/10">
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
