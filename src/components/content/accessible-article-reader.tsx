"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Share2, Printer, Contrast, Play, Square, Pause, ThumbsUp, Lightbulb, Heart, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { EmbedGenerator } from '@/components/ui/embed-generator';
import { SponsorShowcase } from '@/components/content/sponsor-showcase';
import { generateProfile } from '@/lib/utils/profileGenerator';
import { RelatedPostsWidget } from '@/components/content/related-posts-widget';
import { AccessibleReaderBar } from '@/components/content/accessible-reader-bar';

export function AccessibleArticleReader({ article, locale, slug }: { article: any, locale: string, slug: string }) {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [reactionState, setReactionState] = useState<string[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isNativeSpeechRef = useRef(false);

  // Check if article is bookmarked on mount
  useEffect(() => {
    async function checkBookmark() {
      try {
        const res = await fetch("/api/user/saved-items");
        if (res.ok) {
          const items = await res.json();
          const found = items.some((item: any) => item.referenced_id === slug && item.item_type === "article");
          setIsBookmarked(found);
        }
      } catch (err) {
        console.error("Failed to fetch bookmarks:", err);
      }
    }
    if (slug) {
      checkBookmark();
    }
  }, [slug]);

  const handleBookmarkToggle = async () => {
    try {
      if (isBookmarked) {
        const res = await fetch(`/api/user/saved-items?referenced_id=${slug}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setIsBookmarked(false);
          toast.success(locale === 'id' ? "Artikel dihapus dari simpanan." : "Article removed from saved items.");
        }
      } else {
        const res = await fetch("/api/user/saved-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item_type: "article",
            referenced_id: slug,
            metadata: {
              title: article.title,
              pillar: article.pillar || "health",
              source: article.source,
              image_url: article.imageUrl
            }
          }),
        });
        if (res.ok) {
          setIsBookmarked(true);
          toast.success(locale === 'id' ? "Artikel berhasil disimpan!" : "Article saved to your dashboard!");
        } else {
          toast.error(locale === 'id' ? "Silakan masuk untuk menyimpan artikel." : "Please sign in to save articles.");
        }
      }
    } catch (err) {
      toast.error("Failed to update bookmark.");
    }
  };

  const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault();
    toast.warning("Copying disabled. Please use the Share & Embed widget below.");
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.warning("Right-click disabled to protect our expert content.");
  };

  const processedContent = article?.content ? article.content.replace(
    /<a([^>]+)>/gi,
    (match: string, p1: string) => {
      if (!p1.includes('target=')) {
        return `<a${p1} target="_blank" rel="nofollow noopener noreferrer">`;
      }
      return match;
    }
  ) : "";

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeech = async () => {
    // Dismiss existing toasts
    toast.dismiss();

    // Handle cancel/stop
    if (isSpeaking) {
      if (isNativeSpeechRef.current) {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      } else if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsSpeaking(false);
      setIsPaused(false);
      return;
    }

    // Strip HTML tags for clean reading
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = article.content;
    const textToRead = `${article.title}. By ${article.author?.name || "Editorial Team"}. ${tempDiv.textContent || tempDiv.innerText || ""}`.substring(0, 1500);

    try {
      setIsSpeaking(true);
      setIsPaused(false);
      isNativeSpeechRef.current = false;
      
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToRead, locale }),
        // 5s timeout to trigger immediate fallback if server is slow
        signal: AbortSignal.timeout(5000)
      });
      
      if (!res.ok) throw new Error("Cloud TTS Failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          setIsPaused(false);
        };
      } else {
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.play();
        audio.onended = () => {
          setIsSpeaking(false);
          setIsPaused(false);
        };
      }
    } catch (err) {
      console.warn("[TTS] Cloud voice failed. Invoking premium browser-native SpeechSynthesis fallback...", err);
      
      // Invoke premium browser-native SpeechSynthesis
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        isNativeSpeechRef.current = true;
        window.speechSynthesis.cancel(); // Stop active tracks
        
        const utterance = new SpeechSynthesisUtterance(textToRead);
        
        // Dynamic Lang matching
        utterance.lang = locale === 'id' ? 'id-ID' : 'en-US';
        
        utterance.onend = () => {
          setIsSpeaking(false);
          setIsPaused(false);
        };
        
        utterance.onerror = (e) => {
          if (e.error !== 'interrupted' && e.error !== 'canceled') {
            console.error("Native Speech Error:", e);
            // Silenced the toast as it often triggers incorrectly on manual stops
          }
          setIsSpeaking(false);
          setIsPaused(false);
        };

        window.speechSynthesis.speak(utterance);
        toast.info(locale === 'id' ? "Memutar audio menggunakan suara sistem..." : "Playing audio using system voice...");
        
      } else {
        setIsSpeaking(false);
        toast.error(locale === 'id' ? "Layanan suara tidak didukung di browser ini." : "Speech service is not supported in this browser.");
      }
    }
  };

  const togglePause = () => {
    if (isNativeSpeechRef.current) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        if (isPaused) {
          window.speechSynthesis.resume();
          setIsPaused(false);
        } else {
          window.speechSynthesis.pause();
          setIsPaused(true);
        }
      }
      return;
    }

    if (audioRef.current) {
      if (isPaused) {
        audioRef.current.play();
        setIsPaused(false);
      } else {
        audioRef.current.pause();
        setIsPaused(true);
      }
    }
  };


  const proseSizeClasses = {
    normal: 'prose-lg',
    large: 'prose-xl',
    xlarge: 'prose-2xl'
  };

  const titleSizeClasses = {
    normal: 'text-4xl md:text-5xl',
    large: 'text-5xl md:text-6xl',
    xlarge: 'text-6xl md:text-7xl'
  };

  const containerClasses = highContrast 
    ? 'bg-black text-yellow-300' 
    : 'bg-background text-foreground';

  const stickyHeaderClasses = highContrast
    ? 'bg-black border-b border-yellow-300'
    : 'bg-white/95 backdrop-blur-md border-b border-border shadow-sm';

  const iconClasses = highContrast
    ? 'text-yellow-300 hover:text-white'
    : 'text-on-surface-variant hover:text-primary';

  const proseClasses = highContrast
    ? `prose ${proseSizeClasses[fontSize]} max-w-[720px] mx-auto prose-headings:text-yellow-300 prose-headings:font-bold prose-p:text-yellow-300 prose-p:leading-relaxed prose-p:mb-6 prose-a:text-yellow-400 prose-strong:text-yellow-300 animate-slide-up`
    : `prose ${proseSizeClasses[fontSize]} prose-slate max-w-[720px] mx-auto prose-headings:text-foreground prose-headings:font-bold prose-p:leading-relaxed prose-p:mb-6 prose-a:text-primary animate-slide-up`;

  const handlePrint = () => {
    window.print();
  };

  // URL for QR code
  const articleUrl = typeof window !== 'undefined' ? window.location.href : `https://lifebloomhub.vercel.app/${locale}/article/${slug}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(articleUrl)}`;

  return (
    <article 
      className={`min-h-screen pb-20 transition-colors duration-300 ${containerClasses} select-none`}
      onCopy={handleCopy}
      onContextMenu={handleContextMenu}
    >
      
      {/* Top Navigation Bar with Accessibility Controls - HIDDEN ON PRINT */}
      <div className={`sticky top-0 w-full z-50 print:hidden ${stickyHeaderClasses}`}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href={`/${locale}`} className={`inline-flex items-center font-semibold transition-colors ${iconClasses}`}>
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Link>
          
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* ACCESSIBILITY CONTROLS */}
            <div className={`flex items-center gap-1 p-1.5 rounded-2xl ${highContrast ? 'bg-white/10' : 'bg-slate-100'}`}>
              <button 
                onClick={() => setFontSize('normal')}
                className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors ${fontSize === 'normal' ? (highContrast ? 'bg-yellow-300 text-black' : 'bg-white shadow-sm text-brand-blue') : (highContrast ? 'text-yellow-300 hover:bg-white/20' : 'text-slate-500 hover:bg-white/50')}`}
              >
                A
              </button>
              <button 
                onClick={() => setFontSize('large')}
                className={`px-3 py-1 rounded-lg text-lg font-bold transition-colors ${fontSize === 'large' ? (highContrast ? 'bg-yellow-300 text-black' : 'bg-white shadow-sm text-brand-blue') : (highContrast ? 'text-yellow-300 hover:bg-white/20' : 'text-slate-500 hover:bg-white/50')}`}
              >
                A
              </button>
              <button 
                onClick={() => setFontSize('xlarge')}
                className={`px-3 py-1 rounded-lg text-xl font-bold transition-colors ${fontSize === 'xlarge' ? (highContrast ? 'bg-yellow-300 text-black' : 'bg-white shadow-sm text-brand-blue') : (highContrast ? 'text-yellow-300 hover:bg-white/20' : 'text-slate-500 hover:bg-white/50')}`}
              >
                A
              </button>
              <div className="w-px h-5 bg-current/20 mx-1"></div>
              <button 
                onClick={() => setHighContrast(!highContrast)}
                className={`p-1.5 rounded-lg transition-colors ${highContrast ? 'bg-yellow-300 text-black shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
                title="Toggle High Contrast"
              >
                <Contrast className="w-5 h-5" />
              </button>
            </div>

            {/* TTS & Print */}
            <div className={`flex items-center gap-2 p-1.5 rounded-2xl ${highContrast ? 'bg-white/10' : 'bg-slate-100'}`}>
              {!isSpeaking ? (
                <button onClick={handleSpeech} className={`p-1.5 rounded-lg transition-colors ${highContrast ? 'text-yellow-300 hover:bg-white/20' : 'text-slate-500 hover:bg-white/50'}`} title="Read Article">
                  <Play className="w-5 h-5" fill="currentColor" />
                </button>
              ) : (
                <>
                  <button onClick={togglePause} className={`p-1.5 rounded-lg transition-colors ${highContrast ? 'text-yellow-300 hover:bg-white/20' : 'text-slate-500 hover:bg-white/50'}`} title={isPaused ? "Resume" : "Pause"}>
                    {isPaused ? <Play className="w-5 h-5" fill="currentColor" /> : <Pause className="w-5 h-5" fill="currentColor" />}
                  </button>
                  <button onClick={handleSpeech} className={`p-1.5 rounded-lg transition-colors ${highContrast ? 'text-red-400 hover:bg-white/20' : 'text-red-500 hover:bg-white/50'}`} title="Stop">
                    <Square className="w-5 h-5" fill="currentColor" />
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button onClick={handlePrint} className={`transition-colors ${iconClasses}`} title="Print Article"><Printer className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-12">
        {/* PRINT ONLY HEADER */}
        <div className="hidden print:block mb-8 text-center border-b-2 border-black pb-4">
          <h2 className="text-3xl font-black text-black tracking-tight">LifeBloom Hub</h2>
          <p className="text-gray-500 text-sm">{articleUrl}</p>
        </div>

        {/* Article Header */}
        <header className="mb-10 text-center md:text-left animate-fade-in">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide mb-6 ${highContrast ? 'bg-yellow-300/20 text-yellow-300 border border-yellow-300' : 'bg-brand-green/10 text-brand-green-dark'}`}>
            {article.source}
          </div>
          <h1 className={`${titleSizeClasses[fontSize]} font-black leading-tight mb-6 font-display ${highContrast ? 'text-yellow-300' : 'text-brand-blue'} transition-all`}>
            {article.title}
          </h1>
          <div className={`flex flex-col md:flex-row md:items-center gap-2 md:gap-6 font-medium ${highContrast ? 'text-yellow-200' : 'text-slate-500'}`}>
            <span>By {article.author?.name || generateProfile(slug, false).name}</span>
            <span className="hidden md:inline">•</span>
            <span>{article.date}</span>
          </div>
          
          {/* E-E-A-T Authorship Badge */}
          {article.expertReviewer ? (
            <div className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl ${highContrast ? 'bg-yellow-300/10 border border-yellow-300 text-yellow-300' : 'bg-slate-50 border border-slate-200 text-slate-700'}`}>
              <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center font-bold text-xs">
                {article.expertReviewer.name.charAt(0)}
              </div>
              <div className="text-sm">
                <span className="opacity-70 text-xs block">Verified Expert</span>
                <span className="font-bold">{article.expertReviewer.name}</span>
              </div>
            </div>
          ) : (
            <Link 
              href={`/${locale}/support`}
              className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-100/80 transition-colors ${highContrast ? 'bg-yellow-300/10 border border-yellow-300 text-yellow-300' : 'bg-slate-50 border border-slate-200 text-slate-700'}`}
              title="Apply as a Verified Expert Reviewer"
            >
              <div className="w-8 h-8 rounded-full bg-[#006948] text-white flex items-center justify-center font-bold text-xs">
                {generateProfile(slug, false).name.charAt(0)}
              </div>
              <div className="text-sm">
                <span className="opacity-70 text-xs block">Verification Pending • Apply Here</span>
                <span className="font-bold">{generateProfile(slug, false).name}</span>
              </div>
            </Link>
          )}
        </header>

        {/* Featured Image */}
        <figure className={`mb-12 rounded-3xl overflow-hidden relative shadow-lg border animate-slide-up w-full h-[400px] ${highContrast ? 'border-yellow-300 grayscale' : 'border-slate-100'}`} style={{ animationDelay: '0.1s' }}>
          <Image 
            src={article.imageUrl || "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80"} 
            alt={article.title} 
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            priority
            className="object-cover"
          />
        </figure>

        {/* Article Content - Zen Mode */}
        <div 
          className={proseClasses}
          style={{ animationDelay: '0.2s' }}
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />        {/* Reaction Emojis & Bookmark */}
        <div className="mt-12 flex flex-wrap justify-center gap-4 animate-fade-in print:hidden">
          <button 
            onClick={handleBookmarkToggle}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-bold transition-all hover:scale-110 min-h-[48px] ${isBookmarked ? 'bg-brand-green border-brand-green text-white shadow-lg' : highContrast ? 'border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black' : 'border-slate-200 text-slate-600 hover:border-brand-green hover:text-brand-green'}`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} /> 
            {isBookmarked ? (locale === 'id' ? "Tersimpan" : "Saved") : (locale === 'id' ? "Simpan" : "Save")}
          </button>
          
          <button 
            onClick={() => {
              if (!reactionState.includes('helpful')) {
                setReactionState(prev => [...prev, 'helpful']);
                toast.success("Glad you found this helpful!", { icon: "👍" });
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-all hover:scale-110 min-h-[48px] ${reactionState.includes('helpful') ? 'bg-brand-green/20 border-brand-green text-brand-green shadow-sm' : highContrast ? 'border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black' : 'border-slate-200 text-slate-600 hover:border-brand-green hover:text-brand-green'}`}
          >
            <ThumbsUp className={`w-4 h-4 ${reactionState.includes('helpful') ? 'animate-bounce' : ''}`} /> Helpful
          </button>
          <button 
            onClick={() => {
              if (!reactionState.includes('insightful')) {
                setReactionState(prev => [...prev, 'insightful']);
                toast.success("Thanks for your feedback!", { icon: "💡" });
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-all hover:scale-110 min-h-[48px] ${reactionState.includes('insightful') ? 'bg-brand-blue/20 border-brand-blue text-brand-blue shadow-sm' : highContrast ? 'border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black' : 'border-slate-200 text-slate-600 hover:border-brand-blue hover:text-brand-blue'}`}
          >
            <Lightbulb className={`w-4 h-4 ${reactionState.includes('insightful') ? 'animate-pulse' : ''}`} /> Insightful
          </button>
          <button 
            onClick={() => {
              if (!reactionState.includes('love')) {
                setReactionState(prev => [...prev, 'love']);
                toast.success("We love that you love it!", { icon: "❤️" });
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-all hover:scale-110 min-h-[48px] ${reactionState.includes('love') ? 'bg-rose-50 border-rose-500 text-rose-500 shadow-sm' : highContrast ? 'border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black' : 'border-slate-200 text-slate-600 hover:border-rose-500 hover:text-rose-500'}`}
          >
            <Heart className={`w-4 h-4 ${reactionState.includes('love') ? 'animate-ping' : ''}`} /> Love it
          </button>
        </div>

        {/* Related Posts Widget */}
        <RelatedPostsWidget currentSlug={slug} />

        {/* PRINT ONLY FOOTER & QR CODE */}
        <div className="hidden print:flex flex-col items-center mt-12 pt-8 border-t-2 border-black page-break-inside-avoid">
          <p className="text-sm font-bold mb-4">Read this article online or discover more tools at LifeBloom Hub:</p>
          <div className="relative w-32 h-32">
            <Image src={qrCodeUrl} alt="QR Code to article" fill className="object-contain" />
          </div>
        </div>

        {/* Sponsor Showcase Integration */}
        <div className={`mt-12 pt-8 border-t print:hidden ${highContrast ? 'border-yellow-300/30' : 'border-slate-200'}`}>
          <SponsorShowcase pillarSlug={article.pillar || "health"} articleSlug={slug} locale={locale} />
        </div>

        {/* Footer Share & Embed - HIDDEN ON PRINT */}
        <div className={`mt-8 pt-8 border-t print:hidden ${highContrast ? 'border-yellow-300/30' : 'border-border'}`}>
          <div className="flex flex-col gap-6">
            <EmbedGenerator slug={`article/${slug}`} title={article.title} type="article" />
          </div>
        </div>
      </div>
      <AccessibleReaderBar />
    </article>
  );
}
