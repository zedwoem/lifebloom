"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronDown, Newspaper, Video, HeartPulse, Activity, Plane, 
  Calculator, Home, Wrench, PawPrint, Stethoscope, Wallet, 
  TrendingUp, Users, Heart, LogIn, UserPlus, Menu, X, ArrowRight
} from 'lucide-react';
import { GlobalSearch } from './global-search';
import { NavbarUserStatus } from './navbar-user-status';

export function HeaderNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null);
  const pathname = usePathname();

  // Close mobile drawer on route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setMobileExpandedSection(null);
  }, [pathname]);

  // Lock scroll when mobile drawer is active
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileSection = (section: string) => {
    setMobileExpandedSection(prev => (prev === section ? null : section));
  };

  return (
    <>
      {/* DESKTOP NAVBAR CONTROLS */}
      <nav className="hidden md:flex items-center gap-6 lg:gap-8 h-full" aria-label="Desktop Main Navigation">
        <Link 
          href="/" 
          className="text-sm font-bold text-slate-600 hover:text-[#006948] transition-colors py-4"
        >
          Home
        </Link>

        {/* INSIGHTS DROPDOWN */}
        <div className="relative group h-full flex items-center">
          <button 
            type="button"
            className="text-sm font-bold text-slate-600 hover:text-[#006948] transition-colors flex items-center gap-1.5 py-4 outline-none focus:text-[#006948]"
          >
            Guides & Advice <ChevronDown className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
          </button>
          
          <div className="absolute top-[68px] left-[-20px] w-64 bg-white rounded-2xl border border-slate-200/60 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 p-3 space-y-1 z-50">
            <Link 
              href="/article" 
              className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors group/item"
            >
              <div className="p-2 bg-emerald-50 rounded-lg text-[#006948] group-hover/item:bg-emerald-100 transition-colors">
                <Newspaper className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Read Articles</span>
                <span className="text-[10px] text-slate-400 font-medium leading-relaxed block mt-0.5">Gentle, expert-reviewed advice</span>
              </div>
            </Link>
            
            <Link 
              href="/videos" 
              className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors group/item"
            >
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover/item:bg-indigo-100 transition-colors">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Watch Videos</span>
                <span className="text-[10px] text-slate-400 font-medium leading-relaxed block mt-0.5">Step-by-step visual help</span>
              </div>
            </Link>
          </div>
        </div>

        {/* COMMUNITY MEGA MENU */}
        <div className="relative group h-full flex items-center">
          <button 
            type="button"
            className="text-sm font-bold text-slate-600 hover:text-[#006948] transition-colors flex items-center gap-1.5 py-4 outline-none focus:text-[#006948]"
          >
            Tools & Care Network <ChevronDown className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
          </button>
          
          <div className="absolute top-[68px] right-[-200px] lg:right-[-280px] w-[680px] bg-white rounded-3xl border border-slate-200/60 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 p-8 grid grid-cols-12 gap-8 z-50">
            {/* Branding Column */}
            <div className="col-span-4 bg-slate-50/50 rounded-2xl p-5 border border-slate-200/40 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider block mb-2 self-start w-max">
                  Care Network
                </span>
                <h4 className="text-sm font-bold text-slate-800 font-display">Active Family Community</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold mt-2">
                  Find the exact calculators and safety checks you need for your loved ones, quickly and simply.
                </p>
              </div>
              <Link 
                href="/guestbook" 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006948] hover:text-[#005439] mt-6 group/btn"
              >
                Guestbook Wall <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Menu Grid Column */}
            <div className="col-span-8 grid grid-cols-2 gap-x-6 gap-y-6">
              {/* Senior Care */}
              <div>
                <Link href="/senior" className="text-xs font-extrabold text-[#006948] hover:underline flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4" /> Senior Care
                </Link>
                <div className="flex flex-col gap-1.5 mt-2 pl-5">
                  <Link href="/senior#drug-checker" className="text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:underline">
                    Prescription Checker
                  </Link>
                  <Link href="/senior#mobility-planner" className="text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:underline">
                    Mobility Safety Checklist
                  </Link>
                </div>
              </div>

              {/* Accessible Travel */}
              <div>
                <Link href="/travel" className="text-xs font-extrabold text-sky-700 hover:underline flex items-center gap-1.5">
                  <Plane className="w-4 h-4" /> Accessible Travel
                </Link>
                <div className="flex flex-col gap-1.5 mt-2 pl-5">
                  <Link href="/travel#trip-planner" className="text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:underline">
                    Trip Search Engine
                  </Link>
                  <Link href="/travel#trip-budget" className="text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:underline">
                    Travel Budget Planner
                  </Link>
                </div>
              </div>

              {/* Home & Living */}
              <div>
                <Link href="/home-living" className="text-xs font-extrabold text-orange-700 hover:underline flex items-center gap-1.5">
                  <Home className="w-4 h-4" /> Smart Home
                </Link>
                <div className="flex flex-col gap-1.5 mt-2 pl-5">
                  <Link href="/home-living#smart-matcher" className="text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:underline">
                    Matter Devices Matcher
                  </Link>
                  <Link href="/home-living#budget-renovator" className="text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:underline">
                    DIY Budget Planner
                  </Link>
                </div>
              </div>

              {/* Pet Family */}
              <div>
                <Link href="/pet-family" className="text-xs font-extrabold text-indigo-700 hover:underline flex items-center gap-1.5">
                  <PawPrint className="w-4 h-4" /> Pet Family
                </Link>
                <div className="flex flex-col gap-1.5 mt-2 pl-5">
                  <Link href="/pet-family#matchmaker" className="text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:underline">
                    Breed Matcher Quiz
                  </Link>
                  <Link href="/pet-family#canine-symptom" className="text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:underline">
                    Canine Symptom Triage
                  </Link>
                </div>
              </div>

              {/* Money Future */}
              <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                <Link href="/money-future" className="text-xs font-extrabold text-amber-700 hover:underline flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" /> Wealth Optimization
                </Link>
                <div className="flex items-center gap-6 mt-2 pl-5">
                  <Link href="/money-future#retirement-planner" className="text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:underline">
                    Retirement Savings Planner
                  </Link>
                  <Link href="/money-future#yield-radar" className="text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:underline">
                    High-Yield Compounding Radar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HELPDESK */}
        <Link 
          href="/support" 
          className="text-sm font-bold text-slate-600 hover:text-[#006948] transition-colors py-4"
        >
          Helpdesk
        </Link>

        {/* JOIN US DROPDOWN */}
        <div className="relative group h-full flex items-center">
          <button 
            type="button"
            className="text-sm font-bold text-slate-600 hover:text-[#006948] transition-colors flex items-center gap-1.5 py-4 outline-none focus:text-[#006948]"
          >
            Join Us <ChevronDown className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
          </button>
          
          <div className="absolute top-[68px] right-0 w-64 bg-white rounded-2xl border border-slate-200/60 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 p-3 space-y-1 z-50">
            <Link 
              href="/join-us" 
              className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors group/item"
            >
              <div className="p-2 bg-emerald-50 rounded-lg text-[#006948] group-hover/item:bg-emerald-100 transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Partner With Us</span>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">B2B contextual models</span>
              </div>
            </Link>

            <Link 
              href="/guestbook" 
              className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors group/item"
            >
              <div className="p-2 bg-rose-50 rounded-lg text-rose-600 group-hover/item:bg-rose-100 transition-colors">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Guestbook Wall</span>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Share support messages</span>
              </div>
            </Link>

            <div className="h-px bg-slate-100 my-2" />

            <Link 
              href="/login" 
              className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors"
            >
              <LogIn className="w-4 h-4 text-slate-400" />
              <span>Log In</span>
            </Link>

            <Link 
              href="/register" 
              className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-slate-50 rounded-xl text-xs font-bold text-[#006948] transition-colors"
            >
              <UserPlus className="w-4 h-4 text-[#006948]" />
              <span>Create Account</span>
            </Link>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        {/* Global Search icon trigger */}
        <GlobalSearch variant="icon" />

        <NavbarUserStatus />
      </nav>

      {/* MOBILE TRIGGER */}
      <div className="md:hidden flex items-center gap-2 shrink-0">
        <GlobalSearch variant="icon" />
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center justify-center p-3 bg-[#FAF8F3] hover:bg-[#F2EFE9] rounded-full border border-slate-200/60 text-slate-600 transition-all active:scale-95 shadow-2xs cursor-pointer min-h-[44px] min-w-[44px]"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* MOBILE SLIDE OVER DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in md:hidden">
          <div className="absolute inset-0" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="relative w-80 max-w-full bg-[#FFFDF5] h-full shadow-2xl flex flex-col justify-between animate-slide-left border-l border-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
              <span className="font-extrabold text-slate-800 font-display">LifeBloom Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable menu options */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <Link 
                href="/" 
                className="block text-base font-bold text-slate-800 hover:text-[#006948] transition-colors py-2 border-b border-slate-100/50"
              >
                Home
              </Link>

              {/* Insights mobile collapse */}
              <div className="border-b border-slate-100/50 pb-2">
                <button
                  onClick={() => toggleMobileSection('insights')}
                  className="flex items-center justify-between w-full text-base font-bold text-slate-800 hover:text-[#006948] transition-colors py-2"
                >
                  <span>Guides & Advice</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${mobileExpandedSection === 'insights' ? 'rotate-180' : ''}`} />
                </button>
                
                {mobileExpandedSection === 'insights' && (
                  <div className="pl-4 mt-2 space-y-3 animate-slide-down">
                    <Link href="/article" className="flex items-center gap-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-[#006948]">
                      <Newspaper className="w-4 h-4 text-emerald-600" /> Read Articles
                    </Link>
                    <Link href="/videos" className="flex items-center gap-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-[#006948]">
                      <Video className="w-4 h-4 text-indigo-600" /> Watch Videos
                    </Link>
                  </div>
                )}
              </div>

              {/* Community mobile collapse */}
              <div className="border-b border-slate-100/50 pb-2">
                <button
                  onClick={() => toggleMobileSection('community')}
                  className="flex items-center justify-between w-full text-base font-bold text-slate-800 hover:text-[#006948] transition-colors py-2"
                >
                  <span>Tools & Care Network</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${mobileExpandedSection === 'community' ? 'rotate-180' : ''}`} />
                </button>

                {mobileExpandedSection === 'community' && (
                  <div className="pl-4 mt-2 space-y-4 animate-slide-down max-h-[300px] overflow-y-auto pr-1">
                    <div>
                      <Link href="/senior" className="text-xs font-extrabold text-[#006948] block">Senior Care</Link>
                      <div className="flex flex-col gap-2 mt-1.5 pl-3">
                        <Link href="/senior#drug-checker" className="text-[11px] font-semibold text-slate-500">Prescription Checker</Link>
                        <Link href="/senior#mobility-planner" className="text-[11px] font-semibold text-slate-500">Mobility Safety</Link>
                      </div>
                    </div>

                    <div>
                      <Link href="/travel" className="text-xs font-extrabold text-sky-700 block">Accessible Travel</Link>
                      <div className="flex flex-col gap-2 mt-1.5 pl-3">
                        <Link href="/travel#trip-planner" className="text-[11px] font-semibold text-slate-500">Trip Search Engine</Link>
                        <Link href="/travel#trip-budget" className="text-[11px] font-semibold text-slate-500">Travel Budget</Link>
                      </div>
                    </div>

                    <div>
                      <Link href="/home-living" className="text-xs font-extrabold text-orange-700 block">Smart Home</Link>
                      <div className="flex flex-col gap-2 mt-1.5 pl-3">
                        <Link href="/home-living#smart-matcher" className="text-[11px] font-semibold text-slate-500">Devices Matcher</Link>
                        <Link href="/home-living#budget-renovator" className="text-[11px] font-semibold text-slate-500">Budget Planner</Link>
                      </div>
                    </div>

                    <div>
                      <Link href="/pet-family" className="text-xs font-extrabold text-indigo-700 block">Pet Family</Link>
                      <div className="flex flex-col gap-2 mt-1.5 pl-3">
                        <Link href="/pet-family#matchmaker" className="text-[11px] font-semibold text-slate-500">Breed Matcher</Link>
                        <Link href="/pet-family#canine-symptom" className="text-[11px] font-semibold text-slate-500">Canine Symptom Triage</Link>
                      </div>
                    </div>

                    <div>
                      <Link href="/money-future" className="text-xs font-extrabold text-amber-700 block">Wealth</Link>
                      <div className="flex flex-col gap-2 mt-1.5 pl-3">
                        <Link href="/money-future#retirement-planner" className="text-[11px] font-semibold text-slate-500">Retirement Planner</Link>
                        <Link href="/money-future#yield-radar" className="text-[11px] font-semibold text-slate-500">Yield Compounding</Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link 
                href="/support" 
                className="block text-base font-bold text-slate-800 hover:text-[#006948] transition-colors py-2 border-b border-slate-100/50"
              >
                Support
              </Link>

              {/* Join Us mobile collapse */}
              <div className="border-b border-slate-100/50 pb-2">
                <button
                  onClick={() => toggleMobileSection('join')}
                  className="flex items-center justify-between w-full text-base font-bold text-slate-800 hover:text-[#006948] transition-colors py-2"
                >
                  <span>Join Us</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${mobileExpandedSection === 'join' ? 'rotate-180' : ''}`} />
                </button>

                {mobileExpandedSection === 'join' && (
                  <div className="pl-4 mt-2 space-y-3 animate-slide-down">
                    <Link href="/join-us" className="flex items-center gap-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-[#006948]">
                      <Users className="w-4 h-4 text-emerald-600" /> Partner With Us
                    </Link>
                    <Link href="/guestbook" className="flex items-center gap-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-[#006948]">
                      <Heart className="w-4 h-4 text-rose-600" /> Guestbook Wall
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 bg-white border-t border-slate-200 space-y-3">
              <Link href="/login" className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
                <LogIn className="w-4 h-4" /> Log In
              </Link>
              <Link href="/register" className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer">
                <UserPlus className="w-4 h-4" /> Create Account
              </Link>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
