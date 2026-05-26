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
import { LayoutDashboard, Home, Search, LifeBuoy } from 'lucide-react';
import OnboardingOverlay from '@/components/ui/onboarding-overlay';
import { NavbarUserStatus } from '@/components/ui/navbar-user-status';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

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
        
        {/* Custom Meta & Scripts */}
        <meta name="impact-site-verification" content="c188c067-926f-4925-8c8b-e04b15769573" />
        <meta name="impact-site-verification" value="ca6b1edc-0537-4c76-89fe-cbb058b59229" />
        <meta name="google-site-verification" content="BsuKe58zHtvtyw7zN_tK9zTo_ZDK7qW533ds7-uoPEg" />
        <script
          {...{ nowprocket: "true" }}
          data-noptimize="1"
          data-cfasync="false"
          data-wpfc-render="false"
          {...{ "seraph-accel-crit": "1" }}
          data-no-defer="1"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                  var script = document.createElement("script");
                  script.async = 1;
                  script.src = 'https://emrld.ltd/NTMzMTA2.js?t=533106';
                  document.head.appendChild(script);
              })();
            `
          }}
        />
        
        {/* Affiliate Marketing Verification & Scripts */}
        {process.env.IMPACT_VERIFICATION_TAG && (
          <meta name="impact-site-verification" content={process.env.IMPACT_VERIFICATION_TAG} />
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Travelpayouts Integration
              window.travelpayoutsConfig = { enable: true };
              
              // Partnerize Cryptographic Tag
              (() => {
                  let pztt = 3;
                  const pztp = {"p":"pzt","mi":0,"ma":99,"e":[]};
                  const tid = '40d5a952-0730-4f08-9dc0-59f7ad74b66f';

                  const pzth = async i => {
                      const e = new TextEncoder();
                      const bin = e.encode(i);
                      const b = await window.crypto.subtle.digest('SHA-1', bin);
                      const a = Array.from(new Uint8Array(b));
                      const h = a.map(b => b.toString(16).padStart(2, '0')).join('');
                      return h;
                  }

                  const pzth2d = h => {
                      return \`\${h.slice(0, 6)}p.\${h}.com\`;
                  }

                  const pztd = async () => {
                      let i;
                      do {
                          i = Math.floor(Math.random() * ((pztp.ma + 1) - pztp.mi)) + pztp.mi;
                      } while (pztp.e?.includes(i));
                      const hash = await pzth(\`\${pztp.p}\${i}\`);
                      return pzth2d(hash);
                  }

                  const pzti = async () => {
                      try {
                          if (pztt <= 0)
                              return;
                          const s = document.createElement('script');
                          s.onerror = () => {
                              pztt--;
                              pzti();
                          }
                          s.onload = () => {
                              l = true;
                              pzthc();
                          }
                          const d = await pztd();
                          s.src = \`https://\${d}/tag/\${tid}\`;
                          document.body.appendChild(s);
                      } catch (e) {
                          e.push( { error:"Load failed from " + d, parameter:"" } );
                          pzthc();
                      }
                  }
                  
                  let l = false;
                  let e = [];
                  let fe = { x: [] };
              
                  const pzthc = () => {
                      const loaded = l;
                      const errors = e;
                      const features_errors = fe;
                      l = false;
                      e = [];
                      fe = { x: [] };
          
                      fetch('https://api.performancehorizon.com/v3/pzthc/' + tid, {
                          method: 'POST',
                          headers: { 'content-type': 'application/json' },
                          body: JSON.stringify({
                              loaded,
                              errors,
                              features_errors,
                              url: window.location.href
                          })
                      });
                  }

                  if (document.readyState === 'loading') {
                      document.addEventListener('DOMContentLoaded', pzti);
                  } else {
                      pzti();
                  }
              })();
            `
          }}
        />
        
        {/* OneSignal Setup */}
        <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.OneSignalDeferred = window.OneSignalDeferred || [];
              OneSignalDeferred.push(async function(OneSignal) {
                await OneSignal.init({
                  appId: "98a08227-5bbf-40d7-816a-6fa037dc5977",
                  safari_web_id: "web.onesignal.auto.2f682342-7506-4d13-96c3-4fd5fa35ae95",
                  notifyButton: {
                    enable: true,
                    size: 'medium',
                    theme: 'default',
                    position: 'bottom-right',
                    showCredit: false,
                    text: {
                      'tip.state.unsubscribed': 'Get LifeBloom Updates!',
                      'tip.state.subscribed': 'You are subscribed!',
                      'tip.state.blocked': 'Notifications Blocked'
                    }
                  },
                  promptOptions: {
                    slidedown: {
                      prompts: [
                        {
                          type: "push",
                          autoPrompt: true,
                          text: {
                            actionMessage: "Join LifeBloom Hub! Get the latest personalized advice for your life, home, and pets directly.",
                            acceptButton: "Yes, keep me updated",
                            cancelButton: "Maybe later"
                          },
                          delay: {
                            pageViews: 1,
                            timeDelay: 10
                          }
                        }
                      ]
                    }
                  }
                });
              });
            `
          }}
        />
        
        {/* Prevent OneSignal Bell widget overlap on Mobile Navigation Bar */}
        <style dangerouslySetInnerHTML={{
          __html: `
            #onesignal-bell-container.onesignal-reset {
              bottom: 85px !important;
              right: 20px !important;
              z-index: 40 !important;
            }
            @media (max-width: 768px) {
              #onesignal-bell-container.onesignal-reset {
                bottom: 95px !important;
                right: 15px !important;
              }
            }
          `
        }} />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-background text-slate-900">
        <NextTopLoader color="#10B981" showSpinner={false} />
        <Toaster position="bottom-right" richColors />

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
            <header className="sticky top-0 z-40 w-full bg-[#FFFDF5]/95 border-b border-slate-200 shadow-sm backdrop-blur-md">
              <div className="max-w-[1120px] mx-auto px-6 h-[72px] flex items-center justify-between">
                <Link href={`/${locale}`} className="flex items-center gap-2 text-[#006948] font-black text-xl hover:scale-[1.02] transition-transform duration-200" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                  <Image src="/logo.png" width={32} height={32} alt="LifeBloom Logo" className="rounded-xl object-contain shrink-0" />
                  <span className="truncate hidden sm:block">LifeBloom Hub</span>
                </Link>
                
                {/* Desktop Linear Nav */}
                <nav className="hidden md:flex items-center gap-8">
                  <Link href={`/${locale}`} className="text-sm font-bold text-slate-600 hover:text-[#006948] transition-colors flex items-center min-h-[52px]">
                    Home
                  </Link>
                  <Link href={`/${locale}/senior`} className="text-sm font-bold text-slate-600 hover:text-[#006948] transition-colors flex items-center min-h-[52px]">
                    Senior Care
                  </Link>
                  <Link href={`/${locale}/money-future`} className="text-sm font-bold text-slate-600 hover:text-[#006948] transition-colors flex items-center min-h-[52px]">
                    Wealth
                  </Link>
                  <Link href={`/${locale}/support`} className="text-sm font-bold text-slate-600 hover:text-[#006948] transition-colors flex items-center min-h-[52px]">
                    Helpdesk
                  </Link>
                  <div className="h-6 w-px bg-slate-200 mx-2"></div>
                  <LanguageSwitcher currentLocale={locale} />
                  <div className="h-6 w-px bg-slate-200 mx-2"></div>
                  <NavbarUserStatus />
                </nav>

                <div className="md:hidden flex items-center gap-3">
                  <LanguageSwitcher currentLocale={locale} />
                  <GlobalSearch />
                </div>
              </div>
            </header>

            <OnboardingOverlay />

            <main className="flex-grow pb-24 md:pb-0 bg-[#FFFDF5]">
              {children}
            </main>

            <footer className="bg-white border-t border-slate-200 py-16 mt-12 pb-32 md:pb-16">
              <div className="max-w-[1120px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>LifeBloom Hub</h4>
                  <p className="text-sm text-slate-500 max-w-sm">
                    A safe, ad-free harbor. We don’t track your cookies, and we don’t sell your data. We build tools for those who depend on you.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 text-sm font-bold text-slate-600">
                  <Link href={`/${locale}/join-us`} className="hover:text-[#006948] min-h-[44px] flex items-center justify-center">Partner With Us</Link>
                  <Link href={`/${locale}/support/privacy`} className="hover:text-[#006948] min-h-[44px] flex items-center justify-center">Privacy Policy</Link>
                  <Link href={`/${locale}/support/terms`} className="hover:text-[#006948] min-h-[44px] flex items-center justify-center">Terms of Service</Link>
                </div>
              </div>
            </footer>

            {/* Mobile Bottom Navbar (Web-App Native Experience) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200 shadow-[0_-4px_24px_rgba(15,23,42,0.08)] backdrop-blur-md flex items-center justify-around h-[72px] pb-[env(safe-area-inset-bottom)] px-2">
              <Link href={`/${locale}`} className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-[#006948] transition-colors w-[64px] h-[52px] shrink-0">
                <Home className="w-6 h-6" />
                <span className="text-[10px] font-bold">Home</span>
              </Link>
              <Link href={`/${locale}/search`} className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-[#006948] transition-colors w-[64px] h-[52px] shrink-0">
                <Search className="w-6 h-6" />
                <span className="text-[10px] font-bold">Search</span>
              </Link>
              <Link href={`/${locale}/dashboard`} className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-[#006948] transition-colors w-[64px] h-[52px] shrink-0">
                <LayoutDashboard className="w-6 h-6" />
                <span className="text-[10px] font-bold">Portal</span>
              </Link>
              <Link href={`/${locale}/support`} className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-[#006948] transition-colors w-[64px] h-[52px] shrink-0">
                <LifeBuoy className="w-6 h-6" />
                <span className="text-[10px] font-bold">Help</span>
              </Link>
            </div>
          </AuthProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
