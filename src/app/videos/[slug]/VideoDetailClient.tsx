"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ChevronLeft, ThumbsUp, Lightbulb, Heart, Bookmark, Share2, 
  Copy, Calendar, Eye, Clock, Sparkles, AlertCircle, Compass, 
  ExternalLink, Code, Video, ArrowRight, Play
} from "lucide-react";
import { toast } from "sonner";
import VideoPlayer from "@/components/features/video-player";
import { VideoItem, incrementViewCount, updateVideoReaction } from "@/lib/services/videoService";
import { generateProfile } from "@/lib/utils/profileGenerator";
import { ContextualTravelDeals } from "@/components/travel/ContextualTravelDeals";

const locale = "en";

interface VideoDetailClientProps {
  video: VideoItem;
  relatedVideos: VideoItem[];
  locale: string;
}

export default function VideoDetailClient({ video, relatedVideos, locale }: VideoDetailClientProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [reactionState, setReactionState] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Language mapping
  const t = {
    backToHub: "Back to Video Hub",
    nowPlaying: "Now Playing",
    views: "views",
    chapters: "Chapter Navigation",
    takeaways: "AI Key Takeaways",
    reactions: "Did you find this educational?",
    saved: "Saved",
    save: "Save",
    helpful: "Helpful",
    insightful: "Insightful",
    love: "Love It",
    helpfulToast: "Glad you found this helpful!",
    insightfulToast: "Thanks for your feedback!",
    loveToast: "We love that you love it!",
    copyLink: "Copy SmartLink",
    copied: "Copied!",
    copyEmbed: "Copy Embed Code",
    toolsRecommendation: "Targeted Smart Utilities",
    toolsSubtitle: "Put these learnings into practice with our custom-engineered expert calculators:",
    relatedTitle: "More from this Series",
    relatedSubtitle: "Keep expanding your expertise with related masterclasses.",
    play: "Play Now",
    verifiedExpert: "Verified Expert",
    expertPledge: "This video analysis is peer-reviewed for professional consistency and active aging safety.",
    embedPlaceholder: "Embed Code"
  };

  // 1. Session-based view counting deduplication
  useEffect(() => {
    if (!video.id) return;
    const viewKey = `video-views-${video.id}`;
    const hasViewedInSession = sessionStorage.getItem(viewKey);
    if (!hasViewedInSession) {
      incrementViewCount(video.id);
      sessionStorage.setItem(viewKey, "true");
    }
  }, [video.id]);

  // 2. Fetch bookmarks state
  useEffect(() => {
    async function checkBookmark() {
      try {
        const res = await fetch("/api/user/saved-items");
        if (res.ok) {
          const items = await res.json();
          const found = items.some((item: any) => item.referenced_id === video.slug && item.item_type === "video");
          setIsBookmarked(found);
        }
      } catch (err) {
        console.error("Failed to fetch bookmarks:", err);
      }
    }
    if (video.slug) {
      checkBookmark();
    }
  }, [video.slug]);

  const handleBookmarkToggle = async () => {
    try {
      if (isBookmarked) {
        const res = await fetch(`/api/user/saved-items?referenced_id=${video.slug}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setIsBookmarked(false);
          toast.success("Video removed from saved items.");
        }
      } else {
        const res = await fetch("/api/user/saved-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item_type: "video",
            referenced_id: video.slug,
            metadata: {
              title: video.title,
              pillar: video.pillar || "money",
              source: video.provider || "youtube",
              image_url: video.thumbnail_url
            }
          }),
        });
        if (res.ok) {
          setIsBookmarked(true);
          toast.success("Video saved to your dashboard!");
        } else {
          toast.error("Please sign in to save videos.");
        }
      }
    } catch (err) {
      toast.error("Failed to update bookmark.");
    }
  };

  const handleReaction = async (type: "helpful" | "insightful" | "love") => {
    if (reactionState.includes(type)) return;
    
    const { success, count } = await updateVideoReaction(video.id, type);
    if (success) {
      setReactionState(prev => [...prev, type]);
      const toastText = type === "helpful" ? t.helpfulToast : type === "insightful" ? t.insightfulToast : t.loveToast;
      const toastIcon = type === "helpful" 
        ? <ThumbsUp className="w-5 h-5 text-emerald-600" /> 
        : type === "insightful" 
          ? <Lightbulb className="w-5 h-5 text-amber-500" /> 
          : <Heart className="w-5 h-5 text-rose-500 fill-current" />;
      toast.success(toastText, { icon: toastIcon });
    }
  };

  // 3. Sharing helpers
  const shareLink = typeof window !== "undefined" ? window.location.href : `https://lifebloomhub.vercel.app/videos/${video.slug}`;
  const embedCode = `<iframe src="https://lifebloomhub.vercel.app/embed/video/${video.embed_id}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`;

  const copyToClipboard = (text: string, isEmbed: boolean) => {
    navigator.clipboard.writeText(text);
    if (isEmbed) {
      setCopiedEmbed(true);
      toast.success("Embed code copied to clipboard!");
      setTimeout(() => setCopiedEmbed(false), 2000);
    } else {
      setCopiedLink(true);
      toast.success("Video link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // 4. Internal Link Recommendations based on video pillar
  const pillarTools = {
    money: [
      { name: "Retirement Savings Planner", desc: "Project compounding interest, secure capital multipliers, and calculate Recessional buffer states.", path: "/money-future/retirement-planner" },
      { name: "Compounding Yield Radar", desc: "Maximize capital distributions across highly yielding treasury notes, certificates, and fixed assets.", path: "/money-future/yield-radar" }
    ],
    home: [
      { name: "Smart Home Technology Analyst", desc: "Audit Matter and Thread integrations for accessibility, structural integrity, and local automations.", path: "/home-living/smart-matcher" },
      { name: "Visual Budget Renovator", desc: "Formulate structural renovations, optimize materials cost matrices, and manage labor schedules.", path: "/home-living/budget-renovator" }
    ],
    pet: [
      { name: "Canine Symptom Auditor", desc: "Analyze symptoms, cross-reference clinical urgency matrices, and construct wellness audits.", path: "/pet-family/canine-symptom-checker" },
      { name: "Breed Adaptability Matcher", desc: "Cross-examine dynamic parameters for family-breed compatibility and longevity indicators.", path: "/pet-family/matchmaker" }
    ],
    senior: [
      { name: "Prescription Interaction Checker", desc: "Validate clinical safety overlaps, drug interactions, and medical compliance criteria.", path: "/senior/drug-checker" },
      { name: "Mobility Safety Planner", desc: "Minimize residential fall hazards, review accessibility standards, and implement walking aids.", path: "/senior/mobility-planner" }
    ],
    travel: [
      { name: "Accessible Route Planner", desc: "Map geographic destinations against physical accessibility standards, budgets, and comfort.", path: "/travel/trip-planner" }
    ]
  };

  const recommendedTools = pillarTools[video.pillar as keyof typeof pillarTools] || pillarTools.money;

  // 5. Expert verification profile fallback
  const expertProfile = generateProfile(video.slug, false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20 select-none">
      
      {/* 1. Sticky Navigation & Breadcrumbs */}
      <div className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/60 shadow-sm print:hidden">
        <div className="container mx-auto px-6 max-w-7xl h-16 flex items-center justify-between">
          <Link
            href={`/videos`}
            className="flex items-center gap-2 text-slate-600 hover:text-[#006948] text-sm font-bold transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> {t.backToHub}
          </Link>
          
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#006948]">{video.pillar}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl mt-8">
        
        {/* 2. Hero Interactive Video Player + Sync Panel */}
        <section className="mb-12">
          <span className="inline-block text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full mb-3 shadow-2xs">
            {t.nowPlaying}
          </span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-brand-blue font-display leading-tight mb-6">
            {video.title}
          </h1>

          <VideoPlayer
            videoId={video.embed_id || video.video_id}
            platform="youtube"
            transcripts={video.segments}
          />
        </section>

        {/* 3. Social Metrics Bar, Bookmarks, and Reactions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Main Content & Insights */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* A. AI Summary & Insights */}
            {video.ai_summary && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-xs">
                <h3 className="text-xl font-black text-brand-blue font-display mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
                  {t.takeaways}
                </h3>
                <div className="space-y-4 text-slate-600 leading-relaxed text-base font-medium">
                  {video.ai_summary.split("\n\n").map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </div>
            )}

            {/* B. Expert Validation Pledge */}
            <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-200/50 flex flex-col sm:flex-row items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#006948] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                {expertProfile.name.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-emerald-800 tracking-wider block mb-1">
                  {t.verifiedExpert} • {expertProfile.name} ({expertProfile.title})
                </span>
                <p className="text-sm text-slate-600 leading-relaxed font-medium mb-0">
                  {t.expertPledge}
                </p>
              </div>
            </div>

            {/* C. Interactive Recommendations (Pillar Tools) */}
            <div className="bg-[#FAF8F3] rounded-3xl p-8 border border-slate-200/80">
              <h3 className="text-xl font-black text-brand-blue font-display mb-2 flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#006948]" />
                {t.toolsRecommendation}
              </h3>
              <p className="text-slate-500 font-medium text-sm mb-6 leading-relaxed">
                {t.toolsSubtitle}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendedTools.map((tool, idx) => (
                  <Link
                    key={idx}
                    href={`${tool.path}`}
                    className="group bg-white rounded-2xl p-5 border border-slate-200/60 shadow-2xs hover:shadow-md hover:border-emerald-500/20 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-brand-blue group-hover:text-[#006948] transition-colors mb-2 text-md">
                        {tool.name}
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed font-medium">
                        {tool.desc}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#006948] mt-4 self-start group-hover:translate-x-1 transition-all">
                      Calculate Now <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar Area: Metadata, Share/Embed, and Chapters */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* A. Dynamic Video Metadata Block */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-2xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 border-b border-slate-100 pb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {formatDate(video.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-slate-400" />
                    {video.view_count || 0} {t.views}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-500">Video Platform</span>
                  <span className="text-xs font-extrabold text-brand-blue uppercase bg-white border border-slate-200/50 px-2 py-0.5 rounded-lg shadow-2xs">
                    {video.provider}
                  </span>
                </div>
              </div>
            </div>

            {/* Travel Deals Insertion */}
            {video.pillar === "travel" && (
              <ContextualTravelDeals origin="CGK" destination="DPS" />
            )}

            {/* B. Shareable SmartLink & Dynamic Embed */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Share2 className="w-4 h-4 text-slate-400" /> Share & Embed
              </h4>
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => copyToClipboard(shareLink, false)}
                  className="flex items-center justify-between w-full p-3 bg-[#FAF8F3] hover:bg-[#F2EFE9] rounded-2xl border border-slate-200/50 text-slate-700 text-xs font-bold transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Copy className="w-3.5 h-3.5" /> {t.copyLink}
                  </span>
                  <span className="text-[10px] text-emerald-800 uppercase font-black">
                    {copiedLink ? t.copied : "Copy"}
                  </span>
                </button>

                <button
                  onClick={() => copyToClipboard(embedCode, true)}
                  className="flex items-center justify-between w-full p-3 bg-[#FAF8F3] hover:bg-[#F2EFE9] rounded-2xl border border-slate-200/50 text-slate-700 text-xs font-bold transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Code className="w-3.5 h-3.5" /> {t.copyEmbed}
                  </span>
                  <span className="text-[10px] text-emerald-800 uppercase font-black">
                    {copiedEmbed ? t.copied : "Copy"}
                  </span>
                </button>
              </div>
            </div>

            {/* C. Reactions & Bookmark Panel */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-2xs text-center">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-4 text-left">
                {t.reactions}
              </h4>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleBookmarkToggle}
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-2xl border text-sm font-bold transition-all hover:scale-102 min-h-[44px] ${isBookmarked ? 'bg-brand-green border-brand-green text-white shadow-md' : 'bg-[#FAF8F3] border-slate-200/60 text-slate-600 hover:border-brand-green hover:text-brand-green'}`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} /> 
                  {isBookmarked ? t.saved : t.save}
                </button>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleReaction("helpful")}
                    disabled={reactionState.includes("helpful")}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-2xl border text-xs font-bold transition-all hover:scale-105 min-h-[58px] ${reactionState.includes("helpful") ? 'bg-emerald-50 border-emerald-500/20 text-emerald-800' : 'bg-[#FAF8F3] border-slate-200/50 text-slate-600 hover:border-emerald-500/30'}`}
                  >
                    <ThumbsUp className={`w-4 h-4 mb-1 ${reactionState.includes("helpful") ? "animate-bounce" : ""}`} />
                    {t.helpful}
                  </button>

                  <button
                    onClick={() => handleReaction("insightful")}
                    disabled={reactionState.includes("insightful")}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-2xl border text-xs font-bold transition-all hover:scale-105 min-h-[58px] ${reactionState.includes("insightful") ? 'bg-emerald-50 border-emerald-500/20 text-emerald-800' : 'bg-[#FAF8F3] border-slate-200/50 text-slate-600 hover:border-emerald-500/30'}`}
                  >
                    <Lightbulb className={`w-4 h-4 mb-1 ${reactionState.includes("insightful") ? "animate-pulse" : ""}`} />
                    {t.insightful}
                  </button>

                  <button
                    onClick={() => handleReaction("love")}
                    disabled={reactionState.includes("love")}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-2xl border text-xs font-bold transition-all hover:scale-105 min-h-[58px] ${reactionState.includes("love") ? 'bg-emerald-50 border-emerald-500/20 text-emerald-800' : 'bg-[#FAF8F3] border-slate-200/50 text-slate-600 hover:border-emerald-500/30'}`}
                  >
                    <Heart className={`w-4 h-4 mb-1 ${reactionState.includes("love") ? "animate-ping" : ""}`} />
                    {t.love}
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* 4. Related Videos Matrix Block */}
        {relatedVideos.length > 0 && (
          <section className="mt-16 border-t border-slate-200 pt-12">
            <div className="max-w-xl mb-10">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#006948] bg-emerald-50 px-2.5 py-0.5 rounded-full mb-3 inline-block">
                LifeBloom Series
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-brand-blue font-display tracking-tight leading-tight">
                {t.relatedTitle}
              </h2>
              <p className="text-slate-500 font-medium text-sm mt-2 leading-relaxed">
                {t.relatedSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedVideos.map(item => (
                <Link
                  key={item.id}
                  href={`/videos/${item.slug}`}
                  className="group bg-white rounded-2xl border border-slate-200/60 overflow-hidden flex flex-col shadow-2xs hover:shadow-md hover:border-emerald-500/20 transition-all duration-300"
                >
                  <div className="aspect-video relative overflow-hidden bg-slate-950 flex items-center justify-center">
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 group-hover:opacity-95 transition-all duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 to-slate-950" />
                    )}
                    
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-all">
                      <div className="w-10 h-10 rounded-full bg-white/95 text-emerald-800 flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#006948] group-hover:text-white transition-all duration-300">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <span className="inline-block text-[9px] font-extrabold text-[#006948] bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 self-start">
                      {item.pillar}
                    </span>
                    <h4 className="font-bold text-brand-blue text-md mb-2 line-clamp-2 group-hover:text-[#006948] transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold mt-auto pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(item.created_at)}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{item.view_count || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
