// src/lib/utils/translator.ts
// [DEPRECATED] All translation functions are now unified under astTranslationEngine.ts.
// Please import { translateHtml } or { getOrCompileArticleTranslation } from '@/lib/services/astTranslationEngine'.

export async function smartTranslate(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
  console.warn('[Translator Deprecated] smartTranslate is deprecated. Routing to astTranslationEngine.');
  const { translateHtml } = await import('@/lib/services/astTranslationEngine');
  return translateHtml(text, targetLang, sourceLang);
}
