"use client";

import React, { useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Button } from "@/components/ui/button";

const MOCK_BREEDS = [
  { id: 1, name: "Golden Retriever", space: "large", time: "high", description: "Sangat bersahabat dan butuh banyak aktivitas." },
  { id: 2, name: "French Bulldog", space: "small", time: "medium", description: "Cocok untuk apartemen, aktivitas sedang." },
  { id: 3, name: "Greyhound", space: "large", time: "medium", description: "Cepat namun suka bersantai di rumah." },
];

export function PetMatchmaker() {
  const [space, setSpace] = useState<"small" | "large" | "">("");
  const [time, setTime] = useState<"low" | "medium" | "high" | "">("");
  const [results, setResults] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMatch = async () => {
    setIsLoading(true);
    
    // Simulate API Call to PetFinder API with 4s AbortController
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 seconds timeout

      // In production, fetch from our secure Next.js API route that proxies PetFinder
      // const res = await fetch(`/api/pets/search?space=${space}&time=${time}`, { signal: controller.signal });
      // const data = await res.json();
      
      // Simulate network delay
      await new Promise(r => setTimeout(r, 1000));
      clearTimeout(timeoutId);

      // Offline JSON fallback filtering
      const matched = MOCK_BREEDS.filter(b => b.space === space || b.time === time);
      setResults(matched.length > 0 ? matched : MOCK_BREEDS);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn("Petfinder API timeout. Using local fallback JSON.");
        // Graceful degradation
        const matched = MOCK_BREEDS.filter(b => b.space === space || b.time === time);
        setResults(matched.length > 0 ? matched : MOCK_BREEDS);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClientOnly fallbackHeight="h-[500px]">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Pet Matchmaker (Kecocokan Ras)</h2>
        <p className="text-lg text-slate-600 mb-8">
          Temukan ras anjing yang ideal berdasarkan gaya hidup, luas hunian, dan ketersediaan waktu luang Anda.
        </p>

        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-lg font-bold text-slate-700 mb-3">Luas Hunian Anda</label>
            <div className="flex gap-4">
              <Button 
                variant={space === "small" ? "primary" : "outline"}
                className={`min-h-[48px] px-6 text-lg ${space === "small" ? "bg-brand-blue text-white" : ""}`}
                onClick={() => setSpace("small")}
              >
                Kecil (Apartemen)
              </Button>
              <Button 
                variant={space === "large" ? "primary" : "outline"}
                className={`min-h-[48px] px-6 text-lg ${space === "large" ? "bg-brand-blue text-white" : ""}`}
                onClick={() => setSpace("large")}
              >
                Besar (Rumah dengan Halaman)
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-lg font-bold text-slate-700 mb-3">Waktu Luang Harian untuk Aktivitas Anjing</label>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant={time === "low" ? "primary" : "outline"}
                className={`min-h-[48px] px-6 text-lg ${time === "low" ? "bg-brand-green text-white" : ""}`}
                onClick={() => setTime("low")}
              >
                Sedikit (&lt; 1 Jam)
              </Button>
              <Button 
                variant={time === "medium" ? "primary" : "outline"}
                className={`min-h-[48px] px-6 text-lg ${time === "medium" ? "bg-brand-green text-white" : ""}`}
                onClick={() => setTime("medium")}
              >
                Sedang (1 - 2 Jam)
              </Button>
              <Button 
                variant={time === "high" ? "primary" : "outline"}
                className={`min-h-[48px] px-6 text-lg ${time === "high" ? "bg-brand-green text-white" : ""}`}
                onClick={() => setTime("high")}
              >
                Banyak (&gt; 2 Jam)
              </Button>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleMatch}
          disabled={!space || !time || isLoading}
          className="w-full min-h-[48px] text-lg bg-slate-800 text-white font-bold"
        >
          {isLoading ? "Menganalisis Kecocokan..." : "Lihat Hasil Kecocokan"}
        </Button>

        {results && (
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Rekomendasi Ras:</h3>
            {results.map((breed) => (
              <div key={breed.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-bold text-lg text-slate-800 mb-1">{breed.name}</h4>
                <p className="text-slate-600 text-lg">{breed.description}</p>
                <div className="mt-3 text-brand-blue font-bold cursor-pointer hover:underline">
                  Lihat Opsi Asuransi Hewan Peliharaan &rarr;
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClientOnly>
  );
}
