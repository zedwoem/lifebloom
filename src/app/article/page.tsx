import { Metadata } from 'next';
import { createServiceClient } from '@/lib/supabase/server';
import ArticleHubClient from './ArticleHubClient';

const locale = "en";

export const revalidate = 300; // Cache for 5 minutes (ISR)

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';
  
  return {
    title: 'Family Insights & Caregiver Dispatches | LifeBloom Hub',
    description: 'Explore expert, ad-free publications covering active longevity, senior health checker alerts, compound retirement formulas, smart Matter device configurations, and barrier-free vacation routes.',
    keywords: ['caregiver guidelines', 'senior care dispatches', 'compound retirement insights', 'ad-free health guides', 'accessible travel articles', 'LifeBloom Hub publications'],
    alternates: {
      canonical: '/article',
      languages: {
        'x-default': '/en/article',
        'en': '/en/article',
      }
    },
    openGraph: {
      title: 'Family Insights & Caregiver Dispatches | LifeBloom Hub',
      description: 'Explore expert, ad-free publications covering active longevity, senior health checker alerts, compound retirement formulas, smart Matter device configurations, and barrier-free vacation routes.',
      url: `${baseUrl}/article`,
      type: 'website',
      images: [
        {
          url: `${baseUrl}/images/og-video-hub.jpg`, // Repurpose stable og image
          width: 1200,
          height: 630,
          alt: 'LifeBloom Insights'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Family Insights & Caregiver Dispatches | LifeBloom Hub',
      description: 'Explore expert, ad-free publications covering active longevity, senior health checker alerts, compound retirement formulas, smart Matter device configurations, and barrier-free vacation routes.'
    }
  };
}

export default async function ArticleHubPage() {
  const supabase = createServiceClient();
  
  // Fetch up to 100 articles to support client-side filtering, sorting, and pagination
  const { data: articles, error } = await supabase
    .from('canonical_articles')
    .select('id, title, slug, published_at, pillar, image_url, content_html')
    .eq('processing_status', 'completed')
    .order('published_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error("[ArticleHubPage] Error loading articles:", error.message);
  }

  // Pre-process articles for search efficiency
  const processedArticles = (articles || []).map(art => {
    // Generate clean text snippet
    const cleanContent = art.content_html 
      ? art.content_html.replace(/<[^>]*>/g, '').substring(0, 160) + '...'
      : 'Explore detailed family care and active aging guidance compiled by the LifeBloom Editorial Board.';

    return {
      id: art.id,
      title: art.title,
      slug: art.slug,
      published_at: art.published_at || new Date().toISOString(),
      pillar: art.pillar || 'general',
      image_url: art.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
      snippet: cleanContent,
      source: 'LifeBloom Editorial'
    };
  });

  return (
    <ArticleHubClient 
      initialArticles={processedArticles} 
      locale={locale} 
    />
  );
}
