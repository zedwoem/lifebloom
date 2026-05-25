import crypto from 'crypto';
import { PILLARS } from '@/lib/constants/pillars';
import { translationAdapter } from '@/lib/services/translationAdapter';

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

// In-memory static database to demonstrate "ON CONFLICT DO NOTHING"
const articleDatabase = new Set<string>();

const GNEWS_API_KEY = process.env.GNEWS_API_KEY || "fb981b557612c4b76c126c9ed4e40ea5";

const PILLAR_QUERIES = [
  { pillar: PILLARS.MONEY.slug, query: "retirement OR pension OR personal finance" },
  { pillar: PILLARS.PET.slug, query: "pets OR dog care OR cat health" },
  { pillar: PILLARS.TRAVEL.slug, query: "\"accessible travel\" OR \"wheelchair travel\" OR senior travel" },
  { pillar: PILLARS.SENIOR.slug, query: "\"senior wellness\" OR aging health OR medicare" },
  { pillar: PILLARS.HOME.slug, query: "\"smart home\" OR home accessibility renovation" }
];

function generateHash(title: string, link: string): string {
  return crypto.createHash('sha256').update(`${title}|${link}`).digest('hex');
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

        // Deduplication Check (ON CONFLICT DO NOTHING)
        if (articleDatabase.has(hashId)) {
          continue;
        }

        articleDatabase.add(hashId);

        // We skip translation API calls here if targetLang is 'en' to save resources,
        // but for 'id', we would call the translation adapter.
        let translatedTitle = item.title;
        let translatedDescription = item.description;

        if (targetLang !== 'en') {
          translatedTitle = await translationAdapter.translate(item.title, targetLang);
          translatedDescription = await translationAdapter.translate(item.description, targetLang);
        }

        newArticles.push({
          title: item.title,
          link: item.url,
          description: item.description,
          content: item.content || item.description,
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
  }

  return newArticles;
}
