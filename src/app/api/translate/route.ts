import { NextResponse } from 'next/server';
import { translateHtml } from '@/lib/services/astTranslationEngine';

// NOTE: No edge runtime — astTranslationEngine uses Node.js crypto and Supabase client

export async function POST(request: Request) {
  // === SECURITY CHECK: Prevent external scraping ===
  const referer = request.headers.get("referer") || "";
  const origin = request.headers.get("origin") || "";
  const allowedHost = process.env.NEXT_PUBLIC_APP_URL || "https://lifebloomhub.vercel.app";
  
  if (!referer.includes(allowedHost) && !origin.includes(allowedHost)) {
    console.warn(`[SECURITY] Blocked unauthorized Translate request from Origin: ${origin}, Referer: ${referer}`);
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { text, targetLang, sourceLang = 'en' } = body;

    if (!text || !targetLang) {
      return NextResponse.json({ error: 'Missing text or targetLang' }, { status: 400 });
    }

    // Panggil utilitas terjemahan pintar (Cache -> LibreTranslate -> DeepL -> Teks Asli)
    // translateHtml aman untuk teks biasa maupun HTML — fallback ke tier Groq > CF Workers > Gemini
    const translatedText = await translateHtml(text, targetLang, sourceLang);

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('[API Translate Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
