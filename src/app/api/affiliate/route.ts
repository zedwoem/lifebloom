import { NextResponse, unstable_after as after } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/upstash";
import * as Sentry from '@sentry/nextjs';

// Standard serverless runtime to fully support Next.js 15 after() and background operations
export const runtime = 'nodejs';

// Strict validation of incoming request parameters using Zod Schema
const affiliateQuerySchema = z.object({
  network: z.enum(['awin', 'impact', 'shareasale', 'amazon', 'direct', 'travelpayouts']),
  product_id: z.string(),
  pillar: z.string().optional().default('general'),
  calculator_slug: z.string().optional().default('none')
});

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  // Rate Limiting (DDoS Protection) - 30 requests per minute per IP
  const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
  });
  
  const { success } = await ratelimit.limit(`ratelimit_affiliate_${ip}`);
  if (!success) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  
  // Resolve network parameter supporting vendor alias
  const networkParam = searchParams.get('network') || searchParams.get('vendor') || 'direct';

  // Validate input parameters
  const parseResult = affiliateQuerySchema.safeParse({
    network: networkParam,
    product_id: searchParams.get('product_id'),
    pillar: searchParams.get('pillar'),
    calculator_slug: searchParams.get('calculator_slug')
  });

  if (!parseResult.success) {
    return NextResponse.json({ 
      error: 'Invalid Request Parameters', 
      details: parseResult.error.issues 
    }, { status: 400 });
  }

  const { network, product_id, pillar, calculator_slug } = parseResult.data;

  // Initialize lightweight Edge Supabase Client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Construct Unified Sub-ID Parameter (< 100 Characters)
  // Compact format: [user_id_8_char]_[p_short_pillar]_[calc_slug_short]_[time_stamp]
  const shortUserId = user?.id ? user.id.substring(0, 8) : 'anon';
  const shortPillar = pillar.substring(0, 10);
  const shortCalc = calculator_slug.substring(0, 15);
  const timestamp = Math.floor(Date.now() / 1000);
  
  const subId = `${shortUserId}_${shortPillar}_${shortCalc}_${timestamp}`.substring(0, 99);

  // Determine Target URL Based on Official Partner Affiliate Network
  let finalTargetUrl = '';
  switch (network) {
    case 'travelpayouts':
      const travelpayoutsMarker = process.env.TRAVELPAYOUTS_MARKER || '533106';
      finalTargetUrl = `https://travelpayouts.com/click?marker=${travelpayoutsMarker}&sub_id=${subId}&destination=${encodeURIComponent(product_id)}`;
      break;
    case 'awin':
      finalTargetUrl = `https://www.awin1.com/cread.php?awinmid=${product_id}&clickref=${subId}`;
      break;
    case 'impact':
      finalTargetUrl = `https://chewy.partnerlinks.io/c/${product_id}/subId=${subId}`;
      break;
    case 'shareasale':
      finalTargetUrl = `https://www.shareasale.com/u.cfm?d=${product_id}&m=95111&afftrack=${subId}`;
      break;
    case 'amazon':
      finalTargetUrl = `https://www.amazon.com/dp/${product_id}?tag=lifebloom00-20&linkCode=ogi&subId=${subId}`;
      break;
    case 'direct':
    default:
      finalTargetUrl = `https://partner.lively-device.com/click?pid=${product_id}&track=${subId}`;
      break;
  }

  // Next.js 15 after(): Execute Click Logging to PostgreSQL in Background (Non-Blocking)
  after(async () => {
    try {
      // Use Service Role Key to bypass RLS for logging events safely
      const supabaseAdmin = createSupabaseAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { error: dbError } = await supabaseAdmin
        .from('affiliate_clicks')
        .insert({
          user_id: user?.id || null, // Handles anonymous gracefully
          calculator_slug: calculator_slug,
          sub_id: subId,
          converted: false
        });

      if (dbError) {
        console.error("[Affiliate Proxy Log DB Error] Failed to record click:", dbError);
      }
    } catch (err) {
      console.error("[Affiliate Proxy Process Exception] Execution failed:", err);
      Sentry.captureException(err);
    }
  });

  // Immediately redirect user to target link (Response Time < 80ms)
  const response = NextResponse.redirect(finalTargetUrl, 307);
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  return response;
}
