import crypto from 'crypto';
import * as cheerio from 'cheerio';
import { Redis } from '@upstash/redis';
import { createServiceClient } from '@/lib/supabase/server';

const locale = "en";


// Constants
const CACHE_TTL_SECONDS = 2592000; // 30 days
const BATCH_SIZE = 15; // Max blocks to translate in a single LLM request
const CONCURRENCY_LIMIT = 2; // Strict concurrency control for external calls

// Initialize Redis safely
let redis: Redis | null = null;
try {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch (e) {
  console.warn("[AST Translation Engine] Failed to initialize Redis:", e);
}

// 1. Text Normalization
export function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

// 2. Deterministic Hash Generation
export function hashText(text: string): string {
  const normalized = normalizeText(text);
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

// 3. Translate a Batch of Blocks via Tier 1 (Groq API)
async function translateBatchGroq(
  blocks: string[],
  targetLang: string,
  sourceLang: string = 'en'
): Promise<string[] | null> {
  const groqApiKey = process.env.XAI_API_KEY; // Actually contains Groq Key starting with gsk_
  if (!groqApiKey || !groqApiKey.startsWith('gsk_')) {
    return null;
  }

  const prompt = `You are a professional HTML/text translator.
Translate the following array of HTML or text blocks from "${sourceLang}" to "${targetLang}".
IMPORTANT: Keep all HTML tags (like <strong>, <em>, <a>, etc.) exactly as they are in the original, only translate the text inside them.
Return your response ONLY as a JSON object with a "translations" key containing the translated string array.

Blocks: ${JSON.stringify(blocks)}`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a translation assistant that outputs clean JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 4000
      }),
      signal: AbortSignal.timeout(10000) // 10s timeout
    });

    if (!res.ok) {
      console.warn(`[Groq Translation] API responded with status ${res.status}`);
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.translations) && parsed.translations.length === blocks.length) {
        return parsed.translations.map((t: string) => t.trim());
      }
    }
    return null;
  } catch (error) {
    console.warn("[Groq Translation] Failed. Pivoting to next tier.", error);
    return null;
  }
}

// Translate a single block via Cloudflare Workers AI (M2M100 model)
async function translateBlockCloudflare(
  text: string,
  targetLang: string,
  sourceLang: string = 'en'
): Promise<string | null> {
  const workerUrl = process.env.CF_WORKER_URL;
  const workerSecret = process.env.CF_WORKER_SECRET;
  
  if (!workerUrl || !workerSecret) return null;

  try {
    const res = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': workerSecret
      },
      body: JSON.stringify({
        text,
        target_lang: targetLang.toLowerCase()
      }),
      signal: AbortSignal.timeout(6000) // 6s timeout
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.translated) {
        return data.translated.trim();
      }
    }
    return null;
  } catch (error) {
    console.warn("[Cloudflare AI Translation] Worker call failed:", error);
    return null;
  }
}

// 4. Translate a Batch of Blocks via Tier 2 (Gemini Flash API)
async function translateBatchGemini(
  blocks: string[],
  targetLang: string,
  sourceLang: string = 'en'
): Promise<string[] | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return null;

  const prompt = `Translate the following HTML or text blocks from "${sourceLang}" to "${targetLang}".
IMPORTANT: Keep all HTML tags (like <strong>, <em>, <a>, etc.) exactly as they are in the original, only translate the text inside them.
Return your response as a JSON object matching the requested schema.

Blocks to translate:
${JSON.stringify(blocks, null, 2)}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                translations: {
                  type: 'ARRAY',
                  items: { type: 'STRING' }
                }
              },
              required: ['translations']
            }
          }
        }),
        signal: AbortSignal.timeout(12000) // 12s timeout
      }
    );

    if (!res.ok) {
      console.warn(`[Gemini Translation] API responded with status ${res.status}`);
      return null;
    }

    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (content) {
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.translations) && parsed.translations.length === blocks.length) {
        return parsed.translations.map((t: string) => t.trim());
      }
    }
    return null;
  } catch (error) {
    console.warn("[Gemini Translation] Failed. Pivoting to next tier.", error);
    return null;
  }
}



// 5. Sequential Fallback for Individual Block via Tier 3 (Lingva Proxy Pool)
async function fallbackTranslateText(text: string, targetLang: string, sourceLang: string): Promise<string> {
  if (!text || !text.trim()) return text;
  try {
    const url = `https://lingva.ml/api/v1/${sourceLang}/${targetLang}/${encodeURIComponent(text)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return text;
    const data = await res.json();
    return data.translation || text;
  } catch (error) {
    return text;
  }
}


async function translateBlockLingva(
  block: string,
  targetLang: string,
  sourceLang: string = 'en'
): Promise<string> {
  try {
    // Falls back to Lingva Sequentially
    return await fallbackTranslateText(block, targetLang, sourceLang);
  } catch (error) {
    console.warn("[Lingva Translation] Individual block failed.", error);
    return block; // Circuit Breaker: Fail-Silent and return original block
  }
}

// 6. AST-Based HTML Translation Engine
export async function translateHtml(
  html: string,
  targetLang: string,
  sourceLang: string = 'en'
): Promise<string> {
  if (!html || !html.trim()) return "";
  if (targetLang.toLowerCase() === sourceLang.toLowerCase()) return html;

  const $ = cheerio.load(html, null, false);
  const elementsToTranslate: cheerio.Cheerio<any>[] = [];
  const rawTexts: string[] = [];
  const hashes: string[] = [];

  // Parse HTML into text container elements (leaves or nodes that are blocks and contain text)
  $('p, li, h1, h2, h3, h4, h5, h6, blockquote, figcaption').each((_, el) => {
    const $el = $(el);
    const textContent = $el.html() || $el.text();
    if (textContent && textContent.trim()) {
      elementsToTranslate.push($el);
      rawTexts.push(textContent.trim());
      hashes.push(hashText(textContent));
    }
  });

  if (rawTexts.length === 0) return html;

  // Initialize translation mappings
  const translationMemoryMap = new Map<string, string>(); // Hash -> Translated string
  const missedHashes: string[] = [];
  const missedTexts: string[] = [];
  const missedIndexes: number[] = [];

  // --- STEP A: HOT CACHE LOOKUP (Upstash Redis) ---
  if (redis) {
    try {
      const redisKeys = hashes.map(h => `tr:${targetLang.toLowerCase()}:${h}`);
      const cachedVals = await redis.mget<string[]>(...redisKeys);
      
      for (let i = 0; i < hashes.length; i++) {
        const cached = cachedVals[i];
        if (cached) {
          translationMemoryMap.set(hashes[i], cached);
        } else {
          missedHashes.push(hashes[i]);
          missedTexts.push(rawTexts[i]);
          missedIndexes.push(i);
        }
      }
    } catch (e) {
      console.warn("[AST Translation Engine] Redis read failed. Continuing to Cold Storage.", e);
      hashes.forEach((h, i) => {
        missedHashes.push(h);
        missedTexts.push(rawTexts[i]);
        missedIndexes.push(i);
      });
    }
  } else {
    hashes.forEach((h, i) => {
      missedHashes.push(h);
      missedTexts.push(rawTexts[i]);
      missedIndexes.push(i);
    });
  }

  // --- STEP B: COLD STORAGE LOOKUP (Supabase) ---
  if (missedHashes.length > 0) {
    try {
      const supabase = createServiceClient();
      const { data, error } = await (supabase as any)
        .from('translated_blocks')
        .select('text_hash, translated_text')
        .eq('locale', targetLang.toLowerCase())
        .in('text_hash', missedHashes);

      if (!error && data && data.length > 0) {
        const foundMap = new Map<string, string>(
          data.map((item: any) => [item.text_hash, item.translated_text])
        );
        
        // Remove found items from missed lists
        const stillMissedHashes: string[] = [];
        const stillMissedTexts: string[] = [];
        const stillMissedIndexes: number[] = [];

        for (let i = 0; i < missedHashes.length; i++) {
          const h = missedHashes[i];
          const foundTranslation = foundMap.get(h);
          
          if (foundTranslation) {
            translationMemoryMap.set(h, foundTranslation);
            
            // Backfill Redis Hot Cache
            if (redis) {
              redis.set(`tr:${targetLang.toLowerCase()}:${h}`, foundTranslation, { ex: CACHE_TTL_SECONDS }).catch(e => {
                console.warn("[AST Translation Engine] Failed backfilling Redis cache:", e);
              });
            }
          } else {
            stillMissedHashes.push(h);
            stillMissedTexts.push(missedTexts[i]);
            stillMissedIndexes.push(missedIndexes[i]);
          }
        }

        // Update working missed lists
        missedHashes.length = 0;
        missedTexts.length = 0;
        missedIndexes.length = 0;
        missedHashes.push(...stillMissedHashes);
        missedTexts.push(...stillMissedTexts);
        missedIndexes.push(...stillMissedIndexes);
      }
    } catch (e) {
      console.error("[AST Translation Engine] Supabase Cold Lookup Error:", e);
    }
  }

  // --- STEP C: MULTI-TIER BROKER FOR REMAINDER ---
  if (missedHashes.length > 0) {
    // Batch misses to optimize LLM concurrency
    const batches: { hashes: string[]; texts: string[] }[] = [];
    for (let i = 0; i < missedHashes.length; i += BATCH_SIZE) {
      batches.push({
        hashes: missedHashes.slice(i, i + BATCH_SIZE),
        texts: missedTexts.slice(i, i + BATCH_SIZE)
      });
    }

    const supabase = createServiceClient();

    // Process batches with strict concurrency control (concurrency limit)
    for (let b = 0; b < batches.length; b += CONCURRENCY_LIMIT) {
      const activeBatches = batches.slice(b, b + CONCURRENCY_LIMIT);
      
      const batchPromises = activeBatches.map(async (batch) => {
        let translations: string[] | null = null;
        let provider = 'groq';

        // Tier 1: Groq
        translations = await translateBatchGroq(batch.texts, targetLang, sourceLang);
        
        // Tier 2: Cloudflare Workers AI Fallback (M2M100)
        if (!translations && process.env.CF_WORKER_URL) {
          const cfTranslations: string[] = [];
          let allSuccess = true;
          for (const text of batch.texts) {
            const translated = await translateBlockCloudflare(text, targetLang, sourceLang);
            if (translated) {
              cfTranslations.push(translated);
            } else {
              allSuccess = false;
              break;
            }
          }
          if (allSuccess) {
            translations = cfTranslations;
            provider = 'cloudflare';
          }
        }

        // Tier 2.5: Gemini Fallback
        if (!translations) {
          translations = await translateBatchGemini(batch.texts, targetLang, sourceLang);
          provider = 'gemini';
        }

        // Tier 3 & Fallbacks: Process individual items sequentially
        if (!translations) {
          translations = [];
          for (const text of batch.texts) {
            const translated = await translateBlockLingva(text, targetLang, sourceLang);
            translations.push(translated);
          }
          provider = 'lingva';
        }

        // Write new translations to local Memory and databases
        const memoryInserts: { text_hash: string; original_text: string }[] = [];
        const blockInserts: { text_hash: string; locale: string; translated_text: string; provider_used: string }[] = [];

        for (let i = 0; i < batch.hashes.length; i++) {
          const h = batch.hashes[i];
          const original = batch.texts[i];
          const translated = translations[i] || original; // Fail-silent fallback

          translationMemoryMap.set(h, translated);

          // Prepare database writes
          memoryInserts.push({ text_hash: h, original_text: original });
          blockInserts.push({
            text_hash: h,
            locale: targetLang.toLowerCase(),
            translated_text: translated,
            provider_used: provider
          });

          // Write to Redis Hot Cache
          if (redis) {
            redis.set(`tr:${targetLang.toLowerCase()}:${h}`, translated, { ex: CACHE_TTL_SECONDS }).catch(e => {
              console.warn("[AST Translation Engine] Failed caching translated block:", e);
            });
          }
        }

        // Write to Supabase Cold Memory
        try {
          if (memoryInserts.length > 0) {
            await (supabase as any).from('translation_memory').upsert(memoryInserts, { onConflict: 'text_hash' });
            await (supabase as any).from('translated_blocks').upsert(blockInserts, { onConflict: 'text_hash,locale' });
          }
        } catch (dbErr) {
          console.error("[AST Translation Engine] Failed saving translations to database:", dbErr);
        }
      });

      // Await batch executions safely
      await Promise.allSettled(batchPromises);
    }
  }

  // --- STEP D: RECONSTRUCT ORIGINAL HTML ---
  for (let i = 0; i < elementsToTranslate.length; i++) {
    const $el = elementsToTranslate[i];
    const h = hashes[i];
    const translatedText = translationMemoryMap.get(h);
    if (translatedText) {
      $el.html(translatedText);
    }
  }

  return $.html();
}

/**
 * Orchestrates the full Article Translation Pipeline.
 * 1. Checks if a translation already exists in `translated_articles`.
 * 2. If missing, translates original title and AST HTML.
 * 3. Compiles and saves the translation into the database.
 */
export async function getOrCompileArticleTranslation(
  articleId: string,
  slug: string,
  titleEn: string,
  contentHtmlEn: string,
  locale: string,
  metadata?: any
): Promise<{ title: string; contentHtml: string }> {
  const targetLocale = locale.toLowerCase();
  if (targetLocale === 'en') {
    return { title: titleEn, contentHtml: contentHtmlEn };
  }

  const supabase = createServiceClient();

  // 1. Check if translated article exists in `translated_articles`
  try {
    const { data: existing, error: fetchErr } = await (supabase as any)
      .from('translated_articles')
      .select('title_translated, content_html_translated')
      .eq('article_id', articleId)
      .eq('locale', targetLocale)
      .maybeSingle();

    if (!fetchErr && existing) {
      return {
        title: existing.title_translated,
        contentHtml: existing.content_html_translated
      };
    }
  } catch (err) {
    console.error("[Article Ingest Engine] Failed looking up pre-rendered article:", err);
  }

  // 2. Translate Title
  let translatedTitle = titleEn;
  try {
    translatedTitle = await fallbackTranslateText(titleEn, targetLocale, 'en');
  } catch (titleErr) {
    console.warn(`[Article Ingest Engine] Failed translating title "${titleEn}":`, titleErr);
  }

  // 3. Translate HTML body using AST Engine
  let translatedContentHtml = contentHtmlEn;
  try {
    translatedContentHtml = await translateHtml(contentHtmlEn, targetLocale, 'en');
  } catch (bodyErr) {
    console.error(`[Article Ingest Engine] Failed parsing and translating AST body:`, bodyErr);
  }

  // 4. Persist compiled translation
  try {
    await (supabase as any).from('translated_articles').upsert({
      article_id: articleId,
      locale: targetLocale,
      title_translated: translatedTitle,
      content_html_translated: translatedContentHtml,
      compiled_at: new Date().toISOString()
    }, { onConflict: 'article_id,locale' });
  } catch (saveErr) {
    console.error("[Article Ingest Engine] Failed persisting compiled article:", saveErr);
  }

  return {
    title: translatedTitle,
    contentHtml: translatedContentHtml
  };
}
