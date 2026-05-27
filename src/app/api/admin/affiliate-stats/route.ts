// src/app/api/admin/affiliate-stats/route.ts
// Protected admin-only endpoint — returns aggregated analytics data.
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { secureLogger } from '@/lib/utils/secureLogger';

export const runtime = 'nodejs';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function isAdminRequest(req: Request): Promise<boolean> {
  // Validate admin via anon-key Supabase client + RPC
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return false;

  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    }
  );
  const { data } = await userClient.rpc('is_admin');
  return data === true;
}

export async function GET(req: Request) {
  try {
    // ── Auth Gate ──────────────────────────────────────────────────────────
    const admin = await isAdminRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const days = Math.min(parseInt(searchParams.get('days') ?? '30', 10), 365);
    const since = new Date(Date.now() - days * 86_400_000).toISOString();

    const supabase = getServiceClient();

    // ── Parallel Queries ───────────────────────────────────────────────────
    const [clicksRes, conversionsRes, networkRes, placementRes, dailyRes] =
      await Promise.all([
        // Total clicks
        supabase
          .from('affiliate_clicks')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', since),

        // Total conversions + revenue
        supabase
          .from('affiliate_conversions')
          .select('commission_amount, status, network')
          .gte('created_at', since),

        // Clicks by network
        supabase
          .from('affiliate_clicks')
          .select('network')
          .gte('created_at', since),

        // Clicks by placement
        supabase
          .from('affiliate_clicks')
          .select('placement')
          .gte('created_at', since),

        // Daily trend from view
        supabase
          .from('daily_affiliate_stats')
          .select('*')
          .gte('day', since.slice(0, 10))
          .order('day', { ascending: true }),
      ]);

    // ── Aggregate ──────────────────────────────────────────────────────────
    const convRows = conversionsRes.data ?? [];
    const totalRevenue = convRows.reduce((s, r) => s + (r.commission_amount ?? 0), 0);
    const approvedRevenue = convRows
      .filter((r) => r.status === 'approved' || r.status === 'paid')
      .reduce((s, r) => s + (r.commission_amount ?? 0), 0);

    const networkMap: Record<string, { clicks: number; revenue: number }> = {};
    for (const r of networkRes.data ?? []) {
      if (!r.network) continue;
      networkMap[r.network] ??= { clicks: 0, revenue: 0 };
      networkMap[r.network].clicks++;
    }
    for (const r of convRows) {
      if (!r.network) continue;
      networkMap[r.network] ??= { clicks: 0, revenue: 0 };
      networkMap[r.network].revenue += r.commission_amount ?? 0;
    }

    const placementMap: Record<string, number> = {};
    for (const r of placementRes.data ?? []) {
      if (!r.placement) continue;
      placementMap[r.placement] = (placementMap[r.placement] ?? 0) + 1;
    }

    return NextResponse.json({
      period_days:        days,
      total_clicks:       clicksRes.count ?? 0,
      total_conversions:  convRows.length,
      total_revenue_usd:  parseFloat(totalRevenue.toFixed(2)),
      approved_revenue_usd: parseFloat(approvedRevenue.toFixed(2)),
      by_network:         networkMap,
      by_placement:       placementMap,
      daily_trend:        dailyRes.data ?? [],
    });
  } catch (err) {
    secureLogger.error('AFFILIATE_STATS_ERROR', err);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
