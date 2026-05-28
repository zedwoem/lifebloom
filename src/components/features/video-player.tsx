"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Maximize2, Minimize2, Play, AlertCircle, Volume2, Type } from "lucide-react";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export interface TranscriptLine {
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
}

interface VideoPlayerProps {
  videoId: string; // This is the embed_id (e.g. YouTube video ID)
  platform?: "youtube" | "vimeo" | "custom";
  transcripts?: TranscriptLine[];
  onPlayStart?: () => void; // Callback when video starts playing to increment views
}

export default function VideoPlayer({
  videoId,
  platform = "youtube",
  transcripts = [],
  onPlayStart
}: VideoPlayerProps) {
  const [mounted, setMounted] = useState(false);
  const playerRef = useRef<any>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [textSize, setTextSize] = useState<"normal" | "large" | "extra">("large");
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasTrackedPlay, setHasTrackedPlay] = useState(false);

  // Mount check for Next.js SSR
  useEffect(() => {
    setMounted(true);
    return () => {
      // Clean up body scroll lock just in case
      document.body.style.overflow = "";
    };
  }, []);

  // Cinema Mode Body Scroll Lock
  useEffect(() => {
    if (isCinemaMode) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isCinemaMode]);

  // Escape key listener for Cinema Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCinemaMode) {
        setIsCinemaMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCinemaMode]);

  // Find currently active transcript line
  const activeIndex = useMemo(() => {
    if (transcripts.length === 0) return -1;
    return transcripts.findIndex(
      (line, idx) =>
        currentTime >= line.start &&
        (idx === transcripts.length - 1 || currentTime < transcripts[idx + 1].start)
    );
  }, [currentTime, transcripts]);

  // Auto-scroll transcript container with debounce / optimization
  useEffect(() => {
    if (activeIndex === -1) return;
    const activeEl = segmentRefs.current.get(activeIndex);
    if (activeEl && transcriptContainerRef.current) {
      const container = transcriptContainerRef.current;
      
      // Calculate top relative position to avoid layout thrashing
      const offsetTop = activeEl.offsetTop;
      const containerHeight = container.clientHeight;
      const elementHeight = activeEl.clientHeight;
      
      container.scrollTo({
        top: offsetTop - containerHeight / 2 + elementHeight / 2,
        behavior: "smooth"
      });
    }
  }, [activeIndex]);

  const handlePlay = () => {
    setPlaying(true);
    if (!hasTrackedPlay) {
      setHasTrackedPlay(true);
      if (onPlayStart) {
        onPlayStart();
      }
    }
  };

  const seekTo = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, "seconds");
      setPlaying(true);
    }
  };

  const getTextSizeClass = () => {
    switch (textSize) {
      case "large":
        return "text-lg md:text-xl leading-relaxed";
      case "extra":
        return "text-xl md:text-2xl leading-relaxed font-medium";
      default:
        return "text-base leading-relaxed";
    }
  };

  if (!mounted) {
    return (
      <div className="aspect-video w-full rounded-2xl bg-slate-900 animate-pulse flex items-center justify-center text-slate-500">
        Loading premium video player...
      </div>
    );
  }

  // Fallback UI when the video cannot be loaded
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 aspect-video w-full">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4 animate-bounce" />
        <h4 className="text-lg font-bold mb-2">Failed to load video player</h4>
        <p className="text-sm text-slate-400 text-center max-w-md mb-6">
          This could be due to network restrictions or embedding permission limits set by the channel creator.
        </p>
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#006948] hover:bg-[#005238] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md hover:scale-105"
        >
          <Play className="w-4 h-4 fill-current" /> Play on YouTube
        </a>
      </div>
    );
  }

  const renderPlayer = () => {
    const Player = ReactPlayer as any;
    return (
      <div className="relative aspect-video bg-slate-950 w-full overflow-hidden rounded-2xl group shadow-lg border border-slate-200/50">
        <Player
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${videoId}`}
          width="100%"
          height="100%"
          playing={playing}
          controls={true}
          light={false}
          onPlay={handlePlay}
          onPause={() => setPlaying(false)}
          onProgress={({ playedSeconds }: { playedSeconds: number }) => setCurrentTime(playedSeconds)}
          onError={() => setHasError(true)}
          config={{
            youtube: {
              playerVars: {
                modestbranding: 1,
                rel: 0,
                showinfo: 0
              }
            }
          }}
        />

        {/* Cinema Mode Switch floating overlay */}
        <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => setIsCinemaMode(!isCinemaMode)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all"
            title={isCinemaMode ? "Exit Cinema Mode" : "Enter Cinema Mode"}
            aria-label={isCinemaMode ? "Exit Cinema Mode" : "Enter Cinema Mode"}
          >
            {isCinemaMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* A. Unified Responsive Layout container */}
      <div className="flex flex-col xl:flex-row gap-6 bg-white rounded-3xl shadow-sm border border-slate-200/60 p-5">
        
        {/* 1. Left Side: Video Player Container */}
        <div className="flex-grow xl:w-7/12 flex items-center justify-center">
          {renderPlayer()}
        </div>

        {/* 2. Right Side: Interactive Transcripts Panel */}
        <div className="xl:w-5/12 flex flex-col min-h-[350px] max-h-[480px] bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
          <header className="flex justify-between items-center border-b border-slate-200/60 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Interactive Transcript</h3>
            </div>
            
            {/* Accessibility Font Size Controller for Elderly Comfort */}
            <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
              <button
                onClick={() => setTextSize("normal")}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${textSize === "normal" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                title="Small Text"
                aria-label="Small Text"
              >
                A
              </button>
              <button
                onClick={() => setTextSize("large")}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${textSize === "large" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                title="Medium Text"
                aria-label="Medium Text"
              >
                A+
              </button>
              <button
                onClick={() => setTextSize("extra")}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-base font-extrabold transition-all ${textSize === "extra" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                title="Large Text"
                aria-label="Large Text"
              >
                A++
              </button>
            </div>
          </header>

          {/* Scrollable Subtitles sync with video state */}
          <div 
            ref={transcriptContainerRef}
            className="flex-grow overflow-y-auto pr-1 space-y-3 scrollbar-thin"
          >
            {transcripts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <Volume2 className="w-8 h-8 opacity-40 mb-3 animate-pulse" />
                <p className="italic text-sm">Transcript is being generated by AI or is unavailable.</p>
              </div>
            ) : (
              transcripts.map((line, idx) => {
                const isActive = idx === activeIndex;

                return (
                  <button
                    key={idx}
                    ref={(el) => {
                      if (el) segmentRefs.current.set(idx, el);
                      else segmentRefs.current.delete(idx);
                    }}
                    onClick={() => seekTo(line.start)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-4 ${
                      isActive
                        ? "bg-emerald-50/75 border-emerald-500/30 text-emerald-800 font-semibold ring-2 ring-emerald-500/20 shadow-sm"
                        : "bg-white border-slate-200/50 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-lg select-none ${isActive ? 'bg-emerald-200/70 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      {Math.floor(line.start / 60)}:
                      {Math.floor(line.start % 60).toString().padStart(2, "0")}
                    </span>
                    <span className={getTextSizeClass()}>{line.text}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* B. Cinema Mode Floating Overlay Portal (Scroll Locked on mount) */}
      {isCinemaMode && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-950/98 backdrop-blur-lg animate-fade-in p-6 overflow-hidden">
          {/* Cinema Header */}
          <header className="flex justify-between items-center mb-4 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h2 className="text-white text-md font-bold uppercase tracking-wider font-display">Cinema Mode</h2>
            </div>
            <button
              onClick={() => setIsCinemaMode(false)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all text-sm"
              title="Close Cinema Mode (ESC)"
            >
              Exit Cinema (ESC)
            </button>
          </header>

          {/* Player Main Area */}
          <div className="flex-grow flex items-center justify-center max-w-7xl mx-auto w-full max-h-[80vh]">
            <div className="w-full aspect-video">
              {renderPlayer()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
