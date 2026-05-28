import { MobilitySafetyChecklist } from '@/components/calculators/mobility-safety-checklist';
import { Metadata } from 'next';
import { UnifiedStructuredData } from '@/components/seo/UnifiedStructuredData';
import JsonLdFAQ from '@/components/seo/json-ld-faq';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

const locale = "en" as string;

export async function generateMetadata({}): Promise<Metadata> {
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';
  
  const titles: Record<string, string> = {
    en: 'Senior Mobility Aid & Home Fall-Prevention Safety Checklist',
    id: 'Panduan Mobilitas Lansia & Daftar Cek Pencegahan Jatuh Mandiri',
    es: 'Guía de Movilidad para Personas Mayores y Lista de Prevención de Caídas'
  };
  
  const descriptions: Record<string, string> = {
    en: 'Audit your home for fall prevention, select walking aids scientifically, and review safe independent movement parameters.',
    id: 'Audit rumah Anda untuk pencegahan jatuh, pilih alat bantu jalan secara ilmiah, dan tinjau panduan pergerakan mandiri yang aman.',
    es: 'Audite su hogar para prevenir caídas, elija ayudas para caminar científicamente y revise las pautas de seguridad.'
  };

  const toolKeywords = [
    'elderly fall prevention checklist', 'senior mobility safety audit', 'walking aid selector', 
    'home safety grab bars', 'rollator vs walker canes guidance', 'LifeBloom Hub',
    'alat bantu jalan lansia', 'mencegah lansia jatuh'
  ];

  const ogImage = `${baseUrl}/images/tools/mobility-planner-og.png`;

  return {
    title: titles.en,
    description: descriptions.en,
    keywords: toolKeywords,
    alternates: {
      canonical: '/senior/mobility-planner',
      languages: {
        'x-default': '/en/senior/mobility-planner',
        'en': '/en/senior/mobility-planner',
                      }
    },
    openGraph: {
      title: titles.en,
      description: descriptions.en,
      url: `${baseUrl}/senior/mobility-planner`,
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

export default async function MobilityPlannerPage({
  params,
}: {
  params: any;
}) {
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';

  const faqItems = [
    {
      question: "How does this home mobility auditor help prevent domestic injuries?",
      answer: "This tool guides you through room-by-room audits (bathrooms, stairs, bedrooms) to isolate tripping hazards, locate missing grab bars, and optimize lighting systems for fall prevention."
    },
    {
      question: "Is there guidance on choosing the right walking aid?",
      answer: "Yes. Our tool embeds screening questions to help you distinguish between standard single-point canes, quad-point canes, or rolling walkers (rollators) aligned to your stability needs."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF5] py-12 px-6">
      <UnifiedStructuredData
        currentUrl={`${baseUrl}/senior/mobility-planner`}
        pageTitle={'Senior Mobility Safety Planner'}
        pageDescription={'Audit your home for fall prevention and select walking aids scientifically.'}
        locale={locale}
        entityType="SoftwareApplication"
        entitySpecificData={{
          applicationCategory: "MedicalApplication",
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
            {'Senior Mobility Safety Planner'}
          </h1>
          <p className="text-lg text-slate-500">
            {'Audit room fall hazards, receive lighting guides, and check custom physical walking aid recommendations.'}
          </p>
        </div>

        <MobilitySafetyChecklist />
      </div>
    </div>
  );
}
