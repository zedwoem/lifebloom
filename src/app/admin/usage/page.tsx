'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Activity, MousePointerClick, TrendingUp, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface UsageStats {
  totalClicks: number;
  totalConverted: number;
  totalPoints: number;
}

export default function UsageDashboard() {
  const [stats, setStats] = useState<UsageStats>({ totalClicks: 0, totalConverted: 0, totalPoints: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();
      
      try {
        const { count: clicksCount } = await supabase
          .from('affiliate_clicks')
          .select('*', { count: 'exact', head: true });
          
        const { count: convertedCount } = await supabase
          .from('affiliate_clicks')
          .select('*', { count: 'exact', head: true })
          .eq('converted', true);

        setStats({
          totalClicks: clicksCount || 0,
          totalConverted: convertedCount || 0,
          totalPoints: (clicksCount || 0) * 15 // Mock calculation logic
        });
      } catch (e) {
        console.error("Dashboard error:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Admin Analytics</h1>
        <p className="text-slate-500 mt-2">Platform usage and contextual monetization tracking.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-blue-500 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MousePointerClick className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Affiliate Clicks (Contextual)</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {loading ? '...' : stats.totalClicks.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-green-500 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Conversions Recorded</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {loading ? '...' : stats.totalConverted.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-purple-500 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Bloom Points Distributed</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {loading ? '...' : stats.totalPoints.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Users className="text-slate-400" /> Recent User Activity Stream
        </h3>
        <p className="text-sm text-slate-500">
          The real-time log is active and routing events to Supabase safely via Edge Functions (`after()`). Connect to a BI tool like Metabase for full querying.
        </p>
      </Card>
    </div>
  );
}
