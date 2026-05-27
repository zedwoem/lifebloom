import { NextResponse } from 'next/server';
import { processPendingArticlesBatch } from '@/lib/services/rssService';

export async function GET(request: Request) {
  // === CRON SECURITY CHECK ===
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('[Cron] Unauthorized attempt blocked.');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Process exactly 2 articles per execution to be safe from 10s timeouts
    const result = await processPendingArticlesBatch(2);

    return NextResponse.json({
      success: true,
      processed: result.processed,
      errors: result.errors,
    });
  } catch (error: any) {
    console.error('[Process Queue Cron] Fatal error:', error);
    return NextResponse.json({ error: error.message, processed: 0 }, { status: 500 });
  }
}
