"use client";

import { useAuth } from '@/lib/hooks/useAuth';
import { useGamification } from '@/lib/hooks/useGamification';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Trophy, ShieldCheck, Tag } from 'lucide-react';

export function PremiumDashboard() {
  const { profile } = useAuth();
  const { points } = useGamification();

  // Mock Price Drop Alert
  const priceAlerts = [
    { item: 'Purina Pro Plan Dog Food 30lb', oldPrice: 65.99, newPrice: 58.99, drop: 10.6, vendor: 'Chewy' }
  ];

  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-[#FAF9F6] min-h-screen">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-brand-blue mb-2">Welcome back, {profile.display_name}</h1>
        <p className="text-xl text-slate-600">Your personalized LifeBloom Hub overview.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Bloom Points Wallet */}
        <Card className="bg-white border-2 border-[#E5E0D8] shadow-sm rounded-3xl overflow-hidden">
          <div className="bg-[#F5F0E6] p-4 border-b border-[#E5E0D8]">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-slate-800">Bloom Points Wallet</h2>
            </div>
          </div>
          <div className="p-8 text-center">
            <div className="text-6xl font-black text-amber-500 tracking-tight mb-2">
              {points}
            </div>
            <p className="text-slate-500 font-medium">Available Points</p>
            <div className="mt-6 text-sm text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100">
              Earn points by completing health checks and financial calculators.
            </div>
          </div>
        </Card>

        {/* Price Drop Alerts */}
        <Card className="md:col-span-2 bg-white border-2 border-[#E5E0D8] shadow-sm rounded-3xl overflow-hidden">
          <div className="bg-[#F5F0E6] p-4 border-b border-[#E5E0D8] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-brand-blue" />
              <h2 className="font-bold text-slate-800">Active Price Alerts</h2>
            </div>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
              1 New Alert
            </span>
          </div>
          <div className="p-6 space-y-4">
            {priceAlerts.map((alert, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <Tag className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{alert.item}</h3>
                    <p className="text-sm text-slate-500">Tracked on {alert.vendor}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 line-through text-sm">${alert.oldPrice}</span>
                    <span className="text-2xl font-black text-red-600">${alert.newPrice}</span>
                  </div>
                  <span className="text-red-600 text-sm font-bold block">-{alert.drop}% DROP</span>
                </div>
              </div>
            ))}
            
            <a href="/api/affiliate?vendor=chewy&product_id=12345" target="_blank" rel="noreferrer" className="block w-full text-center py-3 mt-4 text-brand-blue font-bold hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
              Claim Deal on Chewy
            </a>
          </div>
        </Card>

        {/* Security / Preferences */}
        <Card className="md:col-span-3 bg-white border-2 border-[#E5E0D8] shadow-sm rounded-3xl overflow-hidden">
          <div className="bg-[#F5F0E6] p-4 border-b border-[#E5E0D8]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-green" />
              <h2 className="font-bold text-slate-800">Profile Preferences</h2>
            </div>
          </div>
          <div className="p-6 flex justify-between items-center">
            <p className="text-slate-600">Your data is stored locally by default or synced securely to Supabase.</p>
            <button className="px-6 py-2 bg-brand-green text-white font-bold rounded-lg hover:bg-brand-green-dark">
              Manage Data
            </button>
          </div>
        </Card>

      </div>
    </div>
  );
}
