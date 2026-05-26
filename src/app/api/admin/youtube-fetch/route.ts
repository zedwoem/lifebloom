import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const profile = profileData as { role: string | null } | null;

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("id");

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    const isMock = !apiKey || apiKey === "your_youtube_api_key_here";

    if (isMock) {
      // Robust and realistic Elder Wellness / Financial mock data for graceful testing
      const mockDb: Record<string, any> = {
        "dQw4w9WgXcQ": {
          title: "Rick Astley - Never Gonna Give You Up (Official Music Video)",
          description: "The official video for 'Never Gonna Give You Up' by Rick Astley. Essential wellness and musical nostalgia for generational cognitive exercises.",
          thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
          duration: "3:33",
          provider: "youtube",
          warning: "Using local mock fallback. Set YOUTUBE_API_KEY in .env.local to query real live data."
        },
        "default": {
          title: `Panduan Kesehatan Lansia & Nutrisi Makro (Video #${videoId})`,
          description: "Sebuah video informatif berdurasi penuh mengenai nutrisi penting, pola makan ramah pencernaan, serta olahraga ringan terarah untuk menunjang kebugaran lansia di atas usia 65 tahun.",
          thumbnail: `https://images.unsplash.com/photo-1543333995-a78aea2eee52?q=80&w=640&auto=format&fit=crop`,
          duration: "12:45",
          provider: "youtube",
          warning: "Using local mock fallback. Set YOUTUBE_API_KEY in .env.local to query real live data."
        }
      };

      const result = mockDb[videoId] || {
        ...mockDb["default"],
        title: `Multimedia Integration Guide for Elder Care (#${videoId})`
      };

      return NextResponse.json(result);
    }

    // Call real YouTube Data API v3
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`YouTube API returned status: ${res.status}`);
    }

    const data = await res.json();
    
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: "Video not found on YouTube" }, { status: 404 });
    }

    const item = data.items[0];
    const snippet = item.snippet;
    const contentDetails = item.contentDetails;

    // Parse YouTube ISO 8601 duration (e.g. PT15M33S -> 15:33)
    const isoDuration = contentDetails?.duration || "";
    let durationFormatted = "0:00";
    const matches = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (matches) {
      const hours = parseInt(matches[1] || "0", 10);
      const minutes = parseInt(matches[2] || "0", 10);
      const seconds = parseInt(matches[3] || "0", 10);
      
      const parts = [];
      if (hours > 0) parts.push(hours);
      parts.push(hours > 0 ? String(minutes).padStart(2, "0") : minutes);
      parts.push(String(seconds).padStart(2, "0"));
      durationFormatted = parts.join(":");
    }

    const thumbnail = snippet.thumbnails?.maxres?.url || 
                      snippet.thumbnails?.high?.url || 
                      snippet.thumbnails?.medium?.url || 
                      snippet.thumbnails?.default?.url || "";

    return NextResponse.json({
      title: snippet.title || "",
      description: snippet.description || "",
      thumbnail,
      duration: durationFormatted,
      provider: "youtube"
    });

  } catch (error: any) {
    console.error("[youtube-fetch] Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch video details from YouTube" }, { status: 500 });
  }
}
