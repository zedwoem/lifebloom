export interface TranslationProvider {
  translateText(text: string, targetLang: string): Promise<string>;
}

export class DeepLProvider implements TranslationProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.DEEPL_API_KEY || '';
  }

  async translateText(text: string, targetLang: string): Promise<string> {
    if (!this.apiKey) {
      console.warn("DEEPL_API_KEY not found. Using offline fallback.");
      return `[Fallback Translated to ${targetLang}]: ${text}`;
    }

    try {
      const response = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: [text],
          target_lang: targetLang.toUpperCase()
        })
      });

      if (!response.ok) throw new Error("DeepL API Error");
      const data = await response.json();
      return data.translations[0].text;
    } catch (e) {
      console.error(e);
      return text;
    }
  }
}

export class LibreTranslateProvider implements TranslationProvider {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com/translate';
  }

  async translateText(text: string, targetLang: string): Promise<string> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: targetLang,
          format: 'text'
        })
      });

      if (!response.ok) throw new Error("LibreTranslate API Error");
      const data = await response.json();
      return data.translatedText;
    } catch (e) {
      console.error(e);
      return text;
    }
  }
}

export class TranslationService {
  private provider: TranslationProvider;

  constructor(strategy: 'deepl' | 'libretranslate' = 'deepl') {
    if (strategy === 'libretranslate' && process.env.LIBRETRANSLATE_URL) {
      this.provider = new LibreTranslateProvider();
    } else {
      this.provider = new DeepLProvider();
    }
  }

  async translate(text: string, targetLang: string): Promise<string> {
    return this.provider.translateText(text, targetLang);
  }
}

export const translationAdapter = new TranslationService();
