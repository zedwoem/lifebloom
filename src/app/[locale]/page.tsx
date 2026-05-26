"use client";

import { useTranslations } from 'next-intl';
import { PILLARS } from '@/lib/constants/pillars';
import { useAuth } from '@/lib/hooks/useAuth';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  Wallet, 
  PawPrint, 
  HeartPulse, 
  Plane, 
  LifeBuoy,
  ArrowRight,
  TrendingUp,
  Search
} from 'lucide-react';
import { GlobalSearch } from '@/components/ui/global-search';

export default function HomePage() {
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuth();

  const t = useTranslations('HomePage');

  const pillarIcons: Record<string, React.ReactNode> = {
    home: <Home className="w-8 h-8 text-[#006948]" />,
    money: <Wallet className="w-8 h-8 text-[#904d00]" />,
    pet: <PawPrint className="w-8 h-8 text-indigo-600" />,
    senior: <HeartPulse className="w-8 h-8 text-[#006948]" />,
    travel: <Plane className="w-8 h-8 text-sky-600" />
  };

  const pillarAesthetic: Record<string, { cardClass: string; badgeClass: string; iconBg: string }> = {
    senior: {
      cardClass: "md:col-span-2 bg-[#f5fff7] hover:border-[#006948]",
      badgeClass: "bg-[#006948] text-white flex items-center gap-1.5",
      iconBg: "bg-white shadow-sm border border-[#006948]/20"
    },
    pet: {
      cardClass: "bg-white hover:border-indigo-200",
      badgeClass: "bg-indigo-50 text-indigo-600",
      iconBg: "bg-indigo-50 border border-indigo-100"
    },
    money: {
      cardClass: "bg-white hover:border-[#904d00]/30",
      badgeClass: "bg-orange-50 text-[#904d00]",
      iconBg: "bg-orange-50 border border-orange-100"
    },
    travel: {
      cardClass: "md:col-span-2 bg-white hover:border-sky-200",
      badgeClass: "bg-sky-50 text-sky-700",
      iconBg: "bg-sky-50 border border-sky-100"
    },
    home: {
      cardClass: "bg-white hover:border-[#006948]/30",
      badgeClass: "bg-[#f5fff7] text-[#006948]",
      iconBg: "bg-[#f5fff7] border border-[#006948]/10"
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FFFDF5] pb-12 overflow-x-hidden font-sans selection:bg-[#85f8c4] selection:text-[#002114]">
      
      {/* Premium ambient decorative glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#006948]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-[#904d00]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1120px] mx-auto px-6 py-12 md:py-24 relative z-10">
        
        {/* HERO SECTION */}
        <header className="text-center flex flex-col items-center gap-6 py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f5fff7] text-[#006948] font-bold text-sm tracking-wide border border-[#006948]/20 animate-fade-in shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006948] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#006948]"></span>
            </span>
            Safe Harbor For Families
          </div>
          
          <h1 className="text-[42px] md:text-[64px] font-extrabold text-slate-900 leading-[1.1] tracking-tight max-w-4xl mx-auto" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            UNSCROLL YOUR LIFE
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto font-medium">
            Clarity Over Noise. Solutions Over Scrolls.
          </p>
        </header>

        {/* MASSIVE PREDICTIVE SEARCH */}
        <section className="max-w-3xl mx-auto mb-24 relative z-30 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#006948]/20 to-[#904d00]/20 rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative bg-white rounded-3xl p-3 border border-slate-200 shadow-sm focus-within:shadow-md focus-within:border-[#006948]/30 transition-all duration-300">
            <div className="flex items-center gap-3 px-4">
              <Search className="w-6 h-6 text-slate-400" />
              <input 
                type="text" 
                placeholder="What can we calculate for your family today?" 
                className="w-full h-[56px] text-lg bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400"
              />
              <button className="hidden sm:flex items-center justify-center px-6 min-h-[48px] bg-[#006948] hover:bg-[#00855d] text-white font-bold rounded-xl transition-colors">
                Search
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <span className="text-sm font-bold text-slate-500">Popular:</span>
            <button className="text-sm font-bold bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 hover:text-[#006948] hover:border-[#006948]/30 transition-colors shadow-sm">
              💰 Retirement Yield
            </button>
            <button className="text-sm font-bold bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 hover:text-[#006948] hover:border-[#006948]/30 transition-colors shadow-sm">
              💊 Parent&apos;s Drug Safety
            </button>
          </div>
        </section>

        {/* 5-PILLAR NAVIGATION BENTO GRID */}
        <section className="w-full">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
              YOUR LOGICAL PATHWAYS
            </h2>
            <p className="text-slate-500 mt-2 text-lg">
              Select a pillar to explore step-by-step tools and verified resources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[240px]">
            {Object.values(PILLARS).map((pillar) => {
              const aesthetic = pillarAesthetic[pillar.id] || pillarAesthetic.home;
              
              // Custom copy overrides based on blueprint
              let desc = "Personalized tools and medical-grade guidance.";
              if (pillar.id === "senior") desc = "Evaluate fall risks & check medication safety instantly.";
              if (pillar.id === "pet") desc = "Canine symptoms & family matches.";
              if (pillar.id === "money") desc = "Project compound yield & secure plans.";
              if (pillar.id === "travel") desc = "Design itineraries without the adware or hidden fees.";

              return (
                <Link 
                  key={pillar.id} 
                  href={`/${locale}/${pillar.slug}`} 
                  className={`group relative rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1 ${aesthetic.cardClass}`}
                >
                  <div className="flex items-start justify-between z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${aesthetic.iconBg}`}>
                      {pillarIcons[pillar.id]}
                    </div>
                    {pillar.id === 'senior' && (
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${aesthetic.badgeClass}`}>
                        <TrendingUp className="w-3.5 h-3.5" /> Start Here
                      </span>
                    )}
                  </div>

                  <div className="z-10 mt-auto">
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-[#006948] transition-colors" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                      {pillar.label}
                    </h3>
                    <p className="text-base text-slate-600 mt-2 line-clamp-2">
                      {desc}
                    </p>
                  </div>
                </Link>
              );
            })}

            {/* STATIC SUPPORT HUB CARD */}
            <Link 
              href={`/${locale}/support`} 
              className="group relative bg-slate-900 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1 border border-slate-800"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-40" />
              
              <div className="flex items-start justify-between z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 border border-white/5">
                  <LifeBuoy className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="z-10 mt-auto">
                <h3 className="text-2xl font-bold text-white group-hover:text-[#85f8c4] transition-colors" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                  Support Center
                </h3>
                <p className="text-base text-slate-400 mt-2">
                  Knowledge base, privacy details, and contact forms.
                </p>
              </div>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
