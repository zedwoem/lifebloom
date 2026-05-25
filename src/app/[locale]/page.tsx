"use client";

import { useTranslations } from 'next-intl';
import { PILLARS } from '@/lib/constants/pillars';
import { useAuth } from '@/lib/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronRight, UserCircle2 } from 'lucide-react';
import { GlobalSearch } from '@/components/ui/global-search';

export default function HomePage() {
  const params = useParams();
  const locale = params.locale as string;
  const { user, profile, mockLogin, loading } = useAuth();
  const router = useRouter();

  const t = useTranslations('HomePage');
  const tTitle = t('title');
  const tSubtitle = t('subtitle');

  return (
    <div className="min-h-screen bg-warm-beige relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-brand-green/10 to-transparent pointer-events-none rounded-b-full blur-3xl opacity-60"></div>
      
      <div className="container mx-auto px-6 py-12 md:py-20 max-w-6xl relative z-10 animate-fade-in">
        

        {/* HERO SECTION */}
        <header className="text-center mb-20 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-green/10 text-brand-green-dark font-semibold text-sm mb-8 border border-brand-green/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
            </span>
            Smart System, Tailored For You
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-brand-blue mb-8 leading-[1.1] font-display tracking-tight max-w-4xl mx-auto">
            {tTitle}
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {tSubtitle}
          </p>
        </header>

        {/* UNIVERSAL SEARCH BAR */}
        <section className="max-w-3xl mx-auto mb-24 relative z-50 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative z-50 group">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-green to-brand-blue rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <GlobalSearch variant="hero" />
          </div>
        </section>

        {/* 5-PILLAR NAVIGATION GRID */}
        <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-brand-blue font-display tracking-tight">{t('categories_title')}</h2>
              <p className="text-slate-500 mt-2 text-lg">{t('categories_subtitle')}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.values(PILLARS).map((pillar, idx) => (
              <Link 
                key={pillar.id} 
                href={`/${locale}/${pillar.slug}`} 
                className="group relative bg-white rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] overflow-hidden"
              >
                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white transition-transform duration-300 shadow-sm">
                    <div className="w-6 h-6 bg-brand-blue rounded-full opacity-80" /> {/* Placeholder icon */}
                  </div>
                  <h3 className="text-2xl font-bold text-brand-blue mb-3 group-hover:text-brand-green-dark transition-colors">{pillar.label}</h3>
                  <p className="text-slate-500 mb-8 text-lg leading-relaxed">
                    Smart solutions and step-by-step guidance for your {pillar.label.toLowerCase()} needs.
                  </p>
                  
                  <div className="inline-flex items-center text-brand-green font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    {t('explore')} <ChevronRight className="w-5 h-5 ml-1" />
                  </div>
                </div>
              </Link>
            ))}

            {/* STATIC SUPPORT HUB CARD */}
            <Link 
              href={`/${locale}/support`} 
              className="group relative bg-brand-blue rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 shadow-xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                  <div className="w-6 h-6 bg-white rounded-full opacity-90" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Help & Resources</h3>
                <p className="text-slate-300 mb-8 text-lg leading-relaxed">
                  Knowledge base, legal policies, and customer support.
                </p>
                <div className="inline-flex items-center text-brand-green font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  Visit Helpdesk <ChevronRight className="w-5 h-5 ml-1" />
                </div>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
