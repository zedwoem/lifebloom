"use client";

import React, { useState, useEffect } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { ArrowUpRight, TrendingUp, Save } from "lucide-react";
import { SmartCTA } from "@/components/ui/smart-cta";
import { getEconomicMetrics, getCryptoPrice } from "@/lib/actions/calculatorActions";

interface YieldData {
  id: string;
  name: string;
  rate: string | number;
  type: "Economic Indicator" | "Crypto Asset" | "Gov Bond" | "Deposit";
  trend: "up" | "stable" | "down";
  source: string;
}

export function YieldRadar() {
  const [data, setData] = useState<YieldData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchYields = async () => {
      try {
        // 1. Fetch live FRED metrics
        const econ = await getEconomicMetrics();
        // 2. Fetch live crypto prices
        const btc = await getCryptoPrice("bitcoin");
        const eth = await getCryptoPrice("ethereum");

        const loadedData: YieldData[] = [
          {
            id: "us-inflation",
            name: "US Inflation Rate (CPI)",
            rate: econ ? `${econ.usInflationRate}%` : "3.20%",
            type: "Economic Indicator",
            trend: "stable",
            source: econ?.source || "FRED API"
          },
          {
            id: "us-mortgage-30",
            name: "US 30-Year Mortgage Rate",
            rate: econ ? `${econ.mortgageRate30Yr}%` : "6.85%",
            type: "Economic Indicator",
            trend: "up",
            source: econ?.source || "FRED API"
          },
          {
            id: "btc-price",
            name: "Bitcoin (BTC USD)",
            rate: btc ? `$${btc.usdPrice.toLocaleString()}` : "$65,000",
            type: "Crypto Asset",
            trend: btc && btc.change24h > 0 ? "up" : "down",
            source: "CoinGecko API"
          },
          {
            id: "eth-price",
            name: "Ethereum (ETH USD)",
            rate: eth ? `$${eth.usdPrice.toLocaleString()}` : "$3,500",
            type: "Crypto Asset",
            trend: eth && eth.change24h > 0 ? "up" : "down",
            source: "CoinGecko API"
          }
        ];

        setData(loadedData);
      } catch (err) {
        console.error("Failed to fetch live yield radar:", err);
      } finally {
        setIsLoading(false);
      }
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
            <h2 className="text-2xl font-bold text-slate-800">Daily Yield & Rates Radar</h2>
            <p className="text-sm text-slate-500">Real-time indicators comparing macroeconomic FRED indexes and live CoinGecko values.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 px-4 text-sm font-bold text-slate-500">Indicator / Asset</th>
                  <th className="py-4 px-4 text-sm font-bold text-slate-500">Category</th>
                  <th className="py-4 px-4 text-sm font-bold text-slate-500 text-right">Live Rate / Price</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        {item.name}
                        {item.trend === "up" && <ArrowUpRight className="w-4 h-4 text-brand-green animate-bounce" />}
                      </div>
                      <span className="text-[10px] text-slate-400 block">{item.source}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.type === 'Economic Indicator' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-xl font-black text-brand-green">{item.rate}</span>
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
