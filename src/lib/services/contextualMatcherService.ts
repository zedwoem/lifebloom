import { redis } from '@/lib/upstash';
import { supabase } from '@/lib/supabase/server';

export interface ProductRecord {
  id: string;
  network: string;
  network_product_id: string;
  name: string;
  description: string;
  pillar: string;
  category: string;
  tags: string[];
  image_url: string;
  base_commission_rate: number;
  is_recurring: boolean;
  target_url: string;
  priority_score: number;
}

export interface ScoredProduct extends ProductRecord {
  score: number;
  reason: string;
}

interface MatcherInput {
  pillar: string;
  calculatorSlug?: string;
  calculatorOutput?: Record<string, any>;
  articleKeywords?: string[];
  limit?: number;
}

export class ContextualMatcherService {
  private static CACHE_TTL = 3600 * 12; // 12 Hours cache for API efficiency

  public static async getRecommendations(input: MatcherInput): Promise<ScoredProduct[]> {
    const { pillar, calculatorSlug = 'none', calculatorOutput = {}, articleKeywords = [], limit = 3 } = input;
    
    const cacheKey = `cme:v2:${pillar}:${calculatorSlug}:${JSON.stringify(calculatorOutput)}:${articleKeywords.sort().join(',')}`;
    
    // 1. Upstash Redis Caching Layer (Fast Path)
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
      }
    } catch (cacheError) {
      console.error("[CME Cache Error] Failed to load from Upstash Redis:", cacheError);
    }

    // 2. Query Database Supabase (Fallback Path)
    const { data: dbProducts, error } = await supabase
      .from('products')
      .select('*')
      .eq('pillar', pillar)
      .eq('is_active', true);

    if (error || !dbProducts) {
      console.error("[CME DB Error] Failed to fetch product catalog:", error);
      return this.getStaticFallback(pillar, limit);
    }

    // 3. Execute Weighted Scoring Engine
    const scoredProducts: ScoredProduct[] = dbProducts.map((prod: ProductRecord) => {
      let score = prod.priority_score || 50;
      let reasons: string[] = [];

      // Weight 1: Calculator Parameter Matching (Weight: +30)
      if (calculatorOutput && Object.keys(calculatorOutput).length > 0) {
        if (calculatorOutput.currentSavings > 500000 && prod.category === 'retirement') {
          score += 30;
          reasons.push("Sempurna untuk mengamankan aset pensiun portofolio besar Anda.");
        }
        if (calculatorOutput.dogSize === 'large' && prod.tags.includes('large-breed')) {
          score += 30;
          reasons.push("Disisipkan khusus untuk kebutuhan nutrisi ras anjing besar.");
        }
        if (calculatorOutput.renovationBudget > 10000 && prod.category === 'iot-device') {
          score += 30;
          reasons.push("Direkomendasikan untuk paket renovasi aksesibilitas rumah menyeluruh.");
        }
      }

      // Weight 2: Semantic Article Keyword Matching (Weight: +15 per Keyword)
      if (articleKeywords && articleKeywords.length > 0) {
        const matchingTags = prod.tags.filter(tag => 
          articleKeywords.some(kw => kw.toLowerCase() === tag.toLowerCase())
        );
        if (matchingTags.length > 0) {
          score += matchingTags.length * 15;
          reasons.push(`Sesuai dengan pembahasan topik: ${matchingTags.join(', ')}.`);
        }
      }

      // Weight 3: Recurring Commission Model Priority (Recurring Bonus)
      if (prod.is_recurring) {
        score += 10;
      }

      const finalReason = reasons.length > 0 
        ? reasons.join(" ") 
        : `Layanan tepercaya yang sangat direkomendasikan untuk kebutuhan segmen ${pillar}.`;

      return {
        ...prod,
        score,
        reason: finalReason
      };
    });

    const finalRecommendations = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Save calculation to Upstash Redis
    try {
      await redis.set(cacheKey, JSON.stringify(finalRecommendations), { ex: this.CACHE_TTL });
    } catch (saveError) {
      console.error("[CME Cache Save Error] Failed to write to Upstash Redis:", saveError);
    }

    return finalRecommendations;
  }

  // Final Protection Layer (Hardcoded Static Fallbacks per Pillar)
  private static getStaticFallback(pillar: string, limit: number): ScoredProduct[] {
    const STATIC_FALLBACKS: Record<string, ScoredProduct[]> = {
      'senior': [
        {
          id: 'fb-senior-lively',
          network: 'direct',
          network_product_id: 'lively-alert',
          name: "Lively Mobile Plus (Best Buy Health)",
          description: "Alat deteksi jatuh darurat portabel khusus lansia dengan tombol respons instan 24/7.",
          pillar: 'senior',
          category: 'medical-alert',
          tags: ['safety', 'emergency', 'health'],
          image_url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=300',
          base_commission_rate: 75.00,
          is_recurring: false,
          target_url: 'https://lively.pxf.io/lifebloom-alert',
          priority_score: 100,
          score: 100,
          reason: "Rekomendasi utama untuk keselamatan aktivitas harian lansia di rumah."
        }
      ],
      'pet-family': [
        {
          id: 'fb-pet-chewy',
          network: 'impact',
          network_product_id: 'chewy-autoship',
          name: "Chewy Autoship Program",
          description: "Pengiriman otomatis makanan dan suplemen hewan peliharaan harian dengan diskon tambahan.",
          pillar: 'pet-family',
          category: 'pet-food',
          tags: ['nutrition', 'dog', 'cat', 'autoship'],
          image_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300',
          base_commission_rate: 15.00,
          is_recurring: true,
          target_url: 'https://chewy.partnerlinks.io/lifebloom',
          priority_score: 95,
          score: 95,
          reason: "Solusi termudah agar kebutuhan nutrisi hewan peliharaan Anda selalu terpenuhi tepat waktu."
        }
      ]
    };

    return STATIC_FALLBACKS[pillar]?.slice(0, limit) || [];
  }
}
