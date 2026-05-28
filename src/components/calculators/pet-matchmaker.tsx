"use client";

import React, { useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import Link from "next/link";

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
                className={`min-h-[52px] px-6 text-lg ${space === "small" ? "bg-brand-blue text-white" : ""}`}
                onClick={() => setSpace("small")}
              >
                {t.spaceSmall}
              </Button>
              <Button 
                id="space-large-btn"
                name="space-option"
                variant={space === "large" ? "primary" : "outline"}
                className={`min-h-[52px] px-6 text-lg ${space === "large" ? "bg-brand-blue text-white" : ""}`}
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
                className={`min-h-[52px] px-6 text-lg ${time === "low" ? "bg-brand-green text-white" : ""}`}
                onClick={() => setTime("low")}
              >
                {t.timeLow}
              </Button>
              <Button 
                id="time-medium-btn"
                name="time-option"
                variant={time === "medium" ? "primary" : "outline"}
                className={`min-h-[52px] px-6 text-lg ${time === "medium" ? "bg-brand-green text-white" : ""}`}
                onClick={() => setTime("medium")}
              >
                {t.timeMedium}
              </Button>
              <Button 
                id="time-high-btn"
                name="time-option"
                variant={time === "high" ? "primary" : "outline"}
                className={`min-h-[52px] px-6 text-lg ${time === "high" ? "bg-brand-green text-white" : ""}`}
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
          className="w-full min-h-[52px] text-lg bg-slate-800 text-white font-bold"
        >
          {isLoading ? t.btnSubmitLoading : t.btnSubmit}
        </Button>

        {isLoading ? (
          <div className="mt-8 space-y-4 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex gap-4">
                <div className="w-16 h-16 bg-slate-200 rounded-lg shrink-0"></div>
                <div className="flex-1">
                  <div className="h-5 bg-slate-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-brand-blue/20 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : results && (
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-bold text-slate-800 border-b pb-2">{t.resultsTitle}</h3>
            {results.map((breed) => (
              <div key={breed.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
                {breed.url && (
                  <img src={breed.url} alt={breed.name} className="w-16 h-16 object-cover rounded-lg shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-lg text-slate-800 mb-1">{breed.name}</h4>
                  <p className="text-slate-600 text-sm line-clamp-2">{breed.description}</p>
                  <Link href="/support/privacy" className="mt-2 block text-brand-blue font-bold hover:underline text-xs">
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

