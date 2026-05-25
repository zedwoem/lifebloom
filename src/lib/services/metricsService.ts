import { createClient } from '@/lib/supabase/client';

export type ContentType = 'article' | 'tool' | 'page';

export interface ContentMetric {
  id: string;
  slug: string;
  content_type: ContentType;
  title: string;
  category: string;
  total_views: number;
  trending_score: number;
  last_updated: string;
}

export const MetricsService = {
  /**
   * Tracks a view for a specific content piece. 
   * Uses RPC to handle upsert logic and bypass RLS for inserts securely.
   */
  async recordView(slug: string, type: ContentType, title: string, category: string, userId?: string) {
    if (process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true') {
      return; // Skip DB call in mock mode
    }

    const supabase = createClient();
    
    // Call the RPC we created in migration 007
    const { error } = await supabase.rpc('increment_content_view', {
      p_slug: slug,
      p_type: type,
      p_title: title,
      p_category: category,
      p_user_id: userId || null
    });

    if (error) {
      console.error('Failed to record view:', error);
    }
  },

  async getTrending(limit: number = 5): Promise<ContentMetric[]> {
    if (process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true') {
      return []; // Return empty in mock mode, global-search fallback will handle it
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('content_metrics')
        .select('*')
        .order('trending_score', { ascending: false })
        .limit(limit);
        
      if (error) {
        console.warn("[MetricsService] Supabase getTrending returned error:", error.message);
        return [];
      }
      return (data || []) as ContentMetric[];
    } catch (e: any) {
      console.warn("[MetricsService] getTrending failed gracefully:", e.message || e);
      return [];
    }
  },

  async getPopular(limit: number = 5): Promise<ContentMetric[]> {
    if (process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true') {
      return []; 
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('content_metrics')
        .select('*')
        .order('total_views', { ascending: false })
        .limit(limit);
        
      if (error) {
        console.warn("[MetricsService] Supabase getPopular returned error:", error.message);
        return [];
      }
      return (data || []) as ContentMetric[];
    } catch (e: any) {
      console.warn("[MetricsService] getPopular failed gracefully:", e.message || e);
      return [];
    }
  },

  async getRandom(limit: number = 5): Promise<ContentMetric[]> {
    if (process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true') {
      return []; 
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('content_metrics')
        .select('*')
        .limit(50);
        
      if (error) {
        console.warn("[MetricsService] Supabase getRandom returned error:", error.message);
        return [];
      }
      
      const array = [...((data || []) as ContentMetric[])];
      if (array.length === 0) return [];
      
      // Shuffle array using Fisher-Yates
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      
      return array.slice(0, limit);
    } catch (e: any) {
      console.warn("[MetricsService] getRandom failed gracefully:", e.message || e);
      return [];
    }
  }
};

