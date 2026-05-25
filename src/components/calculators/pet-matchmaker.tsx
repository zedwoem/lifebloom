"use client";

import React, { useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Button } from "@/components/ui/button";
import { useLocale } from "next-intl";

const TRANSLATIONS = {
  en: {
    title: "Pet Matchmaker",
    subtitle: "Find the ideal dog breed based on your lifestyle, living space, and daily availability.",
    labelSpace: "Your Living Space",
    spaceSmall: "Small (Apartment)",
    spaceLarge: "Large (House with Yard)",
    labelTime: "Daily Free Time for Pet Activity",
    timeLow: "Low (< 1 Hour)",
    timeMedium: "Medium (1 - 2 Hours)",
    timeHigh: "High (> 2 Hours)",
    btnSubmit: "Analyze Match",
    btnSubmitLoading: "Analyzing Match...",
    resultsTitle: "Recommended Breeds:",
    seeInsurance: "View Pet Insurance Options →",
    breeds: [
      { id: 1, name: "Golden Retriever", space: "large", time: "high", description: "Very friendly and requires plenty of exercise." },
      { id: 2, name: "French Bulldog", space: "small", time: "medium", description: "Perfect for apartments, moderate energy level." },
      { id: 3, name: "Greyhound", space: "large", time: "medium", description: "Fast runner but loves to lounge around the house." }
    ]
  },
  id: {
    title: "Pet Matchmaker (Kecocokan Ras)",
    subtitle: "Temukan ras anjing yang ideal berdasarkan gaya hidup, luas hunian, dan ketersediaan waktu luang Anda.",
    labelSpace: "Luas Hunian Anda",
    spaceSmall: "Kecil (Apartemen)",
    spaceLarge: "Besar (Rumah dengan Halaman)",
    labelTime: "Waktu Luang Harian untuk Aktivitas Anjing",
    timeLow: "Sedikit (< 1 Jam)",
    timeMedium: "Sedang (1 - 2 Jam)",
    timeHigh: "Banyak (> 2 Jam)",
    btnSubmit: "Lihat Hasil Kecocokan",
    btnSubmitLoading: "Menganalisis Kecocokan...",
    resultsTitle: "Rekomendasi Ras:",
    seeInsurance: "Lihat Opsi Asuransi Hewan Peliharaan →",
    breeds: [
      { id: 1, name: "Golden Retriever", space: "large", time: "high", description: "Sangat bersahabat dan butuh banyak aktivitas." },
      { id: 2, name: "French Bulldog", space: "small", time: "medium", description: "Cocok untuk apartemen, aktivitas sedang." },
      { id: 3, name: "Greyhound", space: "large", time: "medium", description: "Cepat namun suka bersantai di rumah." }
    ]
  }
};

export function PetMatchmaker() {
  const locale = useLocale() as keyof typeof TRANSLATIONS;
  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;

  const [space, setSpace] = useState<"small" | "large" | "">("");
  const [time, setTime] = useState<"low" | "medium" | "high" | "">("");
  const [results, setResults] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMatch = async () => {
    setIsLoading(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 seconds timeout
      
      // Simulate network delay
      await new Promise(r => setTimeout(r, 1000));
      clearTimeout(timeoutId);

      // Offline JSON fallback filtering
      const matched = t.breeds.filter(b => b.space === space || b.time === time);
      setResults(matched.length > 0 ? matched : t.breeds);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn("Petfinder API timeout. Using local fallback JSON.");
        const matched = t.breeds.filter(b => b.space === space || b.time === time);
        setResults(matched.length > 0 ? matched : t.breeds);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClientOnly fallbackHeight="h-[500px]">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{t.title}</h2>
        <p className="text-lg text-slate-600 mb-8">{t.subtitle}</p>

        <div className="space-y-6 mb-8">
          <div>
            <span className="block text-lg font-bold text-slate-700 mb-3">{t.labelSpace}</span>
            <div className="flex gap-4">
              <Button 
                id="space-small-btn"
                name="space-option"
                variant={space === "small" ? "primary" : "outline"}
                className={`min-h-[48px] px-6 text-lg ${space === "small" ? "bg-brand-blue text-white" : ""}`}
                onClick={() => setSpace("small")}
              >
                {t.spaceSmall}
              </Button>
              <Button 
                id="space-large-btn"
                name="space-option"
                variant={space === "large" ? "primary" : "outline"}
                className={`min-h-[48px] px-6 text-lg ${space === "large" ? "bg-brand-blue text-white" : ""}`}
                onClick={() => setSpace("large")}
              >
                {t.spaceLarge}
              </Button>
            </div>
          </div>

          <div>
            <span className="block text-lg font-bold text-slate-700 mb-3">{t.labelTime}</span>
            <div className="flex flex-wrap gap-4">
              <Button 
                id="time-low-btn"
                name="time-option"
                variant={time === "low" ? "primary" : "outline"}
                className={`min-h-[48px] px-6 text-lg ${time === "low" ? "bg-brand-green text-white" : ""}`}
                onClick={() => setTime("low")}
              >
                {t.timeLow}
              </Button>
              <Button 
                id="time-medium-btn"
                name="time-option"
                variant={time === "medium" ? "primary" : "outline"}
                className={`min-h-[48px] px-6 text-lg ${time === "medium" ? "bg-brand-green text-white" : ""}`}
                onClick={() => setTime("medium")}
              >
                {t.timeMedium}
              </Button>
              <Button 
                id="time-high-btn"
                name="time-option"
                variant={time === "high" ? "primary" : "outline"}
                className={`min-h-[48px] px-6 text-lg ${time === "high" ? "bg-brand-green text-white" : ""}`}
                onClick={() => setTime("high")}
              >
                {t.timeHigh}
              </Button>
            </div>
          </div>
        </div>

        <Button 
          id="pet-match-submit-btn"
          onClick={handleMatch}
          disabled={!space || !time || isLoading}
          className="w-full min-h-[48px] text-lg bg-slate-800 text-white font-bold"
        >
          {isLoading ? t.btnSubmitLoading : t.btnSubmit}
        </Button>

        {results && (
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-bold text-slate-800 border-b pb-2">{t.resultsTitle}</h3>
            {results.map((breed) => (
              <div key={breed.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-bold text-lg text-slate-800 mb-1">{breed.name}</h4>
                <p className="text-slate-600 text-lg">{breed.description}</p>
                <div className="mt-3 text-brand-blue font-bold cursor-pointer hover:underline text-sm">
                  {t.seeInsurance}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClientOnly>
  );
}

