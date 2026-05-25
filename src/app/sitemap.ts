import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const BASE_URL = 'https://lifebloomhub.com';

export default function sitemap(): MetadataRoute.Sitemap {
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
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Generate localized URLs for each route
  routing.locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemapEntries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : 0.8,
      });
    });
  });

  return sitemapEntries;
}
