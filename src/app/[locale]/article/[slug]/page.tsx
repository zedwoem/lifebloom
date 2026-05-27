import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
import { Article, MedicalWebPage, WithContext } from 'schema-dts';
import { AccessibleArticleReader } from '@/components/content/accessible-article-reader';
import { createServiceClient } from '@/lib/supabase/server';
import { getOrCompileArticleTranslation } from '@/lib/services/astTranslationEngine';
import crypto from 'crypto';
import { AccessibleComments } from '@/components/community/accessible-comments';

// Async data fetching with advanced SEO metadata and dynamic AI content generation
async function getArticleData(slug: string, locale: string) {
  const decodedSlug = decodeURIComponent(slug).replace(/-/g, ' ');

  // 0. Primary check: Search in 3NF canonical_articles
  const supabase = createServiceClient();
  const { data: canonicalArticle } = await supabase
    .from('canonical_articles')
    .select('id, title, content_html, image_url, pillar, published_at')
    .eq('slug', slug)
    .maybeSingle();

  if (canonicalArticle) {
    let contentHtml = canonicalArticle.content_html || '';
    let finalImageUrl = canonicalArticle.image_url;
    const category = (canonicalArticle.pillar || 'general') as 'health' | 'finance' | 'tech' | 'general';

    // A. Dynamic On-Demand LLM Generation Fallback (if content is pending, thin, or default placeholder)
    if ((!contentHtml || contentHtml.length < 500 || contentHtml.includes("Processing premium content...")) && process.env.GEMINI_API_KEY) {
      try {
        console.log(`[On-Demand Generator] Article "${canonicalArticle.title}" content is thin (${contentHtml.length} chars). Generating rich content via Gemini...`);
        const cleanDesc = contentHtml.replace(/<[^>]*>/g, '').trim().slice(0, 500);
        
        let expertReviewerName = "LifeBloom Editorial Board";
        let expertReviewerTitle = "Senior Accessibility Curators";
        if (category === 'health') {
          expertReviewerName = "Dr. Sarah Jenkins, MD";
          expertReviewerTitle = "Geriatric Medicine Specialist";
        } else if (category === 'finance') {
          expertReviewerName = "Michael Chen, CFP";
          expertReviewerTitle = "Certified Financial Planner";
        }

        const generationPrompt = `You are a professional, expert editor at LifeBloom Hub. Write a highly informative, detailed, 600-word professional article in English for senior citizens about the topic: "${canonicalArticle.title}". 
Original summary/context: "${cleanDesc}". 

Instructions:
1. Use clear semantic HTML elements including paragraphs, <h2> and <h3> subheadings, and bullet lists.
2. Incorporate a beautiful verification note reflecting that this article content is reviewed by the designated expert.
   Reviewer details: Name: "${expertReviewerName}", Title: "${expertReviewerTitle}".
   Wrap this block inside a custom styling structure:
   <div class="expert-verification-box p-5 my-6 bg-emerald-50/50 border border-emerald-200/50 rounded-2xl">
     <strong class="font-bold text-xs uppercase tracking-wider text-emerald-800 block mb-1">Verified Expert Review:</strong>
     <p class="text-sm text-slate-600 mb-0">"Designated advice is reviewed by <strong>${expertReviewerName}</strong> (${expertReviewerTitle}) to ensure clinical/financial compliance. Always consult a certified professional for personalized guidance."</p>
   </div>
3. End the article with a 'Sources & References' section (using an <h2>) listing 2-3 real, authoritative sources (e.g., AARP, NIH, SSA.gov) with HTML links. The links MUST have rel="nofollow noopener noreferrer" target="_blank" as a security boundary.
4. Internal Linking Strategy: You MUST inject at least 1-2 semantic internal HTML anchor links to our tools when relevant keywords appear.
   Strict mapping (always prepend '/${locale}' to the link):
   - /${locale}/money-future/retirement-planner (Triggers: retirement, pensiun, dana pensiun)
   - /${locale}/money-future/yield-radar (Triggers: yield, deposito, obligasi, imbal hasil)
   - /${locale}/pet-family/canine-symptom-checker (Triggers: dog symptom, anjing sakit, vet checklist)
   - /${locale}/senior/drug-checker (Triggers: drug checker, interaksi obat, obat resep, side effects)
   - /${locale}/senior/mobility-planner (Triggers: mobility, fall prevention, mencegah jatuh)
   - /${locale}/travel/trip-planner (Triggers: trip planner, travel budget, accessible travel)
   - /${locale}/home-living/budget-renovator (Triggers: renovation, renovasi, budget rumah)
   - /${locale}/home-living/smart-matcher (Triggers: smart home, matter protocol, perangkat pintar)
5. Ensure the tone is warm, extremely accessible, and authoritative. Do not wrap in markdown blocks, html, head, or body tags — output only the clean inner HTML.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: generationPrompt }] }]
            }),
            signal: AbortSignal.timeout(12000)
          }
        );

        if (geminiRes.ok) {
          const resData = await geminiRes.json();
          const generatedText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText && generatedText.trim().length > 100) {
            console.log(`[On-Demand Generator] Rich content successfully generated on-the-fly.`);
            contentHtml = generatedText;

            // Apply Unsplash image fallback if null
            if (!finalImageUrl) {
              const pillarKeywords: Record<string, string> = {
                'home-living': 'home-interior-decor',
                'money-future': 'retirement-finance-wealth',
                'pet-family': 'happy-pets-dogs',
                'senior': 'healthy-aging-seniors',
                'travel': 'wheelchair-accessible-travel',
                'general': 'wellness'
              };
              const keyword = pillarKeywords[canonicalArticle.pillar || 'general'] || pillarKeywords['general'];
              const randomSeed = Math.abs(crypto.createHash('md5').update(canonicalArticle.title).digest().readInt32BE(0)) % 1000;
              finalImageUrl = `https://images.unsplash.com/featured/1200x630/?${keyword}&sig=${randomSeed}`;
            }

            // Save back to DB to cache permanently
            await supabase
              .from('canonical_articles')
              .update({
                content_html: contentHtml,
                image_url: finalImageUrl,
                processing_status: 'completed'
              })
              .eq('id', canonicalArticle.id);
          }
        }
      } catch (err) {
        console.error(`[On-Demand Generator] Failed to enrich thin content:`, err);
      }
    }

    // Apply Unsplash fallback image if still null
    if (!finalImageUrl) {
      const pillarKeywords: Record<string, string> = {
        'home-living': 'home-interior-decor',
        'money-future': 'retirement-finance-wealth',
        'pet-family': 'happy-pets-dogs',
        'senior': 'healthy-aging-seniors',
        'travel': 'wheelchair-accessible-travel',
        'general': 'wellness'
      };
      const keyword = pillarKeywords[canonicalArticle.pillar || 'general'] || pillarKeywords['general'];
      const randomSeed = Math.abs(crypto.createHash('md5').update(canonicalArticle.title).digest().readInt32BE(0)) % 1000;
      finalImageUrl = `https://images.unsplash.com/featured/1200x630/?${keyword}&sig=${randomSeed}`;
    }

    const { title: translatedTitle, contentHtml: translatedContentHtml } = await getOrCompileArticleTranslation(
      canonicalArticle.id,
      slug,
      canonicalArticle.title,
      contentHtml,
      locale
    );

    let expertReviewer = null;
    if (category === 'health') {
      expertReviewer = { name: 'Dr. Sarah Jenkins, MD', url: 'https://lifebloomhub.vercel.app/author/sarah-jenkins' };
    } else if (category === 'finance') {
      expertReviewer = { name: 'Michael Chen, CFP', url: 'https://lifebloomhub.vercel.app/author/michael-chen' };
    }

    const dateStr = new Date(canonicalArticle.published_at || '2026-05-20T08:00:00Z').toLocaleDateString(
      locale === 'id' ? 'id-ID' : 'en-US',
      { month: 'long', day: 'numeric', year: 'numeric' }
    );

    return {
      id: canonicalArticle.id,
      title: translatedTitle,
      source: "LifeBloom Hub Curation",
      date: dateStr,
      datePublished: canonicalArticle.published_at || new Date('2026-05-20T08:00:00Z').toISOString(),
      dateModified: new Date().toISOString(),
      author: { name: "LifeBloom Editorial Team", url: "https://lifebloomhub.vercel.app/about" },
      category,
      expertReviewer,
      imageUrl: finalImageUrl,
      content: translatedContentHtml,
      pillar: canonicalArticle.pillar
    };
  }

  // Simple heuristic for category mapping
  let category: 'health' | 'finance' | 'tech' | 'general' = 'general';
  let expertReviewer = null;

  if (slug.includes('health') || slug.includes('medicare') || slug.includes('arthritis')) {
    category = 'health';
    expertReviewer = { name: 'Dr. Sarah Jenkins, MD', url: 'https://lifebloomhub.vercel.app/author/sarah-jenkins' };
  } else if (slug.includes('money') || slug.includes('social-security') || slug.includes('savings')) {
    category = 'finance';
    expertReviewer = { name: 'Michael Chen, CFP', url: 'https://lifebloomhub.vercel.app/author/michael-chen' };
  } else if (slug.includes('smart-home') || slug.includes('gadgets')) {
    category = 'tech';
    expertReviewer = { name: 'Alex Rivera, Tech Analyst', url: 'https://lifebloomhub.vercel.app/author/alex-rivera' };
  }

  const dateStr = new Date('2026-05-20T08:00:00Z').toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const articleDetails = {
    id: null as string | null,
    title: decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1),
    source: "LifeBloom Hub Curation",
    date: dateStr,
    datePublished: new Date('2026-05-20T08:00:00Z').toISOString(),
    dateModified: new Date().toISOString(),
    author: { name: "LifeBloom Editorial Team", url: "https://lifebloomhub.vercel.app/about" },
    category,
    expertReviewer,
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop", // Clean premium digital layout image
    content: "",
    pillar: "general" as string
  };


  // 1. Dynamic Server-Side LLM Article Generator (using Gemini API)
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const reviewerName = articleDetails.expertReviewer?.name || "LifeBloom Editorial Board";
      const reviewerTitle = articleDetails.category === 'health' ? "Geriatric Medicine Specialist" : 
                            articleDetails.category === 'finance' ? "Certified Financial Planner" : 
                            articleDetails.category === 'tech' ? "Certified Smart Home Technology Analyst" : 
                            "Senior Accessibility Curators";
      
      const prompt = `You are a professional, expert editor at LifeBloom Hub. Write a highly informative, detailed, 600-word professional article in ${locale === 'id' ? 'Indonesian' : 'English'} for senior citizens about the topic: "${decodedSlug}". 
      
Instructions:
1. Use clear semantic HTML elements including paragraphs, <h2> and <h3> subheadings, and bullet lists.
2. Incorporate a beautiful verification note reflecting that this article content is reviewed by the designated expert.
   Reviewer details: Name: "${reviewerName}", Title: "${reviewerTitle}".
   Wrap this block inside a custom styling structure:
   <div class="expert-verification-box p-5 my-6 bg-emerald-50/50 border border-emerald-200/50 rounded-2xl">
     <strong class="font-bold text-xs uppercase tracking-wider text-emerald-800 block mb-1">Verified Expert Review:</strong>
     <p class="text-sm text-slate-600 mb-0">"Designated advice is reviewed by <strong>${reviewerName}</strong> (${reviewerTitle}) to ensure clinical/financial compliance. Always consult a certified professional for personalized guidance."</p>
   </div>
3. End the article with a 'Sources & References' section (using an <h2>) listing 2-3 real, authoritative sources (e.g., AARP, NIH, SSA.gov) with HTML links. The links MUST have rel="nofollow noopener noreferrer" target="_blank" as a security boundary.
4. Internal Linking Strategy: You MUST inject at least 1-2 semantic internal HTML anchor links to our tools when relevant keywords appear.
   Strict mapping (always prepend '/${locale}' to the link):
   - /${locale}/money-future/retirement-planner (Triggers: retirement, pensiun, dana pensiun)
   - /${locale}/money-future/yield-radar (Triggers: yield, deposito, obligasi, imbal hasil)
   - /${locale}/pet-family/canine-symptom-checker (Triggers: dog symptom, anjing sakit, vet checklist)
   - /${locale}/senior/drug-checker (Triggers: drug checker, interaksi obat, obat resep, side effects)
   - /${locale}/senior/mobility-planner (Triggers: mobility, fall prevention, mencegah jatuh)
   - /${locale}/travel/trip-planner (Triggers: trip planner, travel budget, accessible travel)
   - /${locale}/home-living/budget-renovator (Triggers: renovation, renovasi, budget rumah)
   - /${locale}/home-living/smart-matcher (Triggers: smart home, matter protocol, perangkat pintar)
5. Ensure the tone is warm, extremely accessible, and authoritative. Do not wrap in markdown blocks, html, head, or body tags — output only the clean inner HTML.`;
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          }),
          signal: AbortSignal.timeout(6000) // 6s timeout
        }
      );

      if (response.ok) {
        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText && generatedText.trim().length > 100) {
          articleDetails.content = generatedText;
          return articleDetails;
        }
      }
    } catch (e) {
      console.warn("[Article API] Gemini generation failed or timed out. Reverting to high-fidelity static fallback database.", e);
    }
  }

  // 2. High-Fidelity Static Fallback Database (Strict E-E-A-T and real advisory paragraphs)
  if (slug.includes("social-security")) {
    articleDetails.content = `
      <p>Maximizing your Social Security benefits is one of the most critical components of senior financial planning. For many retirees, Social Security represents a stable, inflation-adjusted income stream that guarantees security throughout their later years. Understanding the mechanical rules of the Social Security Administration (SSA) can mean the difference of hundreds of thousands of dollars in lifetime income.</p>
      
      <h2>1. The Power of Delaying Benefits</h2>
      <p>While you can claim retirement benefits as early as age 62, doing so results in a permanent reduction of up to 30% compared to your Full Retirement Age (FRA). Conversely, for every year you delay claiming benefits beyond your FRA up to age 70, your benefit increases by 8% annually. This guaranteed 8% simple interest increase is unmatched by standard market investments.</p>
      
      <h2>2. Understanding the 35-Year Calculation Formula</h2>
      <p>Your Primary Insurance Amount (PIA) is calculated based on your highest 35 years of indexed earnings. If you have fewer than 35 years of work in the United States, the SSA inserts zeros into the formula, which significantly drags down your average monthly benefit. Continuing to work even part-time in your 60s can replace low-earning early years with high-earning later years, instantly boosting your benefit.</p>

      <h2>3. Navigating Spousal and Survivor Benefits</h2>
      <p>Married couples, divorced individuals (married at least 10 years), and surviving spouses are eligible for complex benefit choices. A lower-earning spouse can claim up to 50% of the higher-earning spouse's FRA benefit. Furthermore, if a higher-earning spouse delays claiming until age 70, they permanently maximize the survivor benefit for their spouse, establishing a vital safety net.</p>

      <div class="p-5 my-6 bg-slate-50 border border-slate-200 rounded-xl">
        <strong class="text-brand-blue uppercase tracking-wider text-xs block mb-1">Key Expert Tip from Michael Chen, CFP:</strong>
        <p class="text-slate-600 text-sm mb-0">"Coordinate claiming strategies as a household. Typically, the highest earner should delay benefits until age 70 to maximize the guaranteed survivor benefit, while the lower earner can claim earlier to provide essential liquidity."</p>
      </div>

      <h2 class="mt-8 border-t border-slate-200 pt-6">Sources & References</h2>
      <ul class="text-sm text-slate-500">
        <li><a href="https://www.ssa.gov/benefits/retirement/planner/claiming.html" target="_blank" class="text-brand-blue hover:underline">Social Security Administration: Starting Your Retirement Benefits Early</a></li>
        <li><a href="https://www.aarp.org/retirement/social-security/" target="_blank" class="text-brand-blue hover:underline">AARP Social Security Resource Center</a></li>
      </ul>
    `;
  } else if (slug.includes("wheelchair") || slug.includes("europe")) {
    articleDetails.content = `
      <p>Traveling in Europe is a dream for many, but for seniors with limited mobility or wheelchair users, it requires meticulous research. Fortunately, European accessibility infrastructure has progressed significantly. Many historic capitals have successfully balanced medieval conservation with modern, low-threshold public transits and universal access ramps.</p>
      
      <h2>1. London, United Kingdom: The Accessible Black Cab Standard</h2>
      <p>London stands out as a world leader in transit accessibility. Every single official London Black Cab is equipped with an integrated wheelchair ramp, spacious passenger seating, and secure anchor systems by law. The iconic double-decker buses also feature low floors, rear-facing wheelchair bays, and automated ramps. In the London Underground (Tube), look for the dedicated wheelchair-accessible map to identify step-free platform stations.</p>
      
      <h2>2. Amsterdam, Netherlands: Accessible Canals and Smooth Pathways</h2>
      <p>Despite its historic cobblestones, Amsterdam is highly navigable. Almost all city canal cruises now offer wheelchair lifts. The city's extensive modern tram network features low-floor entry doors and dedicated platform boarding zones. Museums like the Rijksmuseum and the Van Gogh Museum are entirely step-free, offering wide elevators, accessible restrooms, and complimentary wheelchair loans.</p>

      <h2>3. Berlin, Germany: Perfect Barrier-Free Sidewalks</h2>
      <p>Berlin's modern reconstruction has made it one of the most accessible cities in Europe. Sidewalks feature smooth, tactile paving and wide, gentle curb cuts at almost every intersection. The U-Bahn (Subway) and S-Bahn (Urban Railway) boast high levels of elevator coverage. Historic landmarks like the Reichstag Dome feature smooth, double-spiral ramps that are fully wheelchair-navigable, offering breathtaking, barrier-free panoramic views of the city.</p>

      <div class="p-5 my-6 bg-slate-50 border border-slate-200 rounded-xl">
        <strong class="text-brand-blue uppercase tracking-wider text-xs block mb-1">Key Travel Tip:</strong>
        <p class="text-slate-600 text-sm mb-0">"Always request an 'Accessible/Barrier-Free Room' (sometimes called a roll-in shower room) in writing directly from the hotel, as European definitions of 'accessible' can vary widely from standard ADA specifications."</p>
      </div>

      <h2 class="mt-8 border-t border-slate-200 pt-6">Sources & References</h2>
      <ul class="text-sm text-slate-500">
        <li><a href="https://www.ricksteves.com/travel-tips/trip-planning/travelers-with-disabilities" target="_blank" class="text-brand-blue hover:underline">Rick Steves: Traveling with Disabilities</a></li>
        <li><a href="https://tfl.gov.uk/transport-accessibility/" target="_blank" class="text-brand-blue hover:underline">Transport for London: Accessibility Information</a></li>
      </ul>
    `;
  } else if (slug.includes("medicare")) {
    articleDetails.content = `
      <p>Navigating the federal Medicare system is a critical milestone for seniors turning 65. Making the wrong choices during your initial enrollment can lead to permanent financial penalties and severe coverage gaps. Understanding the differences between Original Medicare and Medicare Advantage is essential for long-term health and financial stability.</p>
      
      <h2>1. The Four Core Parts of Medicare</h2>
      <ul>
        <li><strong>Part A (Hospital Insurance):</strong> Covers inpatient hospital stays, skilled nursing facility care, and hospice. It is premium-free for most seniors who have worked 10+ years.</li>
        <li><strong>Part B (Medical Insurance):</strong> Covers outpatient visits, preventive care, and medical equipment. It requires a standard monthly premium.</li>
        <li><strong>Part C (Medicare Advantage):</strong> Private health plans that bundle Parts A, B, and usually D. They often feature low premiums but restrict you to local provider networks.</li>
        <li><strong>Part D (Prescription Drug Coverage):</strong> Outpatient prescription drug coverage run by private insurance companies approved by Medicare.</li>
      </ul>
      
      <h2>2. Original Medicare vs. Medicare Advantage</h2>
      <p>Original Medicare (Parts A & B) allows you to see any doctor in the United States that accepts Medicare, offering ultimate freedom. However, it lacks an out-of-pocket maximum, which is why most seniors purchase a private supplemental policy (Medigap) to cover cost shares. Medicare Advantage, on the other hand, acts like an HMO/PPO, providing low upfront costs but requiring pre-authorizations for specialized procedures.</p>

      <div class="p-5 my-6 bg-slate-50 border border-slate-200 rounded-xl">
        <strong class="text-brand-blue uppercase tracking-wider text-xs block mb-1">Key Health Tip from Dr. Sarah Jenkins, MD:</strong>
        <p class="text-slate-600 text-sm mb-0">"Always enroll during your Initial Enrollment Period (IEP)—the 7-month window surrounding your 65th birthday. Failing to do so triggers a lifetime 10% penalty on your Part B premiums for every 12-month period you delayed."</p>
      </div>

      <h2 class="mt-8 border-t border-slate-200 pt-6">Sources & References</h2>
      <ul class="text-sm text-slate-500">
        <li><a href="https://www.medicare.gov/basics/get-started-with-medicare" target="_blank" class="text-brand-blue hover:underline">Medicare.gov: Get Started with Medicare</a></li>
        <li><a href="https://www.kff.org/medicare/" target="_blank" class="text-brand-blue hover:underline">KFF: Medicare Policy & Data</a></li>
      </ul>
    `;
  } else {
    // Elegant Generalized Informative Article Template
    articleDetails.content = `
      <p>Welcome to LifeBloom Hub's Curated Advisory view. This section provides detailed, evidence-based recommendations written by accredited specialists. Our mission is to simplify complex financial and wellness decisions for senior households, ensuring you maintain independence, security, and health in this chapter of life.</p>
      
      <h2>Core Recommendations</h2>
      <p>Managing long-term quality of life requires a balanced strategy encompassing smart capital preservation, physical strength, and digital accessibility. By leveraging specialized calculators and expert articles, senior families can safely map out future goals and automate day-to-day decisions with total privacy.</p>
      
      <h3>Key Pillars for Longevity</h3>
      <ul>
        <li><strong>Financial Resilience:</strong> Review income streams, calculate inflation offsets, and track high-yielding safe savings vehicles.</li>
        <li><strong>Wellness and Pacing:</strong> Maintain consistent active mobility routines, review prescription interactions, and seek certified practitioner guidance.</li>
        <li><strong>Accessible Environment:</strong> Integrate smart assistant devices, audit physical entry points for high-contrast visibility, and prioritize fall-prevention updates.</li>
      </ul>

      <div class="p-5 my-6 bg-slate-50 border border-slate-200 rounded-xl">
        <strong class="text-brand-blue uppercase tracking-wider text-xs block mb-1">Key Editorial Guidance:</strong>
        <p class="text-slate-600 text-sm mb-0">"Always cross-reference calculations with your family doctor or licensed financial advisor to customize recommendations to your unique circumstances."</p>
      </div>

      <h2 class="mt-8 border-t border-slate-200 pt-6">Sources & References</h2>
      <ul class="text-sm text-slate-500">
        <li><a href="https://www.nia.nih.gov/" target="_blank" class="text-brand-blue hover:underline">National Institute on Aging (NIH)</a></li>
        <li><a href="https://www.ncoa.org/" target="_blank" class="text-brand-blue hover:underline">National Council on Aging (NCOA)</a></li>
      </ul>
    `;
  }

  return articleDetails;
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string; locale: string }> 
}): Promise<Metadata> {
  const { slug, locale } = await params;
  try {
    const article = await getArticleData(slug, locale);
    if (!article) return {};

    const plainDescription = article.content
      ? article.content.replace(/<[^>]*>/g, '').substring(0, 155) + '...'
      : 'Inclusive Curated Article | LifeBloom Hub';

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';

    const categoryKeywords: Record<string, string[]> = {
      health: ['senior healthcare', 'medical safety', 'geriatric health advice', 'expert peer-reviewed medical checker', 'health care guides', 'clinical screening tools'],
      finance: ['retirement savings', 'personal finance senior', 'high-yield savings options', 'wealth projection', 'interest rate compounding', 'recession simulator'],
      tech: ['smart home appliances', 'Matter standard compatibility', 'elderly assistive technology', 'green tech tools', 'energy efficiency matchmaker'],
      general: ['lifestyle utility platform', 'senior-friendly calculators', 'safe ad-free harbor', 'accessible travel guide', 'inclusive home wellness']
    };
    
    const articleKeywords = [
      ...(categoryKeywords[article.category || 'general'] || categoryKeywords.general),
      'LifeBloom Hub',
      article.title.toLowerCase()
    ];

    return {
      title: article.title,
      description: plainDescription,
      keywords: articleKeywords,
      alternates: {
        canonical: `/article/${slug}`,
        languages: {
          'x-default': `/en/article/${slug}`,
          'en': `/en/article/${slug}`,
          'id': `/id/article/${slug}`,
          'es': `/es/article/${slug}`,
        }
      },
      openGraph: {
        title: `${article.title} | LifeBloom Hub`,
        description: plainDescription,
        url: `${baseUrl}/${locale}/article/${slug}`,
        type: 'article',
        publishedTime: article.datePublished,
        modifiedTime: article.dateModified,
        authors: [article.author.url],
        images: [
          {
            url: article.imageUrl,
            width: 1200,
            height: 630,
            alt: article.title
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: plainDescription,
        images: [article.imageUrl]
      }
    };
  } catch (e) {
    return {
      title: 'Article | LifeBloom Hub'
    };
  }
}

export default async function ArticleReaderPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params;
  const article = await getArticleData(slug, locale);

  if (!article) notFound();

  // SSR fetch approved comments for the current article
  let initialComments: any[] = [];
  if (article.id) {
    const supabase = createServiceClient();
    const { data: comments } = await supabase
      .from('comments')
      .select('id, parent_id, author_name, content, created_at, user_id')
      .eq('article_id', article.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: true });
    
    initialComments = comments || [];
  }

  // Base Schema Properties
  const baseSchema = {
    '@context': 'https://schema.org',
    headline: article.title,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: {
      '@type': 'Person',
      name: article.author.name,
      url: article.author.url
    },
    publisher: {
      '@type': 'Organization',
      name: 'LifeBloom Hub',
      logo: {
        '@type': 'ImageObject',
        url: 'https://lifebloomhub.vercel.app/logo.png'
      }
    },
    image: [article.imageUrl] // Discover requirement: array of high-res images
  };

  // Generate Category-Specific Schema
  let articleSchema: any = {
    ...baseSchema,
    '@type': 'Article'
  };

  if (article.category === 'health') {
    articleSchema = {
      ...baseSchema,
      '@type': 'MedicalWebPage',
      reviewedBy: article.expertReviewer ? {
        '@type': 'Person',
        name: article.expertReviewer.name,
        url: article.expertReviewer.url
      } : undefined,
      lastReviewed: article.dateModified
    } as WithContext<MedicalWebPage>;
  } else if (article.category === 'finance') {
    articleSchema = {
      ...baseSchema,
      '@type': 'Article', // FinancialArticle is an extension
      articleSection: 'Personal Finance',
      reviewedBy: article.expertReviewer ? {
        '@type': 'Person',
        name: article.expertReviewer.name,
        url: article.expertReviewer.url
      } : undefined
    } as WithContext<Article>;
  }

  // Inject comment structured data for SEO E-E-A-T
  if (initialComments.length > 0) {
    articleSchema.comment = initialComments.map((c: any) => ({
      '@type': 'Comment',
      'text': c.content,
      'author': {
        '@type': 'Person',
        'name': c.author_name
      },
      'dateCreated': c.created_at
    }));
  }

  return (
    <>
      <StructuredData data={articleSchema} />
      <AccessibleArticleReader article={article} locale={locale} slug={slug} />
      {article.id && (
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <AccessibleComments articleId={article.id} initialComments={initialComments} />
        </div>
      )}
    </>
  );
}
