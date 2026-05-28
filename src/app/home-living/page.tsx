import { PILLARS } from '@/lib/constants/pillars';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { HomeBudgetCalculator } from "@/components/calculators/home-budget-calculator";
import { SmartHomeMatcher } from "@/components/calculators/smart-home-matcher";
import { DynamicNewsFeed } from '@/components/content/dynamic-news-feed';
import { PillarVideoSection } from '@/components/content/pillar-video-section';

const locale = "en";

export default async function PillarPage({
  params,
}: {
  params: any;
}) {
  
  const slug = 'home-living';
  
  const pillar = Object.values(PILLARS).find((p) => p.slug === slug);

  if (!pillar) {
    notFound();
  }

  return (
    <div className="relative min-h-screen bg-background pb-20 overflow-x-hidden">
      
      {/* Decorative Warm Ambient Background */}
      <div className="ambient-bg" />
      <div className="absolute top-0 left-0 w-full h-[32rem] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0"></div>

      <div className="container mx-auto px-gutter-mobile md:px-margin-desktop pt-10 max-w-container-max relative z-10 animate-fade-in">
        
        {/* Navigation Breadcrumb */}
        <Link 
          href={``}
          className="inline-flex items-center gap-2 text-primary hover:text-primary-container mb-8 transition-all font-bold group min-h-[52px]"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Dynamic Category Header */}
        <header className="mb-12 max-w-article-max">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-bold mb-4">
            Core Care Segment
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground font-display tracking-tight mb-4">
            {pillar.label}
          </h1>
          <p className="text-body-lg text-on-surface-variant leading-relaxed">
            A centralized smart living hub of information and step-by-step estimators designed to organize your home, automation, and security requirements gently.
          </p>
        </header>

        {/* Above-the-fold Interactive Widgets */}
        <section className="w-full max-w-4xl mx-auto space-y-8 mb-12">
          <div id="budget-renovator" className="bg-white rounded-3xl p-8 border border-border soft-shadow transition-all duration-300">
            <HomeBudgetCalculator />
          </div>
          <div id="smart-matcher" className="bg-white rounded-3xl p-8 border border-border soft-shadow transition-all duration-300">
            <SmartHomeMatcher />
          </div>
        </section>

        {/* Dynamic Video Section */}
        <PillarVideoSection pillarSlug={slug} locale={locale} />

        {/* Contextual Articles & News Feed */}
        <section className="w-full max-w-4xl mx-auto space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-border soft-shadow transition-all duration-300">
            <DynamicNewsFeed pillarSlug={slug} locale={locale} />
          </div>
        </section>

      </div>
    </div>
  );
}
