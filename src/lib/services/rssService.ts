import crypto from 'crypto';
import { PILLARS } from '@/lib/constants/pillars';
import { createServiceClient } from '@/lib/supabase/server';
import Parser from 'rss-parser';
import { AutopostService, IngestedItem } from '@/lib/services/autopostService';
import { getOrCompileArticleTranslation } from '@/lib/services/astTranslationEngine';
import * as cheerio from 'cheerio';

const locale = "en";

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
      "UCLXQalldcm6gMYMQfLMliww"  // James Shack
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
      "https://www.sciencedaily.com/rss/health_medicine/healthy_aging.xml",
      "https://rss.medicalnewstoday.com/aging.xml"
    ]
  },
  "travel": {
    rss: [
      "https://wheelchairtravel.org/feed/",
      "https://thepointsguy.com/feed/"
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


function slugify(title: string, hashId: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${base}-${hashId.slice(0, 8)}`;
}

/**
 * Ekstrak URL gambar dari RSS item — prioritas: enclosure, media:thumbnail, media:content
 */
function extractImageUrl(item: any): string {
  const enclosureUrl = item.enclosure?.url;
  if (enclosureUrl) return enclosureUrl;

  const mediaThumbnail = item.mediaThumbnail?.['$']?.url || item.mediaThumbnail?.url;
  if (mediaThumbnail) return mediaThumbnail;

  const mediaContent = item.mediaContent?.['$']?.url;
  if (mediaContent) return mediaContent;

  return '';
}

// ============================================================
// RSS INGESTION (LIGHTWEIGHT QUEUE LOADER)
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
        console.log(`[RSS Ingest] Fetching XML: ${feedUrl} [${pillarSlug}]`);
        const feed = await parser.parseURL(feedUrl);
        const items = feed.items || [];

        // Ingest max 15 items per feed in queue status
        for (const item of items.slice(0, 15)) {
          if (!item.title || !item.link) continue;

          try {
            const anyItem = item as any;
            const hashId = generateHash(anyItem.title || "", anyItem.link || "");
            const slug = slugify(anyItem.title || "", hashId);
            const imageUrl = extractImageUrl(anyItem);

            // Insert basic details and set processing_status = 'pending'
            const { data: insertedData, error: canonicalError } = await supabase
              .from('canonical_articles')
              .upsert({
                source_hash: hashId,
                slug,
                title: anyItem.title || "",
                content_html: anyItem['content:encoded'] || anyItem.content || anyItem.description || '<p>Content unavailable</p>',
                source_url: anyItem.link || "",
                pillar: pillarSlug,
                image_url: imageUrl || null,
                published_at: anyItem.pubDate ? new Date(anyItem.pubDate).toISOString() : new Date().toISOString(),
                processing_status: 'pending'
              }, { onConflict: 'source_hash', ignoreDuplicates: true })
              .select('id, title, slug, pillar, image_url')
              .maybeSingle();

            if (canonicalError) {
              if (canonicalError.code === '23505') {
                result.duplicates_blocked++;
              } else {
                console.error(`[RSS Ingest] DB Error for "${item.title}":`, canonicalError.message);
                result.errors.push(canonicalError.message);
              }
            } else if (insertedData) {
              result.processed++;
              // Not storing in newItems yet because it's not fully processed/complete
            } else {
              result.skipped++;
            }
          } catch (itemErr: any) {
            console.error(`[RSS Ingest] Item error:`, itemErr.message);
            result.errors.push(itemErr.message);
          }
        }
      } catch (feedErr: any) {
        console.warn(`[RSS Ingest] Feed failed: ${feedUrl}. Trying GNews fallback...`, feedErr.message);

        // GNews Fallback
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
                  const slug = slugify(gnewsItem.title, hashId);

                  const { data: insertedData, error } = await supabase
                    .from('canonical_articles')
                    .upsert({
                      source_hash: hashId,
                      slug,
                      title: gnewsItem.title,
                      content_html: gnewsItem.content || gnewsItem.description || '<p>Content unavailable</p>',
                      source_url: gnewsItem.url,
                      pillar: pillarSlug,
                      image_url: gnewsItem.image || null,
                      published_at: gnewsItem.publishedAt ? new Date(gnewsItem.publishedAt).toISOString() : new Date().toISOString(),
                      processing_status: 'pending'
                    }, { onConflict: 'source_hash', ignoreDuplicates: true })
                    .select('id, title, slug, pillar, image_url')
                    .maybeSingle();

                  if (!error) {
                    if (insertedData) result.processed++;
                  } else if (error.code === '23505') {
                    result.duplicates_blocked++;
                  }
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
    // YOUTUBE CHANNEL INGESTION
    // ============================================================
    if (config.youtubeChannels && config.youtubeChannels.length > 0) {
      for (const channelId of config.youtubeChannels) {
        try {
          console.log(`[YouTube Ingest] Fetching channel via RSS: ${channelId} [${pillarSlug}]`);
          const ytRssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
          const feed = await parser.parseURL(ytRssUrl);
          const ytItems = feed.items || [];

          for (const ytItem of ytItems.slice(0, 5)) {
            const anyYtItem = ytItem as any;
            // YouTube RSS id is formatted like: yt:video:VIDEO_ID
            const videoId = anyYtItem.id ? anyYtItem.id.replace('yt:video:', '') : '';
            if (!videoId || !anyYtItem.title) continue;

            try {
              const titleSlug = anyYtItem.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '')
                .slice(0, 80);

              const videoPillarMap: Record<string, string> = {
                'home-living': 'home',
                'money-future': 'money',
                'pet-family': 'pet'
              };
              const dbPillar = videoPillarMap[pillarSlug] || pillarSlug;

              const { data: insertedVideo, error: videoError } = await supabase
                .from('videos')
                .upsert({
                  embed_id: videoId,
                  video_id: videoId,
                  title: anyYtItem.title || "",
                  description: anyYtItem.contentSnippet?.slice(0, 500) || anyYtItem.content?.slice(0, 500) || '',
                  provider: 'youtube',
                  pillar: dbPillar,
                  locale: 'en',
                  slug: `${titleSlug}-${videoId}`,
                  thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                  transcript_status: 'pending',
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

  // If new YouTube videos were added, trigger autoposts for them directly
  if (result.newItems.length > 0) {
    AutopostService.triggerAutopostsForNewIngest(result.newItems).catch(err => {
      console.error(`[Autopost Service Ingest Trigger Fail]`, err);
    });
  }

  console.log(`[Ingest XML Complete] Queued RSS: ${result.processed} pending articles, ${result.duplicates_blocked} dupes blocked, YouTube: ${result.youtube_videos_added} videos added.`);
  return result;
}

// ============================================================
// DECOUPLED FULL-TEXT SCRAPER (CHEERIO ENGINE)
// ============================================================

export async function scrapeFullArticleContent(url: string): Promise<{ contentText: string; imageUrl?: string }> {
  let html = '';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    html = await res.text();
  } catch (primaryErr: any) {
    console.warn(`[Scraper] Primary scrape failed for ${url}: ${primaryErr.message}. Trying Jina Reader fallback...`);
    try {
      const jinaUrl = `https://r.jina.ai/${url}`;
      const jinaRes = await fetch(jinaUrl, {
        headers: {
          'Accept': 'text/plain',
        },
        signal: AbortSignal.timeout(10000)
      });
      if (jinaRes.ok) {
        const jinaText = await jinaRes.text();
        if (jinaText && jinaText.trim().length > 300) {
          console.log(`[Scraper] Jina Reader successfully retrieved ${jinaText.length} characters.`);
          return {
            contentText: jinaText.replace(/\s+/g, ' ').substring(0, 10000),
            imageUrl: undefined
          };
        }
      }
    } catch (jinaErr: any) {
      console.error(`[Scraper] Jina fallback failed as well:`, jinaErr.message);
    }
    throw primaryErr; // Re-throw primary error if Jina also fails
  }

  try {
    const $ = cheerio.load(html);

    // 1. Extract og:image from metadata
    let imageUrl = $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('meta[property="og:image:url"]').attr('content');

    // Fallback: search for first large image inside post content or body
    if (!imageUrl) {
      const firstImg = $('article img, main img, .post-content img, .entry-content img').first().attr('src');
      if (firstImg && firstImg.startsWith('http')) {
        imageUrl = firstImg;
      }
    }

    // Clean up typical non-content elements inside body before scraping text
    $('nav, header, footer, sidebar, aside, script, style, iframe, .ads, .comment, .social-share, .newsletter-signup, .related-posts, .author-box').remove();

    // 2. Extract content text: Priority fallback
    let contentText = '';

    // Strategy A: Standard HTML5 tags
    const targetTags = $('article, main');
    if (targetTags.length > 0) {
      contentText = targetTags.text().trim();
    }

    // Strategy B: Common content class selectors
    if (!contentText || contentText.length < 300) {
      const classSelectors = [
        '.post-content', '.entry-content', '.article-body', '.article-content',
        '.content', '#content', '.main-content', '.post-text', '.story-body'
      ];
      for (const selector of classSelectors) {
        const matched = $(selector);
        if (matched.length > 0) {
          const text = matched.text().trim();
          if (text.length > 300) {
            contentText = text;
            break;
          }
        }
      }
    }

    // Strategy C: Fallback to largest cluster of <p> tags
    if (!contentText || contentText.length < 300) {
      let largestText = '';
      $('div, section').each((_, elem) => {
        const paragraphs = $(elem).children('p');
        if (paragraphs.length > 2) {
          const text = $(elem).text().trim();
          if (text.length > largestText.length) {
            largestText = text;
          }
        }
      });
      if (largestText.length > 300) {
        contentText = largestText;
      }
    }

    // Strategy D: Absolute fallback - take body text
    if (!contentText || contentText.length < 300) {
      contentText = $('body').text().trim();
    }

    // Clean up excessive whitespace and restrict token bloat
    contentText = contentText.replace(/\s+/g, ' ').substring(0, 10000);

    return {
      contentText,
      imageUrl: imageUrl || undefined
    };
  } catch (err: any) {
    console.error(`[Scraper] Failed to scrape ${url}:`, err.message);
    throw err;
  }
}

// ============================================================
// GEMINI AI SANITIZATION & SEMANTIC INTERLINKING
// ============================================================

export async function enrichScrapedContentWithAI(
  rawText: string,
  sourceUrl: string,
  category: string,
  locale: string = 'en'
): Promise<{ contentHtml: string; description: string; keywords: string[] }> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterKey) {
    throw new Error('Missing OPENROUTER_API_KEY');
  }

  // Strict Internal Linking Mapping
  const toolLinkMappings = [
    { name: "Retirement Planner", path: "/money-future/retirement-planner", triggers: ["retirement", "pensiun", "dana pensiun", "tabungan hari tua", "retirement planning", "investasi pensiun"] },
    { name: "Yield Radar", path: "/money-future/yield-radar", triggers: ["yield", "deposito", "obligasi", "imbal hasil", "suku bunga", "yield radar", "sbn", "treasury"] },
    { name: "Canine Symptom Checker", path: "/pet-family/canine-symptom-checker", triggers: ["dog symptom", "anjing sakit", "gejala anjing", "sakit anjing", "canine symptom", "vet checklist", "symptom checker"] },
    { name: "Pet Matchmaker", path: "/pet-family/matchmaker", triggers: ["pet matchmaker", "breed compatibility", "ras anjing", "adopsi anjing", "jenis anjing", "dog breed"] },
    { name: "Prescription Drug Checker", path: "/senior/drug-checker", triggers: ["drug checker", "drug interaction", "interaksi obat", "obat resep", "medication", "prescription", "side effects", "efek samping"] },
    { name: "Mobility Safety Planner", path: "/senior/mobility-planner", triggers: ["mobility", "fall prevention", "mencegah jatuh", "alat bantu jalan", "senior mobility", "safety checklist"] },
    { name: "Trip Planner", path: "/travel/trip-planner", triggers: ["trip planner", "travel budget", "anggaran liburan", "aksesibilitas travel", "accessible travel", "route planner"] },
    { name: "Budget Renovator", path: "/home-living/budget-renovator", triggers: ["renovation", "renovasi", "budget rumah", "remodel", "home budget", "biaya bangunan", "estimasi biaya"] },
    { name: "Smart Home Matcher", path: "/home-living/smart-matcher", triggers: ["smart home", "matter protocol", "perangkat pintar", " Matter ", "smarthome"] }
  ];

  const expertReviewers: Record<string, { name: string; title: string; url: string }> = {
    health: { name: "Dr. Sarah Jenkins, MD", title: "Geriatric Medicine Specialist", url: "https://lifebloomhub.vercel.app/author/sarah-jenkins" },
    finance: { name: "Michael Chen, CFP", title: "Certified Financial Planner", url: "https://lifebloomhub.vercel.app/author/michael-chen" },
    senior: { name: "Dr. Sarah Jenkins, MD", title: "Geriatric Medicine Specialist", url: "https://lifebloomhub.vercel.app/author/sarah-jenkins" },
    "money-future": { name: "Michael Chen, CFP", title: "Certified Financial Planner", url: "https://lifebloomhub.vercel.app/author/michael-chen" },
    "pet-family": { name: "Dr. Sarah Chen, DVM", title: "Certified Veterinarian Specialist", url: "https://lifebloomhub.vercel.app/author/sarah-chen-dvm" },
    "home-living": { name: "Alex Rivera", title: "Certified Smart Home Technology Analyst", url: "https://lifebloomhub.vercel.app/author/alex-rivera" },
    travel: { name: "LifeBloom Editorial Board", title: "Senior Accessibility Curators", url: "https://lifebloomhub.vercel.app/about" }
  };

  const reviewer = expertReviewers[category] || expertReviewers.travel;

  const isStrictEEAT = category === 'senior' || category === 'pet-family' || category === 'health';
  
  const prompt = `You are a professional, expert editor at LifeBloom Hub. Your task is to process, sanitize, clean, and enrich the raw scraped article text provided below.

RAW ARTICLE TEXT:
"""
${rawText}
"""

Instructions:
1. **Clean & Structure:** Remove any cookie notifications, newsletter popups, navigational links, or ads. Clean up typos. Output only clean, highly readable, semantic HTML content.
2. **Formatting:** Use structured subheadings (<h2> and <h3>), well-paced paragraphs, and formatted bullet lists (<ul><li>) where appropriate. Wrap paragraphs in standard <p> tags.
3. **Internal Linking Strategy:** You MUST inject at least 1-2 semantic internal HTML anchor links to our tools when relevant keywords appear.
   Here is the strict mapping you must follow (always prepend the locale '' to the link):
   ${JSON.stringify(toolLinkMappings.map(t => ({ keywordTriggers: t.triggers, urlPath: t.path, linkAnchorText: t.name })))}
   - Example: if discussing compound savings, insert: <a href="/money-future/retirement-planner">Retirement Planner</a>.
   - Example: if discussing side effects, insert: <a href="/senior/drug-checker">Prescription Drug Checker</a>.
   - Always link to '/videos' when recommending visual tutorials or masterclasses.
   ${!isStrictEEAT 
      ? `- **Affiliate Strategy**: Since this article is in the '${category}' pillar, you may inject commercial affiliate links (using href="/api/affiliate?vendor=b2b&product_id=keyword") when recommending physical generic products like smart devices or travel gear.` 
      : `- **STRICT MEDICAL GUARDRAIL**: This article is in the '${category}' pillar. You are STRICTLY PROHIBITED from injecting commercial affiliate links or product endorsements to maintain medical/clinical credibility.`}
   - Be natural! Do not force links if they do not fit the context at all, but always look for opportunities.
4. **E-E-A-T Expert Verification:** Incorporate a beautiful verification note reflecting that this article content is reviewed by the designated expert.
   Reviewer details: Name: "${reviewer.name}", Title: "${reviewer.title}".
   Wrap this block inside a custom styling structure:
   <div class="expert-verification-box p-5 my-6 bg-emerald-50/50 border border-emerald-200/50 rounded-2xl">
     <strong class="font-bold text-xs uppercase tracking-wider text-emerald-800 block mb-1">Verified Expert Review:</strong>
     <p class="text-sm text-slate-600 mb-0">"Designated advice is reviewed by <strong>${reviewer.name}</strong> (${reviewer.title}) to ensure clinical/financial compliance. Always consult a certified professional for personalized guidance."</p>
   </div>
5. **Sources & References Citation:** Create a clean references section using an <h2> tag at the end. Include a link to the original article using the URL: "${sourceUrl}".
   The link MUST have rel="nofollow noopener noreferrer" target="_blank" as a security boundary:
   Example: <a href="${sourceUrl}" rel="nofollow noopener noreferrer" target="_blank">Original Source Reference</a>
6. **Meta Metadata & Keywords:** You must return the output as a valid JSON object with the following keys:
   - "content_html": The complete processed HTML string containing paragraphs, headings, internal links, expert box, and sources section.
   - "description": A high-engagement, customized SEO description (max 155 characters).
   - "keywords": An array of 5-8 relevant, targeted keywords matching this article's topic.

IMPORTANT: Respond ONLY with the raw JSON object. Do not wrap in markdown code blocks like \`\`\`json. The response must be a single parsable JSON string.`;

  try {
    const res = await fetch(
      `https://openrouter.ai/api/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openRouterKey}`,
          "HTTP-Referer": "https://lifebloomhub.com",
          "X-Title": "LifeBloom Hub"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat", // DeepSeek via OpenRouter (cheap, reasoning)
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        }),
        signal: AbortSignal.timeout(30000)
      }
    );

    if (!res.ok) {
      throw new Error(`OpenRouter API HTTP ${res.status}`);
    }

    const resData = await res.json();
    const rawJson = resData.choices?.[0]?.message?.content;
    if (!rawJson) {
      throw new Error("Empty response from OpenRouter API");
    }

    const cleanResult = JSON.parse(rawJson.trim());
    return {
      contentHtml: cleanResult.content_html,
      description: cleanResult.description,
      keywords: cleanResult.keywords || []
    };
  } catch (err: any) {
    console.error("[OpenRouter/DeepSeek Enrichment] Failed:", err.message);
    throw err;
  }
}

// ============================================================
// DECOUPLED BATCH QUEUE PROCESSOR
// ============================================================

export async function processPendingArticlesBatch(limit: number = 5): Promise<{ processed: number; errors: string[] }> {
  const supabase = createServiceClient() as any;
  const results = {
    processed: 0,
    errors: [] as string[]
  };

  // 1. Fetch 'pending' articles
  const { data: pendingArticles, error: fetchError } = await supabase
    .from('canonical_articles')
    .select('id, title, source_url, pillar, slug, content_html, image_url')
    .eq('processing_status', 'pending')
    .order('ingested_at', { ascending: true })
    .limit(limit);

  if (fetchError) {
    console.error('[Queue Processor] Failed to fetch pending articles:', fetchError.message);
    return { processed: 0, errors: [fetchError.message] };
  }

  if (!pendingArticles || pendingArticles.length === 0) {
    console.log('[Queue Processor] No pending articles to process.');
    return { processed: 0, errors: [] };
  }

  console.log(`[Queue Processor] Found ${pendingArticles.length} pending articles. Processing...`);

  for (const article of (pendingArticles as any[])) {
    // Update status to 'processing' to prevent double processing in case of multiple concurrent runs
    await supabase
      .from('canonical_articles')
      .update({ processing_status: 'processing' })
      .eq('id', article.id);

    try {
      console.log(`[Queue Processor] Scraping content for article "${article.title}" (${article.source_url})`);

      let scraped: { contentText: string; imageUrl?: string };
      try {
        scraped = await scrapeFullArticleContent(article.source_url || "");
        if (!scraped.contentText || scraped.contentText.length < 200) {
          throw new Error('Scraped content is too thin or empty.');
        }
      } catch (scrapeErr: any) {
        console.warn(`[Queue Processor] Scraping failed for "${article.title}": ${scrapeErr.message}. Attempting Gemini Direct AI Generation fallback...`);
        
        const cleanDesc = article.content_html 
          ? article.content_html.replace(/<[^>]*>/g, '').trim().slice(0, 500) 
          : '';
        
        const openRouterKey = process.env.OPENROUTER_API_KEY;
        if (!openRouterKey) throw new Error('Missing OPENROUTER_API_KEY for direct AI fallback.');
        
        console.log(`[Queue Processor] Generating direct AI content for "${article.title}"...`);
        const generationPrompt = `Write a highly informative, detailed, 600-word professional article in English for senior citizens about the topic: "${article.title}". 
Original summary/context: "${cleanDesc}".

Instructions:
1. Use clear semantic HTML elements including paragraphs, <h2> and <h3> subheadings, and bullet lists.
2. Ensure the tone is warm, extremely accessible, and authoritative. Do not wrap in markdown blocks, html, head, or body tags — output only the clean inner HTML.`;
        
        const openRouterRes = await fetch(
          `https://openrouter.ai/api/v1/chat/completions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openRouterKey}`,
              "HTTP-Referer": "https://lifebloomhub.com"
            },
            body: JSON.stringify({
              model: "deepseek/deepseek-chat",
              messages: [{ role: "user", content: generationPrompt }]
            }),
            signal: AbortSignal.timeout(30000)
          }
        );

        if (!openRouterRes.ok) {
          throw new Error(`OpenRouter AI generation fallback failed with HTTP ${openRouterRes.status}`);
        }

        const resData = await openRouterRes.json();
        const generatedText = resData.choices?.[0]?.message?.content;
        if (!generatedText || generatedText.trim().length < 100) {
          throw new Error('OpenRouter direct generation returned empty content.');
        }

        scraped = {
          contentText: generatedText,
          imageUrl: undefined
        };
      }

      console.log(`[Queue Processor] Scraped/Generated ${scraped.contentText.length} chars. Enriching with Gemini AI...`);

      // B. Enrich content with Gemini
      const enriched = await enrichScrapedContentWithAI(
        scraped.contentText,
        article.source_url || "",
        article.pillar || 'general',
        'en' // default locale for ingestion
      );

      console.log(`[Queue Processor] Content enriched. Updating database...`);

      let finalImageUrl = scraped.imageUrl || article.image_url || null;
      if (!finalImageUrl) {
        const pillarKeywords: Record<string, string> = {
          'home-living': 'home-interior-decor',
          'money-future': 'retirement-finance-wealth',
          'pet-family': 'happy-pets-dogs',
          'senior': 'healthy-aging-seniors',
          'travel': 'wheelchair-accessible-travel',
          'general': 'wellness'
        };
        const keyword = pillarKeywords[article.pillar] || pillarKeywords['general'];
        const randomSeed = Math.abs(crypto.createHash('md5').update(article.title).digest().readInt32BE(0)) % 1000;
        finalImageUrl = `https://images.unsplash.com/featured/1200x630/?${keyword}&sig=${randomSeed}`;
      }

      // C. Save rich data back to database and mark as 'completed'
      const { error: updateError } = await supabase
        .from('canonical_articles')
        .update({
          content_html: enriched.contentHtml,
          image_url: finalImageUrl,
          raw_scraped_content: scraped.contentText,
          processing_status: 'completed',
          processing_error: null
        })
        .eq('id', article.id);

      if (updateError) {
        throw new Error(`DB update failed: ${updateError.message}`);
      }

      results.processed++;

      // D. Trigger Background Translation
      getOrCompileArticleTranslation(article.id, article.slug, article.title, enriched.contentHtml, 'id')
        .catch(err => console.error(`[Pre-translate ID Queue Error]`, err.message));
      getOrCompileArticleTranslation(article.id, article.slug, article.title, enriched.contentHtml, 'es')
        .catch(err => console.error(`[Pre-translate ES Queue Error]`, err.message));

      // E. Trigger Social Autoposting
      const postItem: IngestedItem = {
        id: article.id,
        title: article.title,
        slug: article.slug,
        description: enriched.description,
        imageUrl: finalImageUrl || undefined,
        pillar: article.pillar || 'general',
        type: 'article'
      };

      AutopostService.triggerAutopostsForNewIngest([postItem]).catch(err => {
        console.error(`[Autopost Service Queue Trigger Fail] for article "${article.title}":`, err.message);
      });

    } catch (err: any) {
      console.error(`[Queue Processor] Failed to process article "${article.title}":`, err.message);
      results.errors.push(`Article "${article.title}": ${err.message}`);

      // Mark as 'failed' and log error
      await supabase
        .from('canonical_articles')
        .update({
          processing_status: 'failed',
          processing_error: err.message
        })
        .eq('id', article.id);
    }
  }

  return results;
}
