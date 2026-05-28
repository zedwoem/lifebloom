import { PILLARS } from '@/lib/constants/pillars';
import Link from 'next/link';
import { 
  Home, 
  Wallet, 
  PawPrint, 
  HeartPulse, 
  Plane, 
  ShieldCheck, 
  Smartphone, 
  ChevronRight,
  Sparkles,
  EyeOff,
  Accessibility,
  Heart,
  Users,
  ArrowRight
} from 'lucide-react';
import { GlobalSearch } from '@/components/ui/global-search';
import { createServiceClient } from '@/lib/supabase/server';
import { FeaturedInsightsSection } from '@/components/content/FeaturedInsightsSection';
import { Suspense } from 'react';

export default async function HomePage() {
  const supabase = createServiceClient();
  
  // 1. Fetch completed canonical articles
  const { data: articles } = await supabase
    .from('canonical_articles')
    .select('id, title, slug, published_at, pillar, image_url, content_html')
    .eq('processing_status', 'completed')
    .order('published_at', { ascending: false })
    .limit(50);

  const processedArticles = (articles || []).map(art => {
    const cleanContent = art.content_html 
      ? art.content_html.replace(/<[^>]*>/g, '').substring(0, 160) + '...'
      : 'Explore detailed family care and active aging guidance compiled by the LifeBloom Editorial Board.';

    return {
      id: art.id,
      title: art.title,
      slug: art.slug,
      published_at: art.published_at || new Date().toISOString(),
      pillar: art.pillar || 'general',
      image_url: art.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
      snippet: cleanContent,
      source: 'LifeBloom Curation'
    };
  });

  // 2. Fetch active videos
  const { data: videos } = await supabase
    .from('videos')
    .select('id, title, slug, pillar, thumbnail_url, duration, view_count, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(20);

  const processedVideos = videos || [];

  const featuredTools = [
    {
      title: "Senior Drug Checker",
      desc: "Instant clinical interaction checks & plain English warnings.",
      path: "/senior#drug-checker",
      icon: <HeartPulse className="w-8 h-8 text-rose-600" />,
      badge: "FDA Database",
      color: "hover:border-rose-200 hover:bg-rose-50/20"
    },
    {
      title: "Retirement Yield Radar",
      desc: "Real-time cost of living, inflation adjustments & asset yields.",
      path: "/money-future#retirement-planner",
      icon: <Wallet className="w-8 h-8 text-amber-600" />,
      badge: "Live FRED & CoinGecko",
      color: "hover:border-amber-200 hover:bg-amber-50/20"
    },
    {
      title: "Pet Matchmaker",
      desc: "Find low-maintenance breeds mapped to your living space.",
      path: "/pet-family#matchmaker",
      icon: <PawPrint className="w-8 h-8 text-indigo-600" />,
      badge: "RescueGroups API",
      color: "hover:border-indigo-200 hover:bg-indigo-50/20"
    },
    {
      title: "Smart Home Matcher",
      desc: "Verify Matter protocol devices for safe independent aging.",
      path: "/home-living#smart-matcher",
      icon: <Smartphone className="w-8 h-8 text-emerald-600" />,
      badge: "Matter Standards",
      color: "hover:border-emerald-200 hover:bg-emerald-50/20"
    },
    {
      title: "Accessible Trip Planner",
      desc: "Plan barrier-free vacations with real-time ticket metasearch.",
      path: "/travel#trip-planner",
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
        <header className="text-center flex flex-col items-center gap-6 py-6 mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs uppercase tracking-wider border border-emerald-100 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Your Warm Harbor for Family Care & Wisdom
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight max-w-4xl mx-auto font-display" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            Caring for Your Loved Ones Just Got a Little Easier.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mt-4">
            Welcome to a peaceful, ad-free space designed for families and caregivers. From checking drug interactions to planning accessible trips, we provide trusted tools to help you support the people who matter most.
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
            <p className="text-slate-500 mt-2 text-sm md:text-base font-semibold">
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
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed font-semibold">
                    {tool.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* REFINED ABOUT & CORE VALUES SECTION (AUDIENCE-CENTRIC COPYWRITING) */}
        <section className="mb-24 border-t border-slate-200/60 pt-16 animate-fade-in" aria-label="About Our Digital Harbor">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs uppercase tracking-wider border border-emerald-100 shadow-sm mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Our Core Sanctuary Values
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight mb-4" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
              Built for Care. <span className="text-[#006948]">Built for Trust.</span>
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              Everyday technology should support your parents, grandparents, pets, and children—not overwhelm or exploit them. LifeBloom Hub is a calm, ad-free digital harbor for multigenerational families.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white rounded-3xl p-8 border border-slate-150 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 mb-6 text-[#006948]">
                <EyeOff className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                Your Privacy is Sacred
              </h3>
              <p className="text-slate-500 leading-relaxed text-sm font-medium">
                We never sell your health or financial calculations, track your sessions, or show pop-ups. Your personal entries stay strictly yours, secure by design.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-150 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 mb-6 text-indigo-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                Accredited Expert Oversight
              </h3>
              <p className="text-slate-500 leading-relaxed text-sm font-medium">
                Every calculation, active-aging guideline, and clinical warning checker is meticulously reviewed by certified clinicians, financial planners, and curators.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-150 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100 mb-6 text-[#904d00]">
                <Accessibility className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                Designed for Everyone
              </h3>
              <p className="text-slate-500 leading-relaxed text-sm font-medium">
                Simple visual interfaces, high-contrast layouts, text sizing adjustments, and full screen-reader friendliness. No digital clutter—just clear guidance.
              </p>
            </div>
          </div>

          {/* Visual Story / Vision block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-8 md:p-12 border border-slate-150 shadow-sm mb-16">
            <div className="lg:col-span-7 space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 font-display">
                Why We Gathered These Tools Under One Roof
              </h3>
              <div className="space-y-4 text-slate-500 text-sm md:text-base leading-relaxed font-medium">
                <p>
                  Technology should make coordinating care easier, not act as a source of frustration. We recognized that families managing the safety of their parents and grandparents were constantly forced to navigate tracker cookies, confusing advertisements, and generic mock advices.
                </p>
                <p>
                  That is why we built a unified peaceful sanctuary combining real-time flight metasearch, FDA drug hazard warnings, and compound pension planners. We maintain a quiet, clean, and reliable harbor so you can focus entirely on helping those you love thrive.
                </p>
              </div>
            </div>
            
            <div className="lg:col-span-5 relative h-[260px] w-full bg-slate-50/50 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200/50">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-amber-500/5 to-transparent z-0" />
              <div className="text-center p-6 z-10">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Heart className="w-8 h-8 text-[#006948] fill-current animate-pulse" />
                </div>
                <h4 className="text-slate-800 font-extrabold text-base" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                  LifeBloom Care Vision
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">Ad-Free • Care-First • Trusted</p>
              </div>
            </div>
          </div>
        </section>

        {/* DYNAMIC PUBLICATIONS & MASTERCLASSES SECTION (COMPACT TABS & CAROUSELS) */}
        <FeaturedInsightsSection 
          articles={processedArticles} 
          videos={processedVideos} 
        />

        {/* FOOTER CALL-TO-ACTION */}
        <footer className="mt-32 p-8 md:p-16 bg-slate-900 rounded-[32px] text-center relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-40 animate-pulse" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <Users className="w-12 h-12 text-[#85f8c4] mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
              Join Our Caregiver & Family Community
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Unlock access to detailed history logs, custom calculator profiles, and collaborative community forums.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link 
                href="/register"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/10 cursor-pointer text-sm"
              >
                Get Started Free
              </Link>
              <Link 
                href="/support"
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3.5 rounded-xl transition-all border border-white/10 cursor-pointer text-sm"
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
