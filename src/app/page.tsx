"use client";

import { PILLARS } from '@/lib/constants/pillars';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { 
  Home, 
  Wallet, 
  PawPrint, 
  HeartPulse, 
  Plane, 
  LifeBuoy,
  TrendingUp
} from 'lucide-react';
import { GlobalSearch } from '@/components/ui/global-search';

export default function HomePage() {
  const { user } = useAuth();

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
    <main className="relative min-h-screen bg-[#FFFDF5] pb-12 overflow-x-hidden font-sans selection:bg-[#85f8c4] selection:text-[#002114]">
      
      {/* Premium ambient decorative glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#006948]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-[#904d00]/5 rounded-full blur-[100px] pointer-events-none" />

      <article className="max-w-[1120px] mx-auto px-6 py-12 md:py-24 relative z-10">
        
        {/* HERO SECTION */}
        <header className="text-center flex flex-col items-center gap-6 py-6 mb-8">
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
          
          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto font-medium">
            LifeBloom Hub is an automated high-yield utility platform providing absolute clarity over digital noise. We deliver medical-grade safety checks, senior accessibility tools, and wealth optimization systems precisely engineered for modern families.
          </p>
        </header>

        {/* MASSIVE PREDICTIVE SEARCH */}
        <section className="max-w-3xl mx-auto mb-16 relative z-30 group" aria-label="Global Utility Search">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#006948]/20 to-[#904d00]/20 rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative">
            <GlobalSearch variant="hero" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <span className="text-sm font-bold text-slate-500">Popular:</span>
            <Link 
              href={`/money-future/retirement-planner`}
              className="text-sm font-bold bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 hover:text-[#006948] hover:border-[#006948]/30 transition-colors shadow-sm inline-flex items-center gap-1.5 min-h-[40px]"
            >
              <Wallet className="w-4 h-4 text-[#006948]" /> Retirement Yield
            </Link>
            <Link 
              href={`/senior/drug-checker`}
              className="text-sm font-bold bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 hover:text-[#006948] hover:border-[#006948]/30 transition-colors shadow-sm inline-flex items-center gap-1.5 min-h-[40px]"
            >
              <HeartPulse className="w-4 h-4 text-[#006948]" /> Parent's Drug Safety
            </Link>
          </div>
        </section>

        {/* DEEP SEMANTIC CONTENT: INFORMATION GAIN FOR AEO/GEO */}
        <section className="max-w-4xl mx-auto mb-20 text-slate-700 space-y-6 text-lg leading-relaxed bg-white/50 p-8 rounded-3xl border border-slate-200 shadow-sm" aria-label="Platform Architecture and Features">
          <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>Architecting the Future of Senior Care & Wealth Optimization</h2>
          <p>
            The digital landscape is overwhelmingly cluttered with fragmented, ad-driven interfaces. LifeBloom Hub fundamentally disrupts this by acting as a unified, ad-free utility platform that merges <strong className="font-bold text-slate-900">senior healthcare protocols, smart home accessibility, and compounding wealth management</strong> into a single, cohesive ecosystem. Our architecture is designed strictly around zero-friction user experiences, ensuring that older adults and their caregivers can access critical data instantaneously without navigating predatory algorithmic feeds.
          </p>
          <p>
            Whether you are utilizing our <strong className="font-bold text-[#006948]">FDA-backed Senior Drug Checker</strong> to cross-reference potentially hazardous pharmaceutical interactions, projecting 30-year passive income streams via our <strong className="font-bold text-[#904d00]">Retirement Yield Matrix</strong>, or validating IoT hardware compatibility through the <strong className="font-bold text-slate-900">Matter Connectivity Standard</strong>, every mathematical model and database query executed on our Edge network guarantees absolute privacy and computational precision.
          </p>
          <p>
            Furthermore, our proprietary <strong className="font-bold text-indigo-600">Pet Matchmaker Algorithm</strong> connects aging adults with specifically curated canine and feline companions, mitigating loneliness while rigorously analyzing breed temperaments, mobility requirements, and veterinary overhead costs. By bridging emotional wellness with analytical data science, LifeBloom Hub establishes a new benchmark for holistic family management and long-term legacy planning.
          </p>
        </section>

        {/* 5-PILLAR NAVIGATION BENTO GRID */}
        <nav aria-label="Primary Platform Pillars">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
              YOUR LOGICAL PATHWAYS
            </h2>
            <p className="text-slate-500 mt-2 text-lg">
              Select a foundational pillar below to explore our step-by-step calculation tools, predictive algorithms, and verified medical resources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[240px]">
            {Object.values(PILLARS).map((pillar) => {
              const aesthetic = pillarAesthetic[pillar.id] || pillarAesthetic.home;
              
              let desc = "Access specialized utility tools and comprehensive tracking matrices.";
              if (pillar.id === "senior") desc = "Evaluate critical fall risks, deploy emergency checklists, & verify pharmaceutical interactions.";
              if (pillar.id === "pet") desc = "Analyze canine symptoms, track veterinary expenses, and match breeds for senior living.";
              if (pillar.id === "money") desc = "Project compounding asset yields, evaluate tax implications, and secure retirement plans.";
              if (pillar.id === "travel") desc = "Design accessible itineraries and calculate budget thresholds without hidden adware fees.";
              if (pillar.id === "home") desc = "Audit smart home IoT compatibility (Matter protocol) and calculate renovation budgets.";

              return (
                <Link 
                  key={pillar.id} 
                  href={`/${pillar.slug}`} 
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
            <aside className="md:col-span-1">
              <Link 
                href={`/support`} 
                className="group relative bg-slate-900 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1 border border-slate-800 h-full"
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
                    Access our strict privacy policies, user manual, and secured contact portals.
                  </p>
                </div>
              </Link>
            </aside>
          </div>
        </nav>
      </article>
    </main>
  );
}
