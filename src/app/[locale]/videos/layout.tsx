import { Metadata } from 'next';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}): Promise<Metadata> {
  const { locale } = await params;
  
  const titles: Record<string, string> = {
    en: 'Educational Video Hub — Professional Masterclasses',
    id: 'Pusat Video Edukasi — Kelas Master Profesional',
    es: 'Centro de Videos Educativos — Clases Maestras Profesionales',
  };

  const descriptions: Record<string, string> = {
    en: 'Access premium masterclasses and curated video guides with responsive transcripts for senior care, travel, pet safety, and smart living.',
    id: 'Akses kelas master premium dan panduan video terkurasi dengan transkrip responsif untuk perawatan lansia, perjalanan, keselamatan hewan peliharaan, dan gaya hidup cerdas.',
    es: 'Acceda a clases maestras premium y guías de video seleccionadas con transcripciones adaptables para el cuidado de personas mayores, viajes, seguridad de mascotas y vida inteligente.',
  };

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      canonical: '/videos',
      languages: {
        'x-default': '/en/videos',
        'en': '/en/videos',
        'id': '/id/videos',
        'es': '/es/videos',
      }
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: `https://lifebloomhub.vercel.app/${locale}/videos`,
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'LifeBloom Hub Video Masterclasses'
        }
      ]
    }
  };
}

export default function VideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
