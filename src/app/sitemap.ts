import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { createServiceClient } from '@/lib/supabase/server';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    '',
    '/home-living',
    '/home-living/budget-renovator',
    '/home-living/smart-matcher',
    '/money-future',
    '/money-future/retirement-planner',
    '/money-future/yield-radar',
    '/pet-family',
    '/pet-family/canine-symptom-checker',
    '/pet-family/matchmaker',
    '/senior',
    '/senior/drug-checker',
    '/senior/mobility-planner',
    '/travel',
    '/travel/trip-planner',
    '/videos',
    '/about',
    '/join-us'
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 1. Generate localized entries for static routes with full alternates
  routes.forEach((route) => {
    routing.locales.forEach((locale) => {
      sitemapEntries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : 0.8,
        alternates: {
          languages: {
            'x-default': `${BASE_URL}/en${route}`,
            'en': `${BASE_URL}/en${route}`,
            'id': `${BASE_URL}/id${route}`,
            'es': `${BASE_URL}/es${route}`,
          }
        }
      });
    });
  });

  // 2. Programmatic Dynamic Ingestion: Query Supabase for articles & videos
  try {
    const supabase = createServiceClient();
    
    // Fetch canonical articles
    const { data: articles } = await supabase
      .from('canonical_articles')
      .select('slug, published_at')
      .limit(500);

    if (articles && articles.length > 0) {
      articles.forEach(art => {
        routing.locales.forEach((locale) => {
          sitemapEntries.push({
            url: `${BASE_URL}/${locale}/article/${art.slug}`,
            lastModified: art.published_at ? new Date(art.published_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
            alternates: {
              languages: {
                'x-default': `${BASE_URL}/en/article/${art.slug}`,
                'en': `${BASE_URL}/en/article/${art.slug}`,
                'id': `${BASE_URL}/id/article/${art.slug}`,
                'es': `${BASE_URL}/es/article/${art.slug}`,
              }
            }
          });
        });
      });
    }

    // Fetch videos and map to unique query URL `/videos?v=${vid.slug}`
    const { data: videos } = await supabase
      .from('videos')
      .select('slug, created_at')
      .limit(500);

    if (videos && videos.length > 0) {
      videos.forEach(vid => {
        routing.locales.forEach((locale) => {
          sitemapEntries.push({
            url: `${BASE_URL}/${locale}/videos?v=${vid.slug}`,
            lastModified: vid.created_at ? new Date(vid.created_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.5,
            alternates: {
              languages: {
                'x-default': `${BASE_URL}/en/videos?v=${vid.slug}`,
                'en': `${BASE_URL}/en/videos?v=${vid.slug}`,
                'id': `${BASE_URL}/id/videos?v=${vid.slug}`,
                'es': `${BASE_URL}/es/videos?v=${vid.slug}`,
              }
            }
          });
        });
      });
    }
  } catch (err: any) {
    console.warn('[Sitemap Generator] Failed to query dynamic DB routes, falling back to static:', err.message);
  }

  return sitemapEntries;
}
