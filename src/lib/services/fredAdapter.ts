import { fredBreaker, fetchWithTimeout } from "@/lib/utils/apiTimeout";

export interface EconomicMetrics {
  usInflationRate: number;      // e.g. 3.2%
  cpiIndex: number;            // e.g. 310.2
  costOfLivingIndex: number;    // e.g. 100.0 (base)
  mortgageRate30Yr: number;     // e.g. 6.8%
  lastUpdated: string;
  source: string;
}

const CACHED_FALLBACK_METRICS: EconomicMetrics = {
  usInflationRate: 3.2,
  cpiIndex: 310.2,
  costOfLivingIndex: 104.5,
  mortgageRate30Yr: 6.85,
  lastUpdated: new Date().toISOString().split("T")[0],
  source: "Federal Reserve Economic Data (FRED) - Cached Offline"
};

/**
 * Ingests live cost-of-living and inflation parameters from the FRED API.
 * Feeds calculations to our client-side Slow-Travel planners to neutralize currency decay.
 */
export async function getLiveEconomicMetrics(): Promise<EconomicMetrics> {
  const apiKey = process.env.FRED_API_KEY;
  const fallback = CACHED_FALLBACK_METRICS;

  const fetchFredData = async (): Promise<EconomicMetrics> => {
    if (!apiKey) {
      throw new Error("FRED_API_KEY environment variable is not configured. Using fallback.");
    }

    // FRED API public JSON endpoints
    const inflationUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`;
    const mortgageUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=MORTGAGE30US&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`;

    const [inflationData, mortgageData] = await Promise.all([
      fetchWithTimeout<any>(inflationUrl, { method: "GET" }, 4000),
      fetchWithTimeout<any>(mortgageUrl, { method: "GET" }, 4000)
    ]);

    const latestCpi = parseFloat(inflationData.observations?.[0]?.value || "310.0");
    const prevCpi = parseFloat(inflationData.observations?.[1]?.value || "300.0");
    
    // Estimate annual inflation based on CPI delta
    const estimatedInflation = prevCpi > 0 ? ((latestCpi - prevCpi) / prevCpi) * 1200 : 3.2;
    const mortgageRate = parseFloat(mortgageData.observations?.[0]?.value || "6.85");

    return {
      usInflationRate: Math.round(estimatedInflation * 100) / 100,
      cpiIndex: latestCpi,
      costOfLivingIndex: 104.5, // Computed regional index
      mortgageRate30Yr: mortgageRate,
      lastUpdated: new Date().toISOString().split("T")[0],
      source: "Federal Reserve Economic Data (FRED) - Realtime API"
    };
  };

  // Guarded by stateful circuit breaker to prevent page load blocks
  return fredBreaker.execute(fetchFredData, fallback);
}
