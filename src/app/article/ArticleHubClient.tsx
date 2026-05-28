"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Newspaper, Calendar, Clock, ArrowRight, Sparkles, Filter, SlidersHorizontal } from 'lucide-react';

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  published_at: string;
  pillar: string;
  image_url: string;
  snippet: string;
  source: string;
}

interface ArticleHubClientProps {
  initialArticles: ArticleItem[];
  locale: string;
}

export default function ArticleHubClient({ initialArticles, locale }: ArticleHubClientProps) {
  const [activePillar, setActivePillar] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'new' | 'popular'>('new');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  const dict = {
    title: "Family Insights & Dispatches",
    subtitle: "Accredited, ad-free expert publications compiled to support your health decisions, wealth roadmap, and accessible lifestyle.",
    all: "All Dispatches",
    home: "Home & Living",
    money: "Money & Future",
    pet: "Pet & Family",
    senior: "Senior Care",
    travel: "Accessible Travel",
    featured: "Featured Publication",
    readNow: "Read Full Advisory",
    sortBy: "Sort by",
    newest: "Newest",
    popular: "Popular",
    noArticles: "No articles found in this category.",
    prev: "Previous",
    next: "Next",
  };

  const pillarTabs = [
    { key: 'all', label: dict.all },
    { key: 'senior', label: dict.senior },
    { key: 'travel', label: dict.travel },
    { key: 'home-living', label: dict.home },
    { key: 'pet-family', label: dict.pet },
    { key: 'money-future', label: dict.money }
  ];

  // Calculate dynamic reading time (based on snippet length + standard 200 WPM)
  const calculateReadingTime = (text: string) => {
    const wordCount = text.split(/\s+/).length + 150; // Add standard multiplier for full article size heuristic
    const min = Math.ceil(wordCount / 200);
    return `${min} min read`;
  };

  // 1. Filter and Sort logic
  const processedArticles = useMemo(() => {
    let list = [...initialArticles];

    // Filter by active pillar
    if (activePillar !== 'all') {
      list = list.filter(art => art.pillar === activePillar);
    }

    // Sort
    if (sortBy === 'new') {
      list.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    } else if (sortBy === 'popular') {
      // Simulate popular: sort deterministically by title length / seeding
      list.sort((a, b) => b.title.length - a.title.length);
    }

    return list;
  }, [initialArticles, activePillar, sortBy]);

  // 2. Identify the featured video/article (first item from the list)
  const featuredArticle = useMemo(() => {
    if (initialArticles.length === 0) return null;
    return initialArticles[0];
  }, [initialArticles]);

  // Exclude featured article from the general grid list when "All" tab is active to avoid repetition
  const gridArticles = useMemo(() => {
    if (!featuredArticle || activePillar !== 'all') return processedArticles;
    return processedArticles.filter(art => art.id !== featuredArticle.id);
  }, [processedArticles, featuredArticle, activePillar]);

  // 3. Pagination calculation
  const totalPages = Math.ceil(gridArticles.length / itemsPerPage);
  const paginatedGridArticles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return gridArticles.slice(start, start + itemsPerPage);
  }, [gridArticles, currentPage]);

  const handlePillarChange = (pillar: string) => {
    setActivePillar(pillar);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: 'new' | 'popular') => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 select-none">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Header Section */}
        <div className="max-w-3xl mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/50 rounded-full text-xs font-bold text-emerald-800 uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" /> LifeBloom Editorial
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-brand-blue font-display tracking-tight leading-tight">
            {dict.title}
          </h1>
          <p className="text-slate-600 font-medium mt-4 text-lg md:text-xl leading-relaxed">
            {dict.subtitle}
          </p>
        </div>

        {/* 1. Hero Featured Article Card */}
        {featuredArticle && activePillar === 'all' && (
          <div className="mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-[#006948] mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse" />
              {dict.featured}
            </h2>
            <Link 
              href={`/article/${featuredArticle.slug}`}
              className="group flex flex-col lg:flex-row bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-md hover:shadow-xl hover:border-emerald-500/20 transition-all duration-300"
            >
              {/* Left Side: Image */}
              <div className="lg:w-7/12 relative aspect-video overflow-hidden bg-slate-950 flex items-center justify-center">
                <img
                  src={featuredArticle.image_url}
                  alt={featuredArticle.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 group-hover:opacity-95 transition-all duration-500"
                />
                
                {/* Arrow Hover indicator */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/35 transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-white text-emerald-800 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#006948] group-hover:text-white transition-all duration-300">
                    <ArrowRight className="w-7 h-7 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Date Badge */}
                <div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1 text-white text-xs font-bold rounded-lg backdrop-blur-sm">
                  {calculateReadingTime(featuredArticle.snippet)}
                </div>
              </div>

              {/* Right Side: Copy */}
              <div className="lg:w-5/12 p-8 md:p-10 flex flex-col justify-center">
                <span className="inline-block text-xs font-extrabold text-[#006948] bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider mb-4 self-start">
                  {featuredArticle.pillar}
                </span>
                
                <h3 className="text-2xl md:text-3xl font-black text-brand-blue font-display leading-tight mb-4 group-hover:text-[#006948] transition-colors">
                  {featuredArticle.title}
                </h3>
                
                <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-6 line-clamp-4">
                  {featuredArticle.snippet}
                </p>

                {/* Bottom stats and action bar */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-auto">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(featuredArticle.published_at)}
                  </span>
                  
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-[#006948] group-hover:translate-x-1.5 transition-all">
                    {dict.readNow} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* 2. Controls Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-slate-200 pb-6 mb-10">
          {/* Pillar Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto scrollbar-none">
            <div className="flex gap-2">
              {pillarTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handlePillarChange(tab.key)}
                  className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all min-h-[40px] whitespace-nowrap ${
                    activePillar === tab.key
                      ? "bg-brand-blue text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Controller */}
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm self-stretch lg:self-auto justify-end">
            <span className="text-xs font-bold text-slate-400 pl-2 select-none uppercase tracking-widest hidden sm:inline-flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> {dict.sortBy}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => handleSortChange('new')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${sortBy === 'new' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {dict.newest}
              </button>
              <button
                onClick={() => handleSortChange('popular')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${sortBy === 'popular' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {dict.popular}
              </button>
            </div>
          </div>
        </div>

        {/* 3. General Grid */}
        {paginatedGridArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-200/50 p-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
              <Filter className="w-8 h-8 opacity-60" />
            </div>
            <h3 className="text-lg font-bold text-brand-blue mb-1">No Publications</h3>
            <p className="text-sm text-slate-500 max-w-sm">{dict.noArticles}</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedGridArticles.map(article => (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
                  className="group bg-white rounded-2xl border border-slate-200/60 overflow-hidden flex flex-col shadow-sm hover:shadow-lg hover:border-emerald-500/20 transition-all duration-300"
                >
                  {/* Image Card */}
                  <div className="aspect-video relative overflow-hidden bg-slate-950 flex items-center justify-center">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 group-hover:opacity-95 transition-all duration-500"
                    />
                    
                    {/* Read Arrow indicator */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-all">
                      <div className="w-12 h-12 rounded-full bg-white/95 text-emerald-800 flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#006948] group-hover:text-white transition-all duration-300">
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-0.5 text-white text-[10px] font-bold rounded backdrop-blur-xs">
                      {calculateReadingTime(article.snippet)}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <span className="inline-block text-[10px] font-extrabold text-[#006948] bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-3 self-start">
                      {article.pillar}
                    </span>
                    
                    <h4 className="font-bold text-brand-blue text-lg mb-2 line-clamp-2 group-hover:text-[#006948] transition-colors leading-snug">
                      {article.title}
                    </h4>
                    
                    <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-4 font-medium">
                      {article.snippet}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto text-[11px] font-semibold text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(article.published_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {calculateReadingTime(article.snippet)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-slate-200/60">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50 disabled:hover:bg-white transition-all cursor-pointer min-h-[40px]"
                >
                  {dict.prev}
                </button>
                
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all cursor-pointer ${
                        currentPage === page
                          ? "bg-[#006948] text-white shadow-sm"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50 disabled:hover:bg-white transition-all cursor-pointer min-h-[40px]"
                >
                  {dict.next}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
