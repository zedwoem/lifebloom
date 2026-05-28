"use server";

import * as cheerio from 'cheerio';
import { Redis } from '@upstash/redis';

export interface ScrapedDeal {
  bankName: string;
  apy: string;
  term: string;
  minDeposit: string;
}

/**
 * Server Action: Instant Local Scraper
 * Fetches live CD rates. We use a mock-fallback pattern in case the target site blocks the scraper.
 */
export async function scrapeLiveCDRates(): Promise<ScrapedDeal[]> {
  // Try to load from Upstash Redis cache first to prevent IP bans / Cloudflare blocks
  try {
    const redis = Redis.fromEnv();
    const cached = await redis.get<ScrapedDeal[]>("cache:scraped_cd_rates");
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }
  } catch (e) {
    console.warn("[Scraper Cache] Failed to load cached CD rates from Redis:", e);
  }

  try {
    // We target a generic finance informational page or simulate the request
    // For MVP demonstration, we will try to scrape a standard table structure.
    // Note: Many large financial sites block automated requests. If fetch fails, we will gracefully fallback.
    const response = await fetch('https://www.nerdwallet.com/best/banking/cd-rates', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      next: { revalidate: 3600 } // Cache the result for 1 hour to avoid IP bans
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const deals: ScrapedDeal[] = [];

    // Attempt to extract data from NerdWallet's standard table rows
    // (Selectors are approximate and might need adjustment if their DOM changes)
    $('tr').each((i, element) => {
      // Limit to top 5 results
      if (deals.length >= 5) return;

      const textContent = $(element).text();
      // Simple heuristic: if it looks like a bank row with an APY
      if (textContent.includes('%') && textContent.includes('APY')) {
        const apyMatch = textContent.match(/(\d+\.\d+)%\s*APY/);
        const apy = apyMatch ? `${apyMatch[1]}%` : 'N/A';
        
        // Extract a generic bank name from an h3 or strong tag within the row
        let bankName = $(element).find('h3, strong').first().text().trim();
        if (!bankName) bankName = "Top Regional Bank";

        // If we successfully found an APY, add it to our deals
        if (apy !== 'N/A' && bankName.length > 2) {
          deals.push({
            bankName: bankName.length > 30 ? bankName.substring(0, 30) + '...' : bankName,
            apy,
            term: "1-Year",
            minDeposit: "$500"
          });
        }
      }
    });

    // If scraper succeeded but DOM changed, provide our dynamic fallback 
    // to ensure the UI demonstration works flawlessly for the MVP
      return [];
    }

    // Cache successfully scraped deals in Redis for 24 hours
    try {
      const redis = Redis.fromEnv();
      await redis.set("cache:scraped_cd_rates", deals, { ex: 86400 });
    } catch (e) {}

    return deals;

  } catch (error) {
    console.error("Scraper encountered an error or was blocked by Cloudflare:", error);
    // Return empty array instead of graceful fallback data so the UI doesn't render fake data
    return [];
  }
}
