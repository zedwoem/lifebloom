import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // === AI BOT DETECTION (AEO/GEO) ===
  const userAgent = request.headers.get("user-agent") || "";
  const isAIBot = /PerplexityBot|ChatGPT-User|ClaudeBot|GPTBot-User/i.test(userAgent);

  if (isAIBot) {
    // Rewrite silently to AI Shell route
    // Example: /en/article/health-tips -> /api/ai-shell/en/health-tips
    // We assume the URL structure has a slug or we pass the entire pathname
    const url = request.nextUrl.clone();
    // Simply proxy the whole path to the shell endpoint, we can parse it there
    url.pathname = `/api/ai-shell${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // === ROUTE PROTECTION ===
  // Protect routes like /dashboard, /saved, etc.
  const pathname = request.nextUrl.pathname;
  // Match /[locale]/dashboard or /[locale]/saved
  const isProtectedRoute = /^\/[^\/]+\/(dashboard|saved)(\/.*)?$/.test(pathname);
  
  if (isProtectedRoute) {
    // Check if user has Supabase auth cookie or mock auth cookie
    // Supabase usually sets cookies starting with sb-
    const hasAuthCookie = request.cookies.getAll().some(cookie => cookie.name.startsWith('sb-'));
    
    if (!hasAuthCookie) {
      const url = request.nextUrl.clone();
      // Extract locale from the pathname
      const locale = pathname.split('/')[1];
      url.pathname = `/${locale}/login`;
      // Pass the original URL as a redirect parameter if needed, but for now just redirect
      return NextResponse.redirect(url);
    }
  }

  // === HYBRID LOCALE DETECTION STRATEGY ===
  
  // 1. Check if the user already has a NEXT_LOCALE cookie set (Tertiary: User Preference)
  const hasLocaleCookie = request.cookies.has('NEXT_LOCALE');
  
  if (!hasLocaleCookie) {
    // 2. Check Vercel Geo IP Header (Secondary)
    const country = request.headers.get('x-vercel-ip-country');
    if (country) {
      // Basic Country -> Locale mapping (can be expanded)
      const geoToLocaleMap: Record<string, string> = {
        'ID': 'id',
        'ES': 'es', 'MX': 'es', 'AR': 'es',
        'FR': 'fr', 'CH': 'fr', 'BE': 'fr',
        'DE': 'de', 'AT': 'de',
      };
      const geoLocale = geoToLocaleMap[country];
      
      if (geoLocale && routing.locales.includes(geoLocale as any)) {
        // We will pass the locale to the response later, but intlMiddleware usually detects it from headers.
        // Modifying request cookies directly can cause Edge Runtime errors in some Next.js versions.
        // Instead, we can inject it via header or just rely on intlMiddleware's Accept-Language.
      }
    }
  }

  // 3. If neither cookie nor valid GeoIP exists, next-intl's createMiddleware automatically
  // parses the `Accept-Language` header (Primary), falling back to routing.defaultLocale ('en').
  
  return intlMiddleware(request);
}

export const config = {
  // Skip all internal paths (_next) and api routes
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
