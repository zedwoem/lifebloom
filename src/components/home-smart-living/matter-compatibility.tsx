"use client";

import React, { useState } from "react";
import { Search, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientOnly } from "@/components/ui/client-only";

export function MatterCompatibility() {
  const [device, setDevice] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = () => {
    if (!device) return;
    setIsChecking(true);
    setTimeout(() => {
      // Simple mock logic for compatibility (in reality, connect to a database or API)
      const compatibleBrands = ['nest', 'ring', 'apple', 'philips', 'hue', 'eve', 'tp-link', 'tapo', 'aqara', 'sonoff'];
      const isCompatible = compatibleBrands.some(b => device.toLowerCase().includes(b));
      setResult(isCompatible);
      setIsChecking(false);
    }, 1000);
  };

  return (
    <ClientOnly>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-brand-blue font-display">Matter IoT Checker</h2>
          <p className="text-slate-500 font-medium mt-1">Check if your smart device supports the universal Matter standard for secure, ad-free local automation.</p>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="e.g. Philips Hue Smart Bulb" 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 font-medium"
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            />
          </div>
          <Button 
            onClick={handleCheck} 
            disabled={!device || isChecking}
            className="bg-[#006948] hover:bg-emerald-800 text-white px-6 py-3 rounded-xl min-h-[50px] font-bold"
          >
            {isChecking ? "Checking..." : "Check"}
          </Button>
        </div>

        {result !== null && !isChecking && (
          <div className={`p-5 rounded-2xl border flex gap-4 ${result ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="mt-1">
              {result ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <XCircle className="w-6 h-6 text-rose-600" />}
            </div>
            <div>
              <h3 className={`text-lg font-bold ${result ? 'text-emerald-900' : 'text-rose-900'}`}>
                {result ? "Matter Compatible" : "Not Matter Certified"}
              </h3>
              <p className={`text-sm mt-1 font-medium ${result ? 'text-emerald-700' : 'text-rose-700'}`}>
                {result 
                  ? "This device works locally without relying on cloud services. It is safe for an aging-in-place home setup." 
                  : "This device may rely on proprietary cloud servers. Consider upgrading to a Matter-certified alternative for better privacy and longevity."}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            We prioritize your privacy. The Matter standard ensures your smart home devices operate locally without sending data to third-party ad networks.
          </p>
        </div>
      </div>
    </ClientOnly>
  );
}
