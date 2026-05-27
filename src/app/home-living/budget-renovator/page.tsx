import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { HomeBudgetCalculator } from '@/components/calculators/home-budget-calculator';
import { HydrationGuard } from '@/components/ui/hydration-guard';
import { Metadata } from 'next';
import { UnifiedStructuredData } from '@/components/seo/UnifiedStructuredData';
import JsonLdFAQ from '@/components/seo/json-ld-faq';

const locale = "en" as string;

export async function generateMetadata({}): Promise<Metadata> {
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';
  
  const titles: Record<string, string> = {
    en: 'Home Renovation Budget Calculator & Cost Estimator',
    id: 'Kalkulator Anggaran Renovasi Rumah & Estimasi Biaya',
    es: 'Calculadora de Presupuesto de Renovación del Hogar'
  };
  
  const descriptions: Record<string, string> = {
    en: 'Calculate custom house renovation costs dynamically, map materials budget, and generate high-fidelity downloadable cost reports.',
    id: 'Hitung perkiraan biaya renovasi rumah mandiri Anda secara instan, petakan anggaran material, dan unduh berkas laporannya.',
    es: 'Calcule los costos de renovación de su hogar de manera dinámica, planifique su presupuesto y genere informes de costos descargables.'
  };

  const toolKeywords = [
    'home renovation budget', 'remodeling cost calculator', 'materials cost estimator', 
    'house budget planner', 'renovator cost pdf report', 'LifeBloom Hub',
    'biaya bangun rumah', 'kalkulator renovasi dapur'
  ];

  const ogImage = `${baseUrl}/images/tools/budget-renovator-og.png`;

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    keywords: toolKeywords,
    alternates: {
      canonical: '/home-living/budget-renovator',
      languages: {
        'x-default': '/en/home-living/budget-renovator',
        'en': '/en/home-living/budget-renovator',
        'id': '/id/home-living/budget-renovator',
        'es': '/es/home-living/budget-renovator',
      }
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: `${baseUrl}/home-living/budget-renovator`,
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

export default async function BudgetRenovatorPage({
  params,
}: {
  params: any;
}) {
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';
  
  const faqItems = [
    {
      question: "How does the home renovation calculator estimate my costs?",
      answer: locale === 'id'
        ? "Kalkulator ini menggunakan tarif rata-rata material dan upah per meter persegi di berbagai area rumah seperti dapur, kamar mandi, atau ruang keluarga untuk merumuskan estimasi anggaran yang mendekati realitas pasar."
        : "This calculator aggregates typical labor rates and raw material averages per square foot across multiple rooms (like kitchen, bath, or living areas) to compile realistic home renovation budgets."
    },
    {
      question: locale === 'id'
        ? "Dapatkah saya menyimpan atau mengunduh laporan anggaran ini?"
        : "Can I save or download this renovation budget breakdown?",
      answer: locale === 'id'
        ? "Ya. Alat kami dilengkapi dengan fitur ekspor instan di bagian akhir kalkulasi untuk mengunduh rincian anggaran dalam format PDF terstruktur secara gratis."
        : "Yes. Our tool features an instant export button to compile your calculated renovation cost parameters into a structured, downloadable PDF report for free."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF5] py-12 px-6">
      <UnifiedStructuredData
        currentUrl={`${baseUrl}/home-living/budget-renovator`}
        pageTitle={'Home Renovation Budget Calculator'}
        pageDescription={locale === 'id' ? 'Hitung biaya renovasi rumah mandiri Anda secara instan dan unduh berkas laporannya.' : 'Calculate custom house renovation costs dynamically.'}
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
          <ChevronLeft className="w-5 h-5" /> {locale === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
        </Link>
        <div className="animate-fade-in">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2 Atkinson-font">
            {locale === 'id' ? 'Kalkulator Anggaran Renovasi' : 'Home Renovation Budget Calculator'}
          </h1>
          <p className="text-lg text-slate-500 mb-10">
            {locale === 'id' 
              ? 'Hitung perkiraan biaya renovasi rumah mandiri Anda secara instan dan unduh berkas laporannya.'
              : 'Calculate your home remodeling costs dynamically and download custom budget reports.'}
          </p>
          <HydrationGuard fallbackHeight="h-[600px]">
            <HomeBudgetCalculator />
          </HydrationGuard>
        </div>
      </div>
    </div>
  );
}
