"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Play, Calendar, Eye, Clock, ArrowRight, Sparkles, Filter, SlidersHorizontal } from 'lucide-react';
import { VideoItem } from '@/lib/services/videoService';

const locale = "en";

interface VideoHubClientProps {
  initialVideos: VideoItem[];
  locale: string;
}

export default function VideoHubClient({ initialVideos, locale }: VideoHubClientProps) {
  const [activePillar, setActivePillar] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'new' | 'popular'>('new');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Language mapping
  const dict = {
    en: {
      title: "Educational Video Hub",
      subtitle: "Premium, verified masterclasses designed to empower your wellness, financial growth, and home layout.",
      all: "All Masterclasses",
      home: "Home & Living",
      money: "Money & Future",
      pet: "Pet & Family",
      senior: "Senior Care",
      travel: "Accessible Travel",
      featured: "Featured Masterclass",
      watchNow: "Watch Masterclass",
      related: "Related Content",
      play: "Play",
      newest: "Newest",
      popular: "Popular",
      sortBy: "Sort by",
      noVideos: "No masterclasses found in this category.",
      loadMore: "Load More",
      prev: "Previous",
      next: "Next",
      views: "views"
    },
    id: {
      title: "Pusat Edukasi Video",
      subtitle: "Kelas master pilihan dan terverifikasi untuk mendukung kesehatan, pertumbuhan finansial, dan tata ruang rumah Anda.",
      all: "Semua Video",
      home: "Rumah & Hunian",
      money: "Uang & Masa Depan",
      pet: "Hewan & Keluarga",
      senior: "Perawatan Lansia",
      travel: "Travel Aksesibel",
      featured: "Kelas Master Pilihan",
      watchNow: "Tonton Sekarang",
      related: "Konten Terkait",
      play: "Putar",
      newest: "Terbaru",
      popular: "Terpopuler",
      sortBy: "Urutkan",
      noVideos: "Tidak ada kelas master dalam kategori ini.",
      loadMore: "Muat Lebih Banyak",
      prev: "Sebelumnya",
      next: "Berikutnya",
      views: "tontonan"
    }
  };

  const t = dict.en;

  const pillarTabs = [
    { key: 'all', label: t.all },
    { key: 'home', label: t.home },
    { key: 'money', label: t.money },
    { key: 'pet', label: t.pet },
    { key: 'senior', label: t.senior },
    { key: 'travel', label: t.travel }
  ];

  // 1. Filter and Sort logic
  const processedVideos = useMemo(() => {
    let list = [...initialVideos];

    // Filter by active pillar
    if (activePillar !== 'all') {
      list = list.filter(v => v.pillar === activePillar);
    }

    // Sort
    if (sortBy === 'new') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'popular') {
      list.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    }

    return list;
  }, [initialVideos, activePillar, sortBy]);

  // 2. Identify the featured video (always the absolute most popular video from the unfiltered list)
  const featuredVideo = useMemo(() => {
    if (initialVideos.length === 0) return null;
    // Return the single video with the highest view count
    return [...initialVideos].sort((a, b) => (b.view_count || 0) - (a.view_count || 0))[0];
  }, [initialVideos]);

  // Exclude featured video from the general grid list to avoid duplication
  const gridVideos = useMemo(() => {
    if (!featuredVideo) return processedVideos;
    return processedVideos.filter(v => v.id !== featuredVideo.id);
  }, [processedVideos, featuredVideo]);

  // 3. Pagination calculation
  const totalPages = Math.ceil(gridVideos.length / itemsPerPage);
  const paginatedGridVideos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return gridVideos.slice(start, start + itemsPerPage);
  }, [gridVideos, currentPage]);

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
    <div className="min-h-screen bg-[#FDFBF7] py-12">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Header Section with Elegant LifeBloom Style */}
        <div className="max-w-3xl mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/50 rounded-full text-xs font-bold text-emerald-800 uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" /> LifeBloom Academy
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-brand-blue font-display tracking-tight leading-tight">
            {t.title}
          </h1>
          <p className="text-slate-600 font-medium mt-4 text-lg md:text-xl leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* 1. Hero Featured Video Card */}
        {featuredVideo && activePillar === 'all' && (
          <div className="mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-[#006948] mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse" />
              {t.featured}
            </h2>
            <Link 
              href={`/videos/${featuredVideo.slug}`}
              className="group flex flex-col lg:flex-row bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-md hover:shadow-xl hover:border-emerald-500/20 transition-all duration-300"
            >
              {/* Left Side: Thumbnail with elegant play button overlay */}
              <div className="lg:w-7/12 relative aspect-video overflow-hidden bg-slate-950 flex items-center justify-center">
                {featuredVideo.thumbnail_url ? (
                  <img
                    src={featuredVideo.thumbnail_url}
                    alt={featuredVideo.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 group-hover:opacity-95 transition-all duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-slate-950" />
                )}
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-white text-emerald-800 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#006948] group-hover:text-white transition-all duration-300">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                </div>

                {/* Duration Badge */}
                {featuredVideo.duration && (
                  <div className="absolute bottom-4 right-4 bg-black/70 px-2.5 py-1 text-white text-xs font-bold font-mono rounded-lg backdrop-blur-sm">
                    {Math.floor(featuredVideo.duration / 60)}:{(featuredVideo.duration % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>

              {/* Right Side: Informative Premium Metadata */}
              <div className="lg:w-5/12 p-8 md:p-10 flex flex-col justify-center">
                <span className="inline-block text-xs font-extrabold text-[#006948] bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider mb-4 self-start">
                  {featuredVideo.pillar}
                </span>
                
                <h3 className="text-2xl md:text-3xl font-black text-brand-blue font-display leading-tight mb-4 group-hover:text-[#006948] transition-colors">
                  {featuredVideo.title}
                </h3>
                
                <p className="text-slate-600 leading-relaxed text-base mb-6 line-clamp-3 md:line-clamp-4">
                  {featuredVideo.description}
                </p>

                {/* Bottom stats and action bar */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-auto">
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(featuredVideo.created_at)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {featuredVideo.view_count || 0} {t.views}
                    </span>
                  </div>
                  
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-[#006948] group-hover:translate-x-1.5 transition-all">
                    {t.watchNow} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* 2. Advanced Controls Bar (Filter Pills & Sort Mode) */}
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
            <span className="text-xs font-bold text-slate-400 pl-2 select-none uppercase tracking-widest hidden sm:inline flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> {t.sortBy}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => handleSortChange('new')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${sortBy === 'new' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {t.newest}
              </button>
              <button
                onClick={() => handleSortChange('popular')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${sortBy === 'popular' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {t.popular}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Main Videos Grid */}
        {paginatedGridVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-200/50 p-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
              <Filter className="w-8 h-8 opacity-60" />
            </div>
            <h3 className="text-lg font-bold text-brand-blue mb-1">No Video Content</h3>
            <p className="text-sm text-slate-500 max-w-sm">{t.noVideos}</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedGridVideos.map(video => (
                <Link
                  key={video.id}
                  href={`/videos/${video.slug}`}
                  className="group bg-white rounded-2xl border border-slate-200/60 overflow-hidden flex flex-col shadow-sm hover:shadow-lg hover:border-emerald-500/20 transition-all duration-300"
                >
                  {/* Thumbnail Card */}
                  <div className="aspect-video relative overflow-hidden bg-slate-950 flex items-center justify-center">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 group-hover:opacity-95 transition-all duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 to-slate-950" />
                    )}
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-all">
                      <div className="w-12 h-12 rounded-full bg-white/95 text-emerald-800 flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#006948] group-hover:text-white transition-all duration-300">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    {video.duration && (
                      <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-0.5 text-white text-[10px] font-bold font-mono rounded backdrop-blur-xs">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <span className="inline-block text-[10px] font-extrabold text-[#006948] bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-3 self-start">
                      {video.pillar}
                    </span>
                    
                    <h4 className="font-bold text-brand-blue text-lg mb-2 line-clamp-2 group-hover:text-[#006948] transition-colors leading-snug">
                      {video.title}
                    </h4>
                    
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {video.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto text-[11px] font-semibold text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(video.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {video.view_count || 0} {t.views}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 4. Beautiful Numeric Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-slate-200/60">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50 disabled:hover:bg-white transition-all"
                >
                  {t.prev}
                </button>
                
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
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
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50 disabled:hover:bg-white transition-all"
                >
                  {t.next}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
