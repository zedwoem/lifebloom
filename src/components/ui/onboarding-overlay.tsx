"use client";

import React, { useEffect, useState } from "react";
import { Check, Heart, Smile, Wind, HelpCircle, ArrowRight } from "lucide-react";


export default function OnboardingOverlay() {
  const locale = "en";
  const [isOpen, setIsOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const profile = localStorage.getItem("lifebloom_user_profile");
    if (!profile) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isClient || !isOpen) return null;

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;

    const finalNickname = nickname.trim() || "our family";

    const userProfile = {
      nickname: finalNickname,
      mood: mood || "neutral",
      joinedAt: new Date().toISOString()
    };

    localStorage.setItem("lifebloom_user_profile", JSON.stringify(userProfile));
    
    // Dispatch custom event for navbar to catch
    window.dispatchEvent(new Event("lifebloom_profile_updated"));
    
    setIsOpen(false);
  };

  const moods = [
    { id: "happy", icon: Smile, label: "Happy" },
    { id: "calm", icon: Wind, label: "Calm" },
    { id: "anxious", icon: Heart, label: "Anxious" },
    { id: "curious", icon: HelpCircle, label: "Curious" }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-500">
      <div className="relative w-full max-w-lg p-8 mx-4 overflow-hidden bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/30 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 text-center">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome to LifeBloom Hub</h2>
          <p className="text-emerald-50 mb-8 text-sm opacity-80">
            A safe space tailored to your well-being. Let&apos;s personalize your experience.
          </p>

          <form onSubmit={handleComplete} className="space-y-6 text-left">
            <div>
              <label className="block text-sm font-medium text-emerald-100 mb-2" htmlFor="nickname-input">
                What should we call you? <span className="opacity-50 text-xs font-normal">(Optional)</span>
              </label>
              <input 
                id="nickname-input"
                name="nickname"
                type="text" 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your nickname..."
                autoComplete="nickname"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-emerald-100/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-100 mb-3">
                How are you feeling today? <span className="opacity-50 text-xs font-normal">(Optional)</span>
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {moods.map((m) => {
                  const Icon = m.icon;
                  const isSelected = mood === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMood(m.id)}
                      className={`group flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 ${
                        isSelected 
                          ? "bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_15px_rgba(52,211,153,0.3)] scale-105" 
                          : "bg-white/5 border-white/10 text-emerald-100/70 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-2 transition-transform duration-300 group-hover:scale-110 ${isSelected ? "text-emerald-400 scale-110" : ""}`} />
                      <span className="text-xs font-medium">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-start pt-2">
              <div className="flex items-center h-5">
                <input
                  id="consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/50"
                  required
                />
              </div>
              <label htmlFor="consent" className="ml-3 text-xs text-emerald-100/60 leading-tight">
                I agree to the <a href={locale === 'en' ? '/support/terms' : `/${locale}/support/terms`} className="text-emerald-400 hover:underline" target="_blank" rel="noreferrer">Terms of Service</a> and <a href={locale === 'en' ? '/support/privacy' : `/${locale}/support/privacy`} className="text-emerald-400 hover:underline" target="_blank" rel="noreferrer">Privacy Policy</a>, and consent to the use of cookies to enhance my experience.
              </label>
            </div>

            <button
              type="submit"
              disabled={!consent}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              Start Exploring
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
