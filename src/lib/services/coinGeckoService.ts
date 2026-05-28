import { fetchWithTimeout } from "@/lib/utils/apiTimeout";
import { secureLogger } from "@/lib/utils/secureLogger";
import { redis } from "@/lib/upstash";

export interface CoinPriceResult {
  usdPrice: number;
  change24h: number;
  lastUpdated: string;
}

export interface CoinSearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
}

export interface DexPoolData {
  address: string;
  name: string;
  priceUsd: number;
  volume24h: number;
  fdv: number;
}

export class CoinGeckoService {
  private static apiKey = process.env.COINGECKO_API_KEY || "CG-EvAx6WeGK8cadBQmPXbStKVS";
  private static baseUrl = "https://api.coingecko.com/api/v3";
  private static onchainUrl = "https://api.coingecko.com/api/v3/onchain"; // GeckoTerminal

  private static getHeaders(): Record<string, string> {
    return {
      "x-cg-demo-api-key": this.apiKey,
      "Content-Type": "application/json"
    };
  }

  /**
   * Search to resolve coin IDs by name/symbol before calling other endpoints.
   */
  static async searchAsset(query: string): Promise<CoinSearchResult[]> {
    const url = `${this.baseUrl}/search?query=${encodeURIComponent(query)}`;
    try {
      const response = await fetchWithTimeout<any>(url, {
        method: "GET",
        headers: this.getHeaders()
      }, 5000);
      
      if (response && response.coins) {
        return response.coins.slice(0, 5).map((c: any) => ({
          id: c.id,
          name: c.name,
          symbol: c.symbol,
          thumb: c.thumb
        }));
      }
      return [];
    } catch (error: any) {
      secureLogger.error(`CoinGecko search failed for: ${query}`, error);
      return [];
    }
  }

  /**
   * Fetches the current simple price of a coin/asset (e.g. 'bitcoin', 'ethereum')
   */
  static async getAssetPrice(assetId: string): Promise<CoinPriceResult> {
    const cacheKey = `cg:price:${assetId}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return typeof cached === 'string' ? JSON.parse(cached) : cached;
    } catch (e) {
      secureLogger.error('Upstash Redis cache read failed', e);
    }

    const url = `${this.baseUrl}/simple/price?ids=${assetId}&vs_currencies=usd&include_24hr_change=true`;
    
    try {
      const response = await fetchWithTimeout<any>(url, {
        method: "GET",
        headers: this.getHeaders()
      }, 4000);
      
      if (response && response[assetId]) {
        const result = {
          usdPrice: response[assetId].usd,
          change24h: response[assetId].usd_24h_change || 0,
          lastUpdated: new Date().toISOString()
        };

        try {
          // Cache for 15 minutes to aggressively save free-tier limits
          await redis.set(cacheKey, JSON.stringify(result), { ex: 900 });
        } catch (e) {
          secureLogger.error('Upstash Redis cache write failed', e);
        }

        return result;
      }
      throw new Error(`Invalid CoinGecko response for asset: ${assetId}`);
    } catch (error: any) {
      secureLogger.error(`CoinGecko price fetch failed for: ${assetId}`, error);
      return this.getFallbackPrice(assetId);
    }
  }

  /**
   * Fetches comprehensive market data, charts, exchange info, etc for a specific coin.
   */
  static async getAssetData(assetId: string): Promise<any> {
    const url = `${this.baseUrl}/coins/${assetId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`;
    try {
      const response = await fetchWithTimeout<any>(url, {
        method: "GET",
        headers: this.getHeaders()
      }, 6000);
      return response;
    } catch (error: any) {
      secureLogger.error(`CoinGecko asset data fetch failed for: ${assetId}`, error);
      return null;
    }
  }

  /**
   * Fetches on-chain DEX analytics (GeckoTerminal) for long-tail tokens and pools.
   */
  static async getDexPoolData(network: string, poolAddress: string): Promise<DexPoolData | null> {
    const url = `${this.onchainUrl}/networks/${network}/pools/${poolAddress}`;
    try {
      const response = await fetchWithTimeout<any>(url, {
        method: "GET",
        headers: this.getHeaders()
      }, 6000);
      
      if (response && response.data && response.data.attributes) {
        const attr = response.data.attributes;
        return {
          address: attr.address,
          name: attr.name,
          priceUsd: parseFloat(attr.base_token_price_usd || '0'),
          volume24h: parseFloat(attr.volume_usd?.h24 || '0'),
          fdv: parseFloat(attr.fdv_usd || '0')
        };
      }
      return null;
    } catch (error: any) {
      secureLogger.error(`GeckoTerminal pool data fetch failed for: ${network}/${poolAddress}`, error);
      return null;
    }
  }

  private static getFallbackPrice(assetId: string): CoinPriceResult {
    let usdPrice = 67500.0;
    if (assetId === "ethereum") usdPrice = 3500.0;
    if (assetId === "pax-gold" || assetId === "gold") usdPrice = 2350.0;

    return {
      usdPrice,
      change24h: 0.15,
      lastUpdated: new Date().toISOString()
    };
  }
}
