import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from '@/lib/hooks/useAuth';
import '@/styles/globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale: string) => ({ locale }));
}

import { StructuredData } from '@/components/seo/StructuredData';
import { WebSite, WithContext } from 'schema-dts';

import { GlobalSearch } from '@/components/ui/global-search';
import Link from 'next/link';
import { Home, LayoutDashboard } from 'lucide-react';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  const websiteSchema: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LifeBloom Hub',
    url: 'https://lifebloom.hub',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://lifebloom.hub/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    } as any
  };

  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1E3A8A" />
        <StructuredData data={websiteSchema} />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-warm-beige text-slate-900">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered: ', registration.scope);
                  }, function(err) {
                    console.log('SW registration failed: ', err);
                  });
                });
              }
            `
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/80 border-b border-slate-200">
              <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <Link href={`/${locale}`} className="flex items-center gap-2 text-brand-blue font-black text-xl font-display">
                  <div className="w-8 h-8 bg-brand-green rounded-xl flex items-center justify-center text-white">L</div>
                  LifeBloom Hub
                </Link>
                <div className="flex-1 max-w-md mx-6 hidden md:block">
                  <GlobalSearch />
                </div>
                <nav className="flex items-center gap-6">
                  <Link href={`/${locale}`} className="hidden md:block text-sm font-semibold text-slate-600 hover:text-brand-blue transition-colors">
                    Home
                  </Link>
                  <Link href={`/${locale}/support`} className="hidden md:block text-sm font-semibold text-slate-600 hover:text-brand-blue transition-colors">
                    Helpdesk
                  </Link>
                  <Link href={`/${locale}/dashboard`} className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-sm font-semibold text-brand-blue transition-colors">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <div className="md:hidden">
                    <GlobalSearch />
                  </div>
                </nav>
              </div>
            </header>
            <main className="flex-grow">
              {children}
            </main>
            <footer className="bg-white border-t border-slate-200 py-12 mt-20">
              <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
                &copy; {new Date().getFullYear()} LifeBloom Hub. All rights reserved. <br/>
                <Link href={`/${locale}/support/terms`} className="hover:text-brand-green transition-colors">Terms of Service</Link> | <Link href={`/${locale}/support/privacy`} className="hover:text-brand-green transition-colors">Privacy Policy</Link>
              </div>
            </footer>
          </AuthProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
