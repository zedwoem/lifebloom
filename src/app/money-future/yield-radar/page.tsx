import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { YieldRadar } from '@/components/calculators/yield-radar';
import { HydrationGuard } from '@/components/ui/hydration-guard';
import { Metadata } from 'next';
import { UnifiedStructuredData } from '@/components/seo/UnifiedStructuredData';
import JsonLdFAQ from '@/components/seo/json-ld-faq';

const locale = "en" as string;

export async function generateMetadata({}): Promise<Metadata> {
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';
  
  const titles: Record<string, string> = {
    en: 'Real-Time Yield Radar — Government Bonds & High-Yield Deposits',
    id: 'Yield Radar Real-Time — Perbandingan Obligasi & Deposito',
    es: 'Radar de Rendimiento Real-Time — Bonos y Depósitos de Alto Rendimiento'
  };
  
  const descriptions: Record<string, string> = {
    en: 'Compare yield rates across secure government bonds, fixed deposits, and cash equivalent accounts programmatically.',
    id: 'Perbandingan tingkat imbal hasil obligasi negara dan deposito teratas secara real-time untuk investasi aman Anda.',
    es: 'Compare las tasas de rendimiento de los bonos gubernamentales y los depósitos de alto rendimiento.'
  };

  const toolKeywords = [
    'fixed deposit yield rates', 'sovereign government treasury bonds', 'best high-yield deposits', 
    'net yield interest rate calculator', 'low-risk wealth investments', 'LifeBloom Hub',
    'suku bunga deposito', 'obligasi pemerintah sbn'
  ];

  const ogImage = `${baseUrl}/images/tools/yield-radar-og.png`;

  return {
    title: titles.en,
    description: descriptions.en,
    keywords: toolKeywords,
    alternates: {
      canonical: '/money-future/yield-radar',
      languages: {
        'x-default': '/en/money-future/yield-radar',
        'en': '/en/money-future/yield-radar',
                      }
    },
    openGraph: {
      title: titles.en,
      description: descriptions.en,
      url: `${baseUrl}/money-future/yield-radar`,
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

export default async function YieldRadarPage({
  params,
}: {
  params: any;
}) {
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';
  
  const faqItems = [
    {
      question: "How does the Yield Radar help me choose safe investments?",
      answer: "The Yield Radar aggregates and compares low-risk vehicles including sovereign government treasury bonds and state-backed fixed deposits, highlighting clean net yields after tax."
    },
    {
      question: "How often are the interest rate yields updated?",
      answer: "Sovereign treasury rates and baseline bank deposit yields are updated systematically based on central bank releases and official treasury auctions."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF5] py-12 px-6">
      <UnifiedStructuredData
        currentUrl={`${baseUrl}/money-future/yield-radar`}
        pageTitle={'Real-Time Yield Radar'}
        pageDescription={'Compare yield rates across secure government bonds.'}
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
          href={``} 
          className="inline-flex items-center gap-2 text-brand-green hover:text-brand-green-dark mb-8 transition-all font-bold min-h-[44px]"
        >
          <ChevronLeft className="w-5 h-5" /> {'Back to Home'}
        </Link>
        <div className="animate-fade-in">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2 Atkinson-font">
            Yield Radar
          </h1>
          <p className="text-lg text-slate-500 mb-10">
            {'Real-time comparisons of sovereign treasury bonds and top high-yield fixed deposits.'}
          </p>
          <HydrationGuard fallbackHeight="h-[400px]">
            <YieldRadar />
          </HydrationGuard>
        </div>
      </div>
    </div>
  );
}
