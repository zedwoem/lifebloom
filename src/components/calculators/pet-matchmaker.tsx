"use client";

import React, { useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import Link from "next/link";

const TRANSLATIONS = {
  en: {
    title: "Companion Matchmaker",
    subtitle: "Find the ideal furry friend to bring joy to your home based on your lifestyle and living space.",
    labelSpace: "Where will your new friend live?",
    spaceSmall: "Cozy Space (Apartment)",
    spaceLarge: "Spacious (House with Yard)",
    labelTime: "How much active time can you share daily?",
    timeLow: "Relaxed (< 1 Hour)",
    timeMedium: "Active (1 - 2 Hours)",
    timeHigh: "Very Active (> 2 Hours)",
    btnSubmit: "Find My Match",
    btnSubmitLoading: "Looking for companions...",
    resultsTitle: "Your Perfect Companions:",
    seeInsurance: "Explore Pet Insurance Options →",
    breeds: [
      { id: 1, name: "Golden Retriever", space: "large", time: "high", description: "Incredibly loyal, gentle, and eager to please. Loves long walks and family time." },
      { id: 2, name: "French Bulldog", space: "small", time: "medium", description: "Affectionate and easygoing. Perfect for apartment living with short daily strolls." },
      { id: 3, name: "Greyhound", space: "large", time: "medium", description: "Surprisingly calm indoors. Loves a quick sprint but is mostly a gentle couch potato." }
    ]
  },
};

export function PetMatchmaker() {
  const params = useParams();
  const locale = "en";
  const t = TRANSLATIONS[locale];

  const [space, setSpace] = useState<"small" | "large" | "">("");
  const [time, setTime] = useState<"low" | "medium" | "high" | "">("");
  const [results, setResults] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMatch = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/pets/search?type=dog&limit=3`);
      if (!response.ok) throw new Error("Failed to fetch pets");
      
      const data = await response.json();
      
      if (data.animals && data.animals.length > 0) {
        setResults(data.animals.map((animal: any) => ({
          id: animal.id,
          name: animal.breeds?.[0]?.name || "Rescue Pet",
          description: animal.breeds?.[0]?.temperament || "Ready for adoption",
          url: animal.url
        })));
      } else {
        throw new Error("Empty animals list");
      }
    } catch (error: any) {
      console.warn("API failed. Using local fallback.");
      let matched = t.breeds.filter(b => b.space === space && b.time === time);
      if (matched.length === 0) {
        matched = t.breeds.filter(b => b.space === space || b.time === time);
      }
      setResults(matched.length > 0 ? matched : t.breeds);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClientOnly fallbackHeight="h-[500px]">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 max-w-2xl mx-auto mt-8">
        <div className="text-center mb-8 border-b border-slate-100 pb-6">
          <h2 className="text-2xl md:text-3xl font-black text-rose-800 tracking-tight" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            {t.title}
          </h2>
          <p className="text-slate-500 font-medium mt-2 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="space-y-8 mb-8">
          <div>
            <span className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">{t.labelSpace}</span>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setSpace("small")}
                className={`flex-1 min-h-[52px] px-6 py-3 rounded-xl text-base font-bold transition-all shadow-sm ${
                  space === "small" 
                    ? "bg-rose-600 text-white ring-2 ring-rose-600 ring-offset-2" 
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {t.spaceSmall}
              </button>
              <button 
                onClick={() => setSpace("large")}
                className={`flex-1 min-h-[52px] px-6 py-3 rounded-xl text-base font-bold transition-all shadow-sm ${
                  space === "large" 
                    ? "bg-rose-600 text-white ring-2 ring-rose-600 ring-offset-2" 
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {t.spaceLarge}
              </button>
            </div>
          </div>

          <div>
            <span className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">{t.labelTime}</span>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setTime("low")}
                className={`flex-1 min-h-[52px] px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                  time === "low" 
                    ? "bg-amber-500 text-white ring-2 ring-amber-500 ring-offset-2" 
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {t.timeLow}
              </button>
              <button 
                onClick={() => setTime("medium")}
                className={`flex-1 min-h-[52px] px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                  time === "medium" 
                    ? "bg-amber-500 text-white ring-2 ring-amber-500 ring-offset-2" 
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {t.timeMedium}
              </button>
              <button 
                onClick={() => setTime("high")}
                className={`flex-1 min-h-[52px] px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                  time === "high" 
                    ? "bg-amber-500 text-white ring-2 ring-amber-500 ring-offset-2" 
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {t.timeHigh}
              </button>
            </div>
          </div>
        </div>

        <Button 
          id="pet-match-submit-btn"
          onClick={handleMatch}
          disabled={!space || !time || isLoading}
          className="w-full h-14 text-lg bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? t.btnSubmitLoading : t.btnSubmit}
        </Button>

        {isLoading ? (
          <div className="mt-8 space-y-4 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex gap-4">
                <div className="w-20 h-20 bg-slate-200 rounded-xl shrink-0"></div>
                <div className="flex-1 py-1">
                  <div className="h-5 bg-slate-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-rose-200/50 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : results && (
          <div className="mt-8 space-y-4 animate-fade-in">
            <h3 className="text-xl font-bold text-slate-800 mb-4">{t.resultsTitle}</h3>
            {results.map((breed) => (
              <div key={breed.id} className="p-5 bg-white border border-rose-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {breed.url ? (
                  <img src={breed.url} alt={breed.name} className="w-full sm:w-24 h-40 sm:h-24 object-cover rounded-xl shrink-0" />
                ) : (
                  <div className="w-full sm:w-24 h-40 sm:h-24 bg-rose-50 rounded-xl flex items-center justify-center shrink-0 border border-rose-100">
                    <span className="text-4xl">🐾</span>
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-black text-xl text-slate-800 mb-1">{breed.name}</h4>
                  <p className="text-slate-600 text-sm font-medium leading-relaxed mb-3">{breed.description}</p>
                  <Link href="/support/partners/partner-3" className="inline-block text-rose-600 font-bold hover:text-rose-800 transition-colors text-xs bg-rose-50 px-3 py-1.5 rounded-lg">
                    {t.seeInsurance}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClientOnly>
  );
}

