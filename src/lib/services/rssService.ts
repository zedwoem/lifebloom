import crypto from 'crypto';
import { PILLARS } from '@/lib/constants/pillars';
import { translationAdapter } from '@/lib/services/translationAdapter';
import nlp from 'compromise';
import { createServiceClient } from '@/lib/supabase/server';
import Parser from 'rss-parser';

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
const parser = new Parser();

export const CONTENT_ENGINE_SOURCES: Record<string, { rss: string[]; youtubeChannels?: string[] }> = {
  "home-living": {
    rss: [
      "https://www.familyhandyman.com/feed/",
      "https://feeds.feedburner.com/younghouselove"
    ]
  },
  "money-future": {
    rss: [
      "https://moneyguy.com/feed/"
    ],
    youtubeChannels: [
      "UC9vUu4vlIlMC0dHQCTvQPbg",
      "UCZ2s1q_6S2fUPn0E2p-B7fQ"
    ]
  },
  "pet-family": {
    rss: [
      "https://www.avma.org/news/rss-feeds",
      "https://barkandwhiskers.com/rss"
    ]
  },
  "senior": {
    rss: [
      "https://medlineplus.gov/rss.html"
    ]
  },
  "travel": {
    rss: [
      "https://www.disabled-world.com/info/newsfeeds.php"
    ]
  }
};

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

function slugify(title: string, hashId: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${base}-${hashId.slice(0, 8)}`;
}

export async function ingestRSSFeeds(targetLang: string = 'en'): Promise<IngestedArticle[]> {
  const supabase = createServiceClient();
  const newArticles: IngestedArticle[] = [];
  const bulkUpsertData: any[] = [];
  const tempArticlesMap = new Map<string, IngestedArticle>();

  // Fetch feeds for all pillars sequentially to manage API rates and handles errors gracefully
  for (const [pillarSlug, config] of Object.entries(CONTENT_ENGINE_SOURCES)) {
    for (const feedUrl of config.rss) {
      try {
        console.log(`[RSS Ingest] Fetching RSS feed: ${feedUrl} for pillar: ${pillarSlug}`);
        const feed = await parser.parseURL(feedUrl);
        const items = feed.items || [];

        for (const item of items.slice(0, 5)) { // Process top 5 entries to prevent timeouts
          if (!item.title || !item.link) continue;

          try {
            const hashId = generateHash(item.title, item.link);
            const rawSnippet = item.contentSnippet || item.summary || item.content || '';
            const cleanDesc = cleanContent(rawSnippet);
            const cleanBody = cleanContent(item.content || rawSnippet);

            const slug = slugify(item.title, hashId);
            const contentHtml = `<p>${cleanBody.replace(/\n\n/g, '</p><p>')}</p>`;

            // Write to canonical_articles
            const { data: canonicalData, error: canonicalError } = await supabase
              .from('canonical_articles')
              .upsert({
                source_hash: hashId,
                slug,
                title: item.title,
                content_html: contentHtml,
                source_url: item.link,
                pillar: pillarSlug,
                image_url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
                published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
              }, { onConflict: 'source_hash' })
              .select('id')
              .single();

            if (canonicalError) {
              console.error(`[RSS Ingest] Canonical Insertion Error for "${item.title}":`, canonicalError.message);
            }

            // Note: Translations are now completely decoupled from this cron ingestion path to prevent timeouts.
            // Decoupled async translations will run via database triggers / lazy rendering or background queue.

            let translatedTitle = item.title;
            let translatedDescription = cleanDesc;

            if (targetLang !== 'en') {
              try {
                translatedTitle = await translationAdapter.translate(item.title, targetLang);
                translatedDescription = await translationAdapter.translate(cleanDesc, targetLang);
              } catch (transErr: any) {
                console.warn(`[RSS Ingest] Failed to translate item "${item.title}" for legacy flow:`, transErr.message);
              }
            }

            bulkUpsertData.push({
              pillar: pillarSlug,
              source_type: 'rss',
              source_name: feed.title || "News Feed",
              original_url: item.link,
              title_en: item.title,
              title_id: targetLang === 'id' ? translatedTitle : null,
              title_es: targetLang === 'es' ? translatedTitle : null,
              summary_en: cleanDesc,
              summary_id: targetLang === 'id' ? translatedDescription : null,
              summary_es: targetLang === 'es' ? translatedDescription : null,
              image_url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
              content_hash: hashId,
              published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
              metadata: { content: cleanBody }
            });

            tempArticlesMap.set(hashId, {
              title: item.title,
              link: item.link,
              description: cleanDesc,
              content: cleanBody,
              imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
              pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
              source: feed.title || "News Feed",
              hashId,
              pillar: pillarSlug,
              translatedTitle,
              translatedDescription
            });
          } catch (itemErr: any) {
            console.error(`[RSS Ingest] Error processing feed item "${item.title}":`, itemErr.message);
          }
        }
      } catch (error: any) {
        console.warn(`[RSS Ingest] Direct RSS parsing failed for ${feedUrl}. Attempting GNews fallback...`, error.message);

        // GNews Fallback logic if direct RSS parsing fails
        if (GNEWS_API_KEY) {
          try {
            const queryMap: Record<string, string> = {
              "home-living": "home renovations OR smart home aging",
              "money-future": "retirement planning OR personal finance",
              "pet-family": "dog health OR senior cats care",
              "senior": "medicare wellness OR healthy aging",
              "travel": "accessible travel OR senior tours"
            };

            const query = queryMap[pillarSlug] || "senior wellness";
            const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=3&apikey=${GNEWS_API_KEY}`;
            const response = await fetch(url);

            if (response.ok) {
              const data = await response.json();
              const articles = data.articles || [];

              for (const item of articles) {
                try {
                  const hashId = generateHash(item.title, item.url);
                  const cleanDesc = cleanContent(item.description);
                  const cleanBody = cleanContent(item.content || item.description);
                  const slug = slugify(item.title, hashId);
                  const contentHtml = `<p>${cleanBody.replace(/\n\n/g, '</p><p>')}</p>`;

                  const { error: canonicalError } = await supabase
                    .from('canonical_articles')
                    .upsert({
                      source_hash: hashId,
                      slug,
                      title: item.title,
                      content_html: contentHtml,
                      source_url: item.url,
                      pillar: pillarSlug,
                      image_url: item.image || "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
                      published_at: item.publishedAt ? new Date(item.publishedAt).toISOString() : new Date().toISOString()
                    }, { onConflict: 'source_hash' });

                  if (!canonicalError) {
                    tempArticlesMap.set(hashId, {
                      title: item.title,
                      link: item.url,
                      description: cleanDesc,
                      content: cleanBody,
                      imageUrl: item.image || "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
                      pubDate: item.publishedAt || new Date().toISOString(),
                      source: item.source?.name || "News Feed",
                      hashId,
                      pillar: pillarSlug
                    });
                  }
                } catch (gnewsItemErr: any) {
                  console.error(`[RSS Ingest GNews Fallback] Item failed:`, gnewsItemErr.message);
                }
              }
            }
          } catch (gnewsErr: any) {
            console.error(`[RSS Ingest Fallback Engine] GNews fetch failed:`, gnewsErr.message);
          }
        }
      }
    }
  }

  // Perform bulk upsert for the legacy aggregated_content table
  if (bulkUpsertData.length > 0) {
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
