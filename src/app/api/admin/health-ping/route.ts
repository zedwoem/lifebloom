import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function measurePing(url: string, headers: HeadersInit = {}): Promise<{ statusCode: number; latencyMs: number; errorPayload?: string }> {
  const start = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, {
      headers,
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeoutId);
    const latency = performance.now() - start;

    return {
      statusCode: res.status,
      latencyMs: Number(latency.toFixed(2)),
      errorPayload: res.ok ? undefined : `HTTP Error ${res.status}: ${res.statusText}`
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    const latency = performance.now() - start;
    const isTimeout = error.name === 'AbortError';
    return {
      statusCode: isTimeout ? 408 : 500,
      latencyMs: Number(latency.toFixed(2)),
      errorPayload: (error.message || 'Unknown Network Error').substring(0, 500)
    };
  }
}

export async function GET(req: Request) {
  // Simple token authentication
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const cronSecret = process.env.CRON_SECRET || 'lifebloom-cron-secret';

  if (secret !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apis = [
    { name: 'OpenFDA', url: 'https://api.fda.gov/drug/event.json?limit=1' },
    { name: 'RxNav', url: 'https://rxnav.nlm.nih.gov/REST/version.json' },
    { name: 'Amadeus', url: 'https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=NYC&destinationLocationCode=LON&adults=1' }
  ];

  const results = [];

  for (const api of apis) {
    const check = await measurePing(api.url);
    
    // Log to Supabase
    const { error } = await supabase
      .from('api_health_logs')
      .insert({
        api_name: api.name,
        status_code: check.statusCode,
        latency_ms: check.latencyMs,
        error_payload: check.errorPayload
      });

    if (error) {
      console.error(`[Health-Ping] Database write failure for ${api.name}:`, error.message);
    }

    results.push({
      apiName: api.name,
      ...check
    });
  }

  return NextResponse.json({ success: true, results });
}
