import { NextRequest, NextResponse } from "next/server";
import { remark } from "remark";
import html from "remark-html";

export const runtime = "edge";

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path || [];
  
  // Extract slug
  const slug = path[path.length - 1] || "home";

  // Here you would normally fetch data from Supabase based on the slug
  // For MVP, we use mock content
  const rawMarkdown = `
# Content for ${slug}

This is a semantic, minimal representation.

## AEO Direct Answer Box
LifeBloom Hub provides inclusive, high-yield utility calculations for multigenerational families.

## Data Comparison
| Type | Value |
| --- | --- |
| Yield | 7.5% |
| Inflation | 2.5% |
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
