import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { YieldRadar } from '@/components/calculators/yield-radar';
import { HydrationGuard } from '@/components/ui/hydration-guard';

export default async function YieldRadarPage({
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
            Yield Radar
          </h1>
          <p className="text-lg text-slate-500 mb-10">
            Perbandingan tingkat imbal hasil obligasi negara dan deposito teratas secara real-time.
          </p>
          <HydrationGuard fallbackHeight="h-[400px]">
            <YieldRadar />
          </HydrationGuard>
        </div>
      </div>
    </div>
  );
}
