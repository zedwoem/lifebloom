"use client";

import React, { useState } from "react";

import { ClientOnly } from "@/components/ui/client-only";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SmartHomeMatcher() {
    const [deviceType, setDeviceType] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchMatterDevices = async () => {
    setIsLoading(true);
    // Simulation of fetching from Google Home / Amazon PA-API
    // In production, this would hit an API endpoint that queries the APIs.
    setTimeout(() => {
      setResults([
        { id: 1, name: "Smart Bulb A19", type: "Lighting", protocol: "Matter over Thread", efficiency: "A+" },
        { id: 2, name: "Eco Thermostat", type: "Climate", protocol: "Matter over Wi-Fi", efficiency: "A" }
      ]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <ClientOnly fallbackHeight="h-[500px]">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 max-w-2xl mx-auto mt-8">
        <div className="text-center mb-8 border-b border-slate-100 pb-6">
          <h2 className="text-2xl md:text-3xl font-black text-blue-900 tracking-tight" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            Smart Home Simplifier
          </h2>
          <p className="text-slate-500 font-medium mt-2 leading-relaxed">
            Discover easy-to-use devices that make your home safer and more comfortable, without the technical hassle. All recommendations are certified to work together seamlessly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Input 
            placeholder="E.g., Lights, Thermostats, Locks"
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchMatterDevices()}
            className="flex-1 h-14 text-lg rounded-xl border-slate-200"
          />
          <Button 
            onClick={searchMatterDevices} 
            disabled={isLoading || !deviceType}
            className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? "Searching..." : <><Search className="w-5 h-5 mr-2" /> Find Devices</>}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Top Recommendations for Your Home</h3>
            <div className="grid gap-4">
              {results.map((device) => (
                <div key={device.id} className="p-5 border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="font-black text-xl text-blue-900 mb-1">{device.name}</h4>
                    <p className="text-slate-600 text-sm font-medium">{device.type} &bull; {device.protocol}</p>
                    <p className="text-blue-600 text-xs mt-2 font-bold uppercase tracking-wider">✓ Easy Setup Certified</p>
                  </div>
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2">
                    <span>Efficiency Rating:</span>
                    <span className="text-lg">{device.efficiency}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-sm text-amber-800 font-medium">
                <span className="font-bold">💡 Tip:</span> Devices with "Matter" certification work with almost any smart home app, meaning you don't need to learn a new system to use them.
              </p>
            </div>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}
