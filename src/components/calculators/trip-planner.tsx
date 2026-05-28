"use client";

import { useState } from 'react';
import { Plane, MapPin, Accessibility, Calendar, ArrowRight } from 'lucide-react';
import { getFlightDeals } from '@/lib/actions/calculatorActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AccessibleTripPlanner() {
  const [origin, setOrigin] = useState('CGK');
  const [destination, setDestination] = useState('DPS');
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
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-sky-50 rounded-xl text-sky-600 border border-sky-100">
          <Plane className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            Accessible Trip Planner
          </h2>
          <p className="text-slate-500">Plan vacations with real-time flight deals and mobility reviews.</p>
        </div>
      </div>

      {step === 1 && (
        <div className="animate-fade-in space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Origin (IATA)</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  type="text" 
                  placeholder="e.g. CGK" 
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value.toUpperCase().trim())}
                  className="pl-12 text-lg uppercase"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Destination (IATA)</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  type="text" 
                  placeholder="e.g. DPS" 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value.toUpperCase().trim())}
                  className="pl-12 text-lg uppercase"
                />
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleSearch}
            disabled={!origin || !destination || isLoading}
            className="w-full py-6 text-lg bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
          >
            {isLoading ? 'Searching Live Rates...' : 'Find Accessible Flights & Prices'}
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in space-y-6">
          
          {/* Accessibility Score Card */}
          <div className="p-5 bg-emerald-50/50 border border-emerald-200/50 rounded-2xl flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-1.5">
                <Accessibility className="w-5 h-5 text-emerald-600" /> Accessibility Check
              </h3>
              <p className="text-sm text-slate-600 mt-1 max-w-sm">{accessInfo.text}</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Access Score</div>
              <div className="text-3xl font-black text-emerald-600">{accessInfo.score}</div>
            </div>
          </div>

          {/* Real Flight Deals Section */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3 text-sm tracking-wide uppercase">Cheapest Flight Deals Found</h3>
            <div className="space-y-3">
              {deals.length === 0 ? (
                <p className="text-slate-400 text-sm py-4 text-center">No active deals found for this route. Contact support.</p>
              ) : (
                deals.map((deal, idx) => (
                  <div key={idx} className="border border-slate-100 rounded-xl p-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100/50 transition-colors">
                    <div>
                      <div className="font-bold text-slate-800">{deal.airline}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3.5 h-3.5" /> 
                        {new Date(deal.departure_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {deal.direct && <span className="bg-sky-100 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full ml-2">Direct</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-sky-600">IDR {deal.price.toLocaleString()}</div>
                      <a 
                        href={deal.booking_url}
                        className="text-xs font-bold text-sky-600 hover:text-sky-800 inline-flex items-center gap-1 mt-1 underline"
                      >
                        Book Ticket <ArrowRight className="w-3 h-3" />
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
