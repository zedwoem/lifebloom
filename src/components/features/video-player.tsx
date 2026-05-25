"use client";

import React, { useEffect, useRef, useState } from "react";
import Plyr from "plyr";
import "plyr/dist/plyr.css";

interface TranscriptLine {
  time: number; // in seconds
  text: string;
}

interface VideoPlayerProps {
  videoId: string;
  platform?: "youtube" | "vimeo" | "custom";
  transcripts?: TranscriptLine[];
}

export default function VideoPlayer({
  videoId,
  platform = "youtube",
  transcripts = [],
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const plyrInstanceRef = useRef<Plyr | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [textSize, setTextSize] = useState<"normal" | "large" | "extra">("large");

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize Plyr only in client browser environment
    const player = new Plyr(videoRef.current, {
      autoplay: false,
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "fullscreen",
      ],
    });

    plyrInstanceRef.current = player;

    player.on("timeupdate", () => {
      setCurrentTime(player.currentTime);
    });

    return () => {
      player.destroy();
    };
  }, [videoId, platform]);

  const seekTo = (seconds: number) => {
    if (plyrInstanceRef.current) {
      plyrInstanceRef.current.currentTime = seconds;
      plyrInstanceRef.current.play();
    }
  };

  const getTextSizeClass = () => {
    switch (textSize) {
      case "large":
        return "text-lg md:text-xl";
      case "extra":
        return "text-xl md:text-2xl";
      default:
        return "text-base";
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      {/* 1. Left Side: Video Player */}
      <div className="flex-grow lg:w-3/5">
        <div className="overflow-hidden rounded-xl bg-slate-950 aspect-video">
          {platform === "youtube" ? (
            <div
              ref={videoRef as any}
              data-plyr-provider="youtube"
              data-plyr-embed-id={videoId}
            />
          ) : (
            <div
              ref={videoRef as any}
              data-plyr-provider="vimeo"
              data-plyr-embed-id={videoId}
            />
          )}
        </div>
      </div>

      {/* 2. Right Side: Interactive Transcripts Panel */}
      <div className="lg:w-2/5 flex flex-col min-h-[300px] max-h-[450px]">
        <header className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
          <h3 className="text-md font-bold text-slate-800">Transcript Panel</h3>
          
          {/* Subtitle Font Size Controller for Elderly Comfort */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setTextSize("normal")}
              className={`px-2 py-1 rounded text-xs font-semibold ${textSize === "normal" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
            >
              A
            </button>
            <button
              onClick={() => setTextSize("large")}
              className={`px-2 py-1 rounded text-sm font-semibold ${textSize === "large" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
            >
              A+
            </button>
            <button
              onClick={() => setTextSize("extra")}
              className={`px-2 py-1 rounded text-base font-bold ${textSize === "extra" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
            >
              A++
            </button>
          </div>
        </header>

        {/* Scrollable Subtitles sync with video state */}
        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
          {transcripts.length === 0 ? (
            <p className="text-slate-400 italic text-center py-12">No subtitles uploaded for this video.</p>
          ) : (
            transcripts.map((line, idx) => {
              const isActive =
                currentTime >= line.time &&
                (idx === transcripts.length - 1 || currentTime < transcripts[idx + 1].time);

              return (
                <button
                  key={idx}
                  onClick={() => seekTo(line.time)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 min-h-[48px] ${
                    isActive
                      ? "bg-blue-50 border-brand-blue/30 text-brand-blue font-semibold ring-2 ring-brand-blue"
                      : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded select-none">
                    {Math.floor(line.time / 60)}:
                    {(line.time % 60).toString().padStart(2, "0")}
                  </span>
                  <span className={getTextSizeClass()}>{line.text}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
