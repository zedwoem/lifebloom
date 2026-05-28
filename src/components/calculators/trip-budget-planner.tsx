"use client";

import React, { useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FALLBACK_RATES = {
  hotel: 100,
  car: 50,
  food: 30,
};

export function TripBudgetPlanner() {
  const [destination, setDestination] = useState<string>("");
  const [days, setDays] = useState<number | "">("");
  const [people, setPeople] = useState<number | "">("");
  const [accType, setAccType] = useState<"standard" | "premium" | "accessible">("accessible");
  const [budget, setBudget] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateBudget = async () => {
    setIsLoading(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 seconds strict timeout

      // Simulate Amadeus / Travelpayouts API fetch
      // const res = await fetch(`/api/travel/rates?dest=bali`, { signal: controller.signal });
      // const liveRates = await res.json();
      
      await new Promise(r => setTimeout(r, 1500)); // Simulate latency
      clearTimeout(timeoutId);

      const multiplier = accType === "premium" ? 1.8 : accType === "accessible" ? 1.3 : 1.0;
      const rates = FALLBACK_RATES; // Fallback to liveRates in prod
      const totalHotel = rates.hotel * multiplier * (Number(days) || 1);
      const totalCar = rates.car * (Number(days) || 1);
      const totalFood = rates.food * (Number(people) || 1) * (Number(days) || 1);

      setBudget({
        hotel: totalHotel,
        car: totalCar,
        food: totalFood,
        total: totalHotel + totalCar + totalFood,
        destination: destination || "Your Destination"
      });

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn("Travel API timeout. Using stale/fallback JSON parameters.");
        const multiplier = accType === "premium" ? 1.8 : accType === "accessible" ? 1.3 : 1.0;
        const rates = FALLBACK_RATES;
        const totalHotel = rates.hotel * multiplier * (Number(days) || 1);
        const totalCar = rates.car * (Number(days) || 1);
        const totalFood = rates.food * (Number(people) || 1) * (Number(days) || 1);

        setBudget({
          hotel: totalHotel,
          car: totalCar,
          food: totalFood,
          total: totalHotel + totalCar + totalFood,
          destination: destination || "Your Destination",
          isFallback: true
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClientOnly fallbackHeight="h-[600px]">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 max-w-2xl mx-auto mt-8 relative overflow-hidden">
        <div className="mb-8 border-b border-slate-100 pb-6">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            Family Comfort Budget Estimator
          </h2>
          <p className="text-slate-500 font-medium mt-2 leading-relaxed">
            Plan your next multigenerational trip with ease. We factor in accessibility needs and vehicle sizes so there are no surprises.
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Where are you heading?</label>
            <Input 
              type="text"
              placeholder="e.g., Bali, Singapore, Tokyo" 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="h-14 text-lg rounded-xl border-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Duration (Days)</label>
              <Input 
                type="number"
                placeholder="e.g. 4" 
                value={days}
                onChange={(e) => setDays(e.target.value === "" ? "" : Number(e.target.value))}
                className="h-14 text-lg rounded-xl border-slate-200"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Travelers (Including Caregivers)</label>
              <Input 
                type="number"
                placeholder="e.g. 5" 
                value={people}
                onChange={(e) => setPeople(e.target.value === "" ? "" : Number(e.target.value))}
                className="h-14 text-lg rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Accommodation Comfort Level</label>
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'standard', label: 'Standard Hotels' },
                { id: 'accessible', label: 'Certified Accessible (Recommended)' },
                { id: 'premium', label: 'Premium / Resort' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setAccType(type.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    accType === type.id 
                      ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-600 ring-offset-2" 
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button 
          onClick={calculateBudget}
          disabled={!days || !people || isLoading}
          className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-transform active:scale-[0.98]"
        >
          {isLoading ? "Calculating..." : "Calculate Estimated Budget"}
        </Button>

        {budget && (
          <div className="mt-8 bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 animate-fade-in">
            {budget.isFallback && (
              <div className="mb-5 text-sm bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl font-medium flex items-start gap-2">
                <span className="shrink-0 text-xl">💡</span>
                Using estimated average daily rates for {budget.destination}. Actual partner pricing may vary slightly based on season.
              </div>
            )}
            
            <h3 className="font-bold text-slate-800 text-lg mb-4 text-center">Estimated Costs for {budget.destination}</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-slate-700 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div>
                  <div className="font-bold">Accommodation</div>
                  <div className="text-xs text-slate-500 mt-0.5">{accType === 'accessible' ? 'Certified step-free & grab bars' : accType === 'premium' ? 'Premium spacious suites' : 'Standard family rooms'}</div>
                </div>
                <span className="font-black text-lg text-emerald-700">${Math.round(budget.hotel).toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div>
                  <div className="font-bold">Family Transport</div>
                  <div className="text-xs text-slate-500 mt-0.5">Spacious MPV / Wheelchair-friendly Van</div>
                </div>
                <span className="font-black text-lg text-emerald-700">${Math.round(budget.car).toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div>
                  <div className="font-bold">Dining & Refreshments</div>
                  <div className="text-xs text-slate-500 mt-0.5">Estimated daily allowance for {people} people</div>
                </div>
                <span className="font-black text-lg text-emerald-700">${Math.round(budget.food).toLocaleString('en-US')}</span>
              </div>
            </div>
            <div className="pt-5 border-t border-emerald-200/60 flex flex-col items-center">
              <span className="text-sm font-bold text-emerald-800 uppercase tracking-widest mb-1">Total Estimated Budget</span>
              <span className="text-4xl font-black text-emerald-600">${Math.round(budget.total).toLocaleString('en-US')}</span>
            </div>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}
