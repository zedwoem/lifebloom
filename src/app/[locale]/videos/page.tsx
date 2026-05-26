"use client";

import React, { useState, useEffect } from 'react';
import { PlayCircle, Tv, Heart } from 'lucide-react';
import dynamic from 'next/dynamic';
import { getAllVideos, VideoItem } from '@/lib/services/videoService';

const VideoPlayer = dynamic(() => import('@/components/features/video-player'), {
  loading: () => (
    <div className="w-full aspect-video bg-slate-900 rounded-xl flex items-center justify-center animate-pulse">
      <PlayCircle className="w-12 h-12 text-slate-700" />
    </div>
  ),
  ssr: false
});

export default function VideoHubPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const data = await getAllVideos();
      setVideos(data);
      if (data.length > 0) {
        setActiveVideo(data[0]);
      }
    };
    fetchVideos();
  }, []);

  if (!activeVideo) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Tv className="w-12 h-12 text-brand-green/50 mb-4" />
          <p className="text-brand-blue font-bold">Loading Masterclasses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-600">
            <Tv className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-brand-blue font-display tracking-tight">Educational Video Hub</h1>
            <p className="text-slate-600 font-medium mt-2 text-lg">
              Curated masterclasses with interactive, adjustable transcripts for your comfort.
            </p>
          </div>
        </div>

        {/* Featured Video Player */}
        <div className="mb-12">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="mb-6">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-widest rounded-lg mb-3 inline-block">
                Now Playing • {activeVideo.category}
              </span>
              <h2 className="text-3xl font-bold text-brand-blue mb-2">{activeVideo.title}</h2>
              <p className="text-slate-600 leading-relaxed">{activeVideo.description}</p>
            </div>
            
            <VideoPlayer 
              key={activeVideo.id} // Force remount on video change
              videoId={activeVideo.id}
              platform="youtube"
              transcripts={activeVideo.transcripts}
            />
          </div>
        </div>

        {/* Up Next / Playlist */}
        <div>
          <h3 className="text-2xl font-bold text-brand-blue mb-6 flex items-center gap-2">
            <PlayCircle className="w-6 h-6 text-brand-green" />
            More Masterclasses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.filter(v => v.id !== activeVideo.id).map(video => (
              <div 
                key={video.id}
                onClick={() => setActiveVideo(video)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer group hover:shadow-lg transition-all hover:border-brand-green/30"
              >
                {/* Thumbnail Placeholder - using a gradient since we don't have actual thumbnails */}
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative flex items-center justify-center">
                  <PlayCircle className="w-12 h-12 text-white/50 group-hover:text-brand-green group-hover:scale-110 transition-all" />
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs font-bold rounded">
                    5:00
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-xs font-black text-brand-green uppercase tracking-wider block mb-2">
                    {video.category}
                  </span>
                  <h4 className="font-bold text-brand-blue text-lg mb-2 line-clamp-2 group-hover:text-brand-green-dark transition-colors">
                    {video.title}
                  </h4>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {video.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
