"use client";

import { useEffect, useState } from "react";
import { getAllVideos, VideoItem } from "@/lib/services/videoService";
import { HydrationGuard } from "@/components/ui/hydration-guard";
import { PlayCircle } from "lucide-react";

export function VideoFeed({ locale = "en", pillar }: { locale?: string; pillar?: string }) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVideos() {
      const data = await getAllVideos(3, locale, pillar);
      setVideos(data);
      setLoading(false);
    }
    loadVideos();
  }, [locale, pillar]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-800">Latest Video Content</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-slate-100 rounded-2xl h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  if (videos.length === 0) return null;

  return (
    <HydrationGuard fallbackHeight="min-h-[300px]">
      <div className="my-12">
        <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <PlayCircle className="w-6 h-6 text-emerald-500" />
          Featured Multimedia
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(video => (
            <div key={video.id} className="bg-[#FFFDF7] border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative pt-[56.25%] bg-slate-900">
                {video.provider === 'youtube' ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${video.embed_id}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full border-0"
                  />
                ) : (
                  <iframe
                    src={`https://player.vimeo.com/video/${video.embed_id}`}
                    title={video.title}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full border-0"
                  />
                )}
              </div>
              <div className="p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  {video.pillar}
                </span>
                <h4 className="font-bold text-slate-800 mt-2 line-clamp-2">{video.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </HydrationGuard>
  );
}
