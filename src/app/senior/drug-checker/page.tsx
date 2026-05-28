import { DrugInteractionChecker } from '@/components/calculators/drug-interaction-checker';
import { Metadata } from 'next';
import { UnifiedStructuredData } from '@/components/seo/UnifiedStructuredData';
import JsonLdFAQ from '@/components/seo/json-ld-faq';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

const locale = "en" as string;

export async function generateMetadata({}): Promise<Metadata> {
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';
  
  const titles: Record<string, string> = {
    en: 'Prescription Drug Interaction Checker & Medication Safety Tool',
    id: 'Alat Cek Interaksi Obat & Analisis Keamanan Resep Medis',
    es: 'Comprobador de Interacciones de Medicamentos y Seguridad de Recetas'
  };
  
  const descriptions: Record<string, string> = {
    en: 'Instantly check peer-reviewed interactions between senior prescription medications, retrieve FDA alerts, and secure clinical guidelines.',
    id: 'Periksa interaksi antara obat resep lansia secara instan dengan data klinis teruji, dapatkan peringatan FDA, dan panduan medis aman.',
    es: 'Compruebe al instante las interacciones de medicamentos para personas mayores, reciba alertas de la FDA y pautas clínicas de seguridad.'
  };

  const toolKeywords = [
    'prescription drug checker', 'medication interaction checker', 'senior drug safety', 
    'FDA warnings database', 'clinical medication screening', 'LifeBloom Hub',
    'interaksi obat', 'cek efek samping obat'
  ];

  const ogImage = `${baseUrl}/images/tools/drug-checker-og.png`;

  return {
    title: titles.en,
    description: descriptions.en,
    keywords: toolKeywords,
    alternates: {
      canonical: '/senior/drug-checker',
      languages: {
        'x-default': '/en/senior/drug-checker',
        'en': '/en/senior/drug-checker',
                      }
    },
    openGraph: {
      title: titles.en,
      description: descriptions.en,
      url: `${baseUrl}/senior/drug-checker`,
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

export default async function DrugCheckerPage({
  params,
}: {
  params: any;
}) {
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';

  const faqItems = [
    {
      question: "How does the prescription drug interaction checker work?",
      answer: "This tool evaluates drug chemical formulations against peer-reviewed clinical databases (referencing MedlinePlus and openFDA data APIs) to identify high-risk side effects or contraindications."
    },
    {
      question: "Can I use this tool to change my medication dosages?",
      answer: "Absolutely not. This tool is designed as an educational reference guide. You must consult your primary care doctor or a certified pharmacist before altering, stopping, or initiating any medication regimen."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF5] py-12 px-6">
      <UnifiedStructuredData
        currentUrl={`${baseUrl}/senior/drug-checker`}
        pageTitle={'Prescription Drug Checker'}
        pageDescription={'Instantly check peer-reviewed interactions between senior prescription medications.'}
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
            {'Prescription Drug Checker'}
          </h1>
          <p className="text-lg text-slate-500">
            {'Screen interactions across multiple senior medications securely with clinical reference checks.'}
          </p>
        </div>

        <DrugInteractionChecker />
      </div>
    </div>
  );
}
