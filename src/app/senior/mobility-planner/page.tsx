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
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    keywords: toolKeywords,
    alternates: {
      canonical: '/senior/mobility-planner',
      languages: {
        'x-default': '/en/senior/mobility-planner',
        'en': '/en/senior/mobility-planner',
        'id': '/id/senior/mobility-planner',
        'es': '/es/senior/mobility-planner',
      }
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: `${baseUrl}/senior/mobility-planner`,
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

export default async function MobilityPlannerPage({
  params,
}: {
  params: any;
}) {
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';

  const faqItems = [
    {
      question: "How does this home mobility auditor help prevent domestic injuries?",
      answer: locale === 'id'
        ? "Alat ini memandu Anda melakukan audit per ruangan (kamar mandi, tangga, kamar tidur) untuk mengidentifikasi bahaya tersandung, minimnya pegangan tangan (grab bars), serta menyarankan penyesuaian pencahayaan kontras tinggi."
        : "This tool guides you through room-by-room audits (bathrooms, stairs, bedrooms) to isolate tripping hazards, locate missing grab bars, and optimize lighting systems for fall prevention."
    },
    {
      question: locale === 'id'
        ? "Apakah ada panduan dalam memilih alat bantu jalan yang sesuai?"
        : "Is there guidance on choosing the right walking aid?",
      answer: locale === 'id'
        ? "Ya. Kami menyertakan kuesioner skrining klinis dasar untuk membantu Anda membedakan antara kebutuhan tongkat kaki tunggal, tripod, atau walker roda (rollator) sesuai tingkat keseimbangan Anda."
        : "Yes. Our tool embeds screening questions to help you distinguish between standard single-point canes, quad-point canes, or rolling walkers (rollators) aligned to your stability needs."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF5] py-12 px-6">
      <UnifiedStructuredData
        currentUrl={`${baseUrl}/senior/mobility-planner`}
        pageTitle={'Senior Mobility Safety Planner'}
        pageDescription={locale === 'id' ? 'Audit rumah Anda untuk pencegahan jatuh dan pilih alat bantu jalan yang aman.' : 'Audit your home for fall prevention and select walking aids scientifically.'}
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
          <ChevronLeft className="w-5 h-5" /> {locale === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
        </Link>
        
        <div className="animate-fade-in mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2 Atkinson-font">
            {locale === 'id' ? 'Pencegahan Jatuh & Mobilitas Lansia' : 'Senior Mobility Safety Planner'}
          </h1>
          <p className="text-lg text-slate-500">
            {locale === 'id' 
              ? 'Tingkatkan keselamatan tempat tinggal Anda dan temukan alat bantu mobilitas yang paling tepat.'
              : 'Audit room fall hazards, receive lighting guides, and check custom physical walking aid recommendations.'}
          </p>
        </div>

        <MobilitySafetyChecklist />
      </div>
    </div>
  );
}
