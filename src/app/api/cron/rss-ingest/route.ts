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

    // Trigger processing of exactly 1 pending article synchronously to ensure 
    // immediate content availability while staying safe from Vercel timeouts.
    const { processPendingArticlesBatch } = await import('@/lib/services/rssService');
    const processResult = await processPendingArticlesBatch(1).catch(err => {
      console.error('[RSS Ingest Queue Trigger Error]:', err.message);
      return { processed: 0, errors: [err.message] };
    });

    // Return struktur yang konsisten dengan IngestResult agar cron-trigger route
    // dapat membaca processed, duplicates_blocked, dan youtube_videos_added secara akurat
    return NextResponse.json({
      success: true,
      processed: result.processed,
      processed_rich_articles: processResult.processed,
      duplicates_blocked: result.duplicates_blocked,
      youtube_videos_added: result.youtube_videos_added,
      errors: [...result.errors, ...processResult.errors].slice(0, 10), // Batas 10 error untuk log singkat
    });
  } catch (error: any) {
    console.error('[RSS Ingest Cron] Fatal error:', error);
    return NextResponse.json({ error: error.message, processed: 0, duplicates_blocked: 0 }, { status: 500 });
  }
}
