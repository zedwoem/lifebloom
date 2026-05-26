import crypto from 'crypto';
import { Redis } from '@upstash/redis';

// Define cache expiration (30 days)
const CACHE_TTL_SECONDS = 2592000;
const TIMEOUT_MS = 5000;

// Initialize Redis from environment variables safely
let redis: Redis | null = null;
try {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch (e) {
  console.warn("[Translation Cache] Failed to initialize Upstash Redis:", e);
}

/**
 * Generate a deterministic SHA-256 hash of the translation request.
 */
function getCacheKey(source: string, target: string, text: string): string {
  const normalized = `${source.toLowerCase()}_${target.toLowerCase()}_${text.trim()}`;
  const hash = crypto.createHash('sha256').update(normalized).digest('hex');
  return `translation:${hash}`;
}

/**
 * Helper to split text into chunks under 1000 characters along sentence or paragraph boundaries.
 */
function chunkText(text: string, maxLength: number = 1000): string[] {
  if (text.length <= maxLength) return [text];

  const chunks: string[] = [];
  let currentChunk = "";

  // Split by paragraph or sentence boundaries
  const segments = text.split(/([\n.!?]+)/);

  for (const segment of segments) {
    if ((currentChunk + segment).length > maxLength) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = segment;
    } else {
      currentChunk += segment;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Perform fetch with a strict timeout limit.
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Strict global sequential queue to protect public proxy IP reputation
let requestQueue: Promise<any> = Promise.resolve();

async function enqueueTranslation<T>(fn: () => Promise<T>): Promise<T> {
  const currentQueue = requestQueue;
  let resolveNext: () => void = () => {};
  
  // Set up the next link in the queue
  requestQueue = new Promise<void>((resolve) => {
    resolveNext = resolve;
  });

  try {
    await currentQueue;
  } catch {
    // Ignore failures in previous requests to avoid blocking the queue
  }

  // Artificial delay (500ms) to fly under the rate-limit radar
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const result = await fn();
    return result;
  } finally {
    resolveNext();
  }
}

/**
 * Translates a single chunk of text using the Lingva Translate API (Google Translate Proxy)
 */
async function translateChunk(text: string, source: string, target: string): Promise<string> {
  const encodedText = encodeURIComponent(text);
  const url = `https://lingva.ml/api/v1/${source}/${target}/${encodedText}`;

  const response = await fetchWithTimeout(url, { method: 'GET' }, TIMEOUT_MS);
  if (!response.ok) {
    throw new Error(`Lingva API responded with status ${response.status}`);
  }

  const data = await response.json();
  if (!data || typeof data.translation !== 'string') {
    throw new Error("Invalid response structure from Lingva API");
  }

  return data.translation;
}

/**
 * High-performance, SRE-hardened, zero-cost text translation.
 * Uses Upstash Redis for LRU caching and Lingva as the translation provider.
 */
export async function translateText(
  text: string,
  targetLang: string,
  sourceLang: string = 'en'
): Promise<string> {
  if (!text || !text.trim()) return "";

  const trimmedText = text.trim();
  const source = sourceLang.toLowerCase();
  const target = targetLang.toLowerCase();

  // If languages match, return text directly
  if (source === target) return trimmedText;

  // 1. Attempt Cache Lookup
  const cacheKey = getCacheKey(source, target, trimmedText);
  if (redis) {
    try {
      const cached = await redis.get<string>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (e) {
      console.warn("[Translation Cache] Cache read error:", e);
    }
  }

  // 2. Chunk text if it exceeds 1000 characters
  const chunks = chunkText(trimmedText, 1000);
  const translatedChunks: string[] = [];

  // 3. Process chunks sequentially via global queue to prevent IP rate limits
  try {
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const translated = await enqueueTranslation(() => translateChunk(chunk, source, target));
      translatedChunks.push(translated);
    }

    const fullTranslation = translatedChunks.join(" ");

    // 4. Cache the successful result with 30-day TTL
    if (redis) {
      try {
        await redis.set(cacheKey, fullTranslation, { ex: CACHE_TTL_SECONDS });
      } catch (e) {
        console.warn("[Translation Cache] Cache write error:", e);
      }
    }

    return fullTranslation;
  } catch (error: any) {
    // SRE Circuit Breaker: Fail silently, log warning, and return original text
    console.warn(`[Translation Adapter] Circuit Breaker active. Translation failed for payload (${text.slice(0, 50)}...):`, error.message);
    return trimmedText;
  }
}

// Keep the previous object shape for drop-in compatibility with rssService.ts
export const translationAdapter = {
  translate: async (text: string, targetLang: string): Promise<string> => {
    return translateText(text, targetLang, 'en');
  }
};

export interface TranslationProvider {
  translate: (text: string, targetLang: string) => Promise<string>;
}

