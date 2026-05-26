"use client";

import { useState, useEffect } from "react";
import { ingestVideoAction, fetchYouTubeMetadata } from "@/lib/actions/videoActions";
import { useRouter, useParams } from "next/navigation";
import { Activity, ArrowLeft, Search, PlusCircle, Video } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { PILLARS } from "@/lib/constants/pillars";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

export default function AdminVideosPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || "en";
  const supabase = createClient();

  const [url, setUrl] = useState("");
  const [pillar, setPillar] = useState("home");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{ title: string; embedId: string; description: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      const { data: adminCheck } = await supabase.rpc("is_admin");
      const isUserAdmin = adminCheck === true;

      if (!isUserAdmin) {
        setIsAdmin(false);
        toast.error("Akses Ditolak. Anda bukan Administrator.");
        router.push(`/${locale}/dashboard`);
        return;
      }

      setIsAdmin(true);
    }

    if (profile !== undefined) {
      checkAdmin();
    }
  }, [profile, router, supabase, locale]);

  const handleFetchPreview = async () => {
    if (!url) return toast.error("Masukkan URL YouTube terlebih dahulu");
    setLoading(true);
    toast.loading("Menganalisis URL...");
    
    const res = await fetchYouTubeMetadata(url);
    toast.dismiss();
    
    if (res.success && res.data) {
      setPreview(res.data);
      toast.success("Metadata berhasil ditarik!");
    } else {
      toast.error(res.error || "Gagal menarik data dari YouTube API");
      setPreview(null);
    }
    setLoading(false);
  };

  const handleIngest = async () => {
    if (!preview) return;
    setLoading(true);
    toast.loading("Menyimpan ke Database...");

    const res = await ingestVideoAction({
      youtubeUrl: url,
      pillar,
      locale,
      titleOverride: preview.title
    });

    toast.dismiss();
    if (res.success) {
      toast.success("Video berhasil di-ingest ke Supabase!");
      setUrl("");
      setPreview(null);
    } else {
      toast.error(res.error || "Gagal menyimpan video");
    }
    setLoading(false);
  };

  if (isAdmin === null || loading && !preview) {
    return <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006948]"></div></div>;
  }

  if (isAdmin === false) {
    return null;
  }

  return (
    <div className="bg-[#FFFDF5] text-slate-900 min-h-screen p-6 md:p-12 font-sans selection:bg-[#85f8c4] selection:text-[#002114]">
      
      <header className="max-w-[1120px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200 mb-8">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/admin`}>
            <button className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
              <ArrowLeft className="w-6 h-6 text-slate-500" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
              CMS VIDEO ENGINE
            </h1>
            <p className="text-slate-500 mt-1 text-lg">Ingesti YouTube API V3 ke Supabase</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto space-y-8">
        
        {/* Step 1: Input URL */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold">1. Tarik Metadata YouTube</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..." 
              className="flex-1 min-h-[52px] px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948] outline-none"
            />
            <button 
              onClick={handleFetchPreview}
              disabled={loading}
              className="min-h-[52px] px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Search className="w-5 h-5" /> Analisis
            </button>
          </div>
        </div>

        {/* Step 2: Preview & Publish */}
        {preview && (
          <div className="bg-white rounded-3xl p-8 border border-[#006948]/30 shadow-md animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#f5fff7] rounded-xl flex items-center justify-center border border-[#006948]/20">
                <Video className="w-5 h-5 text-[#006948]" />
              </div>
              <h2 className="text-xl font-bold">2. Konfirmasi & Simpan</h2>
            </div>
            
            <div className="aspect-video bg-slate-100 rounded-2xl mb-6 overflow-hidden border border-slate-200">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${preview.embedId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Judul Video</label>
              <input 
                type="text" 
                value={preview.title}
                onChange={(e) => setPreview({...preview, title: e.target.value})}
                className="w-full min-h-[52px] px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948] outline-none font-bold"
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Pilar Penempatan</label>
              <select 
                value={pillar}
                onChange={(e) => setPillar(e.target.value)}
                className="w-full min-h-[52px] px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948] outline-none bg-white"
              >
                {Object.values(PILLARS).map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleIngest}
              disabled={loading}
              className="w-full min-h-[52px] bg-[#006948] hover:bg-[#00855d] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <PlusCircle className="w-5 h-5" /> Ingest ke Supabase
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
