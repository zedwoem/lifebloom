'use client';
// src/components/admin/affiliate/CommissionsTable.tsx
// Recent conversions table with status badge and filter controls.
import { useState } from 'react';
import { CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';

type Status = 'pending' | 'approved' | 'declined' | 'paid';

interface Conversion {
  id: string;
  network: string;
  transaction_id: string;
  commission_amount: number;
  currency: string;
  status: Status;
  created_at: string;
}

interface Props {
  conversions: Conversion[];
}

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ElementType; className: string }> = {
  pending:  { label: 'Pending',  icon: Clock,       className: 'bg-amber-50  text-amber-700  border-amber-200'  },
  approved: { label: 'Approved', icon: CheckCircle, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  declined: { label: 'Declined', icon: XCircle,     className: 'bg-rose-50   text-rose-700   border-rose-200'   },
  paid:     { label: 'Paid',     icon: DollarSign,  className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

const FILTERS: Array<Status | 'all'> = ['all', 'pending', 'approved', 'declined', 'paid'];

export function CommissionsTable({ conversions }: Props) {
  const [filter, setFilter] = useState<Status | 'all'>('all');

  const filtered = filter === 'all'
    ? conversions
    : conversions.filter((c) => c.status === filter);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header + Filters */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Recent Conversions</h3>
          <p className="text-sm text-slate-400">{filtered.length} records</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors border ${
                filter === f
                  ? 'bg-[#006948] text-white border-[#006948]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['Network', 'Transaction ID', 'Commission', 'Status', 'Date'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                  No conversions found.
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const cfg = STATUS_CONFIG[c.status];
                const Icon = cfg.icon;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-700 capitalize">{c.network}</td>
                    <td className="px-5 py-4 font-mono text-slate-500 text-xs">{c.transaction_id}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {c.currency} {c.commission_amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${cfg.className}`}>
                        <Icon className="w-3.5 h-3.5" aria-hidden />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
