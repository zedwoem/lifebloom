import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { CanineSymptomDecisionTree } from '@/components/calculators/pet-planner';
import { HydrationGuard } from '@/components/ui/hydration-guard';
import { Metadata } from 'next';
import { UnifiedStructuredData } from '@/components/seo/UnifiedStructuredData';
import JsonLdFAQ from '@/components/seo/json-ld-faq';

const locale = "en" as string;

export async function generateMetadata({}): Promise<Metadata> {
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';
  
  const titles: Record<string, string> = {
    en: 'Interactive Canine Symptom Checker & Emergency Risk Classifier',
    id: 'Alat Pengecek Gejala Anjing & Klasifikasi Risiko Darurat',
    es: 'Comprobador de Síntomas Caninos y Clasificador de Riesgos'
  };
  
  const descriptions: Record<string, string> = {
    en: 'Evaluate your dog symptoms instantly using our decision tree. Track emergency indicators, hydration levels, and check if a vet visit is needed.',
    id: 'Evaluasi gejala anjing Anda secara instan menggunakan pohon keputusan. Lacak indikator darurat, tingkat hidrasi, dan cek apakah perlu ke dokter hewan.',
    es: 'Evalúe los síntomas de su perro al instante usando nuestro árbol de decisiones. Realice un seguimiento de los indicadores de emergencia.'
  };

  const toolKeywords = [
    'dog symptom checker', 'canine medical advisor', 'vet emergency screening', 
    'dog health risk classifier', 'canine clinical decision tree', 'LifeBloom Hub',
    'sakit anjing', 'gejala penyakit anjing'
  ];

  const ogImage = `${baseUrl}/images/tools/canine-symptom-checker-og.png`;

  return {
    title: titles.en,
    description: descriptions.en,
    keywords: toolKeywords,
    alternates: {
      canonical: '/pet-family/canine-symptom-checker',
      languages: {
        'x-default': '/en/pet-family/canine-symptom-checker',
        'en': '/en/pet-family/canine-symptom-checker',
                      }
    },
    openGraph: {
      title: titles.en,
      description: descriptions.en,
      url: `${baseUrl}/pet-family/canine-symptom-checker`,
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

export default async function CanineSymptomCheckerPage({
  params,
}: {
  params: any;
}) {
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';
  
  const faqItems = [
    {
      question: "How does the Canine Symptom Checker work?",
      answer: "This tool utilizes a clinical-based decision tree categorized by symptom severity to help pet owners distinguish between red-flag emergencies, yellow-flag urgent conditions, and green-flag safe home-care situations."
    },
    {
      question: "Can this symptom checker replace a professional vet visit?",
      answer: "No. This tool is purely educational and meant for initial self-screening helper guide. If your canine shows extreme lethargy, heavy bleeding, or breathing difficulty, seek professional veterinary care immediately."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF5] py-12 px-6">
      <UnifiedStructuredData
        currentUrl={`${baseUrl}/pet-family/canine-symptom-checker`}
        pageTitle={'Canine Symptom Checker'}
        pageDescription={'Evaluate your dog symptoms instantly using our decision tree.'}
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
      
      <div className="max-w-4xl mx-auto">
        <Link 
          href={``} 
          className="inline-flex items-center gap-2 text-brand-green hover:text-brand-green-dark mb-8 transition-all font-bold min-h-[44px]"
        >
          <ChevronLeft className="w-5 h-5" /> {'Back to Home'}
        </Link>
        <div className="animate-fade-in">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2 Atkinson-font">
            Canine Symptom Checker
          </h1>
          <p className="text-lg text-slate-500 mb-10">
            {'Dog symptom classification guide to detect emergency risk levels independently from home.'}
          </p>
          <HydrationGuard fallbackHeight="h-[400px]">
            <CanineSymptomDecisionTree />
          </HydrationGuard>
        </div>
      </div>
    </div>
  );
}
