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

import Image from 'next/image';
import { StructuredData } from '@/components/seo/StructuredData';
import { WebSite, WithContext } from 'schema-dts';

import { GlobalSearch } from '@/components/ui/global-search';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import OnboardingOverlay from '@/components/ui/onboarding-overlay';
import { NavbarUserStatus } from '@/components/ui/navbar-user-status';
import NextTopLoader from 'nextjs-toploader';

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
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <meta name="theme-color" content="#1E3A8A" />
        <StructuredData data={websiteSchema} />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-warm-beige text-slate-900">
        <NextTopLoader color="#10B981" showSpinner={false} />
        <div className="gtranslate_wrapper"></div>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.gtranslateSettings = {"default_language":"en","native_language_names":true,"detect_browser_language":true,"languages":["en","fr","it","es","id","hi","zh-CN","ja","kn","de","ar"],"wrapper_selector":".gtranslate_wrapper","switcher_horizontal_position":"inline","float_switcher_open_direction":"bottom","alt_flags":{"en":"usa"}};`
          }}
        />
        <script src="https://cdn.gtranslate.net/widgets/latest/float.js" defer></script>
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
                  <Image src="/logo.png" width={32} height={32} alt="LifeBloom Logo" className="rounded-xl object-contain" />
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
                  <NavbarUserStatus />
                  <div className="md:hidden">
                    <GlobalSearch />
                  </div>
                </nav>
              </div>
            </header>
            <OnboardingOverlay />
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
