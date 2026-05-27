'use client';
// src/components/admin/affiliate/AffiliateOverview.tsx
// KPI summary cards — total clicks, conversions, revenue, approval rate.
import { TrendingUp, MousePointerClick, DollarSign, CheckCircle } from 'lucide-react';

interface Props {
  totalClicks: number;
  totalConversions: number;
  totalRevenueUsd: number;
  approvedRevenueUsd: number;
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500 mb-1">{label}</p>
        <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export function AffiliateOverview({ totalClicks, totalConversions, totalRevenueUsd, approvedRevenueUsd }: Props) {
  const ctr = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0.0';
  const approvalRate = totalRevenueUsd > 0
    ? ((approvedRevenueUsd / totalRevenueUsd) * 100).toFixed(0)
    : '0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      <KpiCard
        label="Total Clicks"
        value={totalClicks.toLocaleString()}
        icon={MousePointerClick}
        color="bg-indigo-50 text-indigo-600"
      />
      <KpiCard
        label="Conversions"
        value={totalConversions.toLocaleString()}
        sub={`${ctr}% conversion rate`}
        icon={TrendingUp}
        color="bg-emerald-50 text-emerald-600"
      />
      <KpiCard
        label="Total Revenue"
        value={`$${totalRevenueUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        sub="All statuses"
        icon={DollarSign}
        color="bg-amber-50 text-amber-600"
      />
      <KpiCard
        label="Approved Revenue"
        value={`$${approvedRevenueUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        sub={`${approvalRate}% approved`}
        icon={CheckCircle}
        color="bg-[#f5fff7] text-[#006948]"
      />
    </div>
  );
}
