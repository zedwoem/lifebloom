import crypto from 'crypto';
import { PILLARS } from '@/lib/constants/pillars';
import { translationAdapter } from '@/lib/services/translationAdapter';
import nlp from 'compromise';
import { createServiceClient } from '@/lib/supabase/server';

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

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

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
  const noHtml = rawText.replace(/<[^>]*>?/gm, '');
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
  if (!GNEWS_API_KEY) {
    console.warn("[GNews Ingest] GNEWS_API_KEY is not defined. Skipping feed ingestion.");
    return [];
  }

  const supabase = createServiceClient();
  const newArticles: IngestedArticle[] = [];
  const bulkUpsertData: any[] = [];
  const tempArticlesMap = new Map<string, IngestedArticle>();

  // Parallel fetch over all pillars
  const fetchPromises = PILLAR_QUERIES.map(async ({ pillar, query }) => {
    try {
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=5&apikey=${GNEWS_API_KEY}`;
      const response = await fetch(url, { next: { revalidate: 3600 } });
      
      if (!response.ok) {
        console.error(`[GNews] Failed to fetch for ${pillar}: ${response.statusText}`);
        return;
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

        bulkUpsertData.push({
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
        });

        tempArticlesMap.set(hashId, {
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
    } catch (error) {
      console.error(`[GNews] Error ingesting feed for ${pillar}:`, error);
    }
  });

  await Promise.all(fetchPromises);

  if (bulkUpsertData.length > 0) {
    // Perform bulk upsert in a single database operation
    const { data: insertedData, error } = await supabase.from('aggregated_content')
      .upsert(bulkUpsertData, { onConflict: 'content_hash', ignoreDuplicates: true })
      .select('content_hash');

    if (error) {
      console.error(`[RSS Ingest] Supabase Bulk Upsert Error:`, error.message);
    } else if (insertedData) {
      for (const row of insertedData) {
        const article = tempArticlesMap.get(row.content_hash || '');
        if (article) {
          newArticles.push(article);
        }
      }
    }
  }

  return newArticles;
}
