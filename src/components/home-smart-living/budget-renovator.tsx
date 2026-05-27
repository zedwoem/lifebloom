"use client";

import React, { useState } from "react";
import { Calculator, ShieldCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientOnly } from "@/components/ui/client-only";

export function BudgetRenovator() {
  const [area, setArea] = useState<number>(10);
  const [complexity, setComplexity] = useState<"basic" | "moderate" | "premium">("moderate");

  // Rates in USD
  const baseRate = complexity === "basic" ? 50 : complexity === "moderate" ? 95 : 150;
  const subtotal = area * baseRate;
  const contingency = subtotal * 0.15; // 15% buffer
  const total = subtotal + contingency;

  return (
    <ClientOnly>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="mb-6 flex items-center gap-3">
          <div className="p-2 bg-brand-blue/10 rounded-xl">
            <Calculator className="w-6 h-6 text-brand-blue" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-brand-blue font-display">Renovation Estimator</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Plan aging-in-place modifications with built-in safety buffers.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Area to Renovate (sqm)</label>
            <input 
              type="number"
              min="1"
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Accessibility Standard</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "basic", label: "Basic (Grab bars)" },
                { id: "moderate", label: "Standard (Ramps & Lighting)" },
                { id: "premium", label: "Premium (Full Smart Home)" }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setComplexity(opt.id as any)}
                  className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                    complexity === opt.id 
                      ? 'bg-brand-blue text-white border-brand-blue shadow-md' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-blue/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contingency Alert Widget */}
        <div className="bg-[#FAF8F3] border border-[#006948]/25 rounded-3xl p-6 shadow-sm my-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none">
          <div className="flex gap-4">
            <div className="p-3 bg-[#d8f3e5] text-[#006948] rounded-2xl shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-slate-800 font-display">
                LifeBloom Safe Budget Protection
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed font-medium mt-1">
                Includes a built-in <span className="font-bold text-[#006948]">15% contingency buffer</span> to secure your assets from unexpected price spikes.
              </p>
            </div>
          </div>
          
          <div className="text-right border-t border-slate-200 md:border-0 pt-4 md:pt-0 w-full md:w-auto">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Protection</div>
            <div className="text-2xl font-black text-[#006948]">
              ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="flex-1 bg-brand-blue hover:bg-blue-900 text-white min-h-[50px] font-bold rounded-xl text-lg">
            Save Estimate
          </Button>
          <Button variant="outline" className="min-h-[50px] w-[50px] p-0 rounded-xl border-slate-200" aria-label="Download PDF">
            <Download className="w-5 h-5 text-slate-600" />
          </Button>
        </div>
      </div>
    </ClientOnly>
  );
}
