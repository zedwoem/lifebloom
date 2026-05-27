import crypto from 'crypto';
import { PILLARS } from '@/lib/constants/pillars';
import nlp from 'compromise';
import { createServiceClient } from '@/lib/supabase/server';
import Parser from 'rss-parser';
import { AutopostService, IngestedItem } from '@/lib/services/autopostService';
import { getOrCompileArticleTranslation } from '@/lib/services/astTranslationEngine';

// ============================================================
// CONTENT ENGINE SOURCES — Single source of truth
// Memetakan pilar ke sumber RSS dan YouTube Channel ID-nya
// ============================================================
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
}

export interface IngestResult {
  processed: number;
  skipped: number;
  duplicates_blocked: number;
  errors: string[];
  youtube_videos_added: number;
  newItems: IngestedItem[];
}

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const parser = new Parser({
  customFields: {
    item: [
      ['media:thumbnail', 'mediaThumbnail'],
      ['media:content', 'mediaContent'],
      ['enclosure', 'enclosure'],
    ]
  }
});

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
      "UC9vUu4vlIlMC0dHQCTvQPbg", // The Money Guy Show
      "UCVBkyXzDW4mixAFs2iWswXg"  // James Shack
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

// ============================================================
// HELPERS
// ============================================================

function generateHash(title: string, link: string): string {
  const normalizedStr = `${title.toLowerCase()}|${link.trim().toLowerCase()}`;
  return crypto.createHash('sha256').update(normalizedStr).digest('hex');
}

function cleanContent(rawText: string): string {
  if (!rawText) return '';
  const noHtml = rawText.replace(/<[^>]*>?/gm, '');
  const doc = nlp(noHtml);
  doc.normalize({ whitespace: true, punctuation: true, case: false, unicode: true });
  return doc.text();
}

function slugify(title: string, hashId: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${base}-${hashId.slice(0, 8)}`;
}

/**
 * Ekstrak URL gambar dari RSS item — prioritas: enclosure, media:thumbnail, media:content
 * Fallback ke placeholder netral yang tidak bias ke satu topik
 */
function extractImageUrl(item: any): string {
  const enclosureUrl = item.enclosure?.url;
  if (enclosureUrl && /\.(jpg|jpeg|png|webp)/i.test(enclosureUrl)) {
    return enclosureUrl;
  }
  const mediaThumbnail = item.mediaThumbnail?.['$']?.url || item.mediaThumbnail?.url;
  if (mediaThumbnail) return mediaThumbnail;

  const mediaContent = item.mediaContent?.['$']?.url;
  if (mediaContent && /\.(jpg|jpeg|png|webp)/i.test(mediaContent)) {
    return mediaContent;
  }
  return ''; // Kosong = frontend akan gunakan fallback gambar per-pilar
}

// ============================================================
// RSS INGESTION
// ============================================================

export async function ingestRSSFeeds(): Promise<IngestResult> {
  const supabase = createServiceClient();
  const result: IngestResult = {
    processed: 0,
    skipped: 0,
    duplicates_blocked: 0,
    errors: [],
    youtube_videos_added: 0,
    newItems: []
  };

  for (const [pillarSlug, config] of Object.entries(CONTENT_ENGINE_SOURCES)) {
    for (const feedUrl of config.rss) {
      try {
        console.log(`[RSS Ingest] Fetching: ${feedUrl} [${pillarSlug}]`);
        const feed = await parser.parseURL(feedUrl);
        const items = feed.items || [];

        // Proses max 15 item per feed (cukup untuk daily cron, aman dari timeout Vercel 10s)
        for (const item of items.slice(0, 15)) {
          if (!item.title || !item.link) continue;

          try {
            const hashId = generateHash(item.title, item.link);
            const rawSnippet = item.contentSnippet || item.summary || item.content || '';
            const cleanDesc = cleanContent(rawSnippet);
            const cleanBody = cleanContent(item.content || rawSnippet);
            const slug = slugify(item.title, hashId);
            const contentHtml = `<p>${cleanBody.replace(/\n\n/g, '</p><p>')}</p>`;
            const imageUrl = extractImageUrl(item);

            const { data: insertedData, error: canonicalError } = await supabase
              .from('canonical_articles')
              .upsert({
                source_hash: hashId,
                slug,
                title: item.title,
                content_html: contentHtml,
                source_url: item.link,
                pillar: pillarSlug,
                image_url: imageUrl || null,
                published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
              }, { onConflict: 'source_hash', ignoreDuplicates: true })
              .select('id, title, slug, pillar, image_url')
              .maybeSingle();

            if (canonicalError) {
              // Kode 23505 = unique constraint violation = artikel sudah ada (deduplication normal)
              if (canonicalError.code === '23505') {
                result.duplicates_blocked++;
              } else {
                console.error(`[RSS Ingest] DB Error for "${item.title}":`, canonicalError.message);
                result.errors.push(canonicalError.message);
              }
            } else {
              result.processed++;
              if (insertedData) {
                result.newItems.push({
                  id: insertedData.id,
                  title: insertedData.title,
                  slug: insertedData.slug,
                  description: cleanDesc.slice(0, 200),
                  imageUrl: insertedData.image_url || undefined,
                  pillar: insertedData.pillar || pillarSlug,
                  type: 'article'
                });
              }
            }
          } catch (itemErr: any) {
            console.error(`[RSS Ingest] Item error:`, itemErr.message);
            result.errors.push(itemErr.message);
          }
        }
      } catch (feedErr: any) {
        console.warn(`[RSS Ingest] Feed failed: ${feedUrl}. Trying GNews fallback...`, feedErr.message);

        // GNews Fallback jika RSS langsung gagal (misal feed down / CORS di edge)
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
            const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=5&apikey=${GNEWS_API_KEY}`;
            const response = await fetch(url, { signal: AbortSignal.timeout(8000) });

            if (response.ok) {
              const data = await response.json();
              for (const gnewsItem of (data.articles || [])) {
                try {
                  const hashId = generateHash(gnewsItem.title, gnewsItem.url);
                  const cleanDesc = cleanContent(gnewsItem.description);
                  const cleanBody = cleanContent(gnewsItem.content || gnewsItem.description);
                  const slug = slugify(gnewsItem.title, hashId);
                  const contentHtml = `<p>${cleanBody.replace(/\n\n/g, '</p><p>')}</p>`;

                  const { data: insertedData, error } = await supabase
                    .from('canonical_articles')
                    .upsert({
                      source_hash: hashId,
                      slug,
                      title: gnewsItem.title,
                      content_html: contentHtml,
                      source_url: gnewsItem.url,
                      pillar: pillarSlug,
                      image_url: gnewsItem.image || null,
                      published_at: gnewsItem.publishedAt ? new Date(gnewsItem.publishedAt).toISOString() : new Date().toISOString()
                    }, { onConflict: 'source_hash', ignoreDuplicates: true })
                    .select('id, title, slug, pillar, image_url')
                    .maybeSingle();

                  if (!error) {
                    result.processed++;
                    if (insertedData) {
                      result.newItems.push({
                        id: insertedData.id,
                        title: insertedData.title,
                        slug: insertedData.slug,
                        description: cleanDesc.slice(0, 200),
                        imageUrl: insertedData.image_url || undefined,
                        pillar: insertedData.pillar || pillarSlug,
                        type: 'article'
                      });
                    }
                  }
                  else if (error.code === '23505') result.duplicates_blocked++;
                } catch (gnewsItemErr: any) {
                  result.errors.push(gnewsItemErr.message);
                }
              }
            }
          } catch (gnewsErr: any) {
            console.error(`[RSS Ingest GNews Fallback] Failed:`, gnewsErr.message);
            result.errors.push(`GNews fallback: ${gnewsErr.message}`);
          }
        }
      }
    }

    // ============================================================
    // YOUTUBE CHANNEL INGESTION — per pilar
    // Menggunakan YouTube Data API v3 untuk fetch video terbaru dari setiap channel
    // ============================================================
    if (config.youtubeChannels && config.youtubeChannels.length > 0 && YOUTUBE_API_KEY) {
      for (const channelId of config.youtubeChannels) {
        try {
          console.log(`[YouTube Ingest] Fetching channel: ${channelId} [${pillarSlug}]`);
          const ytUrl = `https://www.googleapis.com/youtube/v3/search?channelId=${channelId}&order=date&type=video&part=snippet&maxResults=5&key=${YOUTUBE_API_KEY}`;
          const ytRes = await fetch(ytUrl, { signal: AbortSignal.timeout(8000) });

          if (!ytRes.ok) {
            console.error(`[YouTube Ingest] API error for channel ${channelId}: HTTP ${ytRes.status}`);
            result.errors.push(`YouTube channel ${channelId}: HTTP ${ytRes.status}`);
            continue;
          }

          const ytData = await ytRes.json();
          const ytItems = ytData.items || [];

          for (const ytItem of ytItems) {
            const videoId = ytItem.id?.videoId;
            const snippet = ytItem.snippet;
            if (!videoId || !snippet?.title) continue;

            try {
              const titleSlug = snippet.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '')
                .slice(0, 80);

              const { data: insertedVideo, error: videoError } = await supabase
                .from('videos')
                .upsert({
                  embed_id: videoId,
                  video_id: videoId,
                  title: snippet.title,
                  description: snippet.description?.slice(0, 500) || '',
                  provider: 'youtube',
                  pillar: pillarSlug,
                  locale: 'en',
                  slug: `${titleSlug}-${videoId}`,
                }, { onConflict: 'embed_id', ignoreDuplicates: true })
                .select('id, title, slug, description, pillar')
                .maybeSingle();

              if (!videoError) {
                result.youtube_videos_added++;
                if (insertedVideo) {
                  result.newItems.push({
                    id: insertedVideo.id,
                    title: insertedVideo.title,
                    slug: insertedVideo.slug,
                    description: insertedVideo.description || '',
                    pillar: insertedVideo.pillar || pillarSlug,
                    type: 'video'
                  });
                }
              } else if (videoError.code !== '23505') {
                console.error(`[YouTube Ingest] DB Error for video ${videoId}:`, videoError.message);
                result.errors.push(videoError.message);
              }
            } catch (videoItemErr: any) {
              result.errors.push(`YouTube video ${videoId}: ${videoItemErr.message}`);
            }
          }
        } catch (channelErr: any) {
          console.error(`[YouTube Ingest] Channel ${channelId} failed:`, channelErr.message);
          result.errors.push(`YouTube channel ${channelId}: ${channelErr.message}`);
        }
      }
    }
  }

  // Trigger Pre-translation & Social Autoposting in background
  if (result.newItems.length > 0) {
    console.log(`[RSS Ingest] Found ${result.newItems.length} new items. Triggering background tasks...`);
    
    // Background Translation (Phase 2)
    for (const item of result.newItems) {
      if (item.type === 'article') {
        getOrCompileArticleTranslation(item.id, 'id').catch(err => console.error(`[Pre-translate ID Error]`, err));
        getOrCompileArticleTranslation(item.id, 'es').catch(err => console.error(`[Pre-translate ES Error]`, err));
      }
    }

    // Background Autoposting (Phase 8)
    AutopostService.triggerAutopostsForNewIngest(result.newItems).catch(err => {
      console.error(`[Autopost Service Ingest Trigger Fail]`, err);
    });
  }

  console.log(`[Ingest Complete] RSS: ${result.processed} new, ${result.duplicates_blocked} dupes blocked, YouTube: ${result.youtube_videos_added} videos added, Errors: ${result.errors.length}`);
  return result;
}
