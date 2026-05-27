import { NextResponse } from 'next/server';
import { batchProcessPendingTranscripts } from '@/lib/services/videoTranscriptService';

export async function GET(request: Request) {
  // === CRON SECURITY CHECK ===
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('[Cron] Unauthorized attempt blocked for fetch-transcripts.');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    console.log('[Cron] Starting batch ingestion of pending video transcripts.');
    const result = await batchProcessPendingTranscripts(5);
    
    return NextResponse.json({
      success: true,
      processed: result.processed,
      failed: result.failed
    });
  } catch (error: any) {
    console.error('[Cron fetch-transcripts] Fatal error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
