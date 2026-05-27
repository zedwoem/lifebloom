import { TripBudgetPlanner } from '@/components/calculators/trip-budget-planner';
import { Metadata } from 'next';
import { UnifiedStructuredData } from '@/components/seo/UnifiedStructuredData';
import JsonLdFAQ from '@/components/seo/json-ld-faq';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

const locale = "en" as string;

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
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    keywords: toolKeywords,
    alternates: {
      canonical: '/travel/trip-planner',
      languages: {
        'x-default': '/en/travel/trip-planner',
        'en': '/en/travel/trip-planner',
        'id': '/id/travel/trip-planner',
        'es': '/es/travel/trip-planner',
      }
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: `${baseUrl}/travel/trip-planner`,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: titles[locale] || titles.en
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
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
      answer: locale === 'id'
        ? "Alat ini membagi biaya perjalanan Anda secara dinamis berdasarkan penginapan, makan, transportasi, dan aktivitas, sembari memperhitungkan preferensi aksesibilitas untuk wisatawan senior."
        : "This planner dynamically segments your trip expenses across lodging, meals, transport, and activities while integrating accessibility checks specifically helpful for senior travelers."
    },
    {
      question: locale === 'id'
        ? "Apakah ada saran keamanan khusus untuk pelancong berkebutuhan khusus?"
        : "Are there specific security tips for travelers with special accessibility needs?",
      answer: locale === 'id'
        ? "Ya. Kami menyertakan daftar cek khusus seperti ketersediaan ramp, pintu darurat lebar, lift, serta kemudahan transportasi umum lokal di kota tujuan Anda."
        : "Yes. Our tool embeds verified checklist items covering ramp access, doorway clearance, elevators, and local public transit ease for destination safety."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF5] py-12 px-6">
      <UnifiedStructuredData
        currentUrl={`${baseUrl}/travel/trip-planner`}
        pageTitle={'Accessible Trip Planner'}
        pageDescription={locale === 'id' ? 'Rencanakan perjalanan Anda dengan rincian biaya yang tepat dan ramah aksesibilitas.' : 'Plan your next journey with customized travel budgets.'}
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
          <ChevronLeft className="w-5 h-5" /> {locale === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
        </Link>
        
        <div className="animate-fade-in mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2 Atkinson-font">
            {locale === 'id' ? 'Perencana Anggaran Perjalanan' : 'Trip Budget & Route Planner'}
          </h1>
          <p className="text-lg text-slate-500">
            {locale === 'id' 
              ? 'Rencanakan perjalanan liburan Anda berikutnya secara presisi, hemat, dan ramah aksesibilitas.'
              : 'Audit hotel accessibility details and manage standard daily trip spend parameters.'}
          </p>
        </div>

        <TripBudgetPlanner />
      </div>
    </div>
  );
}
