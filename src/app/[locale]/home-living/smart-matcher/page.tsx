import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { SmartHomeMatcher } from '@/components/calculators/smart-home-matcher';
import { HydrationGuard } from '@/components/ui/hydration-guard';
import { Metadata } from 'next';
import { UnifiedStructuredData } from '@/components/seo/UnifiedStructuredData';
import JsonLdFAQ from '@/components/seo/json-ld-faq';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';
  
  const titles: Record<string, string> = {
    en: 'Matter Protocols & Smart Home Eco-Device Compatibility Matcher',
    id: 'Alat Pencocok Perangkat Pintar Protokol Matter & Eco-Friendly',
    es: 'Comprobador de Compatibilidad de Dispositivos Inteligentes y Matter'
  };
  
  const descriptions: Record<string, string> = {
    en: 'Find premium smart home devices matching your ecosystem, checking Matter protocols, energy consumption ratings, and ease-of-use.',
    id: 'Temukan perangkat pintar terbaik yang mendukung protokol Matter dan ramah lingkungan sesuai ekosistem rumah Anda.',
    es: 'Encuentre los mejores dispositivos inteligentes compatibles con Matter y respetuosos con el medio ambiente.'
  };

  const toolKeywords = [
    'Matter smart home', 'eco-friendly appliances', 'energy saver appliances', 
    'smart home compatibility matcher', 'Matter protocols device checker', 'LifeBloom Hub',
    'perangkat rumah pintar', 'smarthome matter indonesia'
  ];

  const ogImage = `${baseUrl}/images/tools/smart-matcher-og.png`;

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    keywords: toolKeywords,
    alternates: {
      canonical: '/home-living/smart-matcher',
      languages: {
        'x-default': '/en/home-living/smart-matcher',
        'en': '/en/home-living/smart-matcher',
        'id': '/id/home-living/smart-matcher',
        'es': '/es/home-living/smart-matcher',
      }
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: `${baseUrl}/${locale}/home-living/smart-matcher`,
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

export default async function SmartMatcherPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';
  
  const faqItems = [
    {
      question: locale === 'id' 
        ? "Apa itu protokol Matter dalam sistem rumah pintar?" 
        : "What is the Matter protocol in smart home systems?",
      answer: locale === 'id'
        ? "Matter adalah standar konektivitas bebas royalti baru yang menyatukan ekosistem rumah pintar (Google Home, Apple Home, Amazon Alexa), memastikan perangkat terhubung secara lokal, cepat, dan aman lintas merek."
        : "Matter is a royalty-free connectivity standard that unifies smart home ecosystems (Google Home, Apple Home, Amazon Alexa) allowing devices to communicate locally, quickly, and securely across brands."
    },
    {
      question: locale === 'id'
        ? "Bagaimana alat ini membantu saya memilih perangkat pintar?"
        : "How does this matcher tool help me choose smart devices?",
      answer: locale === 'id'
        ? "Alat ini memfilter perangkat pintar berdasarkan prioritas Anda seperti efisiensi energi, kemudahan pemasangan (untuk lansia), dan kompabilitas ekosistem asisten suara Anda saat ini."
        : "This tool filters smart appliances based on your exact priorities including eco-friendly energy ratings, senior-friendly setup, and existing voice assistant ecosystems."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF5] py-12 px-6">
      <UnifiedStructuredData
        currentUrl={`${baseUrl}/${locale}/home-living/smart-matcher`}
        pageTitle={locale === 'id' ? 'Smart Home Matcher' : 'Smart Home Device Matcher'}
        pageDescription={locale === 'id' ? 'Temukan perangkat pintar terbaik yang mendukung protokol Matter dan ramah lingkungan.' : 'Find premium smart home devices matching your ecosystem.'}
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
          href={`/${locale}`} 
          className="inline-flex items-center gap-2 text-brand-green hover:text-brand-green-dark mb-8 transition-all font-bold min-h-[44px]"
        >
          <ChevronLeft className="w-5 h-5" /> {locale === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
        </Link>
        <div className="animate-fade-in">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2 Atkinson-font">
            Smart Home Matcher
          </h1>
          <p className="text-lg text-slate-500 mb-10">
            {locale === 'id' 
              ? 'Temukan perangkat pintar terbaik yang mendukung protokol Matter dan ramah lingkungan.'
              : 'Discover the best smart home appliances supporting Matter and eco-friendly standards.'}
          </p>
          <HydrationGuard fallbackHeight="h-[500px]">
            <SmartHomeMatcher />
          </HydrationGuard>
        </div>
      </div>
    </div>
  );
}
