'use client';
// src/components/admin/affiliate/NetworkBreakdown.tsx
// Horizontal bar breakdown by network — clicks + revenue side-by-side.
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

interface NetworkStat {
  network: string;
  clicks: number;
  revenue: number;
}

interface Props {
  byNetwork: Record<string, { clicks: number; revenue: number }>;
}

const COLORS = ['#006948', '#6366f1', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6'];

export function NetworkBreakdown({ byNetwork }: Props) {
  const data: NetworkStat[] = Object.entries(byNetwork)
    .map(([network, stats]) => ({ network, ...stats }))
    .sort((a, b) => b.clicks - a.clicks);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-center h-48 text-slate-400">
        No network data yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-1">Network Performance</h3>
      <p className="text-sm text-slate-400 mb-5">Clicks & estimated revenue per network</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clicks chart */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Clicks</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart layout="vertical" data={data} margin={{ top: 0, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="network" tick={{ fontSize: 12, fontWeight: 600 }} width={100} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="clicks" radius={[0, 4, 4, 0]}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue table */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Revenue (USD)</p>
          <div className="space-y-2">
            {data.map((row, i) => (
              <div key={row.network} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-sm font-semibold text-slate-700 capitalize">{row.network}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  ${row.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
