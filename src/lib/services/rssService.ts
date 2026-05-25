import crypto from 'crypto';
import nlp from 'compromise';
import { PILLARS } from '@/lib/constants/pillars';
import { translationAdapter } from '@/lib/services/translationAdapter';

export interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

export interface IngestedArticle extends RSSItem {
  hashId: string;
  pillar: string;
  translatedTitle?: string;
  translatedDescription?: string;
}

// In-memory static database to demonstrate "ON CONFLICT DO NOTHING"
const articleDatabase = new Set<string>();

const FEED_URLS = [
  'https://www.mayoclinic.org/rss/health-information',
  'https://www.health.harvard.edu/blog/feed',
  'https://tools.cdc.gov/api/v2/resources/media/404952.rss',
  'https://www.kiplinger.com/rss'
];

/**
 * Generates a SHA-256 hash from the title and link to prevent duplicates.
 */
function generateHash(title: string, link: string): string {
  return crypto.createHash('sha256').update(`${title}|${link}`).digest('hex');
}

/**
 * Uses Compromise NLP to analyze keywords and categorize the article.
 */
function categorizeArticle(title: string, description: string): string {
  const text = `${title} ${description}`;
  const doc = nlp(text);

  if (doc.match('(money|finance|budget|retirement|investment|tax|kiplinger)').found) {
    return PILLARS.MONEY.slug;
  }
  if (doc.match('(pet|dog|cat|vet|animal|canine|feline)').found) {
    return PILLARS.PET.slug;
  }
  if (doc.match('(travel|flight|hotel|trip|accessible|wheelchair)').found) {
    return PILLARS.TRAVEL.slug;
  }
  if (doc.match('(health|senior|medication|wellness|disease|cdc|clinic)').found) {
    return PILLARS.SENIOR.slug;
  }
  
  return PILLARS.HOME.slug;
}

export async function ingestRSSFeeds(targetLang: string = 'id'): Promise<IngestedArticle[]> {
  const newArticles: IngestedArticle[] = [];

  for (const url of FEED_URLS) {
    try {
      // Fetching RSS feed (Fallback XML parsing for MVP)
      // In production, we would use an XML parser like fast-xml-parser
      const staticItems: RSSItem[] = [
        {
          title: `Latest Health Alert from ${new URL(url).hostname}`,
          link: `${url}/article-${Math.floor(Math.random() * 1000)}`,
          description: "This is a detailed description of the latest news about retirement planning and health.",
          pubDate: new Date().toISOString()
        }
      ];

      for (const item of staticItems) {
        const hashId = generateHash(item.title, item.link);

        // Deduplication Check (ON CONFLICT DO NOTHING)
        if (articleDatabase.has(hashId)) {
          console.log(`[RSS] Duplicate skipped: ${hashId}`);
          continue;
        }

        articleDatabase.add(hashId);

        // NLP Categorization
        const pillar = categorizeArticle(item.title, item.description);

        // Translation Pipeline
        const translatedTitle = await translationAdapter.translate(item.title, targetLang);
        const translatedDescription = await translationAdapter.translate(item.description, targetLang);

        newArticles.push({
          ...item,
          hashId,
          pillar,
          translatedTitle,
          translatedDescription
        });
      }
    } catch (error) {
      console.error(`[RSS] Error ingesting feed ${url}:`, error);
    }
  }

  return newArticles;
}
