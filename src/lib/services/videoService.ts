"use server";

import { createServiceClient } from '@/lib/supabase/server';

const locale = "en";

const supabase = createServiceClient() as any;

export interface VideoTranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface VideoChapter {
  start_seconds: number;
  title: string;
}

export interface VideoItem {
  id: string;
  slug: string;
  pillar: string;
  title: string;
  description?: string;
  platform: 'youtube' | 'vimeo' | 'custom';
  video_id: string;
  duration?: number;
  thumbnail_url?: string;
  view_count?: number;
  reaction_helpful?: number;
  reaction_insightful?: number;
  reaction_love?: number;
  transcript_status?: 'pending' | 'processing' | 'done' | 'failed';
  is_active: boolean;
  created_at: string;
  embed_id: string;
  provider: 'youtube' | 'vimeo';
  locale: string;
  category?: string;
  segments?: VideoTranscriptSegment[];
  full_text?: string;
  ai_summary?: string;
  ai_chapters?: VideoChapter[];
}

/**
 * Fetches latest videos with full pagination and pillar filtering using updated RPC
 */
export const getAllVideos = async (
  limit: number = 12,
  locale: string = 'en',
  pillar?: string,
  offset: number = 0
): Promise<VideoItem[]> => {
  try {
    const { data, error } = await supabase.rpc("get_latest_videos", {
      p_limit: limit,
      p_locale: locale,
      p_pillar: pillar || null,
      p_offset: offset
    });
    
    if (error) {
      console.error("[videoService] Error fetching videos:", error.message);
      return [];
    }
    
    return (data || []).map((v: any) => ({
      ...v,
      category: v.pillar,
      // Fallback array for transcript segments
      segments: []
    })) as VideoItem[];
  } catch (error) {
    console.error("[videoService] Unexpected error in getAllVideos:", error);
    return [];
  }
};

/**
 * Retrieves a single video by its slug, including joining its transcript & AI summaries
 */
export const getVideoBySlug = async (slug: string, locale: string = 'en'): Promise<VideoItem | null> => {
  try {
    // 1. Fetch main video
    const { data: video, error } = await supabase
      .from('videos')
      .select('*')
      .eq('slug', slug)
      .eq('locale', locale)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error(`[videoService] Error fetching video by slug ${slug}:`, error.message);
      return null;
    }

    if (!video) return null;

    // 2. Fetch transcript details if 'done'
    let segments: VideoTranscriptSegment[] = [];
    let fullText = '';
    let aiSummary = '';
    let aiChapters: VideoChapter[] = [];

    if (video.transcript_status === 'done') {
      const { data: transcript, error: transErr } = await supabase
        .from('video_transcripts')
        .select('segments, full_text, ai_summary, ai_chapters')
        .eq('video_id', video.id)
        .maybeSingle();

      if (!transErr && transcript) {
        segments = (transcript.segments || []) as VideoTranscriptSegment[];
        fullText = transcript.full_text || '';
        aiSummary = transcript.ai_summary || '';
        aiChapters = (transcript.ai_chapters || []) as VideoChapter[];
      }
    }

    return {
      ...video,
      category: video.pillar,
      segments,
      full_text: fullText,
      ai_summary: aiSummary,
      ai_chapters: aiChapters
    } as VideoItem;
  } catch (error) {
    console.error(`[videoService] Unexpected error in getVideoBySlug for ${slug}:`, error);
    return null;
  }
};

/**
 * Gets related videos in the same pillar, excluding the active video
 */
export const getRelatedVideos = async (
  pillar: string,
  excludeSlug: string,
  limit: number = 3,
  locale: string = 'en'
): Promise<VideoItem[]> => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('pillar', pillar)
      .eq('locale', locale)
      .eq('is_active', true)
      .neq('slug', excludeSlug)
      .order('view_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[videoService] Error fetching related videos:", error.message);
      return [];
    }

    return (data || []).map((v: any) => ({
      ...v,
      category: v.pillar,
      segments: []
    })) as VideoItem[];
  } catch (error) {
    console.error("[videoService] Unexpected error in getRelatedVideos:", error);
    return [];
  }
};

/**
 * Client-safe method to increment the view count of a video
 */
export const incrementViewCount = async (videoId: string): Promise<void> => {
  try {
    // We increment via supabase RPC to handle concurrency safely
    const { error } = await supabase.rpc('increment_video_views', { p_video_id: videoId });
    
    if (error) {
      // Fallback: direct update if RPC is missing
      const { data: current } = await supabase
        .from('videos')
        .select('view_count')
        .eq('id', videoId)
        .single();
      
      const nextViews = (current?.view_count || 0) + 1;
      await supabase
        .from('videos')
        .update({ view_count: nextViews })
        .eq('id', videoId);
    }
  } catch (error) {
    console.error("[videoService] Error incrementing view count:", error);
  }
};

/**
 * Updates reaction counts for a video in database
 */
export const updateVideoReaction = async (
  videoId: string,
  reactionType: 'helpful' | 'insightful' | 'love'
): Promise<{ success: boolean; count: number }> => {
  try {
    const columnName = `reaction_${reactionType}`;
    
    // 1. Fetch current reaction count
    const { data, error: fetchErr } = await supabase
      .from('videos')
      .select(columnName)
      .eq('id', videoId)
      .single();

    if (fetchErr || !data) {
      throw new Error(`Video not found: ${fetchErr?.message}`);
    }

    const currentCount = data[columnName as keyof typeof data] || 0;
    const nextCount = currentCount + 1;

    // 2. Update with incremented value
    const { error: updateErr } = await supabase
      .from('videos')
      .update({ [columnName]: nextCount })
      .eq('id', videoId);

    if (updateErr) {
      throw new Error(`DB update failed: ${updateErr.message}`);
    }

    return { success: true, count: nextCount };
  } catch (error: any) {
    console.error(`[videoService] Error updating video reaction ${reactionType}:`, error.message);
    return { success: false, count: 0 };
  }
};
