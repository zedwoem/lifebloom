import { NextResponse } from 'next/server';
import { ingestRSSFeeds } from '@/lib/services/rssService';

export async function GET(request: Request) {
  // === CRON SECURITY CHECK ===
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('Unauthorized Cron Attempt blocked.');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const results = await ingestRSSFeeds('en');
    return NextResponse.json({ success: true, processed: results });
  } catch (error: any) {
    console.error('RSS Ingest Cron Failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
