
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function SubroutePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="min-h-screen bg-warm-beige p-6">
      <Link href={`/${locale}`} className="inline-flex items-center text-brand-blue mb-6">
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back
      </Link>
      <h1 className="text-3xl font-bold text-brand-blue">yield radar</h1>
    </div>
  );
}
