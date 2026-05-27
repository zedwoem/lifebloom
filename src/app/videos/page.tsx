import { Metadata } from 'next';
import { getAllVideos } from '@/lib/services/videoService';
import VideoHubClient from './VideoHubClient';

const locale = "en";

export const revalidate = 300; // Cache for 5 minutes

export async function generateMetadata({ 
  params 
}: { 
  params: any 
}): Promise<Metadata> {
  
  
  const dict = {
    en: {
      title: "Educational Video Hub | LifeBloom Hub",
      description: "Explore verified, premium masterclasses in health wellness, home layout, pet family, and retirement planning. Step-by-step guidance for active longevity.",
      keywords: ["educational video hub", "active longevity guide", "retirement masterclass", "home renovator wellness", "expert senior health check", "LifeBloom Academy"]
    },
    id: {
      title: "Pusat Video Edukasi | LifeBloom Hub",
      description: "Jelajahi kelas master premium dan terverifikasi untuk kesehatan lansia, dana pensiun, hewan peliharaan, dan arsitektur rumah pintar.",
      keywords: ["pusat edukasi video", "panduan hidup sehat lansia", "kelas master pensiun", "renovasi rumah praktis", "LifeBloom Academy"]
    }
  };

  const t = dict.en;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    alternates: {
      canonical: `/videos`,
      languages: {
        'x-default': `/en/videos`,
        'en': `/en/videos`,
        'id': `/id/videos`,
        'es': `/es/videos`,
      }
    },
    openGraph: {
      title: t.title,
      description: t.description,
      url: `${baseUrl}/videos`,
      type: 'website',
      images: [
        {
          url: `${baseUrl}/images/og-video-hub.jpg`,
          width: 1200,
          height: 630,
          alt: t.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: t.title,
      description: t.description
    }
  };
}

export default async function VideoHubPage({ 
  params 
}: { 
  params: any 
}) {
  

  // Fetch up to 100 videos to support full client-side filtering/sorting/pagination
  const videos = await getAllVideos(100, locale);

  return (
    <VideoHubClient 
      initialVideos={videos} 
      locale={locale} 
    />
  );
}
