import { Metadata } from 'next';

const locale = "en";

export async function generateMetadata({ 
  params 
}: { 
  params: any 
}): Promise<Metadata> {
  
  
  const title = 'Educational Video Hub — Professional Masterclasses';
  const description = 'Access premium masterclasses and curated video guides with responsive transcripts for senior care, travel, pet safety, and smart living.';

  return {
    title,
    description,
    alternates: {
      canonical: '/videos',
      languages: {
        'x-default': '/en/videos',
        'en': '/en/videos',
                      }
    },
    openGraph: {
      title: title,
      description: description,
      url: `https://lifebloomhub.vercel.app/videos`,
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
