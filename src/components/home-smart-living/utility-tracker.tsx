"use client";

import React, { useState } from "react";
import { Zap, Droplets, Flame, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientOnly } from "@/components/ui/client-only";

export function UtilityTracker() {
  const [electricity, setElectricity] = useState<number>(0);
  const [water, setWater] = useState<number>(0);
  const [gas, setGas] = useState<number>(0);

  const totalCost = electricity + water + gas;

  return (
    <ClientOnly>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-brand-blue font-display">Utility Cost Tracker</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Track monthly energy consumption on a fixed pension income.</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex-grow">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Electricity ($)</label>
              <input 
                type="number"
                min="0"
                value={electricity || ""}
                onChange={(e) => setElectricity(Number(e.target.value))}
                className="w-full bg-transparent font-bold text-xl text-slate-800 focus:outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div className="flex-grow">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Water ($)</label>
              <input 
                type="number"
                min="0"
                value={water || ""}
                onChange={(e) => setWater(Number(e.target.value))}
                className="w-full bg-transparent font-bold text-xl text-slate-800 focus:outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-xl shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div className="flex-grow">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Gas ($)</label>
              <input 
                type="number"
                min="0"
                value={gas || ""}
                onChange={(e) => setGas(Number(e.target.value))}
                className="w-full bg-transparent font-bold text-xl text-slate-800 focus:outline-none"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 bg-brand-blue text-white p-6 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-brand-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Monthly Total</p>
            <p className="text-3xl font-black">${totalCost.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm">
              <TrendingDown className="w-3.5 h-3.5" /> Normal Range
            </div>
          </div>
        </div>

        <Button className="w-full mt-4 bg-white text-brand-blue border-2 border-brand-blue hover:bg-slate-50 min-h-[50px] font-bold rounded-xl text-lg">
          Log This Month
        </Button>
      </div>
    </ClientOnly>
  );
}
