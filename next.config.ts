import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // ppr: true, // Enable this only if using the latest Next.js 15 canary version
  },
  images: {
    remotePatterns: [
      { protocol: 'https' as const, hostname: 'm.media-amazon.com' },
      { protocol: 'https' as const, hostname: 'images.unsplash.com' },
      { protocol: 'https' as const, hostname: 'api.qrserver.com' },
      { protocol: 'https' as const, hostname: 'ui-avatars.com' }
    ],
  },
};

export default withNextIntl(nextConfig);
