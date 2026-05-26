import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { CanineSymptomDecisionTree } from '@/components/calculators/pet-planner';
import { HydrationGuard } from '@/components/ui/hydration-guard';

export default async function CanineSymptomCheckerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="min-h-screen bg-[#FFFDF5] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link 
          href={`/${locale}`} 
          className="inline-flex items-center gap-2 text-brand-green hover:text-brand-green-dark mb-8 transition-all font-bold min-h-[44px]"
        >
          <ChevronLeft className="w-5 h-5" /> Kembali ke Beranda
        </Link>
        <div className="animate-fade-in">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2 Atkinson-font">
            Canine Symptom Checker
          </h1>
          <p className="text-lg text-slate-500 mb-10">
            Panduan klasifikasi gejala penyakit anjing untuk mendeteksi tingkat risiko darurat secara mandiri dari rumah.
          </p>
          <HydrationGuard fallbackHeight="h-[400px]">
            <CanineSymptomDecisionTree />
          </HydrationGuard>
        </div>
      </div>
    </div>
  );
}
