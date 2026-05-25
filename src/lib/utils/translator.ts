// src/lib/utils/translator.ts
import { createClient } from '@supabase/supabase-js';

// We use native Web Crypto API for Edge compatibility instead of 'crypto' node module
// but for simplicity in this utility, if running on Edge, we can use a lightweight hash
async function createContentHash(text: string, targetLang: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(`${text}_${targetLang}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Use Service Role Key because writing to cache bypasses RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must be in .env.local

// Ensure we don't crash on client side if accidentally imported
const supabase = typeof window === 'undefined' ? createClient(supabaseUrl, supabaseServiceKey || 'dummy') : null;

const deeplAuthKey = process.env.DEEPL_API_KEY;

// LibreTranslate config
const LT_URL = process.env.LIBRETRANSLATE_URL || 'http://localhost:5000';
const LT_API_KEY = process.env.LIBRETRANSLATE_API_KEY || '';


export async function getCachedTranslation(hash: string): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('translation_cache')
    .select('translated_text')
    .eq('content_hash', hash)
    .maybeSingle();

  if (error || !data) return null;

  // Asynchronously update last_accessed (fire and forget to not block UI)
  supabase.rpc('update_translation_accessed', { hash_val: hash }).then();
  
  return data.translated_text;
}

export async function saveTranslationToCache(
  hash: string, 
  sourceText: string, 
  translatedText: string, 
  sourceLang: string, 
  targetLang: string, 
  provider: string
) {
  if (!supabase) return;
  await supabase.from('translation_cache').insert({
    content_hash: hash,
    source_text: sourceText,
    translated_text: translatedText,
    source_lang: sourceLang,
    target_lang: targetLang,
    provider_used: provider
  });
}

/**
 * Smart Translate Engine (Server-Side Only).
 * Flow: Supabase Cache -> LibreTranslate (Self-Hosted) -> DeepL (Fallback) -> Original Text
 */
export async function smartTranslate(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
  if (targetLang === sourceLang) return text;
  
  const hash = await createContentHash(text, targetLang);
  
  // 1. Check Supabase Cache (Aggressive caching)
  const cached = await getCachedTranslation(hash);
  if (cached) return cached;

  // 2. Try Primary Provider: LibreTranslate
  try {
    const res = await fetch(`${LT_URL}/translate`, {
      method: "POST",
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        api_key: LT_API_KEY
      }),
      headers: { "Content-Type": "application/json" },
      // 5-second timeout to quickly pivot to fallback if server is down
      signal: AbortSignal.timeout(5000) 
    });

    if (res.ok) {
      const data = await res.json();
      const translated = data.translatedText;
      await saveTranslationToCache(hash, text, translated, sourceLang, targetLang, 'libretranslate');
      return translated;
    }
  } catch (error) {
    console.error("[Translation] LibreTranslate Failed. Pivoting to DeepL.", error);
    // Continue to fallback
  }

  // 3. Fallback: DeepL Free API via native fetch (Edge Compatible)
  if (deeplAuthKey) {
    try {
      const deeplTarget = targetLang.toUpperCase() === 'EN' ? 'EN-US' : targetLang.toUpperCase();
      const body = new URLSearchParams({
        text,
        target_lang: deeplTarget,
        source_lang: sourceLang.toUpperCase()
      });

      const res = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${deeplAuthKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body,
        signal: AbortSignal.timeout(5000)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.translations && data.translations.length > 0) {
          const translated = data.translations[0].text;
          await saveTranslationToCache(hash, text, translated, sourceLang, targetLang, 'deepl');
          return translated;
        }
      }
    } catch (error) {
      console.error("[Translation] DeepL Fallback Failed.", error);
    }
  }

  // 3.5. Fallback: Google Gemini API (No-cost premium translation using server key)
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const prompt = `Translate the following text strictly from "${sourceLang}" into target language "${targetLang}". Return ONLY the direct translation, do not explain or add commentary.\n\nText: ${text}`;
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          }),
          signal: AbortSignal.timeout(6000) // 6s timeout
        }
      );

      if (response.ok) {
        const data = await response.json();
        const translated = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (translated && translated.trim().length > 0) {
          const cleanText = translated.trim();
          await saveTranslationToCache(hash, text, cleanText, sourceLang, targetLang, 'gemini');
          return cleanText;
        }
      }
    } catch (error) {
      console.error("[Translation] Gemini Fallback Failed.", error);
    }
  }

  // 4. Tertiary Fallback (Graceful Degradation)
  console.warn(`[Translation] All providers failed for text: "${text.substring(0, 20)}..."`);
  return text;
}
