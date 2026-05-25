"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { Search, Command, ArrowRight, TrendingUp, Sparkles, Hash, Shuffle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

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
  { name: "Money", path: "money-future", color: "bg-blue-100 text-blue-700" },
  { name: "Home", path: "home-living", color: "bg-orange-100 text-orange-700" },
  { name: "Pet", path: "pet-family", color: "bg-yellow-100 text-yellow-700" },
  { name: "Senior", path: "senior", color: "bg-purple-100 text-purple-700" },
  { name: "Travel", path: "travel", color: "bg-teal-100 text-teal-700" }
];

export function GlobalSearch({ variant = 'navbar' }: { variant?: 'navbar' | 'hero' }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Dynamic Content States
  const [trending, setTrending] = useState<{ title: string; url: string }[]>([]);
  const [isLoadingDynamic, setIsLoadingDynamic] = useState(true);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  // Initial fetch of dynamic trending data
  useEffect(() => {
    import('@/lib/services/metricsService').then(({ MetricsService }) => {
      MetricsService.getTrending(4).then(data => {
        if (data && data.length > 0) {
          setTrending(data.map(item => ({
            title: item.title,
            url: `/${locale}/${item.slug.startsWith('article') ? '' : ''}${item.slug}`
          })));
        } else {
          // Fallback if DB is empty
          setTrending([
            { title: "Medicare Part D Changes", url: `/${locale}/article/the-new-medicare-part-d-changes-explained` },
            { title: "Accessible European Cities", url: `/${locale}/article/the-10-most-wheelchair-accessible-cities-in-europe` },
            { title: "Retirement Planner", url: `/${locale}/money-future/retirement-planner` }
          ]);
        }
        setIsLoadingDynamic(false);
      }).catch(err => {
        // Suppress expected mock errors from console to keep it clean
        if (process.env.NEXT_PUBLIC_USE_MOCK_AUTH !== 'true') {
          console.error('Failed to fetch trending', err);
        }
        setTrending([
          { title: "Medicare Part D Changes", url: `/${locale}/article/the-new-medicare-part-d-changes-explained` },
          { title: "Accessible European Cities", url: `/${locale}/article/the-10-most-wheelchair-accessible-cities-in-europe` },
          { title: "Retirement Planner", url: `/${locale}/money-future/retirement-planner` }
        ]);
        setIsLoadingDynamic(false);
      });
    });
  }, [locale]);

  const fuse = useMemo(() => new Fuse(searchIndex, {
    keys: ['title', 'category', 'tags'],
    threshold: 0.5,
    includeScore: true
  }), []);

  const results = query ? fuse.search(query).slice(0, 5) : [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow Cmd+K or Ctrl+K from anywhere to focus this specific input if it's the navbar one
      // If hero, we'll just let the navbar one handle the global shortcut, but both will react to focus
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        // Prioritize focusing the one that's currently visible or preferred
        if (inputRef.current) {
           inputRef.current.focus();
        }
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/${locale}/search?q=${encodeURIComponent(query)}`);
    }
  };

  const isHero = variant === 'hero';

  return (
    <div className={`relative z-50 ${isHero ? 'w-full' : 'w-full'}`} ref={wrapperRef}>
      <form onSubmit={handleSearch} className="relative flex items-center w-full group">
        <div className={`absolute left-4 text-slate-400 ${isHero ? 'left-5' : ''}`}>
          <Search className={isHero ? "w-6 h-6 text-slate-400" : "w-4 h-4"} />
        </div>
        <input 
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={isHero ? "Search topics, tools, articles..." : "Search topics, tools..."}
          className={`w-full outline-none transition-all ${
            isHero 
              ? "pl-14 pr-32 py-5 bg-white border border-slate-100 rounded-3xl shadow-xl text-lg md:text-xl text-brand-blue placeholder:text-slate-400 focus:ring-4 focus:ring-brand-green/20" 
              : "pl-10 pr-12 py-2 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-brand-blue/30 text-sm font-medium text-slate-700 placeholder:text-slate-400"
          }`}
          autoComplete="off"
        />
        
        {isHero ? (
          <button type="submit" className="absolute right-2 px-6 py-3 bg-brand-green text-white font-bold rounded-2xl hover:bg-brand-green-dark transition-all shadow-md">
            Search
          </button>
        ) : (
          <div className="absolute right-3 flex items-center gap-1 opacity-40 pointer-events-none">
            <Command className="w-3 h-3" />
            <span className="text-[10px] font-bold">K</span>
          </div>
        )}
      </form>

      {/* Overlay Dropdown / Mega Menu */}
      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in origin-top ${isHero ? 'p-2' : ''}`}>
          
          {/* SEARCH RESULTS MODE */}
          {query.trim() !== '' ? (
            <div className="max-h-96 overflow-y-auto p-2">
              {results.length > 0 ? (
                <ul className="space-y-1">
                  {results.map(({ item }) => (
                    <li key={item.id}>
                      <Link 
                        href={`/${locale}${item.url}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-slate-light group transition-colors"
                      >
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 group-hover:border-brand-green/30">
                          <ArrowRight className="w-4 h-4 text-brand-green" />
                        </div>
                        <div>
                          <p className={`font-bold text-brand-blue group-hover:text-brand-green-dark leading-tight ${isHero ? 'text-base' : 'text-sm'}`}>{item.title}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">{item.category} • {item.tags[0]}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">Press Enter to search all content for <strong className="text-brand-blue">&quot;{query}&quot;</strong></p>
                </div>
              )}
              
              <div className="mt-2 pt-2 border-t border-slate-100 px-2 pb-1">
                <button onClick={handleSearch} className="w-full py-3 text-center text-sm font-bold text-brand-blue hover:text-brand-green transition-colors rounded-xl hover:bg-brand-green/5">
                  View all results for &quot;{query}&quot; &rarr;
                </button>
              </div>
            </div>
          ) : (
            /* MEGA MENU MODE (EMPTY STATE) */
            <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div>
                  {/* Suggestions / Clues */}
                  <div className="mb-8">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Sparkles className="w-4 h-4 text-brand-green" /> Suggested
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map(s => (
                        <button 
                          key={s} 
                          onClick={() => { setQuery(s); document.getElementById('global-search-input')?.focus(); }}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-brand-green/10 text-slate-600 hover:text-brand-green-dark text-sm font-medium rounded-lg transition-colors border border-slate-100"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Hash className="w-4 h-4 text-brand-blue" /> Categories
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map(cat => (
                        <Link 
                          key={cat.path} 
                          href={`/${locale}/${cat.path}`}
                          onClick={() => setIsOpen(false)}
                          className={`px-4 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 ${cat.color}`}
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-red-500" /> Trending Now
                  </h4>
                  <ul className="space-y-4">
                    {isLoadingDynamic ? (
                      <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex gap-3">
                            <div className="w-6 h-6 bg-slate-200 rounded"></div>
                            <div className="flex-1 h-6 bg-slate-200 rounded"></div>
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
                              <span className="text-xl font-black text-slate-200 group-hover:text-brand-green transition-colors mt-0.5">0{i+1}</span>
                              <p className="font-semibold text-brand-blue group-hover:text-brand-green-dark transition-colors">{t.title}</p>
                            </div>
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>

                  <div className="mt-8 pt-6 border-t border-slate-200/60">
                    <Link 
                      href={`/${locale}/search?q=random`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-blue transition-colors group"
                    >
                      <Shuffle className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> Discover Random Tools
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
