import crypto from 'crypto';
import { PILLARS } from '@/lib/constants/pillars';
import { translationAdapter } from '@/lib/services/translationAdapter';
import nlp from 'compromise';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface RSSItem {
  title: string;
  link: string;
  description: string;
  content: string;
  imageUrl: string;
  pubDate: string;
  source: string;
}

export interface IngestedArticle extends RSSItem {
  hashId: string;
  pillar: string;
  translatedTitle?: string;
  translatedDescription?: string;
}

const GNEWS_API_KEY = process.env.GNEWS_API_KEY || "fb981b557612c4b76c126c9ed4e40ea5";

const PILLAR_QUERIES = [
  { pillar: PILLARS.MONEY.slug, query: "retirement OR pension OR personal finance" },
  { pillar: PILLARS.PET.slug, query: "pets OR dog care OR cat health" },
  { pillar: PILLARS.TRAVEL.slug, query: "\"accessible travel\" OR \"wheelchair travel\" OR senior travel" },
  { pillar: PILLARS.SENIOR.slug, query: "\"senior wellness\" OR aging health OR medicare" },
  { pillar: PILLARS.HOME.slug, query: "\"smart home\" OR home accessibility renovation" }
];

function generateHash(title: string, link: string): string {
  const normalizedStr = `${title.toLowerCase()}|${link.trim().toLowerCase()}`;
  return crypto.createHash('sha256').update(normalizedStr).digest('hex');
}

function cleanContent(rawText: string): string {
  if (!rawText) return '';
  // Strip raw HTML tags first
  const noHtml = rawText.replace(/<[^>]*>?/gm, '');
  // NLP normalization
  const doc = nlp(noHtml);
  doc.normalize({
    whitespace: true,
    punctuation: true,
    case: false,
    unicode: true,
  });
  return doc.text();
}

export async function ingestRSSFeeds(targetLang: string = 'en'): Promise<IngestedArticle[]> {
  const newArticles: IngestedArticle[] = [];

  for (const { pillar, query } of PILLAR_QUERIES) {
    try {
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=5&apikey=${GNEWS_API_KEY}`;
      const response = await fetch(url, { next: { revalidate: 3600 } });
      
      if (!response.ok) {
        console.error(`[GNews] Failed to fetch for ${pillar}: ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      const articles = data.articles || [];

      for (const item of articles) {
        const hashId = generateHash(item.title, item.url);

        const cleanDesc = cleanContent(item.description);
        const cleanBody = cleanContent(item.content || item.description);

        let translatedTitle = item.title;
        let translatedDescription = cleanDesc;

        if (targetLang !== 'en') {
          translatedTitle = await translationAdapter.translate(item.title, targetLang);
          translatedDescription = await translationAdapter.translate(cleanDesc, targetLang);
        }

        // Supabase Persistent Deduplication
        // ON CONFLICT (content_hash) DO NOTHING
        const { data: insertedData, error } = await supabase
          .from('aggregated_content')
          .upsert(
            {
              pillar: pillar,
              source_type: 'rss',
              source_name: item.source?.name || "News Feed",
              original_url: item.url,
              title_en: item.title,
              title_id: targetLang === 'id' ? translatedTitle : null,
              title_es: targetLang === 'es' ? translatedTitle : null,
              title_fr: targetLang === 'fr' ? translatedTitle : null,
              title_de: targetLang === 'de' ? translatedTitle : null,
              summary_en: cleanDesc,
              summary_id: targetLang === 'id' ? translatedDescription : null,
              summary_es: targetLang === 'es' ? translatedDescription : null,
              summary_fr: targetLang === 'fr' ? translatedDescription : null,
              summary_de: targetLang === 'de' ? translatedDescription : null,
              image_url: item.image || "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
              content_hash: hashId,
              published_at: item.publishedAt,
              metadata: { content: cleanBody }
            },
            { onConflict: 'content_hash', ignoreDuplicates: true }
          )
          .select();

        if (error) {
          console.error(`[RSS Ingest] Supabase Upsert Error for ${hashId}:`, error.message);
          continue;
        }

        // If data was returned, it means it was inserted (not ignored)
        if (insertedData && insertedData.length > 0) {
          newArticles.push({
            title: item.title,
            link: item.url,
            description: cleanDesc,
            content: cleanBody,
            imageUrl: item.image || "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
            pubDate: item.publishedAt,
            source: item.source?.name || "News Feed",
            hashId,
            pillar,
            translatedTitle,
            translatedDescription
          });
        }
      }
    } catch (error) {
      console.error(`[GNews] Error ingesting feed for ${pillar}:`, error);
    }
  }

  return newArticles;
}
