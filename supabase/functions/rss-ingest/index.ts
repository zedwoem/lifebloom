// supabase/functions/rss-ingest/index.ts
// Supabase Edge Function — Automated RSS Feed Ingestion & Translation (Deno Runtime)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

serve(async (req) => {
  // 1. Verify Request Origin & Authorization (Cron Token)
  const authHeader = req.headers.get('Authorization');
  const cronSecret = Deno.env.get('CRON_SECRET');
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized cron session' }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // 2. Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? "";
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? "";
    const supabase = createClient(supabaseUrl, serviceKey);

    // 3. Extract RSS feeds to ingest
    const feedUrlsEnv = Deno.env.get('RSS_FEED_URLS') ?? "";
    const feedUrls = feedUrlsEnv.split(',').map(u => u.trim()).filter(Boolean);

    if (feedUrls.length === 0) {
      return new Response(JSON.stringify({ message: "No RSS feed URLs defined for ingestion" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const processedArticles = [];

    // 4. Fetch and parse each RSS Feed
    for (const url of feedUrls) {
      const response = await fetch(url);
      const xmlText = await response.text();
      
      // Map pillar based on feed URL hints
      let pillar = 'senior';
      if (url.includes('handyman') || url.includes('younghouselove')) {
        pillar = 'home-living';
      } else if (url.includes('moneyguy')) {
        pillar = 'money-future';
      } else if (url.includes('avma') || url.includes('bark')) {
        pillar = 'pet-family';
      } else if (url.includes('disabled-world')) {
        pillar = 'travel';
      }

      // Simple RegExp-based RSS XML parsing for Deno Edge environment compatibility
      const items = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
      
      for (const item of items) {
        const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
        const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
        const descMatch = item.match(/<description>([\s\S]*?)<\/description>/);
        const contentMatch = item.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/) || item.match(/<content>([\s\S]*?)<\/content>/);
        const pubDateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
        const enclosureMatch = item.match(/<enclosure[^>]*url="([^"]*)"/);

        if (!titleMatch || !linkMatch) continue;

        const title = titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
        const sourceUrl = linkMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
        const description = descMatch ? descMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : "";
        const rawContent = contentMatch ? contentMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : description;
        const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
        const imageUrl = enclosureMatch ? enclosureMatch[1].trim() : "";

        // Standard SHA-256 source hash generation in Deno
        const encoder = new TextEncoder();
        const data = encoder.encode(`${title.toLowerCase()}|${sourceUrl.trim().toLowerCase()}`);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashId = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        // Create standard slug from title and hash
        const slugBase = title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .slice(0, 80);
        const slug = `${slugBase}-${hashId.slice(0, 8)}`;

        const cleanBody = rawContent.replace(/<[^>]*>?/gm, ' ').trim();
        const contentHtml = `<p>${cleanBody.replace(/\n\n/g, '</p><p>')}</p>`;

        // Insert new canonical article
        const { error: insertError } = await supabase
          .from('canonical_articles')
          .upsert({
            source_hash: hashId,
            slug,
            title,
            content_html: contentHtml,
            source_url: sourceUrl,
            pillar,
            image_url: imageUrl || null,
            published_at: new Date(pubDate).toISOString()
          }, { onConflict: 'source_hash', ignoreDuplicates: true });

        if (!insertError) {
          processedArticles.push({ title, slug });
        }
      }
    }

    // 5. Trigger on-demand NextJS ISR Cache invalidation
    const revalidateToken = Deno.env.get('REVALIDATE_TOKEN');
    const appUrl = Deno.env.get('NEXT_PUBLIC_APP_URL') ?? "https://lifebloomhub.vercel.app";
    
    await fetch(`${appUrl}/api/revalidate?secret=${revalidateToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: ['articles'] })
    }).catch(() => {/* Silent fail */});

    return new Response(JSON.stringify({
      message: "RSS feeds ingested and processed successfully",
      count: processedArticles.length,
      articles: processedArticles
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
})

