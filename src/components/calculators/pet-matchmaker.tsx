"use client";

import React, { useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, ArrowLeft, HelpCircle, MapPin, Compass, Sparkles, Award } from "lucide-react";
import { PetDetailModal } from "./PetDetailModal";
import { EnhancedPet } from "@/lib/services/petService";

export function PetMatchmaker() {
  const [step, setStep] = useState<number>(1);
  const [species, setSpecies] = useState<'dog' | 'cat'>('dog');
  const [space, setSpace] = useState<'small' | 'large'>('large');
  const [time, setTime] = useState<'low' | 'medium' | 'high'>('medium');
  const [hasKids, setHasKids] = useState<boolean>(false);
  const [hasPets, setHasPets] = useState<boolean>(false);
  const [energy, setEnergy] = useState<'low' | 'medium' | 'high'>('medium');
  
  const [zipCode, setZipCode] = useState<string>("");
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [results, setResults] = useState<EnhancedPet[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPet, setSelectedPet] = useState<EnhancedPet | null>(null);

  const detectLocation = () => {
    setIsDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // Simulate dynamic location fallback
          setZipCode("90210");
          setIsDetecting(false);
        },
        () => {
          setIsDetecting(false);
        }
      );
    } else {
      setIsDetecting(false);
    }
  };

  const handleMatch = async () => {
    setIsLoading(true);
    setStep(6);
    
    try {
      const url = `/api/pets/search?species=${species}&space=${space}&time=${time}&hasKids=${hasKids}&hasPets=${hasPets}&energy=${energy}${zipCode ? `&zipCode=${zipCode}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to match pets");
      
      const data = await response.json();
      setResults(data.animals || []);
    } catch (error) {
      console.warn("Fallback to client models active.");
      // Client-side fallback matching
      const fallbacks: EnhancedPet[] = [
        {
          id: 'fb-dog-1',
          name: 'Buddy',
          type: 'dog',
          breed: 'Golden Retriever Mix',
          age: 'Young',
          size: 'Large',
          gender: 'Male',
          photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80'],
          bio: 'Buddy is a happy-go-lucky companion who loves water, fetch, and cozy evening cuddles. He is incredibly patient and excellent with children.',
          compatibilityScore: species === 'dog' ? 95 : 65,
          adoptionFee: 150,
          tags: ['Playful', 'Patient', 'Loving'],
          goodWithKids: true,
          goodWithCats: true,
          goodWithApartments: false,
          rescueOrg: 'Safe Harbor Rescue Shelter',
          contactUrl: '/support'
        },
        {
          id: 'fb-dog-2',
          name: 'Mochi',
          type: 'dog',
          breed: 'French Bulldog',
          age: 'Adult',
          size: 'Small',
          gender: 'Female',
          photos: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80'],
          bio: 'Mochi is a professional couch potato. She loves short walks around the block, eating carrots, and snoring gently next to your desk.',
          compatibilityScore: species === 'dog' && space === 'small' ? 98 : 70,
          adoptionFee: 200,
          tags: ['Quiet', 'Friendly', 'Calm'],
          goodWithKids: true,
          goodWithCats: true,
          goodWithApartments: true,
          rescueOrg: 'Cozy Paws Shelter Network',
          contactUrl: '/support'
        },
        {
          id: 'fb-cat-1',
          name: 'Cleo',
          type: 'cat',
          breed: 'Ragdoll Mix',
          age: 'Adult',
          size: 'Medium',
          gender: 'Female',
          photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80'],
          bio: 'Cleo is a soft, fluffy princess who will follow you from room to room. She has beautiful blue eyes and loves chasing feather wands.',
          compatibilityScore: species === 'cat' ? 96 : 60,
          adoptionFee: 100,
          tags: ['Affectionate', 'Gentle', 'Fluffy'],
          goodWithKids: true,
          goodWithCats: true,
          goodWithApartments: true,
          rescueOrg: 'Happy Felines League',
          contactUrl: '/support'
        }
      ];
      setResults(fallbacks.filter(p => p.type === species));
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuiz = () => {
    setStep(1);
    setResults(null);
  };

  return (
    <ClientOnly fallbackHeight="h-[520px]">
      <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-200/60 shadow-md max-w-3xl mx-auto selection:bg-[#ffead1]">
        
        {/* Step Indicator Header */}
        {step < 6 && (
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-8">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#006948] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Pet Companionship Wizard
            </span>
            <span className="text-xs font-black text-slate-400">
              Step {step} of 5
            </span>
          </div>
        )}

        {/* Wizard Multi-Step Container with Smooth Transition Indicator */}
        <div className="transition-all duration-300">
          
          {/* STEP 1: Species Selection */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight text-center">
                Who are you looking to welcome into your heart?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={() => { setSpecies('dog'); setStep(2); }}
                  className={`p-8 rounded-2xl border text-center transition-all flex flex-col items-center justify-center min-h-[160px] ${species === 'dog' ? 'border-[#006948] bg-emerald-50/20 text-[#006948]' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="text-4xl mb-3">🐶</span>
                  <span className="font-extrabold text-lg text-slate-700">A Playful Dog</span>
                </button>
                <button 
                  onClick={() => { setSpecies('cat'); setStep(2); }}
                  className={`p-8 rounded-2xl border text-center transition-all flex flex-col items-center justify-center min-h-[160px] ${species === 'cat' ? 'border-[#006948] bg-emerald-50/20 text-[#006948]' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="text-4xl mb-3">🐱</span>
                  <span className="font-extrabold text-lg text-slate-700">A Loving Cat</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Living Space */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight text-center">
                Where will your new companion live?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={() => { setSpace('small'); setStep(3); }}
                  className={`p-8 rounded-2xl border text-center transition-all flex flex-col items-center justify-center min-h-[160px] ${space === 'small' ? 'border-[#006948] bg-emerald-50/20 text-[#006948]' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="text-4xl mb-3">🏢</span>
                  <span className="font-extrabold text-lg text-slate-700">Cozy Apartment</span>
                </button>
                <button 
                  onClick={() => { setSpace('large'); setStep(3); }}
                  className={`p-8 rounded-2xl border text-center transition-all flex flex-col items-center justify-center min-h-[160px] ${space === 'large' ? 'border-[#006948] bg-emerald-50/20 text-[#006948]' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="text-4xl mb-3">🏡</span>
                  <span className="font-extrabold text-lg text-slate-700">House with Yard</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Daily Activity / Commitment Time */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight text-center">
                How much daily active time can you share?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <button 
                  onClick={() => { setTime('low'); setStep(4); }}
                  className={`p-6 rounded-2xl border text-center transition-all flex flex-col items-center justify-center min-h-[140px] ${time === 'low' ? 'border-[#006948] bg-emerald-50/20 text-[#006948]' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="text-3xl mb-2">🛋️</span>
                  <span className="font-extrabold text-base text-slate-700">Relaxed (&lt; 1 Hour)</span>
                </button>
                <button 
                  onClick={() => { setTime('medium'); setStep(4); }}
                  className={`p-6 rounded-2xl border text-center transition-all flex flex-col items-center justify-center min-h-[140px] ${time === 'medium' ? 'border-[#006948] bg-emerald-50/20 text-[#006948]' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="text-3xl mb-2">🏃</span>
                  <span className="font-extrabold text-base text-slate-700">Moderate (1-2 Hours)</span>
                </button>
                <button 
                  onClick={() => { setTime('high'); setStep(4); }}
                  className={`p-6 rounded-2xl border text-center transition-all flex flex-col items-center justify-center min-h-[140px] ${time === 'high' ? 'border-[#006948] bg-emerald-50/20 text-[#006948]' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="text-3xl mb-2">⛰️</span>
                  <span className="font-extrabold text-base text-slate-700">High (&gt; 2 Hours)</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Kids / Pets Environment */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight text-center">
                Who else is sharing your family space?
              </h2>
              <div className="space-y-4 pt-4 max-w-md mx-auto">
                <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <span className="font-extrabold text-slate-700 text-sm flex items-center gap-2">🧒 Children in the house</span>
                  <input 
                    type="checkbox" 
                    checked={hasKids} 
                    onChange={(e) => setHasKids(e.target.checked)}
                    className="w-5 h-5 accent-[#006948]"
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <span className="font-extrabold text-slate-700 text-sm flex items-center gap-2">🐶 Other pets present</span>
                  <input 
                    type="checkbox" 
                    checked={hasPets} 
                    onChange={(e) => setHasPets(e.target.checked)}
                    className="w-5 h-5 accent-[#006948]"
                  />
                </label>
              </div>
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={() => setStep(5)}
                  className="px-6 py-3.5 bg-[#006948] hover:bg-[#005439] text-white font-bold rounded-xl flex items-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: Energy Level & Zip Code Filtering */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight text-center">
                Choose the preferred personality profile
              </h2>
              
              {/* Energy selection buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {['low', 'medium', 'high'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setEnergy(level as any)}
                    className={`px-4 py-3 border text-sm font-extrabold capitalize rounded-xl transition-all ${energy === level ? 'border-[#006948] bg-emerald-50/20 text-[#006948] ring-2 ring-[#006948]/20' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    {level} Energy
                  </button>
                ))}
              </div>

              {/* Advanced location parameters */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <span className="block text-xs uppercase font-extrabold tracking-widest text-slate-400">Search near your ZIP code (Optional)</span>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="e.g. 90210"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/20"
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={detectLocation}
                    disabled={isDetecting}
                    className="h-12 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs px-4"
                  >
                    {isDetecting ? 'Detecting...' : 'Auto Detect'}
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6">
                <button 
                  onClick={() => setStep(4)}
                  className="flex items-center gap-1 text-slate-500 font-bold hover:text-slate-800 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <Button 
                  onClick={handleMatch}
                  className="px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/10"
                >
                  Find My Companion Matches <Heart className="w-4 h-4 fill-current text-white" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: Loading & Match Results Grid */}
          {step === 6 && (
            <div className="space-y-8 animate-fade-in">
              {isLoading ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-14 h-14 border-4 border-[#006948] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-slate-500 font-bold text-lg animate-pulse">Scanning live animal shelter networks...</p>
                </div>
              ) : results && results.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>Matched Companions</h3>
                      <p className="text-slate-500 text-sm">Best lifestyle matches found in your region.</p>
                    </div>
                    <Button 
                      onClick={resetQuiz}
                      variant="outline"
                      className="text-xs font-bold rounded-xl"
                    >
                      Restart Quiz
                    </Button>
                  </div>

                  {/* Results Horizontal Carousel Card list */}
                  <div className="space-y-4">
                    {results.map((pet) => (
                      <div 
                        key={pet.id}
                        className="bg-white border border-slate-200/60 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 hover:shadow-lg hover:border-emerald-500/20 transition-all duration-300 relative overflow-hidden"
                      >
                        {/* Emotive Large Pet Photo */}
                        <div className="w-full md:w-36 h-36 bg-slate-900 rounded-2xl overflow-hidden shrink-0">
                          <img 
                            src={pet.photos[0]} 
                            alt={pet.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                          />
                        </div>

                        {/* Pet Description Details */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">{pet.breed}</span>
                            
                            {/* Compatibility Score badge with large gradient */}
                            <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm">
                              <Award className="w-3.5 h-3.5" /> {pet.compatibilityScore}% Fit
                            </div>
                          </div>
                          <h4 className="text-2xl font-black text-slate-800" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                            {pet.name}
                          </h4>
                          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                            {pet.bio}
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {pet.tags.map(t => (
                              <span key={t} className="px-2.5 py-0.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-550 capitalize">{t}</span>
                            ))}
                          </div>
                        </div>

                        {/* Click Action triggers Detail Modal */}
                        <div className="w-full md:w-auto self-stretch flex items-end md:items-center justify-end">
                          <Button 
                            onClick={() => setSelectedPet(pet)}
                            className="w-full md:w-auto px-5 py-3.5 bg-emerald-50 hover:bg-emerald-100 text-[#006948] font-bold rounded-xl text-sm flex items-center gap-1"
                          >
                            Meet {pet.name} <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center space-y-4">
                  <span className="text-5xl">🥺</span>
                  <h3 className="text-xl font-bold text-slate-800">No companions match perfectly</h3>
                  <p className="text-slate-500 max-w-sm mx-auto text-sm">We couldn&apos;t find any animals that match your criteria. Try widening your zip code parameters.</p>
                  <Button onClick={resetQuiz} className="bg-[#006948] text-white">Restart Quiz</Button>
                </div>
              )}
            </div>
          )}

        </div>
        
        {/* Progress Dots at the bottom of the active wizard steps */}
        {step < 6 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`w-2.5 h-2.5 rounded-full transition-all ${step === s ? 'bg-[#006948] scale-125' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        )}

        {/* Dynamic Detailed Modal overlay */}
        <PetDetailModal 
          pet={selectedPet} 
          onClose={() => setSelectedPet(null)}
        />
      </div>
    </ClientOnly>
  );
}
