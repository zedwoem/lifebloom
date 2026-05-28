"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const locale = "en";

// Parse YouTube URL to extract Embed ID
function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export async function fetchYouTubeMetadata(videoUrl: string) {
  const videoId = extractYouTubeId(videoUrl);
  if (!videoId) {
    return { success: false, error: "Invalid YouTube URL" };
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey === "your_youtube_api_key_here") {
    return { 
      success: false, 
      error: "YouTube API key is not configured. Please set YOUTUBE_API_KEY in your environment variables."
    };
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`
    );
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return { success: false, error: "Video not found on YouTube" };
    }

    const snippet = data.items[0].snippet;
    return {
      success: true,
      data: {
        embedId: videoId,
        title: snippet.title,
        description: snippet.description,
      }
    };
  } catch (error: any) {
    console.error("YouTube API Error:", error);
    return { success: false, error: "Failed to communicate with YouTube API" };
  }
}

export async function ingestVideoAction(payload: {
  youtubeUrl: string;
  pillar: string;
  locale: string;
  titleOverride?: string;
}) {
  const { youtubeUrl, pillar, locale, titleOverride } = payload;

  const supabase = await createClient();
  const { data: isUserAdmin } = await supabase.rpc("is_admin");

  if (!isUserAdmin) {
    return { success: false, error: "Access denied. Admin role required." };
  }

  // 1. Fetch Metadata
  const metaResult = await fetchYouTubeMetadata(youtubeUrl);
  if (!metaResult.success || !metaResult.data) {
    return { success: false, error: metaResult.error };
  }

  const titleToSave = titleOverride && titleOverride.trim() !== "" ? titleOverride : metaResult.data.title;
  const embedId = metaResult.data.embedId;

  // 2. Save to database using Service Role
  const adminClient = createAdminClient();
  
  const { error } = await adminClient.from("videos").insert({
    title: titleToSave,
    embed_id: embedId,
    provider: "youtube",
    pillar: pillar,
    locale: locale,
    video_id: embedId,
    slug: titleToSave.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  });

  if (error) {
    // Catch unique constraint violation
    if (error.code === '23505') {
       return { success: false, error: "This video has already been ingested into the system." };
    }
    console.error("Video Ingestion Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/${pillar}`, "page");
  return { success: true };
}
