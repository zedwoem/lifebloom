import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { UnifiedStructuredData } from '@/components/seo/UnifiedStructuredData';
import { getVideoBySlug, getRelatedVideos } from '@/lib/services/videoService';
import VideoDetailClient from './VideoDetailClient';

const locale = "en";

export const revalidate = 600; // Cache for 10 minutes

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const video = await getVideoBySlug(slug, locale);

  if (!video) {
    return {
      title: 'Video Not Found | LifeBloom Hub'
    };
  }

  const plainDescription = video.description || 'Verified educational video masterclass from LifeBloom Academy.';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';

  // Dynamic tags matching pillar
  const pillarKeywords: Record<string, string[]> = {
    money: ['pension planning', 'recession simulator', 'compound dividend payouts', 'compound interest', 'early retirement secrets', 'expert financial video'],
    home: ['Matter smart hub integration', 'residential fall audits', 'budget renovations', 'home building efficiency', 'smart devices'],
    pet: ['dog illness checklist', 'canine symptom checker', 'pet compatibility ras', 'adopsi anjing', 'animal family advisor'],
    senior: ['prevent drug interaction', 'medication checklist for elderly', 'mobility planner standards', 'prevent senior falls'],
    travel: ['wheelchair accessible route', 'travel budget projection', 'inclusive holiday planner']
  };

  const videoKeywords = [
    ...(pillarKeywords[video.pillar] || pillarKeywords.money),
    'LifeBloom Hub',
    video.title.toLowerCase()
  ];

  return {
    title: `${video.title} | Video Hub`,
    description: plainDescription.substring(0, 155),
    keywords: videoKeywords,
    alternates: {
      canonical: `/videos/${slug}`,
      languages: {
        'x-default': `/en/videos/${slug}`,
        'en': `/en/videos/${slug}`,
        'id': `/id/videos/${slug}`,
        'es': `/es/videos/${slug}`,
      }
    },
    openGraph: {
      title: `${video.title} | LifeBloom Academy`,
      description: plainDescription.substring(0, 155),
      url: `${baseUrl}/videos/${slug}`,
      type: 'video.other',
      images: [
        {
          url: video.thumbnail_url || `${baseUrl}/images/og-video-hub.jpg`,
          width: 1200,
          height: 630,
          alt: video.title
        }
      ]
    },
    twitter: {
      card: 'player',
      title: video.title,
      description: plainDescription.substring(0, 155),
      images: [video.thumbnail_url || `${baseUrl}/images/og-video-hub.jpg`]
    }
  };
}

export default async function VideoDetailPage({ params }: PageProps) {
  const { slug, locale } = await params;

  // 1. Fetch active video
  const video = await getVideoBySlug(slug, locale);
  if (!video) {
    return notFound();
  }

  // 2. Fetch related videos
  const relatedVideos = await getRelatedVideos(video.pillar, slug, 3, locale);

  // 3. Format ISO duration for SEO VideoObject schema
  const durationSec = video.duration || 600; // default to 10 mins if undefined
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  const isoDuration = `PT${minutes}M${seconds}S`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';
  
  // Specific VideoObject JSON-LD properties
  const videoObjectData = {
    "thumbnailUrl": video.thumbnail_url || `${appUrl}/images/og-video-hub.jpg`,
    "uploadDate": video.created_at,
    "embedUrl": `https://www.youtube.com/embed/${video.embed_id}`,
    "duration": isoDuration,
    "transcript": video.full_text || ""
  };

  return (
    <>
      {/* Search Engine Optimization VideoObject Schema.org injection */}
      <UnifiedStructuredData
        currentUrl={`${appUrl}/videos/${video.slug}`}
        pageTitle={`${video.title} | LifeBloom Hub`}
        pageDescription={video.description || ""}
        locale={locale}
        image={video.thumbnail_url}
        entityType="VideoObject"
        entitySpecificData={videoObjectData}
        publishDate={video.created_at}
      />

      {/* Detail Layout Interactivity Client component */}
      <VideoDetailClient
        video={video}
        relatedVideos={relatedVideos}
        locale={locale}
      />
    </>
  );
}
