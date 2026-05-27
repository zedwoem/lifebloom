import { NextResponse } from 'next/server';
import { ingestRSSFeeds } from '@/lib/services/rssService';

export async function GET(request: Request) {
  // === CRON SECURITY CHECK ===
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('[Cron] Unauthorized attempt blocked.');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await ingestRSSFeeds();

    // Return struktur yang konsisten dengan IngestResult agar cron-trigger route
    // dapat membaca processed, duplicates_blocked, dan youtube_videos_added secara akurat
    return NextResponse.json({
      success: true,
      processed: result.processed,
      duplicates_blocked: result.duplicates_blocked,
      youtube_videos_added: result.youtube_videos_added,
      errors: result.errors.slice(0, 10), // Batas 10 error untuk log singkat
    });
  } catch (error: any) {
    console.error('[RSS Ingest Cron] Fatal error:', error);
    return NextResponse.json({ error: error.message, processed: 0, duplicates_blocked: 0 }, { status: 500 });
  }
}
