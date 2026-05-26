"use client";

import { useState } from 'react';
import { PlayCircle, Tv, X } from 'lucide-react';

interface VideoData {
  id: string;
  title: string;
  embedId: string;
  pillar: string;
  description: string;
}

interface PillarVideoSectionClientProps {
  videos: VideoData[];
  locale: string;
}

export function PillarVideoSectionClient({ videos, locale }: PillarVideoSectionClientProps) {
  const [activeEmbed, setActiveEmbed] = useState<string | null>(null);

  return (
    <section className="mt-16 w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
        
        <div className="flex items-center gap-3 mb-8 border-b pb-4 border-slate-100">
          <div className="p-3 bg-rose-50 text-rose-500 rounded-xl">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">
              {locale === 'id' ? 'Video Edukasi & Masterclass' : 'Video Guides & Masterclasses'}
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              {locale === 'id' ? 'Tonton penjelasan interaktif dari para pakar kami.' : 'Watch comprehensive walkthroughs by our trusted experts.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map(video => (
            <div 
              key={video.id}
              onClick={() => setActiveEmbed(video.embedId)}
              className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden cursor-pointer group hover:shadow-md transition-all hover:border-brand-green/30 flex flex-col justify-between"
            >
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative flex items-center justify-center">
                <PlayCircle className="w-12 h-12 text-white/70 group-hover:text-brand-green group-hover:scale-110 transition-all z-10" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                
                {/* Visual Thumbnail simulation using YouTube fallback if offline */}
                <img 
                  src={`https://img.youtube.com/vi/${video.embedId}/mqdefault.jpg`} 
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-[1.03] transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-brand-green uppercase tracking-wider block mb-1">
                    Masterclass
                  </span>
                  <h4 className="font-bold text-slate-800 text-base mb-2 line-clamp-2 group-hover:text-brand-green-dark transition-colors" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                    {video.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mt-auto">
                  {video.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Video Player modal overlay */}
      {activeEmbed && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <button 
              onClick={() => setActiveEmbed(null)}
              className="absolute top-4 right-4 z-50 p-3 bg-black/60 hover:bg-black/90 text-white rounded-full transition-colors border border-white/10"
              aria-label="Close player"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${activeEmbed}?autoplay=1`}
              title="YouTube masterclass video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}
    </section>
  );
}
