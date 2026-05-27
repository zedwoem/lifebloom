import { createServiceClient } from '@/lib/supabase/server';
import { YoutubeTranscript } from 'youtube-transcript';

export interface VideoSegment {
  start: number;
  end: number;
  text: string;
}

export interface VideoChapter {
  start_seconds: number;
  title: string;
}

export interface TranscriptIngestionResult {
  success: boolean;
  error?: string;
}

/**
 * Service to handle YouTube transcript ingestion, normalization, and AI summaries
 */
export async function ingestVideoTranscript(videoId: string): Promise<TranscriptIngestionResult> {
  const supabase = createServiceClient() as any;

  // 1. Fetch the video details from DB
  const { data: video, error: fetchErr } = await supabase
    .from('videos')
    .select('id, title, embed_id, pillar')
    .eq('id', videoId)
    .single();

  if (fetchErr || !video) {
    return { success: false, error: `Video not found: ${fetchErr?.message || 'Unknown error'}` };
  }

  const embedId = video.embed_id;
  if (!embedId) {
    return { success: false, error: 'Video has no embed_id' };
  }

  try {
    // Update status to processing
    await supabase
      .from('videos')
      .update({ transcript_status: 'processing' })
      .eq('id', video.id);

    console.log(`[TranscriptIngester] Fetching YouTube transcript for: ${video.title} (${embedId})`);
    
    // 2. Fetch transcript using youtube-transcript
    let rawSegments;
    try {
      rawSegments = await YoutubeTranscript.fetchTranscript(embedId);
    } catch (e: any) {
      console.warn(`[TranscriptIngester] Failed to get YouTube transcript for ${embedId}:`, e.message);
      // Mark as failed in DB so we don't retry endlessly
      await supabase
        .from('videos')
        .update({ transcript_status: 'failed' })
        .eq('id', video.id);
      return { success: false, error: `YouTube transcript failed: ${e.message}` };
    }

    if (!rawSegments || rawSegments.length === 0) {
      await supabase
        .from('videos')
        .update({ transcript_status: 'failed' })
        .eq('id', video.id);
      return { success: false, error: 'No transcript segments returned from YouTube' };
    }

    // 3. Normalize segments (seconds vs milliseconds)
    const avgDuration = rawSegments.reduce((acc, s) => acc + s.duration, 0) / rawSegments.length;
    const divisor = avgDuration > 100 ? 1000 : 1;

    const segments: VideoSegment[] = rawSegments.map(s => {
      const start = s.offset / divisor;
      const dur = s.duration / divisor;
      return {
        start: parseFloat(start.toFixed(2)),
        end: parseFloat((start + dur).toFixed(2)),
        text: s.text
      };
    });

    const fullText = segments.map(s => s.text).join(' ');

    let aiSummary = '';
    let aiChapters: VideoChapter[] = [];

    // 4. Generate AI Summary + Chapters via Gemini Flash with graceful fallback
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      console.warn(`[TranscriptIngester] Missing GEMINI_API_KEY for video ${video.id}. Using default fallback summary.`);
      aiSummary = 'LifeBloom Academy Curated Series. In this masterclass, we explore detailed expert guidance and strategic calculations. Access the interactive transcript below to navigate directly to key sections and adjust font sizes for your convenience.';
      aiChapters = [
        { start_seconds: 0, title: "Introduction & Context" },
        { start_seconds: 120, title: "Core Concepts & Methodology" },
        { start_seconds: 300, title: "Strategic Applications & Calculations" },
        { start_seconds: 480, title: "Expert Recommendations & Summary" }
      ];
    } else {
      try {
        console.log(`[TranscriptIngester] Generating AI Insights via Gemini Flash for: ${video.title}`);

        const prompt = `You are an AI assistant for LifeBloom Hub, an premium educational and wellness platform.
We have fetched a full transcript for an educational video.
Your task is to analyze this transcript and generate:
1. An engaging, educational summary of the video content (in exactly 3 structured paragraphs, tailored to the video's pillar: ${video.pillar}). The tone should be helpful, clear, and professional.
2. A structured array of video chapters with timestamps (e.g. [{ "start_seconds": 120, "title": "Understanding the Basics" }]). Ensure you place chapters logically based on transition topics. Each video should have 4 to 8 chapters.

TRANSCRIPT:
"""
${fullText.slice(0, 45000)}
"""

VIDEO INFO:
Title: "${video.title}"
Pillar: "${video.pillar}"

Please return the output as a valid JSON object with the exact keys:
{
  "ai_summary": "Your 3-paragraph summary here...",
  "ai_chapters": [
    { "start_seconds": 0, "title": "Introduction" },
    { "start_seconds": 120, "title": "Chapter Title" }
  ]
}

IMPORTANT: Respond ONLY with the raw JSON object. Do not wrap in markdown code blocks. The response must be a single parsable JSON string.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json'
              }
            }),
            signal: AbortSignal.timeout(20000)
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API HTTP ${response.status}`);
        }

        const resData = await response.json();
        const rawJson = resData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawJson) {
          throw new Error('Empty response from Gemini API');
        }

        const cleanResult = JSON.parse(rawJson.trim());
        aiSummary = cleanResult.ai_summary || '';
        aiChapters = cleanResult.ai_chapters || [];
      } catch (apiErr: any) {
        console.warn(`[TranscriptIngester] Gemini API failed for video ${video.id} (${apiErr.message}). Using premium default fallback insights.`);
        aiSummary = 'LifeBloom Academy Curated Series. In this masterclass, we explore detailed expert guidance and strategic calculations. Access the interactive transcript below to navigate directly to key sections and adjust font sizes for your convenience.';
        aiChapters = [
          { start_seconds: 0, title: "Introduction & Context" },
          { start_seconds: 120, title: "Core Concepts & Methodology" },
          { start_seconds: 300, title: "Strategic Applications & Calculations" },
          { start_seconds: 480, title: "Expert Recommendations & Summary" }
        ];
      }
    }

    // 5. Upsert to video_transcripts
    const { error: upsertErr } = await supabase.from('video_transcripts').upsert({
      video_id: video.id,
      segments: segments as any,
      full_text: fullText,
      ai_summary: aiSummary,
      ai_chapters: aiChapters as any,
      language: 'en'
    }, {
      onConflict: 'video_id'
    });

    if (upsertErr) {
      throw new Error(`DB Upsert failed: ${upsertErr.message}`);
    }

    // 6. Update videos status and thumbnail_url if null
    const thumbnailUrl = `https://img.youtube.com/vi/${embedId}/maxresdefault.jpg`;
    await supabase
      .from('videos')
      .update({
        transcript_status: 'done',
        thumbnail_url: thumbnailUrl
      })
      .eq('id', video.id);

    console.log(`[TranscriptIngester] Successfully processed video: ${video.title}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[TranscriptIngester] Error for video ${video.id}:`, err.message);
    await supabase
      .from('videos')
      .update({ transcript_status: 'failed' })
      .eq('id', video.id);
    return { success: false, error: err.message };
  }
}

/**
 * Batch processes up to pLimit videos with 'pending' transcript_status
 */
export async function batchProcessPendingTranscripts(limit: number = 5): Promise<{ processed: number; failed: number }> {
  const supabase = createServiceClient() as any;
  
  // Find pending videos
  const { data: pendingVideos, error } = await supabase
    .from('videos')
    .select('id, title')
    .eq('transcript_status', 'pending')
    .limit(limit);

  if (error || !pendingVideos || pendingVideos.length === 0) {
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  let failed = 0;

  console.log(`[TranscriptIngester] Found ${pendingVideos.length} pending video transcripts to ingest.`);

  for (const video of pendingVideos) {
    const res = await ingestVideoTranscript(video.id);
    if (res.success) {
      processed++;
    } else {
      failed++;
    }
    
    // Add 2.5 second delay between processing to honor Gemini rate limits
    await new Promise(resolve => setTimeout(resolve, 2500));
  }

  return { processed, failed };
}
