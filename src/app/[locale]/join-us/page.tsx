import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Target, ArrowRight, CheckCircle2, Building2, Stethoscope, BarChart3 } from 'lucide-react';

export default async function B2BPitchDeckPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  return (
    <div className="min-h-screen bg-[#FFFDF5] py-24 font-sans selection:bg-[#85f8c4] selection:text-[#002114]">
      
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#006948]/5 rounded-bl-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1120px] mx-auto px-6 relative z-10">
        
        {/* HERO HEADER */}
        <header className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-bold text-sm tracking-wide border border-slate-200 shadow-sm mb-6">
            LifeBloom B2B Partnerships
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            Integrate Contextually.<br/>
            <span className="text-[#006948]">Convert Natively.</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed font-medium">
            Standard banner ads are dying. High-net-worth families seek clean, zero-adware tools. Partner with Lifebloom to embed your brand&apos;s solutions right at the exact moment a user needs them.
          </p>
        </header>

        {/* THE PROBLEM VS SOLUTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100 mb-6">
              <Target className="w-6 h-6 text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>THE PROBLEM: Ad-Fatigue</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-rose-500 font-bold mt-1">×</span>
                <span className="text-slate-600 text-lg">82% of users ignore intrusive web banners and pop-ups.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 font-bold mt-1">×</span>
                <span className="text-slate-600 text-lg">Social media provides high traffic but zero trust density.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 font-bold mt-1">×</span>
                <span className="text-slate-600 text-lg">Older demographics abandon sites with cognitive overload.</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#006948] rounded-3xl p-10 border border-[#004d35] shadow-md text-white">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 mb-6">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>THE SOLUTION: Safe Harbors</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#85f8c4] shrink-0" />
                <span className="text-white/90 text-lg">Native tool embeds that solve immediate financial or health math.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#85f8c4] shrink-0" />
                <span className="text-white/90 text-lg">Medical & Clinical signatures (ORCID integration) to build extreme trust.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#85f8c4] shrink-0" />
                <span className="text-white/90 text-lg">Strict privacy policy: No cookies sold, guaranteeing high conversion rates.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CHOOSE YOUR PARTNERSHIP PATHWAY */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            CHOOSE YOUR PARTNERSHIP PATHWAY
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Pathway 1: Experts */}
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 mb-6">
              <Stethoscope className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>For Experts & Clinicians</h3>
            <p className="text-slate-600 text-lg mb-8 flex-grow">
              Reclaim the authority of your clinical voice. Link your signature to our multi-author platform and guide thousands of families looking for clean, verified health metrics.
            </p>
            <ul className="space-y-3 mb-10 border-t border-slate-100 pt-6">
              <li className="flex items-center gap-3 text-slate-700 font-bold">
                <CheckCircle2 className="w-5 h-5 text-[#006948]" /> Publish easily via our Minimalist Editor
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-bold">
                <CheckCircle2 className="w-5 h-5 text-[#006948]" /> Direct ORCID & Wikidata Integrations
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-bold">
                <CheckCircle2 className="w-5 h-5 text-[#006948]" /> Access to the Expert Moderation Queue
              </li>
            </ul>
            <Link href={`/${locale}/register?role=expert`} className="block w-full">
              <button className="w-full h-[56px] bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all outline-none focus:ring-4 focus:ring-slate-300">
                Apply as Expert <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>

          {/* Pathway 2: Sponsors */}
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 mb-6">
              <Building2 className="w-8 h-8 text-[#904d00]" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>For Brands & Sponsors</h3>
            <p className="text-slate-600 text-lg mb-8 flex-grow">
              Achieve unparalleled CTR values by integrating directly inside our high-utility calculation tools where high-net-worth families plan their futures.
            </p>
            <ul className="space-y-3 mb-10 border-t border-slate-100 pt-6">
              <li className="flex items-center gap-3 text-slate-700 font-bold">
                <BarChart3 className="w-5 h-5 text-[#904d00]" /> High-RPM Contextual Placements
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-bold">
                <BarChart3 className="w-5 h-5 text-[#904d00]" /> Native Tool Embeds (Calculators)
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-bold">
                <BarChart3 className="w-5 h-5 text-[#904d00]" /> Exclusive Pillar Sponsorships
              </li>
            </ul>
            <Link href={`/${locale}/support/contact`} className="block w-full">
              <button className="w-full h-[56px] bg-white border-2 border-slate-200 hover:border-[#904d00] hover:text-[#904d00] text-slate-900 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all outline-none focus:ring-4 focus:ring-slate-100">
                Inquire Here
              </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
