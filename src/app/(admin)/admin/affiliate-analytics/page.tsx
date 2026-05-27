'use client';
// src/app/(admin)/admin/affiliate-analytics/page.tsx
// Admin-only affiliate analytics dashboard — fetches stats, renders charts & tables.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, TrendingUp } from 'lucide-react';
import { AffiliateOverview } from '@/components/admin/affiliate/AffiliateOverview';
import { RevenueChart } from '@/components/admin/affiliate/RevenueChart';
import { NetworkBreakdown } from '@/components/admin/affiliate/NetworkBreakdown';
import { CommissionsTable } from '@/components/admin/affiliate/CommissionsTable';

type Period = 7 | 30 | 90;

interface StatsPayload {
  period_days: number;
  total_clicks: number;
  total_conversions: number;
  total_revenue_usd: number;
  approved_revenue_usd: number;
  by_network: Record<string, { clicks: number; revenue: number }>;
  by_placement: Record<string, number>;
  daily_trend: { day: string; total_clicks: number; total_conversions: number; total_commission_usd: number }[];
}

interface Conversion {
  id: string;
  network: string;
  transaction_id: string;
  commission_amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'declined' | 'paid';
  created_at: string;
}

export default function AffiliateAnalyticsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [period, setPeriod]   = useState<Period>(30);
  const [stats, setStats]     = useState<StatsPayload | null>(null);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Auth Gate ──────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.rpc('is_admin').then(({ data }) => {
      if (data !== true) {
        toast.error('Access denied.');
        router.push('/admin');
      } else {
        setIsAdmin(true);
      }
    });
  }, []);

  // ── Data Fetch ─────────────────────────────────────────────────────────────
  async function fetchData(days: Period) {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(`/api/admin/affiliate-stats?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      const json: StatsPayload = await res.json();
      setStats(json);

      // Fetch recent conversions directly for the table
      const since = new Date(Date.now() - days * 86_400_000).toISOString();
      const { data: convData } = await (supabase as any)
        .from('affiliate_conversions')
        .select('id, network, transaction_id, commission_amount, currency, status, created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(100);
      setConversions((convData ?? []) as any as Conversion[]);
    } catch (e) {
      toast.error('Could not load affiliate data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin) fetchData(period);
  }, [isAdmin, period]);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006948]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] px-6 py-10 font-sans">
      <div className="max-w-[1200px] mx-auto space-y-8">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:border-slate-300 transition-colors"
              aria-label="Back to Admin"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-[#006948]" />
                <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                  Revenue Intelligence
                </span>
              </div>
              <h1
                className="text-3xl font-extrabold text-slate-900 tracking-tight"
                style={{ fontFamily: 'Atkinson Hyperlegible Next, sans-serif' }}
              >
                AFFILIATE ANALYTICS
              </h1>
            </div>
          </div>

          {/* Period selector + refresh */}
          <div className="flex items-center gap-2">
            {([7, 30, 90] as Period[]).map((d) => (
              <button
                key={d}
                onClick={() => setPeriod(d)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors border ${
                  period === d
                    ? 'bg-[#006948] text-white border-[#006948]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {d}d
              </button>
            ))}
            <button
              onClick={() => fetchData(period)}
              disabled={loading}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:border-slate-300 transition-colors disabled:opacity-50"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* ── KPI Overview ────────────────────────────────────────────────── */}
        {stats ? (
          <AffiliateOverview
            totalClicks={stats.total_clicks}
            totalConversions={stats.total_conversions}
            totalRevenueUsd={stats.total_revenue_usd}
            approvedRevenueUsd={stats.approved_revenue_usd}
          />
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 h-28 animate-pulse" />
            ))}
          </div>
        )}

        {/* ── Charts ──────────────────────────────────────────────────────── */}
        {stats ? (
          <RevenueChart data={stats.daily_trend} />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 h-60 animate-pulse" />
            ))}
          </div>
        )}

        {/* ── Network Breakdown ────────────────────────────────────────────── */}
        {stats ? (
          <NetworkBreakdown byNetwork={stats.by_network} />
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 h-48 animate-pulse" />
        )}

        {/* ── Top Placements ───────────────────────────────────────────────── */}
        {stats && Object.keys(stats.by_placement).length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Top Placements by Clicks</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(stats.by_placement)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([placement, clicks]) => (
                  <div key={placement} className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 truncate mb-1">{placement}</p>
                    <p className="text-xl font-bold text-slate-900">{clicks.toLocaleString()}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── Conversions Table ────────────────────────────────────────────── */}
        <CommissionsTable conversions={conversions} />

      </div>
    </div>
  );
}
