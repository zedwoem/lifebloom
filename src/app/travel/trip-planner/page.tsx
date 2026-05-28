import { TripBudgetPlanner } from '@/components/calculators/trip-budget-planner';
import { Metadata } from 'next';
import { UnifiedStructuredData } from '@/components/seo/UnifiedStructuredData';
import JsonLdFAQ from '@/components/seo/json-ld-faq';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

const locale = "en";

export async function generateMetadata({}): Promise<Metadata> {
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';
  
  const titles: Record<string, string> = {
    en: 'Accessible Trip Budget & Adaptive Travel Route Planner',
    id: 'Kalkulator Anggaran Perjalanan & Perencana Rute Aksesibel',
    es: 'Planificador de Presupuesto de Viaje y Rutas Adaptadas'
  };
  
  const descriptions: Record<string, string> = {
    en: 'Plan your next journey with wheelchair access audits, customized daily travel budgets, and peer-reviewed safety checklists.',
    id: 'Rencanakan perjalanan Anda berikutnya dengan audit akses kursi roda, kalkulasi anggaran harian kustom, dan daftar cek keselamatan teruji.',
    es: 'Planifique su próximo viaje con auditorías de acceso para sillas de ruedas, presupuestos diarios personalizados y listas de verificación.'
  };

  const toolKeywords = [
    'accessible travel planner', 'wheelchair trip route budget', 'senior travel checklist', 
    'hotel accessibility audit', 'adaptive travel planning', 'LifeBloom Hub',
    'perencana liburan lansia', 'anggaran liburan ramah kursi roda'
  ];

  const ogImage = `${baseUrl}/images/tools/trip-planner-og.png`;

  return {
    title: titles.en,
    description: descriptions.en,
    keywords: toolKeywords,
    alternates: {
      canonical: '/travel/trip-planner',
      languages: {
        'x-default': '/en/travel/trip-planner',
        'en': '/en/travel/trip-planner',
                      }
    },
    openGraph: {
      title: titles.en,
      description: descriptions.en,
      url: `${baseUrl}/travel/trip-planner`,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: titles.en
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: titles.en,
      description: descriptions.en,
      images: [ogImage]
    }
  };
}

export default async function TripPlannerPage({
  params,
}: {
  params: any;
}) {
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';

  const faqItems = [
    {
      question: "How does this travel budget planner help my trip planning?",
      answer: "This planner dynamically segments your trip expenses across lodging, meals, transport, and activities while integrating accessibility checks specifically helpful for senior travelers."
    },
    {
      question: "Are there specific security tips for travelers with special accessibility needs?",
      answer: "Yes. Our tool embeds verified checklist items covering ramp access, doorway clearance, elevators, and local public transit ease for destination safety."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF5] py-12 px-6">
      <UnifiedStructuredData
        currentUrl={`${baseUrl}/travel/trip-planner`}
        pageTitle={'Accessible Trip Planner'}
        pageDescription={'Plan your next journey with customized travel budgets.'}
        locale={locale}
        entityType="SoftwareApplication"
        entitySpecificData={{
          applicationCategory: "TravelApplication",
          operatingSystem: "All",
          offers: {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        }}
      />
      <JsonLdFAQ questions={faqItems} />

      <div className="max-w-6xl mx-auto">
        <Link 
          href={``} 
          className="inline-flex items-center gap-2 text-brand-green hover:text-brand-green-dark mb-8 transition-all font-bold min-h-[44px]"
        >
          <ChevronLeft className="w-5 h-5" /> {'Back to Home'}
        </Link>
        
        <div className="animate-fade-in mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2 Atkinson-font">
            {'Trip Budget & Route Planner'}
          </h1>
          <p className="text-lg text-slate-500">
            {'Audit hotel accessibility details and manage standard daily trip spend parameters.'}
          </p>
        </div>

        <TripBudgetPlanner />
      </div>
    </div>
  );
}
