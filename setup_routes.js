const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'src', 'app', '[locale]');

const routes = {
  'home-living': {
    component: 'HomeBudgetCalculator',
    import: 'import { HomeBudgetCalculator } from "@/components/calculators/home-budget-calculator";\nimport { SmartHomeMatcher } from "@/components/calculators/smart-home-matcher";',
    content: '<HomeBudgetCalculator />\n            <SmartHomeMatcher />',
    subroutes: ['smart-matcher', 'budget-renovator']
  },
  'money-future': {
    component: 'RetirementCalculator',
    import: 'import { RetirementCalculator } from "@/components/calculators/retirement-calculator";\nimport { YieldRadar } from "@/components/calculators/yield-radar";',
    content: '<RetirementCalculator />\n            <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-2xl p-6 text-center">\n              <span className="inline-block px-3 py-1 bg-brand-blue text-white text-xs font-bold uppercase rounded-full tracking-wider mb-3">Live Scraper Demo</span>\n              <h3 className="text-xl font-bold text-brand-blue mb-2">Phase 2: Instant Local Scraping Preview</h3>\n              <p className="text-slate-600">This component uses Next.js Server Actions and Cheerio to instantly scrape live CD rates from financial sites when you load the page.</p>\n            </div>\n            <YieldRadar />',
    subroutes: ['retirement-planner', 'yield-radar']
  },
  'pet-family': {
    component: 'PetMatchmaker',
    import: 'import { PetMatchmaker } from "@/components/calculators/pet-matchmaker";',
    content: '<PetMatchmaker />',
    subroutes: ['matchmaker', 'canine-symptom-checker']
  },
  'senior': {
    component: 'DrugInteractionChecker',
    import: 'import { DrugInteractionChecker } from "@/components/calculators/drug-interaction-checker";',
    content: '<DrugInteractionChecker />',
    subroutes: []
  },
  'travel': {
    component: 'AccessibleTripPlanner',
    import: 'import { AccessibleTripPlanner } from "@/components/calculators/trip-planner";',
    content: '<AccessibleTripPlanner />',
    subroutes: []
  }
};

const pageTemplate = (slug, data) => `
import { PILLARS } from '@/lib/constants/pillars';
import { notFound } from 'next/navigation';
import { ChevronLeft, Construction } from 'lucide-react';
import Link from 'next/link';
${data.import}
import { AccessibleNewsFeed } from '@/components/content/accessible-news-feed';

export default async function PillarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const slug = '${slug}';
  
  const pillar = Object.values(PILLARS).find((p) => p.slug === slug);

  if (!pillar) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-warm-beige relative overflow-hidden pb-20">
      <div className="absolute top-0 left-0 w-full h-80 bg-brand-blue rounded-b-[3rem] shadow-xl z-0"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl z-0 -translate-y-1/2 translate-x-1/3"></div>

      <div className="container mx-auto px-6 pt-10 max-w-5xl relative z-10 animate-fade-in">
        <Link 
          href={\`/\${locale}\`}
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

        <div className="bg-white rounded-3xl p-8 md:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Construction className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-brand-blue mb-4">Feature Under Development</h2>
          <p className="text-slate-500 max-w-md text-lg mx-auto">
            The specialized page for <strong>{pillar.label}</strong> is currently being built. Soon, you will find calculators, health articles, and step-by-step guides right here.
          </p>
        </div>

        <div className="mt-12 w-full max-w-4xl mx-auto space-y-8">
          ${data.content}
        </div>

        <div className="mt-12 w-full max-w-4xl mx-auto space-y-8">
          <AccessibleNewsFeed pillarSlug={slug} />
        </div>

      </div>
    </div>
  );
}
`;

const subrouteTemplate = (subrouteSlug) => `
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function SubroutePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="min-h-screen bg-warm-beige p-6">
      <Link href={\`/\${locale}\`} className="inline-flex items-center text-brand-blue mb-6">
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back
      </Link>
      <h1 className="text-3xl font-bold text-brand-blue">${subrouteSlug.replace(/-/g, ' ')}</h1>
    </div>
  );
}
`;

Object.entries(routes).forEach(([slug, data]) => {
  const pillarPath = path.join(basePath, slug);
  if (!fs.existsSync(pillarPath)) {
    fs.mkdirSync(pillarPath, { recursive: true });
  }
  fs.writeFileSync(path.join(pillarPath, 'page.tsx'), pageTemplate(slug, data));

  data.subroutes.forEach(sub => {
    const subPath = path.join(pillarPath, sub);
    if (!fs.existsSync(subPath)) {
      fs.mkdirSync(subPath, { recursive: true });
    }
    fs.writeFileSync(path.join(subPath, 'page.tsx'), subrouteTemplate(sub));
  });
});

console.log('Routes generated successfully.');
