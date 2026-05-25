"use client";

import React, { useState, useEffect } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { ArrowUpRight, TrendingUp, Save } from "lucide-react";
import { SmartCTA } from "@/components/ui/smart-cta";

interface YieldData {
  id: string;
  name: string;
  rate: number;
  type: "SBN" | "Deposito" | "Gov Bond" | "Deposit";
  trend: "up" | "stable" | "down";
}

export function YieldRadar() {
  const [data, setData] = useState<YieldData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In production, this would fetch from an API (e.g., Central Bank / Ministry of Finance scraper)
    const fetchYields = async () => {
      // Mocking the scheduled scraper data
      setTimeout(() => {
        setData([
          { id: "sbr013", name: "SBR013 (Retail Bond)", rate: 6.45, type: "Gov Bond", trend: "up" },
          { id: "ori025", name: "ORI025", rate: 6.25, type: "Gov Bond", trend: "stable" },
          { id: "dep-bca", name: "BCA Deposit (12 Mo)", rate: 3.50, type: "Deposit", trend: "stable" },
          { id: "dep-bpr", name: "Universal BPR (LPS)", rate: 6.75, type: "Deposit", trend: "up" }
        ]);
        setIsLoading(false);
      }, 1000);
    };

    fetchYields();
  }, []);

  return (
    <ClientOnly fallbackHeight="h-[400px]">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-brand-green/10 rounded-xl">
            <TrendingUp className="w-6 h-6 text-brand-green" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Daily Yield Radar</h2>
            <p className="text-lg text-slate-600">Comparison of Top Government Bonds and Deposit Rates (Real-time)</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 px-4 text-lg font-bold text-slate-500">Instrument</th>
                  <th className="py-4 px-4 text-lg font-bold text-slate-500">Type</th>
                  <th className="py-4 px-4 text-lg font-bold text-slate-500 text-right">Coupon / Interest Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        {item.name}
                        {item.trend === "up" && <ArrowUpRight className="w-4 h-4 text-brand-green" />}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.type === 'Gov Bond' ? 'bg-brand-blue/10 text-brand-blue' : 'bg-purple-100 text-purple-700'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-xl font-black text-brand-green">{item.rate.toFixed(2)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-8 flex justify-end">
              <SmartCTA 
                fallbackAction="modal" 
                modalTitle="Save Yield Radar" 
                modalDesc="Sign in to save this comparison to your dashboard and track rates over time."
                className="gap-2 font-bold bg-slate-800 text-white hover:bg-slate-700"
                onAuthenticatedClick={() => alert('Saved to Dashboard!')}
              >
                <Save className="w-4 h-4" /> Save to Dashboard
              </SmartCTA>
            </div>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}
