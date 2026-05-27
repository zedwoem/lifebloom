"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { moderateCommentAction } from "@/lib/actions/communityActions";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import { MessageSquare, CheckCircle2, Trash2, ArrowLeft, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { HydrationGuard } from "@/components/ui/hydration-guard";

export default function AdminCommentsPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || "en";
  const supabase = createClient();

  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAdminAndLoadPendingComments() {
      const { data: adminCheck } = await supabase.rpc("is_admin");
      const isUserAdmin = adminCheck === true;

      if (!isUserAdmin) {
        setIsAdmin(false);
        toast.error("Akses Ditolak. Anda bukan Administrator.");
        router.push(`/${locale}/dashboard`);
        return;
      }

      setIsAdmin(true);
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          author_name,
          article_id,
          articles (
            title
          )
        `)
        .eq("is_approved", false)
        .order("created_at", { ascending: false });

      if (data) setComments(data);
      setLoading(false);
    }
    
    if (profile !== undefined) {
      checkAdminAndLoadPendingComments();
    }
  }, [profile, router, supabase, locale]);

  const handleModerate = async (commentId: string, status: "approve" | "delete") => {
    toast.loading(`Sedang memproses...`);
    const res = await moderateCommentAction({ commentId, status });
    toast.dismiss();
    
    if (res.success) {
      toast.success(status === "approve" ? "Komentar berhasil disetujui!" : "Komentar berhasil dihapus!");
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } else {
      toast.error(res.error || "Gagal memproses moderasi komentar");
    }
  };

  if (isAdmin === null || loading) {
    return <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006948]"></div></div>;
  }

  if (isAdmin === false) {
    return null;
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
                MODERASI KOMENTAR
              </h1>
              <p className="text-slate-500 mt-1 text-lg">Penyaringan Diskusi Komunitas LifeBloom Hub</p>
            </div>
          </div>
        </header>

        <main className="max-w-[1120px] mx-auto space-y-6">
          {comments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center">
              <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-700">Antrean Bersih</h3>
              <p className="text-slate-500 mt-2">Tidak ada komentar baru yang menunggu moderasi.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700">
                        <User className="w-4 h-4 text-slate-400" /> {comment.author_name || "Guest"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" /> {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-brand-green font-bold">
                        Di: &ldquo;{comment.articles?.title || "Artikel Tanpa Judul"}&rdquo;
                      </span>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-slate-800 text-lg whitespace-pre-wrap font-medium">
                      {comment.content}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 items-start md:items-center self-start md:self-center">
                    <button 
                      onClick={() => handleModerate(comment.id, "delete")}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl font-bold transition-all hover:bg-rose-100 min-h-[52px] w-full sm:w-auto"
                    >
                      <Trash2 className="w-5 h-5" /> Hapus
                    </button>
                    <button 
                      onClick={() => handleModerate(comment.id, "approve")}
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
