import { PILLARS } from '@/lib/constants/pillars';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { AccessibleTripPlanner } from "@/components/calculators/trip-planner";
import { AccessibleNewsFeed } from '@/components/content/accessible-news-feed';

export default async function PillarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const slug = 'travel';
  
  const pillar = Object.values(PILLARS).find((p) => p.slug === slug);

  if (!pillar) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-warm-beige relative overflow-hidden pb-20">
      <div className="absolute top-0 left-0 w-full h-[28rem] md:h-80 bg-brand-blue rounded-b-[3rem] shadow-xl z-0"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl z-0 -translate-y-1/2 translate-x-1/3"></div>

      <div className="container mx-auto px-6 pt-10 max-w-5xl relative z-10 animate-fade-in">
        <Link 
          href={`/${locale}`}
          className="inline-flex items-center text-white/80 hover:text-white mb-10 transition-colors font-medium"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Home
        </Link>

        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-sm font-semibold mb-6 backdrop-blur-sm">
            Core Category
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-display tracking-tight mb-6">
            {pillar.label}
          </h1>
          <p className="text-xl text-brand-blue-light/90 text-white/80 max-w-2xl leading-relaxed">
            A centralized hub of information and smart tools specifically designed to simplify your {pillar.label.toLowerCase()} needs.
          </p>
        </header>

        <div className="mt-12 w-full max-w-4xl mx-auto space-y-8">
          <AccessibleTripPlanner />
        </div>

        <div className="mt-12 w-full max-w-4xl mx-auto space-y-8">
          <AccessibleNewsFeed pillarSlug={slug} />
        </div>

      </div>
    </div>
  );
}
