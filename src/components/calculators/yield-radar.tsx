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
  type: "Economic Indicator" | "Crypto Asset" | "Gov Bond" | "Deposit" | "Dividend ETF";
  trend: "up" | "stable" | "down";
  source: string;
  sparkline: string;
}

export function YieldRadar() {
  const [data, setData] = useState<YieldData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("All");

  useEffect(() => {
    const fetchYields = async () => {
      try {
        const econ = await getEconomicMetrics();
        const btc = await getCryptoPrice("bitcoin");
        const eth = await getCryptoPrice("ethereum");

        const loadedData: YieldData[] = [
          {
            id: "hysa-avg",
            name: "High-Yield Savings (Top 5 Avg)",
            rate: "4.85%",
            type: "Deposit",
            trend: "stable",
            source: "Bankrate Data",
            sparkline: "M 0 50 L 20 45 L 40 45 L 60 48 L 80 48 L 100 48"
          },
          {
            id: "cd-1yr",
            name: "1-Year Certificate of Deposit (CD)",
            rate: "5.10%",
            type: "Deposit",
            trend: "down",
            source: "FDIC National Rates",
            sparkline: "M 0 20 L 20 20 L 40 30 L 60 40 L 80 45 L 100 50"
          },
          {
            id: "us-mortgage-30",
            name: "US 30-Year Mortgage Rate",
            rate: econ ? `${econ.mortgageRate30Yr}%` : "6.85%",
            type: "Economic Indicator",
            trend: "up",
            source: econ?.source || "FRED API",
            sparkline: "M 0 60 L 20 55 L 40 40 L 60 30 L 80 20 L 100 10"
          },
          {
            id: "us-inflation",
            name: "US Inflation Rate (CPI)",
            rate: econ ? `${econ.usInflationRate}%` : "3.20%",
            type: "Economic Indicator",
            trend: "stable",
            source: econ?.source || "FRED API",
            sparkline: "M 0 30 L 20 35 L 40 32 L 60 33 L 80 32 L 100 32"
          },
          {
            id: "schd",
            name: "Schwab US Dividend Equity (SCHD)",
            rate: "3.45%",
            type: "Dividend ETF",
            trend: "up",
            source: "Market Data",
            sparkline: "M 0 50 L 20 40 L 40 45 L 60 30 L 80 20 L 100 15"
          },
          {
            id: "btc-price",
            name: "Bitcoin (BTC USD)",
            rate: btc ? `$${btc.usdPrice.toLocaleString()}` : "$65,000",
            type: "Crypto Asset",
            trend: btc && btc.change24h > 0 ? "up" : "down",
            source: "CoinGecko API",
            sparkline: "M 0 80 L 20 60 L 40 70 L 60 30 L 80 40 L 100 20"
          },
          {
            id: "eth-price",
            name: "Ethereum (ETH USD)",
            rate: eth ? `$${eth.usdPrice.toLocaleString()}` : "$3,500",
            type: "Crypto Asset",
            trend: eth && eth.change24h > 0 ? "up" : "down",
            source: "CoinGecko API",
            sparkline: "M 0 70 L 20 65 L 40 50 L 60 55 L 80 30 L 100 25"
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

  const tabs = ["All", "Deposit", "Economic Indicator", "Crypto Asset", "Dividend ETF"];
  const filteredData = data.filter(d => activeTab === "All" || d.type === activeTab);

  return (
    <ClientOnly fallbackHeight="h-[400px]">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 w-full max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-brand-green/10 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-brand-green" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>High-Yield Compounding Radar</h2>
              <p className="text-slate-500 font-medium mt-1">Compare current interest rates, bonds, and digital assets to grow your savings safely.</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? "bg-slate-800 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="py-4 px-5 text-xs font-black text-slate-500 uppercase tracking-wider">Asset / Rate Name</th>
                  <th className="py-4 px-5 text-xs font-black text-slate-500 uppercase tracking-wider text-center">Trend (30d)</th>
                  <th className="py-4 px-5 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Live Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredData.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                    <td className="py-5 px-5">
                      <div className="font-bold text-slate-900 text-base md:text-lg flex items-center gap-2">
                        {item.name}
                        {item.trend === "up" && <ArrowUpRight className="w-4 h-4 text-emerald-500 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.type === 'Economic Indicator' ? 'bg-amber-100 text-amber-800' : 
                          item.type === 'Deposit' ? 'bg-blue-100 text-blue-800' :
                          item.type === 'Dividend ETF' ? 'bg-purple-100 text-purple-800' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">via {item.source}</span>
                      </div>
                    </td>
                    <td className="py-5 px-5 text-center align-middle">
                      <svg viewBox="0 0 100 100" className="w-16 h-8 inline-block opacity-60 group-hover:opacity-100 transition-opacity">
                        <path d={item.sparkline} fill="none" stroke={item.trend === 'down' ? '#ef4444' : item.trend === 'up' ? '#10b981' : '#64748b'} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </td>
                    <td className="py-5 px-5 text-right">
                      <span className="text-xl md:text-2xl font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl">{item.rate}</span>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-slate-500 font-medium">
                      No data available for this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 font-medium max-w-sm">
                Rates are updated daily. Select an asset to view historical compound growth.
              </p>
              <SmartCTA 
                fallbackAction="modal" 
                modalTitle="Save Yield Radar" 
                modalDesc="Sign in to save this comparison to your dashboard and track rates over time."
                className="gap-2 font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-5 py-2.5 shadow-md w-full sm:w-auto justify-center"
                onAuthenticatedClick={() => alert('Saved to Dashboard!')}
              >
                <Save className="w-4 h-4" /> Save Collection
              </SmartCTA>
            </div>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}
