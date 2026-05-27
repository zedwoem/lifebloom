import { NextRequest, NextResponse } from 'next/server';

export default function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  const isAIBot = /PerplexityBot|ChatGPT-User|ClaudeBot|GPTBot-User/i.test(userAgent);
  if (isAIBot) {
    const url = request.nextUrl.clone();
    url.pathname = `/api/ai-shell${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = /^\/(admin|dashboard|saved)(\/.*)?$/.test(pathname);
  if (isProtectedRoute) {
    const hasAuthCookie = request.cookies.getAll().some(cookie => 
      cookie.name.startsWith('sb-') && cookie.value && cookie.value.length > 20
    );
    if (!hasAuthCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};