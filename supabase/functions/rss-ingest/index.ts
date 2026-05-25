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
      
      // Simple RegExp-based RSS XML parsing for Deno Edge environment compatibility
      const items = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
      
      for (const item of items) {
        const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
        const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
        const descMatch = item.match(/<description>([\s\S]*?)<\/description>/);
        const authorMatch = item.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/) || item.match(/<author>([\s\S]*?)<\/author>/);

        if (!titleMatch || !linkMatch) continue;

        const title = titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
        const sourceUrl = linkMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
        const description = descMatch ? descMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : "";
        const author = authorMatch ? authorMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : "LifeBloom Editorial";

        // Create standard slug from title
        const slug = title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .slice(0, 80);

        // Check if article with this slug already exists in database
        const { data: existing } = await supabase
          .from('articles')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (existing) continue; // Skip already ingested articles

        // In production, integrate Anthropic API here to perform semantic language translation:
        // const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
        // If available, translate `title`, `description`, `content` to multiple languages.
        // For baseline, we use the primary ingest as English default.

        // Insert new article into public database
        const { error: insertError } = await supabase
          .from('articles')
          .insert({
            slug,
            pillar: 'senior', // Default to senior wellness, can categorise dynamically
            title,
            description: description.slice(0, 300),
            content: `<h3>${title}</h3><p>${description}</p><p>Read more original content at: <a href="${sourceUrl}" target="_blank">${sourceUrl}</a></p>`,
            author,
            source_url: sourceUrl,
            is_active: true
          });

        if (!insertError) {
          processedArticles.push({ title, slug });
        }
      }
    }

    // 5. Trigger on-demand NextJS ISR Cache invalidation
    const revalidateToken = Deno.env.get('REVALIDATE_TOKEN');
    const appUrl = Deno.env.get('NEXT_PUBLIC_APP_URL') ?? "http://localhost:3000";
    
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
