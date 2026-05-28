import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { PetMatchmaker } from '@/components/calculators/pet-matchmaker';
import { HydrationGuard } from '@/components/ui/hydration-guard';
import { Metadata } from 'next';
import { UnifiedStructuredData } from '@/components/seo/UnifiedStructuredData';
import JsonLdFAQ from '@/components/seo/json-ld-faq';

const locale = "en" as string;

export async function generateMetadata({}): Promise<Metadata> {
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';
  
  const titles: Record<string, string> = {
    en: 'Pet Matchmaker — Smart Dog Breed Compatibility Calculator',
    id: 'Pet Matchmaker — Kalkulator Kompatibilitas Ras Anjing Ideal',
    es: 'Pet Matchmaker — Calculadora de Compatibilidad de Razas de Perro'
  };
  
  const descriptions: Record<string, string> = {
    en: 'Find your perfect dog breed based on home size, allergy sensitivities, exercise schedules, and family compatibility factors.',
    id: 'Temukan ras anjing ideal yang paling sesuai dengan gaya hidup, luas rumah, sensitivitas alergi, dan ketersediaan waktu Anda.',
    es: 'Encuentre la raza de perro ideal según su estilo de vida, espacio disponible, alergias y disponibilidad de tiempo.'
  };

  const toolKeywords = [
    'dog breed compatibility', 'pet matchmaker calculator', 'apartment-friendly dogs', 
    'hypoallergenic dogs finder', 'family dog compatibility quiz', 'LifeBloom Hub',
    'kecocokan jenis anjing', 'anjing ramah anak apartemen'
  ];

  const ogImage = `${baseUrl}/images/tools/matchmaker-og.png`;

  return {
    title: titles.en,
    description: descriptions.en,
    keywords: toolKeywords,
    alternates: {
      canonical: '/pet-family/matchmaker',
      languages: {
        'x-default': '/en/pet-family/matchmaker',
        'en': '/en/pet-family/matchmaker',
                      }
    },
    openGraph: {
      title: titles.en,
      description: descriptions.en,
      url: `${baseUrl}/pet-family/matchmaker`,
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

export default async function PetMatchmakerPage({
  params,
}: {
  params: any;
}) {
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';
  
  const faqItems = [
    {
      question: "How does this pet matchmaking calculator filter dog breeds?",
      answer: "This calculator evaluates your exact parameters covering housing constraints (apartment vs yard), dander allergies, daily active schedule, and family size to map mathematically-aligned dog breeds."
    },
    {
      question: "Are there adoption recommendations after my match is found?",
      answer: "Yes. We actively advocate for shelter rescues over commercial breeders, presenting a step-by-step puppy-proofing checklist directly with your matched breed results."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF5] py-12 px-6">
      <UnifiedStructuredData
        currentUrl={`${baseUrl}/pet-family/matchmaker`}
        pageTitle={'Pet Matchmaker Compatibility Tool'}
        pageDescription={'Find your perfect dog breed based on home size and lifestyle.'}
        locale={locale}
        entityType="SoftwareApplication"
        entitySpecificData={{
          applicationCategory: "DesignApplication",
          operatingSystem: "All",
          offers: {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        }}
      />
      <JsonLdFAQ questions={faqItems} />

      <div className="max-w-4xl mx-auto">
        <Link 
          href={``} 
          className="inline-flex items-center gap-2 text-brand-green hover:text-brand-green-dark mb-8 transition-all font-bold min-h-[44px]"
        >
          <ChevronLeft className="w-5 h-5" /> {'Back to Home'}
        </Link>
        <div className="animate-fade-in">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2 Atkinson-font">
            Pet Matchmaker
          </h1>
          <p className="text-lg text-slate-500 mb-10">
            {'Find your perfect canine breed based on home size, lifestyle active constraints, and schedule parameters.'}
          </p>
          <HydrationGuard fallbackHeight="h-[500px]">
            <PetMatchmaker />
          </HydrationGuard>
        </div>
      </div>
    </div>
  );
}
