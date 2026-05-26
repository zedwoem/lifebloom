"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, Contrast, ZoomIn, ZoomOut } from "lucide-react";

export function AccessibleReaderBar() {
  const [fontSize, setFontSize] = useState<"normal" | "large" | "extra-large">("normal");
  const [highContrast, setHighContrast] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSynth(window.speechSynthesis);
    }
  }, []);

  // Update HTML body styles based on state
  useEffect(() => {
    const body = document.body;
    if (highContrast) {
      body.classList.add("high-contrast-mode");
    } else {
      body.classList.remove("high-contrast-mode");
    }
  }, [highContrast]);

  useEffect(() => {
    const body = document.body;
    if (fontSize === "large") {
      body.style.fontSize = "115%";
    } else if (fontSize === "extra-large") {
      body.style.fontSize = "130%";
    } else {
      body.style.fontSize = "100%";
    }
  }, [fontSize]);

  // Handle cleanup of speech when unmounting
  useEffect(() => {
    return () => {
      if (synth) {
        synth.cancel();
      }
    };
  }, [synth]);

  const handleTTS = () => {
    if (!synth) return;

    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
    } else {
      if (synth.paused) {
        synth.resume();
        setIsPlaying(true);
      } else {
        // Collect text content from the article container
        const articleElement = document.querySelector("article") || document.querySelector("main");
        const textToRead = articleElement ? articleElement.textContent || "" : "";
        
        if (!textToRead) return;

        synth.cancel(); // Stop any ongoing speech
        const newUtterance = new SpeechSynthesisUtterance(textToRead);
        newUtterance.lang = document.documentElement.lang || "id-ID";
        newUtterance.onend = () => setIsPlaying(false);
        newUtterance.onerror = () => setIsPlaying(false);
        
        synth.speak(newUtterance);
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-white p-2 rounded-full shadow-2xl border border-border flex items-center gap-2 backdrop-blur-md bg-opacity-95 max-w-[90vw] md:max-w-max transition-all duration-300">
      {/* Decrease font size */}
      <button 
        aria-label="Decrease text size" 
        onClick={() => {
          if (fontSize === "extra-large") setFontSize("large");
          else if (fontSize === "large") setFontSize("normal");
        }}
        disabled={fontSize === "normal"}
        className="w-[52px] h-[52px] rounded-full hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center text-foreground font-bold transition-all focus:ring-4 focus:ring-primary/20 shrink-0"
      >
        <span className="text-sm">A-</span>
      </button>

      {/* Reset font size */}
      <button 
        aria-label="Reset text size" 
        onClick={() => setFontSize("normal")}
        className={`w-[52px] h-[52px] rounded-full flex items-center justify-center text-foreground font-bold transition-all focus:ring-4 focus:ring-primary/20 shrink-0 ${fontSize === "normal" ? "bg-slate-100" : "hover:bg-slate-100"}`}
      >
        <span className="text-base">A</span>
      </button>

      {/* Increase font size */}
      <button 
        aria-label="Increase text size" 
        onClick={() => {
          if (fontSize === "normal") setFontSize("large");
          else if (fontSize === "large") setFontSize("extra-large");
        }}
        disabled={fontSize === "extra-large"}
        className="w-[52px] h-[52px] rounded-full hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center text-foreground font-bold transition-all focus:ring-4 focus:ring-primary/20 shrink-0"
      >
        <span className="text-lg">A+</span>
      </button>

      <div className="w-px h-8 bg-border mx-1 shrink-0"></div>

      {/* High Contrast */}
      <button 
        aria-label="High Contrast Mode" 
        onClick={() => setHighContrast(prev => !prev)}
        className={`w-[52px] h-[52px] rounded-full flex items-center justify-center text-foreground transition-all focus:ring-4 focus:ring-primary/20 shrink-0 ${highContrast ? "bg-primary text-white" : "hover:bg-slate-100"}`}
      >
        <Contrast className="w-5 h-5" />
      </button>

      {/* Text to Speech */}
      <button 
        aria-label="Text to Speech" 
        onClick={handleTTS}
        className={`w-[52px] h-[52px] rounded-full flex items-center justify-center text-foreground transition-all focus:ring-4 focus:ring-primary/20 shrink-0 ${isPlaying ? "bg-primary text-white" : "hover:bg-slate-100"}`}
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 pl-0.5" />}
      </button>
    </div>
  );
}
