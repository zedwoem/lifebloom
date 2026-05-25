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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Smart Home Matcher (Matter Standard)</h2>
        <p className="text-lg text-slate-600 mb-6">
          Temukan perangkat rumah pintar yang kompatibel dengan Matter dan hemat energi tanpa memerlukan Hub tambahan.
        </p>

        <div className="flex gap-4 mb-8">
          <Input 
            placeholder="Cari perangkat (misal: Lampu, Termostat...)" 
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
            className="text-lg min-h-[48px]"
          />
          <Button 
            onClick={searchMatterDevices} 
            disabled={isLoading || !deviceType}
            className="min-h-[48px] px-8 bg-brand-blue text-white"
          >
            {isLoading ? "Mencari..." : <><Search className="w-5 h-5 mr-2" /> Cari</>}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800">Rekomendasi Perangkat (Matter Certified)</h3>
            <div className="grid gap-4">
              {results.map((device) => (
                <div key={device.id} className="p-4 border border-brand-green/20 bg-brand-green/5 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-lg text-slate-800">{device.name}</h4>
                    <p className="text-slate-600">{device.type} &bull; {device.protocol}</p>
                  </div>
                  <div className="bg-brand-green text-white px-3 py-1 rounded-full font-bold">
                    Rating {device.efficiency}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}
