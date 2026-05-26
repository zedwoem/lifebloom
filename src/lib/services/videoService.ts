import { createClient } from "@supabase/supabase-js";

// Use standard Node.js fetch inside Server Actions/Utilities
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface TranscriptLine {
  time: number;
  text: string;
}

export interface VideoItem {
  id: string;
  title: string;
  embed_id: string;
  provider: 'youtube' | 'vimeo';
  pillar: string;
  locale: string;
  category?: string;
  description?: string;
  transcripts?: TranscriptLine[];
  created_at: string;
}

export const getAllVideos = async (limit: number = 3, locale: string = 'en', pillar?: string): Promise<VideoItem[]> => {
  try {
    const { data, error } = await supabase.rpc("get_latest_videos", {
      p_limit: limit,
      p_locale: locale,
      p_pillar: pillar || null
    });
    
    if (error) {
      console.error("[videoService] Error fetching videos:", error.message);
      return [];
    }
    
    return (data || []).map((v: any) => ({
      ...v,
      category: v.pillar,
      transcripts: Array.isArray(v.transcript) ? v.transcript : []
    })) as VideoItem[];
  } catch (error) {
    console.error("[videoService] Unexpected error:", error);
    return [];
  }
};
