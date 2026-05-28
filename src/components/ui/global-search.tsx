// src/components/ui/global-search.tsx
"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { Search, Command, ArrowRight, TrendingUp, Sparkles, Hash, X, Calculator } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export const searchIndex = [
  { id: 1, title: 'Retirement Calculator', category: 'money', tags: ['finance', 'planning', 'savings', '401k', 'High-Yield Savings'], url: '/money-future/retirement-planner' },
  { id: 2, title: 'Yield Radar', category: 'money', tags: ['investment', 'rates', 'bonds', 'interest', 'High-Yield Savings'], url: '/money-future/yield-radar' },
  { id: 3, title: 'Smart Home Matcher', category: 'home', tags: ['automation', 'matter', 'iot', 'security', 'Smart Home Cameras'], url: '/home-living/smart-matcher' },
  { id: 4, title: 'DIY Budget Renovator', category: 'home', tags: ['renovation', 'cost', 'diy', 'materials'], url: '/home-living/budget-renovator' },
  { id: 5, title: 'Pet Matchmaker', category: 'pet', tags: ['dogs', 'cats', 'adoption', 'quiz'], url: '/pet-family/matchmaker' },
  { id: 6, title: 'Canine Symptom Checker', category: 'pet', tags: ['health', 'symptoms', 'vet', 'dog', 'Dog Joint Health'], url: '/pet-family/canine-symptom-checker' },
  { id: 7, title: 'Drug Interaction Checker', category: 'senior', tags: ['health', 'medication', 'safety', 'pills', 'Medicare'], url: '/senior/drug-checker' },
  { id: 8, title: 'Home Mobility Planner', category: 'senior', tags: ['safety', 'accessibility', 'wheelchair', 'aging in place'], url: '/senior/mobility-planner' },
  { id: 9, title: 'Accessible Trip Planner', category: 'travel', tags: ['vacation', 'accessibility', 'family', 'budget'], url: '/travel/trip-planner' },
  { id: 10, title: 'The New Medicare Part D Changes Explained', category: 'senior', tags: ['health', 'insurance', 'medicare', 'Medicare Part D'], url: '/article/the-new-medicare-part-d-changes-explained' },
  { id: 11, title: 'The 10 Most Wheelchair-Accessible Cities in Europe', category: 'travel', tags: ['europe', 'accessible', 'guide'], url: '/article/the-10-most-wheelchair-accessible-cities-in-europe' }
];

const SUGGESTIONS = ["Medicare Part D", "Smart Home Cameras", "Dog Joint Health", "High-Yield Savings"];
const CATEGORIES = [
  { name: "Money", path: "money-future", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
  { name: "Home", path: "home-living", color: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
  { name: "Pet", path: "pet-family", color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" },
  { name: "Senior", path: "senior", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
  { name: "Travel", path: "travel", color: "bg-teal-50 text-teal-700 hover:bg-teal-100" }
];

export function GlobalSearch({ variant = 'navbar' }: { variant?: 'navbar' | 'hero' | 'icon' }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [dbResults, setDbResults] = useState<{ item: any }[]>([]);
  const [isSearchingDB, setIsSearchingDB] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  
  const [trending, setTrending] = useState<{ title: string; url: string }[]>([]);
  const [isLoadingDynamic, setIsLoadingDynamic] = useState(true);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const params = useParams();
  const locale = "en";

  // Initial fetch of dynamic trending data
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true') {
      setTrending([
        { title: "Medicare Part D Changes", url: `/article/the-new-medicare-part-d-changes-explained` },
        { title: "Accessible European Cities", url: `/article/the-10-most-wheelchair-accessible-cities-in-europe` },
        { title: "Retirement Planner", url: `/money-future/retirement-planner` }
      ]);
      setIsLoadingDynamic(false);
      return;
    }

    import('@/lib/services/metricsService').then(({ MetricsService }) => {
      MetricsService.getTrending(4).then(data => {
        if (data && data.length > 0) {
          setTrending(data.map(item => ({
            title: item.title,
            url: `/${item.slug.startsWith('article') ? '' : ''}${item.slug}`
          })));
        } else {
          setTrending([
            { title: "Medicare Part D Changes", url: `/article/the-new-medicare-part-d-changes-explained` },
            { title: "Accessible European Cities", url: `/article/the-10-most-wheelchair-accessible-cities-in-europe` },
            { title: "Retirement Planner", url: `/money-future/retirement-planner` }
          ]);
        }
        setIsLoadingDynamic(false);
      }).catch(() => {
        setTrending([
          { title: "Medicare Part D Changes", url: `/article/the-new-medicare-part-d-changes-explained` },
          { title: "Accessible European Cities", url: `/article/the-10-most-wheelchair-accessible-cities-in-europe` },
          { title: "Retirement Planner", url: `/money-future/retirement-planner` }
        ]);
        setIsLoadingDynamic(false);
      });
    });
  }, [locale]);

  // 1. Static Fuse.js search setup
  const fuse = useMemo(() => new Fuse(searchIndex, {
    keys: ['title', 'category', 'tags'],
    threshold: 0.4,
    includeScore: true
  }), []);

  // 2. Debounce user input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  // 3. Dynamic DB Search Hook
  useEffect(() => {
    if (debouncedQuery.trim().length < 3) {
      setDbResults([]);
      setIsSearchingDB(false);
      return;
    }

    const searchSupabase = async () => {
      setIsSearchingDB(true);
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from('canonical_articles')
          .select('id, title, pillar, slug')
          .ilike('title', `%${debouncedQuery}%`)
          .limit(4);

        if (!error && data) {
          const mapped = data.map((art) => ({
            item: {
              id: `db-${art.id}`,
              title: art.title,
              category: art.pillar || 'article',
              tags: ['article'],
              url: `/article/${art.slug}`
            }
          }));
          setDbResults(mapped);
        }
      } catch (err) {
        console.error('[SearchDB Error]', err);
      } finally {
        setIsSearchingDB(false);
      }
    };

    searchSupabase();
  }, [debouncedQuery]);

  // 4. Combine results
  const staticResults = query ? fuse.search(query).slice(0, 3) : [];
  const results = [...staticResults, ...dbResults];

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Global Keyboard listener for Cmd+K and ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keyboard navigation within modal results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && results[activeSuggestionIndex]) {
        const selected = results[activeSuggestionIndex].item;
        setIsOpen(false);
        router.push(`${selected.url}`);
      } else if (query.trim()) {
        // Trigger generic search
        setIsOpen(false);
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const isHero = variant === 'hero';
  const isIcon = variant === 'icon';

  return (
    <div className={isIcon ? "" : "w-full"}>
      {/* Trigger Button Mockup */}
      {isIcon ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center p-3 bg-[#FAF8F3] hover:bg-[#F2EFE9] rounded-full border border-slate-200/60 text-slate-600 hover:text-[#006948] transition-all hover:scale-105 active:scale-95 shadow-2xs shrink-0 cursor-pointer min-h-[44px] min-w-[44px]"
          aria-label="Open Search Command Palette"
        >
          <Search className="w-5 h-5" />
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(true)}
          className={`w-full flex items-center justify-between text-left transition-all ${
            isHero
              ? "px-5 py-4 bg-white border border-slate-200/80 rounded-3xl shadow-xl hover:shadow-2xl text-slate-400 font-medium text-lg min-h-[64px]"
              : "px-4 py-2 bg-slate-100/80 hover:bg-slate-200/50 rounded-full text-slate-500 font-medium text-sm min-h-[44px]"
          }`}
        >
          <div className="flex items-center gap-3">
            <Search className={isHero ? "w-6 h-6 text-slate-400" : "w-4 h-4 text-slate-400"} />
            <span>{isHero ? "Search topics, tools, articles..." : "Search topics..."}</span>
          </div>
          <div className="flex items-center gap-1 opacity-50 bg-slate-200/50 px-2 py-0.5 rounded-lg text-xs font-mono">
            <span className="text-[10px]">⌘</span>
            <span className="text-[10px]">K</span>
          </div>
        </button>
      )}

      {/* frosten glass Command Palette Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4 backdrop-blur-md bg-black/40 animate-fade-in">
          {/* Backdrop Click dismiss */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          <div
            ref={modalRef}
            onKeyDown={handleKeyDown}
            className="relative bg-white w-full max-w-[640px] rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[75vh] animate-scale-in"
          >
            {/* Search Input Box */}
            <div className="flex items-center border-b border-slate-150 p-4 gap-3 bg-slate-50/50">
              <Search className="w-6 h-6 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveSuggestionIndex(-1);
                }}
                placeholder="What are you looking for today?"
                className="w-full bg-transparent outline-none text-slate-800 text-lg placeholder:text-slate-400"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-slate-600 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="overflow-y-auto flex-1 p-4">
              {query.trim() !== '' ? (
                /* SEARCH RESULTS */
                <div>
                  {isSearchingDB && (
                    <div className="flex items-center gap-2 p-3 text-sm text-emerald-600 font-bold animate-pulse">
                      <Sparkles className="w-4 h-4" /> Mencari artikel terbaru...
                    </div>
                  )}
                  {results.length > 0 ? (
                    <ul className="space-y-1">
                      {results.map(({ item }, index) => {
                        const isActive = index === activeSuggestionIndex;
                        return (
                          <li key={item.id}>
                            <Link
                              href={`${item.url}`}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all group ${
                                isActive ? 'bg-emerald-50/80 border-emerald-100' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className={`p-2 rounded-xl shadow-sm border transition-colors ${
                                isActive ? 'bg-white border-emerald-200' : 'bg-white border-slate-100 group-hover:border-emerald-200/50'
                              }`}>
                                <ArrowRight className={`w-4 h-4 transition-colors ${isActive ? 'text-[#006948]' : 'text-slate-400 group-hover:text-[#006948]'}`} />
                              </div>
                              <div className="flex-1">
                                <p className={`font-bold leading-tight transition-colors ${
                                  isActive ? 'text-[#005439]' : 'text-slate-800 group-hover:text-[#006948]'
                                }`}>
                                  {item.title}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{item.category} • {item.tags[0]}</p>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="text-center py-10 px-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
                        <Search className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-bold" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                        Press Enter to search all articles for &quot;{query}&quot;
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* SUGGESTIONS & TRENDING */
                <div className="space-y-6 p-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Quick Suggestions & Categories */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-[#006948]" /> Suggested Search
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {SUGGESTIONS.map(s => (
                            <button
                              key={s}
                              onClick={() => setQuery(s)}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-[#006948] text-sm font-semibold rounded-xl transition-all border border-slate-100 hover:border-emerald-100 active:scale-95"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                          <Hash className="w-4 h-4 text-indigo-500" /> Browse Categories
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {CATEGORIES.map(cat => (
                            <Link
                              key={cat.path}
                              href={`/${cat.path}`}
                              onClick={() => setIsOpen(false)}
                              className={`px-4 py-3 rounded-2xl font-bold text-sm text-center transition-all hover:scale-[1.02] active:scale-95 border border-slate-100 ${cat.color}`}
                            >
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                          <Calculator className="w-4 h-4 text-emerald-600" /> Quick Tools
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Link 
                            href="/senior#drug-checker" 
                            onClick={() => setIsOpen(false)}
                            className="p-3 bg-rose-50/50 hover:bg-rose-100/60 text-rose-800 rounded-2xl border border-rose-100/50 text-xs font-bold text-center transition-all hover:scale-[1.02]"
                          >
                            Drug Checker
                          </Link>
                          <Link 
                            href="/money-future#retirement-planner" 
                            onClick={() => setIsOpen(false)}
                            className="p-3 bg-amber-50/50 hover:bg-amber-100/60 text-amber-800 rounded-2xl border border-amber-100/50 text-xs font-bold text-center transition-all hover:scale-[1.02]"
                          >
                            Retirement Planner
                          </Link>
                          <Link 
                            href="/home-living#smart-matcher" 
                            onClick={() => setIsOpen(false)}
                            className="p-3 bg-orange-50/50 hover:bg-orange-100/60 text-orange-800 rounded-2xl border border-orange-100/50 text-xs font-bold text-center transition-all hover:scale-[1.02]"
                          >
                            Smart Matcher
                          </Link>
                          <Link 
                            href="/pet-family#canine-symptom" 
                            onClick={() => setIsOpen(false)}
                            className="p-3 bg-indigo-50/50 hover:bg-indigo-100/60 text-indigo-800 rounded-2xl border border-indigo-100/50 text-xs font-bold text-center transition-all hover:scale-[1.02]"
                          >
                            Symptom Triage
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Trending Items */}
                    <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-rose-500" /> In Demand Right Now
                      </h4>
                      <ul className="space-y-4">
                        {isLoadingDynamic ? (
                          <div className="animate-pulse space-y-4">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="flex gap-3">
                                <div className="w-6 h-6 bg-slate-200 rounded-lg"></div>
                                <div className="flex-1 h-6 bg-slate-200 rounded-lg"></div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          trending.map((t, i) => (
                            <li key={i}>
                              <Link
                                href={t.url}
                                onClick={() => setIsOpen(false)}
                                className="group block"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-lg font-black text-slate-200 group-hover:text-[#006948] transition-colors mt-0.5">0{i + 1}</span>
                                  <p className="font-bold text-slate-700 group-hover:text-[#006948] transition-colors leading-snug">{t.title}</p>
                                </div>
                              </Link>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Cues */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex justify-between items-center text-xs text-slate-400 font-medium shrink-0">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm text-[10px]">↑↓</kbd> to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm text-[10px]">Enter</kbd> to select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm text-[10px]">ESC</kbd> to close
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
