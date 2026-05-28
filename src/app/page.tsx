import { PILLARS } from '@/lib/constants/pillars';
import Link from 'next/link';
import { 
  Home, 
  Wallet, 
  PawPrint, 
  HeartPulse, 
  Plane, 
  LifeBuoy,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { GlobalSearch } from '@/components/ui/global-search';
import { DynamicNewsFeed } from '@/components/content/dynamic-news-feed';
import { Suspense } from 'react';

const pillarIcons: Record<string, React.ReactNode> = {
  home: <Home className="w-6 h-6 text-emerald-600" />,
  money: <Wallet className="w-6 h-6 text-amber-600" />,
  pet: <PawPrint className="w-6 h-6 text-indigo-600" />,
  senior: <HeartPulse className="w-6 h-6 text-rose-600" />,
  travel: <Plane className="w-6 h-6 text-sky-600" />
};

export default function HomePage() {
  const featuredTools = [
    {
      title: "Senior Drug Checker",
      desc: "Instant clinical interaction checks & plain English warnings.",
      path: "/senior/drug-checker",
      icon: <HeartPulse className="w-8 h-8 text-rose-600" />,
      badge: "FDA Database",
      color: "hover:border-rose-200 hover:bg-rose-50/20"
    },
    {
      title: "Retirement Yield Radar",
      desc: "Real-time cost of living, inflation adjustments & asset yields.",
      path: "/money-future/yield-radar",
      icon: <Wallet className="w-8 h-8 text-amber-600" />,
      badge: "Live FRED & CoinGecko",
      color: "hover:border-amber-200 hover:bg-amber-50/20"
    },
    {
      title: "Pet Matchmaker",
      desc: "Find low-maintenance breeds mapped to your living space.",
      path: "/pet-family/matchmaker",
      icon: <PawPrint className="w-8 h-8 text-indigo-600" />,
      badge: "RescueGroups API",
      color: "hover:border-indigo-200 hover:bg-indigo-50/20"
    },
    {
      title: "Smart Home Matcher",
      desc: "Verify Matter protocol devices for safe independent aging.",
      path: "/home-living/smart-matcher",
      icon: <Smartphone className="w-8 h-8 text-emerald-600" />,
      badge: "Matter Standards",
      color: "hover:border-emerald-200 hover:bg-emerald-50/20"
    },
    {
      title: "Accessible Trip Planner",
      desc: "Plan barrier-free vacations with real-time ticket metasearch.",
      path: "/travel/trip-planner",
      icon: <Plane className="w-8 h-8 text-sky-600" />,
      badge: "TravelPayouts API",
      color: "hover:border-sky-200 hover:bg-sky-50/20"
    }
  ];

  return (
    <main className="relative min-h-screen bg-[#FFFDF5] pb-24 overflow-x-hidden font-sans selection:bg-[#85f8c4] selection:text-[#002114]">
      
      {/* Premium ambient decorative background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <article className="max-w-[1120px] mx-auto px-6 py-12 md:py-20 relative z-10">
        
        {/* HERO SECTION - WARM & USER-CENTRIC */}
        <header className="text-center flex flex-col items-center gap-6 py-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs uppercase tracking-wider border border-emerald-100 shadow-sm animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            Your Warm Harbor for Family Care & Wisdom
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight max-w-4xl mx-auto font-display" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            Architecting the Future of Senior Care & Wealth Optimization.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Discover a clean, ad-free sanctuary designed for multigenerational families. We empower you with real-time decision tools: FDA drug warnings, retirement yield projections, and barrier-free travel plans.
          </p>
        </header>

        {/* PREDICTIVE SEARCH BAR */}
        <section className="max-w-3xl mx-auto mb-20 relative z-30 group" aria-label="Global Search">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 to-amber-500/10 rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative">
            <GlobalSearch variant="hero" />
          </div>
        </section>

        {/* INTERACTIVE CALCULATORS & TOOLS GRID (VISUALIZED CARDS) */}
        <section className="mb-24" aria-label="Interactive Calculators">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
              <ShieldCheck className="w-6 h-6 text-emerald-600" /> Real-Time Decision Tools
            </h2>
            <p className="text-slate-500 mt-2 text-sm md:text-base">
              Try our specialized calculations and clinical checkers. No adware, no paywalls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools.map((tool, idx) => (
              <Link 
                key={idx}
                href={tool.path}
                className={`group p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 ${tool.color}`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
                    {tool.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                    {tool.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1">
                    {tool.title} <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* MAGAZINE / BLOG LAYOUT BY PILLAR CATEGORY */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            Latest Dispatches & Insights
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Explore our categorized expert publications on health, wealth, lifestyle, and longevity.
          </p>
        </div>
        
        <nav className="space-y-24" aria-label="Magazine Niche Feeds">
          {Object.values(PILLARS).map((pillar) => {
            return (
              <section key={pillar.id} className="border-t border-slate-200/60 pt-16">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-100 rounded-xl">
                      {pillarIcons[pillar.id]}
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                        {pillar.label}
                      </h2>
                      <p className="text-slate-500 text-xs md:text-sm mt-1">
                        Curated advice and tools for {pillar.label.toLowerCase()}.
                      </p>
                    </div>
                  </div>
                  <Link 
                    href={`/${pillar.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    View Hub <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* DYNAMIC MAGAZINE FEED (SERVER-RENDERED WITH FALLBACKS) */}
                <Suspense fallback={
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-64 bg-slate-100 rounded-3xl" />
                    ))}
                  </div>
                }>
                  <DynamicNewsFeed pillarSlug={pillar.slug} locale="en" />
                </Suspense>
              </section>
            );
          })}
        </nav>

        {/* FOOTER CALL-TO-ACTION */}
        <footer className="mt-32 p-8 bg-slate-900 rounded-[32px] text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-40" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
              Join Our Caregiver & Family Community
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Unlock access to detailed history logs, custom calculator profiles, and collaborative community forums.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Link 
                href="/register"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/10"
              >
                Get Started Free
              </Link>
              <Link 
                href="/support"
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition-all"
              >
                Visit Support Center
              </Link>
            </div>
          </div>
        </footer>

      </article>
    </main>
  );
}
