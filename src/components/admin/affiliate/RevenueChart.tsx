'use client';
// src/components/admin/affiliate/RevenueChart.tsx
// Daily revenue trend (AreaChart) and daily clicks (BarChart) using Recharts.
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface DailyRow {
  day: string;
  total_clicks: number;
  total_conversions: number;
  total_commission_usd: number;
}

interface Props {
  data: DailyRow[];
}

const formatDay = (d: any) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

const formatUSD = (v: number) => `$${v.toFixed(0)}`;

export function RevenueChart({ data }: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* ── Revenue Trend ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-1">Revenue Trend</h3>
        <p className="text-sm text-slate-400 mb-5">Approved commissions (USD)</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#006948" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#006948" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tickFormatter={formatDay} tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis tickFormatter={formatUSD} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={52} />
            <Tooltip
              formatter={(v: any) => [`$${parseFloat(v || 0).toFixed(2)}`, 'Revenue']}
              labelFormatter={formatDay}
              contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }}
            />
            <Area
              type="monotone"
              dataKey="total_commission_usd"
              stroke="#006948"
              strokeWidth={2}
              fill="url(#revenueGrad)"
              dot={false}
              activeDot={{ r: 5, fill: '#006948' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Clicks & Conversions ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-1">Clicks & Conversions</h3>
        <p className="text-sm text-slate-400 mb-5">Daily activity volume</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tickFormatter={formatDay} tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              labelFormatter={formatDay}
              contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="total_clicks"      name="Clicks"      fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="total_conversions" name="Conversions" fill="#006948" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
