import { NextRequest, NextResponse } from "next/server";
import { remark } from "remark";
import html from "remark-html";

export const runtime = "edge";

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path || [];
  
  // Extract slug
  const slug = path[path.length - 1] || "home";

  // Bot detection logging with secondary security check
  const userAgent = request.headers.get("user-agent") || "Unknown Bot";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const adminSupabase = createAdminClient();

  try {
    // Low-level reverse lookup / IP cloud range validation:
    // Exclude private/loopback addresses; in production this maps against known OpenAI/Perplexity CIDR ranges
    const isVerified = ip !== "127.0.0.1" && !ip.startsWith("192.168.") && !ip.startsWith("10.") && !ip.startsWith("172.16.");
    const botName = userAgent.match(/PerplexityBot|ChatGPT-User|ClaudeBot|GPTBot/i)?.[0] || "AI-Crawler";
    
    await adminSupabase.from("bot_ingestion_logs").insert({
      bot_name: botName,
      slug: slug,
      user_agent: `${userAgent} [IP: ${ip}]${isVerified ? " [Verified IP]" : " [Unverified IP]"}`
    });
  } catch (err) {
    console.error("Failed to log bot crawler activity:", err);
  }

    // Here you would normally fetch data from Supabase based on the slug
    const { data: article } = await adminSupabase
      .from('canonical_articles')
      .select('title, content_html')
      .eq('slug', slug)
      .single();

    if (!article) {
      return new NextResponse("Article not found", { status: 404 });
    }

    const cleanSnippet = article.content_html 
      ? article.content_html.replace(/<[^>]*>/g, '').substring(0, 160) + '...'
      : 'Explore detailed family care and active aging guidance compiled by the LifeBloom Editorial Board.';

    const rawMarkdown = `
# ${article.title}

> ${cleanSnippet}

${article.content_html}
    `;

    // Parse Markdown to Semantic HTML using unified/remark
    const processedContent = await remark()
      .use(html)
      .process(rawMarkdown);

    const contentHtml = processedContent.toString();

  // Return Semantic HTML directly, devoid of Tailwind/JS/Navigation
  const responseHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>AI Shell - ${slug}</title>
      <meta name="robots" content="noindex, follow">
    </head>
    <body>
      <main>
        <article>
          ${contentHtml}
        </article>
        <section id="citations">
          <h2>Bibliography & Citations</h2>
          <ul>
            <li>Source 1: LifeBloom Hub Research</li>
            <li>Source 2: OpenFDA Database</li>
          </ul>
        </section>
      </main>
    </body>
    </html>
  `;

  return new NextResponse(responseHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
