"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { reviewArticleAction } from "@/lib/actions/publishActions";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import { FileEdit, CheckCircle2, XCircle, ArrowLeft, Eye } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { HydrationGuard } from "@/components/ui/hydration-guard";

export default function AdminArticlesPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || "en";
  const supabase = createClient();

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPendingArticles() {
      if (profile?.role !== "admin") {
        router.push(`/${locale}/dashboard`);
        return;
      }
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "pending_review")
        .order("created_at", { ascending: false });

      if (data) setArticles(data);
      setLoading(false);
    }
    if (profile) loadPendingArticles();
  }, [profile, router, supabase, locale]);

  const handleReview = async (articleId: string, status: "approved" | "rejected") => {
    toast.loading(`Sedang memproses...`);
    const res = await reviewArticleAction({ articleId, status });
    toast.dismiss();
    
    if (res.success) {
      toast.success(`Artikel berhasil ${status === "approved" ? "disetujui" : "ditolak"}!`);
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
    } else {
      toast.error(res.error || "Gagal memproses artikel");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006948]"></div></div>;
  }

  return (
    <HydrationGuard fallbackHeight="h-screen">
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
                REVIEW ARTIKEL
              </h1>
              <p className="text-slate-500 mt-1 text-lg">Antrean Persetujuan Konten Ahli & Partner</p>
            </div>
          </div>
        </header>

        <main className="max-w-[1120px] mx-auto space-y-6">
          {articles.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center">
              <FileEdit className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-700">Antrean Kosong</h3>
              <p className="text-slate-500 mt-2">Semua artikel telah di-review. Kerja bagus!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article.id} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">{article.pillar}</span>
                      <span className="text-sm font-semibold text-slate-400">Oleh: {article.author} ({article.author_type})</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{article.title}</h3>
                    <p className="text-slate-600 line-clamp-2">{article.description || "Tidak ada deskripsi."}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 items-start md:items-center">
                    <button 
                      onClick={() => toast.info("Fitur Preview belum diimplementasi (Demo)")}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold transition-all hover:bg-slate-50 min-h-[52px] w-full sm:w-auto"
                    >
                      <Eye className="w-5 h-5" /> Baca
                    </button>
                    <button 
                      onClick={() => handleReview(article.id, "rejected")}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl font-bold transition-all hover:bg-rose-100 min-h-[52px] w-full sm:w-auto"
                    >
                      <XCircle className="w-5 h-5" /> Tolak
                    </button>
                    <button 
                      onClick={() => handleReview(article.id, "approved")}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-[#006948] border border-[#004d35] text-white rounded-xl font-bold transition-all hover:bg-[#00855d] min-h-[52px] w-full sm:w-auto"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Setujui
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </HydrationGuard>
  );
}
