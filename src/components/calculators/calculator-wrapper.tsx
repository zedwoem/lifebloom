"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";


interface CalculatorWrapperProps {
  children: React.ReactNode;
  slug: string;
  title: string;
}

export default function CalculatorWrapper({
  children,
  slug,
  title,
}: CalculatorWrapperProps) {
    const { user } = useAuth();
  const [showEmbed, setShowEmbed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [brandColor, setBrandColor] = useState("#1e40af");

  const embedCode = `<iframe src="${typeof window !== "undefined" ? window.location.origin : ""}/embed/calculator/${slug}?color=${brandColor.replace("#", "")}" width="100%" height="650" style="border:1px solid #e2e8f0; border-radius:16px;" allowfullscreen></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* 1. Render Actual Form children */}
      <div>{children}</div>

      {/* 2. Viral Backlink Embed Widget Generator Trigger */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center max-w-2xl mx-auto">
        <h3 className="text-lg font-bold text-slate-800">Embed This Calculator</h3>
        <p className="text-slate-600 text-sm mt-1 mb-4">
          Share this helpful tool with your audience by pasting the iframe widget on your blog.
        </p>

        {!showEmbed ? (
          <button
            onClick={() => setShowEmbed(true)}
            className="px-5 py-2.5 bg-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-300 transition-colors min-h-[48px]"
          >
            Get Embed Code
          </button>
        ) : (
          <div className="space-y-4 text-left animate-fade-in">
            <div className="flex items-center gap-3">
              <label htmlFor="brand-color" className="text-sm font-bold text-slate-700">Iframe Theme Color:</label>
              <input
                id="brand-color"
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
              />
              <span className="text-xs text-slate-400">Choose a brand color that matches your blog</span>
            </div>

            {/* Code Snippet and Copy Button */}
            <div className="relative">
              <textarea
                readOnly
                value={embedCode}
                className="w-full bg-slate-900 text-slate-200 p-3 rounded-lg text-xs font-mono h-24 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
              <button
                onClick={handleCopy}
                className={`absolute right-2 bottom-3 px-4 py-1.5 rounded text-xs font-bold text-white transition-colors ${copied ? "bg-emerald-600" : "bg-brand-blue hover:bg-blue-800"}`}
              >
                {copied ? "Copied!" : "Copy Code"}
              </button>
            </div>
            
            <button
              onClick={() => setShowEmbed(false)}
              className="text-xs text-slate-400 underline hover:text-slate-600"
            >
              Hide Panel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
