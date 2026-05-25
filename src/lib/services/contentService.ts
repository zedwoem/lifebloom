import { createClient } from "@supabase/supabase-js";

// Use standard Node.js fetch inside Server Actions/Utilities
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface Article {
  id: string;
  title: string;
  description: string;
  link: string;
  pub_date: string;
  pillar: string;
  view_count: number;
  created_at: string;
}

export async function getPopularPostsByPillar(pillar: string, limit: number = 3): Promise<Article[]> {
  try {
    // We use Supabase RPC directly.
    const { data, error } = await supabase.rpc("get_popular_posts_by_pillar", {
      p_pillar: pillar,
      p_limit: limit
    });
    if (error) throw error;
    return data as Article[];
  } catch (error) {
    console.error("Error fetching popular posts:", error);
    return [];
  }
}

export async function getRandomPostsByPillar(pillar: string, limit: number = 3): Promise<Article[]> {
  try {
    const { data, error } = await supabase.rpc("get_random_posts_by_pillar", {
      p_pillar: pillar,
      p_limit: limit
    });
    if (error) throw error;
    return data as Article[];
  } catch (error) {
    console.error("Error fetching random posts:", error);
    return [];
  }
}

export async function getNewPosts(limit: number = 5): Promise<Article[]> {
  try {
    const { data, error } = await supabase.rpc("get_new_posts", { p_limit: limit });
    if (error) throw error;
    return data as Article[];
  } catch (error) {
    console.error("Error fetching new posts:", error);
    return [];
  }
}
