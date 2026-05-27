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
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    keywords: toolKeywords,
    alternates: {
      canonical: '/money-future/yield-radar',
      languages: {
        'x-default': '/en/money-future/yield-radar',
        'en': '/en/money-future/yield-radar',
        'id': '/id/money-future/yield-radar',
        'es': '/es/money-future/yield-radar',
      }
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: `${baseUrl}/${locale}/money-future/yield-radar`,
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

export default async function YieldRadarPage({
  params,
}: {
  params: any;
}) {
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';
  
  const faqItems = [
    {
      question: "How does the Yield Radar help me choose safe investments?",
      answer: locale === 'id'
        ? "Yield Radar membandingkan instrumen berisiko rendah seperti Surat Berharga Negara (SBN) dan deposito perbankan yang dijamin LPS, memetakan tingkat pengembalian bersih (net yield) setelah pajak secara transparan."
        : "The Yield Radar aggregates and compares low-risk vehicles including sovereign government treasury bonds and state-backed fixed deposits, highlighting clean net yields after tax."
    },
    {
      question: locale === 'id'
        ? "Seberapa sering data suku bunga diperbarui?"
        : "How often are the interest rate yields updated?",
      answer: locale === 'id'
        ? "Data obligasi negara dan suku bunga dasar deposito diperbarui secara berkala berdasarkan rilis resmi bank sentral dan kementerian keuangan."
        : "Sovereign treasury rates and baseline bank deposit yields are updated systematically based on central bank releases and official treasury auctions."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF5] py-12 px-6">
      <UnifiedStructuredData
        currentUrl={`${baseUrl}/${locale}/money-future/yield-radar`}
        pageTitle={'Real-Time Yield Radar'}
        pageDescription={locale === 'id' ? 'Perbandingan tingkat imbal hasil obligasi negara dan deposito teratas secara real-time.' : 'Compare yield rates across secure government bonds.'}
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
            Yield Radar
          </h1>
          <p className="text-lg text-slate-500 mb-10">
            {locale === 'id' 
              ? 'Perbandingan tingkat imbal hasil obligasi negara dan deposito teratas secara real-time.'
              : 'Real-time comparisons of sovereign treasury bonds and top high-yield fixed deposits.'}
          </p>
          <HydrationGuard fallbackHeight="h-[400px]">
            <YieldRadar />
          </HydrationGuard>
        </div>
      </div>
    </div>
  );
}
