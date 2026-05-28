"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Newspaper, Video, Calendar, Clock, Eye, Play, ArrowRight, 
  Sparkles, SlidersHorizontal, ChevronLeft, ChevronRight, Activity
} from 'lucide-react';

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

interface VideoItem {
  id: string;
  title: string;
  slug: string;
  pillar: string;
  thumbnail_url: string | null;
  duration?: number | null;
  view_count?: number | null;
  created_at: string;
}

interface FeaturedInsightsSectionProps {
  articles: ArticleItem[];
  videos: VideoItem[];
}

export function FeaturedInsightsSection({ articles, videos }: FeaturedInsightsSectionProps) {
  // Articles State
  const [articlePillar, setArticlePillar] = useState('all');
  const [articleSort, setArticleSort] = useState<'new' | 'popular'>('new');
  const [articlePage, setArticlePage] = useState(1);

  // Videos State
  const [videoPillar, setVideoPillar] = useState('all');
  const [videoSort, setVideoSort] = useState<'new' | 'popular'>('new');
  const [videoPage, setVideoPage] = useState(1);

  const itemsPerPage = 6; // 3 columns * 2 rows max

  const pillars = [
    { key: 'all', label: 'All' },
    { key: 'senior', label: 'Senior Care' },
    { key: 'travel', label: 'Accessible Travel' },
    { key: 'home-living', label: 'Smart Home' },
    { key: 'pet-family', label: 'Pet Family' },
    { key: 'money-future', label: 'Wealth' }
  ];

  // Heuristic Reading Time
  const getReadingTime = (text: string) => {
    const min = Math.ceil((text.split(/\s+/).length + 150) / 200);
    return `${min} min read`;
  };

  // --- 1. Articles Filter & Sort ---
  const filteredArticles = useMemo(() => {
    let list = [...articles];
    if (articlePillar !== 'all') {
      const dbPillar = articlePillar === 'home-living' ? 'home'
                     : articlePillar === 'pet-family' ? 'pet'
                     : articlePillar === 'money-future' ? 'money'
                     : articlePillar;
      list = list.filter(a => a.pillar === dbPillar);
    }
    if (articleSort === 'new') {
      list.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    } else {
      list.sort((a, b) => b.title.length - a.title.length);
    }
    return list;
  }, [articles, articlePillar, articleSort]);

  const paginatedArticles = useMemo(() => {
    const start = (articlePage - 1) * itemsPerPage;
    return filteredArticles.slice(start, start + itemsPerPage);
  }, [filteredArticles, articlePage]);

  const totalArticlePages = Math.ceil(filteredArticles.length / itemsPerPage) || 1;

  // --- 2. Videos Filter & Sort ---
  const filteredVideos = useMemo(() => {
    let list = [...videos];
    if (videoPillar !== 'all') {
      const dbPillar = videoPillar === 'home-living' ? 'home'
                     : videoPillar === 'pet-family' ? 'pet'
                     : videoPillar === 'money-future' ? 'money'
                     : videoPillar;
      list = list.filter(v => v.pillar === dbPillar);
    }
    if (videoSort === 'new') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      list.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    }
    return list;
  }, [videos, videoPillar, videoSort]);

  const paginatedVideos = useMemo(() => {
    const start = (videoPage - 1) * itemsPerPage;
    return filteredVideos.slice(start, start + itemsPerPage);
  }, [filteredVideos, videoPage]);

  const totalVideoPages = Math.ceil(filteredVideos.length / itemsPerPage) || 1;

  // Format Helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Reset pagination on category change
  useEffect(() => {
    setArticlePage(1);
  }, [articlePillar]);

  useEffect(() => {
    setVideoPage(1);
  }, [videoPillar]);

  return (
    <div className="space-y-24">
      
      {/* ================= SECTION A: CURATED INSIGHTS (ARTICLES) ================= */}
      <section className="border-t border-slate-200/60 pt-16 relative" aria-label="Curated Insights Articles">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/50 rounded-full text-xs font-bold text-emerald-800 uppercase tracking-widest mb-3">
              <Newspaper className="w-3.5 h-3.5" /> Curated Dispatches
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
              Latest Insights & Wisdom
            </h2>
            <p className="text-slate-500 text-sm md:text-base mt-2 font-medium">
              Read peer-reviewed advice on senior care, wealth compounding, and smart home layouts.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-bold text-slate-400 pl-2 uppercase tracking-widest hidden sm:inline-flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Sort
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setArticleSort('new')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${articleSort === 'new' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Newest
              </button>
              <button
                onClick={() => setArticleSort('popular')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${articleSort === 'popular' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Popular
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-slate-200/40">
          <div className="flex gap-2">
            {pillars.map(tab => (
              <button
                key={tab.key}
                onClick={() => setArticlePillar(tab.key)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all min-h-[36px] whitespace-nowrap ${
                  articlePillar === tab.key
                    ? "bg-[#006948] text-white shadow-2xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid (Compact 3 Columns * 2 Rows Max) */}
        {paginatedArticles.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/50">
            <p className="text-slate-400 italic">No insights found in this category.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {paginatedArticles.map(art => (
                <Link
                  key={art.id}
                  href={`/article/${art.slug}`}
                  className="group bg-white rounded-2xl border border-slate-200/60 overflow-hidden flex flex-col shadow-2xs hover:shadow-md hover:border-emerald-500/20 transition-all duration-300"
                >
                  <div className="aspect-video relative overflow-hidden bg-slate-950">
                    <img
                      src={art.image_url}
                      alt={art.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 group-hover:opacity-95 transition-all duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/25 transition-all flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white text-emerald-800 flex items-center justify-center shadow-md scale-0 group-hover:scale-100 transition-all duration-300">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <span className="inline-block text-[9px] font-extrabold text-[#006948] bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider mb-2.5 self-start">
                      {art.pillar}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-[#006948] transition-colors leading-snug line-clamp-2" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                      {art.title}
                    </h3>
                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-4 font-medium">
                      {art.snippet}
                    </p>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto text-[10px] font-semibold text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(art.published_at)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{getReadingTime(art.snippet)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls & Scroll Progress Bar */}
            {totalArticlePages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/40">
                {/* Scroll Indicator progress bar */}
                <div className="w-full sm:w-48 h-1.5 bg-slate-150 rounded-full overflow-hidden relative">
                  <div 
                    className="absolute top-0 bottom-0 left-0 bg-[#006948] transition-all duration-500 rounded-full"
                    style={{ width: `${(articlePage / totalArticlePages) * 100}%` }}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setArticlePage(p => Math.max(p - 1, 1))}
                    disabled={articlePage === 1}
                    className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer shadow-2xs"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-400">
                    Page {articlePage} of {totalArticlePages}
                  </span>
                  <button
                    onClick={() => setArticlePage(p => Math.min(p + 1, totalArticlePages))}
                    disabled={articlePage === totalArticlePages}
                    className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer shadow-2xs"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ================= SECTION B: DYNAMIC VIDEOS (LIFEBLOOM ACADEMY) ================= */}
      <section className="border-t border-slate-200/60 pt-16 relative" aria-label="LifeBloom Academy Videos">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200/50 rounded-full text-xs font-bold text-indigo-800 uppercase tracking-widest mb-3">
              <Video className="w-3.5 h-3.5" /> Video Masterclasses
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
              LifeBloom Academy
            </h2>
            <p className="text-slate-500 text-sm md:text-base mt-2 font-medium">
              Watch verified, video-guided advisories for structural renovations, travel mapping, and active aging.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-bold text-slate-400 pl-2 uppercase tracking-widest hidden sm:inline-flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Sort
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setVideoSort('new')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${videoSort === 'new' ? 'bg-indigo-50 text-indigo-800' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Newest
              </button>
              <button
                onClick={() => setVideoSort('popular')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${videoSort === 'popular' ? 'bg-indigo-50 text-indigo-800' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Popular
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-slate-200/40">
          <div className="flex gap-2">
            {pillars.map(tab => (
              <button
                key={tab.key}
                onClick={() => setVideoPillar(tab.key)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all min-h-[36px] whitespace-nowrap ${
                  videoPillar === tab.key
                    ? "bg-indigo-900 text-white shadow-2xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Videos Grid (Compact 3 Columns * 2 Rows Max) */}
        {paginatedVideos.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/50">
            <p className="text-slate-400 italic">No masterclasses found in this category.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {paginatedVideos.map(vid => (
                <Link
                  key={vid.id}
                  href={`/videos/${vid.slug}`}
                  className="group bg-white rounded-2xl border border-slate-200/60 overflow-hidden flex flex-col shadow-2xs hover:shadow-md hover:border-indigo-500/20 transition-all duration-300"
                >
                  <div className="aspect-video relative overflow-hidden bg-slate-950 flex items-center justify-center">
                    {vid.thumbnail_url ? (
                      <img
                        src={vid.thumbnail_url}
                        alt={vid.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 group-hover:opacity-95 transition-all duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 to-slate-950" />
                    )}
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-all">
                      <div className="w-11 h-11 rounded-full bg-white text-indigo-900 flex items-center justify-center shadow-md group-hover:scale-110 transition-all duration-300">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    {vid.duration && (
                      <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-0.5 text-white text-[9px] font-bold font-mono rounded">
                        {Math.floor(vid.duration / 60)}:{(vid.duration % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <span className="inline-block text-[9px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider mb-2.5 self-start">
                      {vid.pillar}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-indigo-900 transition-colors leading-snug line-clamp-2" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                      {vid.title}
                    </h3>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto text-[10px] font-semibold text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(vid.created_at)}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{vid.view_count || 0} views</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls & Scroll Progress Bar */}
            {totalVideoPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/40">
                {/* Scroll Indicator progress bar */}
                <div className="w-full sm:w-48 h-1.5 bg-slate-150 rounded-full overflow-hidden relative">
                  <div 
                    className="absolute top-0 bottom-0 left-0 bg-indigo-750 transition-all duration-500 rounded-full"
                    style={{ width: `${(videoPage / totalVideoPages) * 100}%` }}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setVideoPage(p => Math.max(p - 1, 1))}
                    disabled={videoPage === 1}
                    className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer shadow-2xs"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-400">
                    Page {videoPage} of {totalVideoPages}
                  </span>
                  <button
                    onClick={() => setVideoPage(p => Math.min(p + 1, totalVideoPages))}
                    disabled={videoPage === totalVideoPages}
                    className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer shadow-2xs"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

    </div>
  );
}
