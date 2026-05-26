import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/dashboard/', '/login/'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app'}/sitemap.xml`,
  };
}
