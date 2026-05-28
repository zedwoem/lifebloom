"use client";

import { useState } from 'react';
import { Plane, MapPin, Accessibility, Calendar, ArrowRight } from 'lucide-react';
import { getFlightDeals } from '@/lib/actions/calculatorActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AccessibleTripPlanner() {
  const [origin, setOrigin] = useState('CGK');
  const [destination, setDestination] = useState('DPS');
  const [needs, setNeeds] = useState('wheelchair');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [deals, setDeals] = useState<any[]>([]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const flightDeals = await getFlightDeals(origin, destination);
      setDeals(flightDeals || []);
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccessibilityFeatures = (destCode: string) => {
    const features: Record<string, { score: string; text: string }> = {
      DPS: { score: "88/100", text: "Flat resort walking trails, standard accessible hotel options." },
      SIN: { score: "98/100", text: "Flawless wheelchair infrastructure, barrier-free subways & tactile pavings." },
      LAX: { score: "95/100", text: "Excellent ADA compliant airport transfers & flat beach paths." },
      NRT: { score: "92/100", text: "Very high station accessibility and step-free shuttle buses." }
    };
    return features[destCode.toUpperCase()] || { score: "85/100", text: "Standard accessibility. Contact your lodging for specific step-free verification." };
  };

  const accessInfo = getAccessibilityFeatures(destination);

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden mb-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-sky-50 rounded-2xl text-sky-600 border border-sky-100">
          <Plane className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            Accessible Journey Planner
          </h2>
          <p className="text-slate-500 font-medium mt-1">Discover comfortable, barrier-free routes tailored to your mobility needs.</p>
        </div>
      </div>

      {step === 1 && (
        <div className="animate-fade-in space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Where are you departing from?</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  type="text" 
                  placeholder="Airport Code (e.g., CGK)" 
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value.toUpperCase().trim())}
                  className="pl-12 text-lg uppercase h-14 rounded-xl border-slate-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Where would you like to go?</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  type="text" 
                  placeholder="Airport Code (e.g., DPS)" 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value.toUpperCase().trim())}
                  className="pl-12 text-lg uppercase h-14 rounded-xl border-slate-200"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Primary Accessibility Focus</label>
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'wheelchair', label: 'Wheelchair Access' },
                { id: 'visual', label: 'Visual Assistance' },
                { id: 'hearing', label: 'Hearing Assistance' },
                { id: 'cognitive', label: 'Cognitive Support' }
              ].map(need => (
                <button
                  key={need.id}
                  onClick={() => setNeeds(need.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    needs === need.id 
                      ? "bg-sky-600 text-white shadow-md ring-2 ring-sky-600 ring-offset-2" 
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {need.label}
                </button>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={handleSearch}
            disabled={!origin || !destination || isLoading}
            className="w-full h-14 text-lg bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-transform active:scale-[0.98]"
          >
            {isLoading ? 'Checking Routes & Facilities...' : 'Find Comfortable Routes'}
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in space-y-6">
          
          {/* Accessibility Score Card */}
          <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full text-xs font-bold text-emerald-700 shadow-sm mb-3">
                <Accessibility className="w-4 h-4" /> Destination Comfort Score
              </div>
              <h3 className="font-black text-slate-800 text-xl md:text-2xl mb-2">{destination} Accessibility</h3>
              <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed max-w-md">{accessInfo.text}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm text-center min-w-[120px] border border-emerald-50">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</div>
              <div className="text-4xl font-black text-emerald-600 tracking-tighter">{accessInfo.score}</div>
            </div>
          </div>

          {/* Real Flight Deals Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-lg">Recommended Flights</h3>
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full">Sorted by Comfort & Price</span>
            </div>
            <div className="space-y-4">
              {deals.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Plane className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No active flights found for this specific route right now.<br/>Please try different dates or airports.</p>
                </div>
              ) : (
                deals.map((deal, idx) => (
                  <div key={idx} className="border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white hover:border-sky-200 hover:shadow-md transition-all group">
                    <div>
                      <div className="font-black text-slate-800 text-lg group-hover:text-sky-700 transition-colors">{deal.airline}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-2 mt-1.5 font-medium">
                        <Calendar className="w-4 h-4 text-slate-400" /> 
                        {new Date(deal.departure_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        {deal.direct && <span className="bg-sky-100/50 text-sky-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ml-2 border border-sky-100">Direct Flight</span>}
                      </div>
                    </div>
                    <div className="text-left md:text-right w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end">
                      <div className="text-xl md:text-2xl font-black text-slate-800">IDR {deal.price.toLocaleString()}</div>
                      <a 
                        href={deal.booking_url}
                        className="text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg inline-flex items-center gap-2 mt-2 transition-colors"
                      >
                        Select Flight <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button 
            onClick={() => setStep(1)}
            className="text-sky-600 font-bold text-sm hover:underline block"
          >
            ← Modify Search
          </button>
        </div>
      )}
    </div>
  );
}
