"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';

const MOCK_CRON_DATA = [
  { time: '00:00', health: 100 },
  { time: '04:00', health: 98 },
  { time: '08:00', health: 100 },
  { time: '12:00', health: 100 },
  { time: '16:00', health: 95 },
  { time: '20:00', health: 100 },
];

export function B2BAdminDashboard() {
  const [placements, setPlacements] = useState([
    { id: 1, vendor: 'Matter Standard Alliance', slot: 'Smart Home Hub', active: true },
    { id: 2, vendor: 'Fidelity Investments', slot: 'Yield Radar Top Pick', active: true }
  ]);

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen bg-slate-50">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-800">Admin: B2B Placements & System Health</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Tremor-style Area Chart for Cron Health */}
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-blue" /> Vercel Crons Freshness Signals
              </CardTitle>
              <span className="flex items-center gap-1 text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-4 h-4" /> All Systems Healthy
              </span>
            </div>
          </CardHeader>
          <div className="p-6 pt-0">
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_CRON_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} domain={[90, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="health" stroke="#3b82f6" strokeWidth={3} fill="#eff6ff" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* B2B Placements CRUD Panel */}
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-green" /> Sponsored Placements
            </CardTitle>
          </CardHeader>
          <div className="p-6 pt-0">
            <div className="space-y-4">
              {placements.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div>
                    <h3 className="font-bold text-slate-800">{p.vendor}</h3>
                    <p className="text-sm text-slate-500">Slot: {p.slot}</p>
                  </div>
                  <Button variant="outline" className={p.active ? "text-green-600 border-green-200 bg-green-50" : ""}>
                    {p.active ? 'Active' : 'Inactive'}
                  </Button>
                </div>
              ))}
              <Button className="w-full mt-4 bg-brand-blue hover:bg-brand-blue-dark">
                + Upload New Partner Logo & Slot
              </Button>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
