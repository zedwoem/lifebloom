import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { RetirementCalculator } from '@/components/calculators/retirement-calculator';
import { HydrationGuard } from '@/components/ui/hydration-guard';
import { Metadata } from 'next';
import { UnifiedStructuredData } from '@/components/seo/UnifiedStructuredData';
import JsonLdFAQ from '@/components/seo/json-ld-faq';

const locale = "en" as string;

export async function generateMetadata({}): Promise<Metadata> {
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';
  
  const titles: Record<string, string> = {
    en: 'Interactive Retirement Planner & Savings Projection Calculator',
    id: 'Kalkulator Perencanaan Pensiun & Proyeksi Tabungan Interaktif',
    es: 'Calculadora de Planificación de Jubilación y Proyección de Ahorros'
  };
  
  const descriptions: Record<string, string> = {
    en: 'Calculate your retirement fund realistically with inflation adjustments, severe economic market crash simulations, and custom target retirement goals.',
    id: 'Hitung dana pensiun Anda secara realistis dengan simulasi inflasi, penurunan pasar ekonomi yang parah, dan target pensiun kustom.',
    es: 'Calcule su fondo de jubilación de manera realista con ajustes por inflación, simulaciones de crisis del mercado y metas de jubilación personalizadas.'
  };

  const toolKeywords = [
    'retirement calculator', 'savings projection', 'inflation simulator', 
    'recession simulation', 'senior finance', 'compound interest retirement',
    'LifeBloom Hub', 'kalkulator pensiun'
  ];

  const ogImage = `${baseUrl}/images/tools/retirement-planner-og.png`;

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    keywords: toolKeywords,
    alternates: {
      canonical: '/money-future/retirement-planner',
      languages: {
        'x-default': '/en/money-future/retirement-planner',
        'en': '/en/money-future/retirement-planner',
        'id': '/id/money-future/retirement-planner',
        'es': '/es/money-future/retirement-planner',
      }
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: `${baseUrl}/${locale}/money-future/retirement-planner`,
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

export default async function RetirementPlannerPage({
  params,
}: {
  params: any;
}) {
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';
  
  const faqItems = [
    {
      question: "How does this retirement planning calculator work?",
      answer: locale === 'id'
        ? "Kalkulator ini memproyeksikan dana masa depan Anda menggunakan rumus bunga majemuk dengan opsi inflasi dan pengali resesi untuk mensimulasikan daya beli masa depan secara realistis."
        : "This calculator projects your future savings using compound interest while integrating dynamic inflation adjusting variables and market recessions to model true purchasing power."
    },
    {
      question: locale === 'id'
        ? "Mengapa faktor inflasi penting dimasukkan dalam perhitungan pensiun?"
        : "Why is inflation adjustment critical in retirement calculations?",
      answer: locale === 'id'
        ? "Inflasi mengurangi daya beli uang Anda dari waktu ke waktu. Uang Rp1 Miliar hari ini tidak akan memiliki daya beli yang sama 20 tahun lagi. Menyesuaikan inflasi (misalnya 3-4% per tahun) memastikan target tabungan Anda mencerminkan biaya hidup yang realistis."
        : "Inflation reduces the purchasing power of your money over time. Adjusting for standard inflation (e.g., 3-4% annually) ensures your target retirement nest egg reflects realistic future living costs."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF5] py-12 px-6">
      <UnifiedStructuredData
        currentUrl={`${baseUrl}/${locale}/money-future/retirement-planner`}
        pageTitle={'Retirement Planner Calculator'}
        pageDescription={locale === 'id' ? 'Hitung dana pensiun Anda secara realistis dengan simulasi inflasi.' : 'Calculate your retirement fund realistically with inflation adjustments.'}
        locale={locale}
        entityType="SoftwareApplication"
        entitySpecificData={{
          applicationCategory: "FinanceApplication",
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
          href={`/${locale}`} 
          className="inline-flex items-center gap-2 text-brand-green hover:text-brand-green-dark mb-8 transition-all font-bold min-h-[44px]"
        >
          <ChevronLeft className="w-5 h-5" /> {locale === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
        </Link>
        <div className="animate-fade-in">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2 Atkinson-font">
            {locale === 'id' ? 'Kalkulator Pensiun' : 'Retirement Planner'}
          </h1>
          <p className="text-lg text-slate-500 mb-10">
            {locale === 'id' 
              ? 'Prediksikan pertumbuhan dana pensiun Anda secara realistis dengan simulasi inflasi dan resesi.'
              : 'Project your retirement nest egg with inflation and recession simulator offsets.'}
          </p>
          <HydrationGuard fallbackHeight="h-[600px]">
            <RetirementCalculator />
          </HydrationGuard>
        </div>
      </div>
    </div>
  );
}
