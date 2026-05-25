"use client";

import { useState } from 'react';
import { Plane, Calendar, MapPin, Accessibility, Check } from 'lucide-react';

export function AccessibleTripPlanner() {
  const [destination, setDestination] = useState('');
  const [step, setStep] = useState(1);

  const destinations = [
    { name: "San Diego, CA", score: "98/100", feature: "Flat terrain, excellent transit." },
    { name: "Orlando, FL", score: "95/100", feature: "World-class theme park accessibility." },
    { name: "Washington, D.C.", score: "92/100", feature: "Free accessible museums & metro." }
  ];

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-brand-green/10 rounded-xl">
          <Plane className="w-6 h-6 text-brand-green-dark" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-brand-blue">Accessible Trip Planner</h2>
          <p className="text-slate-500">Plan vacations tailored for mobility and comfort.</p>
        </div>
      </div>

      {step === 1 && (
        <div className="animate-fade-in">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Where do you want to go?</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="e.g. Florida, California..." 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-green outline-none transition-colors text-lg"
              />
            </div>
          </div>
          <button 
            onClick={() => setStep(2)}
            disabled={!destination}
            className="w-full py-4 bg-brand-blue text-white font-bold rounded-xl shadow-md hover:bg-brand-blue-light disabled:opacity-50"
          >
            Find Accessible Destinations
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <h3 className="font-bold text-slate-800 mb-4">Top Rated for Mobility & Comfort</h3>
          <div className="space-y-4 mb-6">
            {destinations.map((dest, idx) => (
              <div key={idx} className="border-2 border-slate-100 rounded-xl p-4 flex justify-between items-center hover:border-brand-green/50 cursor-pointer transition-colors group">
                <div>
                  <h4 className="font-bold text-brand-blue text-lg group-hover:text-brand-green-dark">{dest.name}</h4>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                    <Accessibility className="w-4 h-4 text-brand-green" /> {dest.feature}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Access Score</div>
                  <div className="text-2xl font-black text-brand-green">{dest.score}</div>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setStep(1)}
            className="text-brand-green font-bold text-sm hover:underline"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}
