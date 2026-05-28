"use client";

import React from 'react';
import { X, Heart, ShieldAlert, Award, Home, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnhancedPet } from '@/lib/services/petService';

interface PetDetailModalProps {
  pet: EnhancedPet | null;
  onClose: () => void;
}

export function PetDetailModal({ pet, onClose }: PetDetailModalProps) {
  if (!pet) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-[#FFFDF5] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative border border-slate-200/50 animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all flex items-center justify-center font-bold"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Photo Section */}
        <div className="relative h-[320px] bg-slate-900 overflow-hidden">
          <img 
            src={pet.photos[0]} 
            alt={pet.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FFFDF5] via-transparent to-transparent" />
          
          <div className="absolute bottom-6 left-8 right-8">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-rose-100 border border-rose-200 rounded-full text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">
              <Heart className="w-3 h-3 fill-current" /> {pet.breed}
            </span>
            <h2 
              className="text-4xl font-black text-slate-800 tracking-tight leading-none"
              style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}
            >
              {pet.name}
            </h2>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-50/60 border border-emerald-100/50 rounded-2xl text-center">
              <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-extrabold block mb-1">Gender</span>
              <span className="font-bold text-slate-800 text-base">{pet.gender}</span>
            </div>
            <div className="p-4 bg-emerald-50/60 border border-emerald-100/50 rounded-2xl text-center">
              <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-extrabold block mb-1">Age</span>
              <span className="font-bold text-slate-800 text-base">{pet.age}</span>
            </div>
            <div className="p-4 bg-emerald-50/60 border border-emerald-100/50 rounded-2xl text-center">
              <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-extrabold block mb-1">Size</span>
              <span className="font-bold text-slate-800 text-base">{pet.size}</span>
            </div>
            <div className="p-4 bg-amber-50/60 border border-amber-100/50 rounded-2xl text-center">
              <span className="text-[10px] uppercase tracking-wider text-amber-800 font-extrabold block mb-1">Adoption Fee</span>
              <span className="font-bold text-slate-800 text-base">${pet.adoptionFee}</span>
            </div>
          </div>

          {/* Compatibility Badges */}
          <div>
            <span className="block text-xs uppercase font-extrabold tracking-widest text-[#006948] mb-3">Compatibility Projections</span>
            <div className="flex flex-wrap gap-2.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${pet.goodWithKids ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-slate-50 text-slate-400'}`}>
                <Award className="w-3.5 h-3.5" /> Good with Kids: {pet.goodWithKids ? 'Verified' : 'Medium'}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${pet.goodWithCats ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-slate-50 text-slate-400'}`}>
                <Compass className="w-3.5 h-3.5" /> Good with Cats: {pet.goodWithCats ? 'Verified' : 'Medium'}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${pet.goodWithApartments ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-slate-50 text-slate-400'}`}>
                <Home className="w-3.5 h-3.5" /> Good with Apartments: {pet.goodWithApartments ? 'Verified' : 'Medium'}
              </span>
            </div>
          </div>

          {/* Story Bio */}
          <div className="space-y-2">
            <span className="block text-xs uppercase font-extrabold tracking-widest text-[#006948]">Biography & Personality</span>
            <p className="text-slate-650 leading-relaxed text-base font-medium">
              {pet.bio}
            </p>
          </div>

          {/* Safety Disclaimer */}
          <div className="p-4 bg-rose-50/40 border border-rose-100/60 rounded-2xl flex gap-3 text-xs text-rose-800 font-semibold leading-relaxed">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <p>
              Note: Compatibility scores are analytical matching forecasts. Dynamic animal behavior depends on individual care settings. We always advise setting up initial physical interactions via rescue officers.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="text-xs">
              <span className="block text-slate-400 font-bold uppercase tracking-wider">Rescue Shelter</span>
              <span className="font-extrabold text-slate-700">{pet.rescueOrg}</span>
            </div>
            <a 
              href={pet.contactUrl}
              className="px-6 py-4 bg-[#006948] hover:bg-[#005439] text-white font-bold rounded-2xl shadow-md shadow-emerald-800/10 transition-all flex items-center gap-2 hover:scale-[1.02] text-sm"
            >
              Meet {pet.name} (Apply to Adopt) <Heart className="w-4 h-4 fill-current text-white" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
