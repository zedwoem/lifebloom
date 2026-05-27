"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  Shield, 
  MessageSquare, 
  FileEdit, 
  Activity, 
  Users, 
  LogOut, 
  Globe,
  Settings,
  Terminal,
  Database,
  Sliders,
  Send
} from "lucide-react";
import { toast } from "sonner";
import { HydrationGuard } from "@/components/ui/hydration-guard";

export default function AdminPage() {
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";
  const supabase = createClient();

  const [pendingComments, setPendingComments] = useState(0);
  const [pendingArticles, setPendingArticles] = useState(0);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAdminAndLoadData() {
      // 1. Strict public.is_admin() Check
      const { data: adminCheck, error: adminErr } = await supabase.rpc("is_admin");
      
      // Strict server-side RPC verification is the sole source of truth
      const isUserAdmin = adminCheck === true;
      
      if (!isUserAdmin) {
        setIsAdmin(false);
        toast.error("Access denied. Administrator role required.");
        router.push(`/dashboard`);
        return;
      }
      
      setIsAdmin(true);

      // 2. Load Task Bubble Metrics
      // Get pending comments
      const { count: commentsCount } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", false);
        
      if (commentsCount !== null) setPendingComments(commentsCount);

      // Get pending articles
      const { count: articlesCount } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending_review");
        
      if (articlesCount !== null) setPendingArticles(articlesCount);
    }

    if (profile !== undefined) {
      checkAdminAndLoadData();
    }
  }, [profile, router, supabase]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006948]"></div>
      </div>
    );
  }

  if (isAdmin === false) {
    return null; // Will redirect
  }

  return (
    <HydrationGuard fallbackHeight="h-screen">
      <div className="bg-[#FFFDF5] text-slate-900 min-h-screen p-6 md:p-12 font-sans selection:bg-[#85f8c4] selection:text-[#002114]">
        
        {/* Header Command Center */}
        <header className="max-w-[1120px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center">
              <Shield className="w-8 h-8 text-[#006948]" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                LIFEBLOOM COMMAND CENTER
              </h1>
              <p className="text-slate-500 mt-1 text-lg">
                Super Admin Operations & Moderation Desk
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:border-[#006948]/30 hover:bg-[#f5fff7] rounded-xl text-base font-bold transition-all min-h-[52px] shadow-sm text-slate-700"
            >
              <Globe className="w-5 h-5 text-indigo-500" /> Bahasa
            </button>
            <button 
              onClick={() => signOut()}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:border-rose-500/30 hover:bg-rose-50 hover:text-rose-700 rounded-xl text-base font-bold transition-all min-h-[52px] shadow-sm text-slate-700"
            >
              <LogOut className="w-5 h-5 text-rose-500" /> Keluar
            </button>
          </div>
        </header>

        <main className="max-w-[1120px] mx-auto space-y-8">
          
          {/* Task Bubble */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700 text-lg">Antrean Moderasi:</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-2 rounded-xl border border-rose-100 font-bold min-h-[52px]">
                <span>🚨</span>
                {pendingComments} Komentar Baru
              </div>
              <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl border border-amber-100 font-bold min-h-[52px]">
                <span>📝</span>
                {pendingArticles} Draf Artikel Ahli
              </div>
            </div>
          </div>

          <div className="mb-4 mt-10">
            <h2 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
              BENTO MANAGEMENT SYSTEM
            </h2>
            <p className="text-slate-500 text-lg">Pilih modul untuk mengelola platform Lifebloom Hub.</p>
          </div>

          {/* Bento Grid (Expanded to 8 Tiles!) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Box 1: Moderasi Komentar */}
            <div className="group bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between min-h-[260px]">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <MessageSquare className="w-32 h-32 text-[#006948]" />
              </div>
              <div>
                <div className="w-12 h-12 bg-[#eef0ff] rounded-2xl flex items-center justify-center mb-6 border border-[#dae2fd]">
                  <MessageSquare className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>MODERASI KOMENTAR</h3>
                <p className="text-slate-500 text-lg mb-8 max-w-[85%]">Tinjau, setujui, atau hapus komentar dari member komunitas sebelum tayang.</p>
              </div>
              <Link href={`/admin/comments`}>
                <button className="self-start px-6 py-3 bg-[#006948] hover:bg-[#00855d] text-white rounded-xl font-bold min-h-[52px] transition-all flex items-center gap-2 focus:ring-4 focus:ring-[#68dba9]/30 outline-none">
                  Moderator Panel: {pendingComments} Antrean
                </button>
              </Link>
            </div>

            {/* Box 2: Review Konten */}
            <div className="group bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between min-h-[260px]">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <FileEdit className="w-32 h-32 text-[#006948]" />
              </div>
              <div>
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 border border-amber-100">
                  <FileEdit className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>REVIEW ARTIKEL</h3>
                <p className="text-slate-500 text-lg mb-8 max-w-[85%]">Edit dan publikasikan draft artikel yang diajukan oleh Pakar dan Partner.</p>
              </div>
              <Link href={`/admin/articles`}>
                <button className="self-start px-6 py-3 bg-[#006948] hover:bg-[#00855d] text-white rounded-xl font-bold min-h-[52px] transition-all flex items-center gap-2 focus:ring-4 focus:ring-[#68dba9]/30 outline-none">
                  Reviewer Panel: {pendingArticles} Antrean
                </button>
              </Link>
            </div>

            {/* Box 3: CMS Video Engine */}
            <div className="group bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-sm hover:shadow-lg transition-all relative overflow-hidden flex flex-col justify-between min-h-[260px]">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity className="w-32 h-32 text-white" />
              </div>
              <div>
                <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/20">
                  <Activity className="w-6 h-6 text-rose-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>CMS VIDEO & YOUTUBE</h3>
                <p className="text-slate-400 text-lg mb-8 max-w-[85%]">Ingesti otomatis metadata dari YouTube V3 API ke dalam Supabase.</p>
              </div>
              <Link href={`/admin/videos`}>
                <button className="self-start px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold min-h-[52px] transition-all flex items-center gap-2 outline-none shadow-sm">
                  Buka Modul Ingesti
                </button>
              </Link>
            </div>

            {/* Box 4: Global Settings */}
            <div className="group bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between min-h-[260px]">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Settings className="w-32 h-32 text-[#006948]" />
              </div>
              <div>
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                  <Settings className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>PENGATURAN GLOBAL</h3>
                <p className="text-slate-500 text-lg mb-8 max-w-[85%]">Atur variabel website, *maintenance mode*, dan perbarui halaman statis Support.</p>
              </div>
              <Link href={`/admin/settings`}>
                <button className="self-start px-6 py-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold min-h-[52px] transition-all flex items-center gap-2 focus:ring-4 focus:ring-[#68dba9]/30 outline-none shadow-sm">
                  Kelola Konfigurasi Website
                </button>
              </Link>
            </div>

            {/* Box 5: User & CRM */}
            <div className="group bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between min-h-[260px]">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users className="w-32 h-32 text-[#006948]" />
              </div>
              <div>
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>USER & CRM</h3>
                <p className="text-slate-500 text-lg mb-8 max-w-[85%]">Kelola peran akses pengguna umum, pakar medis terverifikasi, partner sponsor, dan admin.</p>
              </div>
              <Link href={`/admin/users`}>
                <button className="self-start px-6 py-3 bg-[#006948] hover:bg-[#00855d] text-white rounded-xl font-bold min-h-[52px] transition-all flex items-center gap-2 focus:ring-4 focus:ring-[#68dba9]/30 outline-none">
                  Kelola Pengguna
                </button>
              </Link>
            </div>

            {/* Box 6: Cron Monitor */}
            <div className="group bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between min-h-[260px]">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Terminal className="w-32 h-32 text-[#006948]" />
              </div>
              <div>
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 border border-amber-100">
                  <Terminal className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>CRON MONITOR</h3>
                <p className="text-slate-500 text-lg mb-8 max-w-[85%]">Pantau log pipeline penyerapan data otomatis harian dan trigger manual ingestion.</p>
              </div>
              <Link href={`/admin/cron`}>
                <button className="self-start px-6 py-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold min-h-[52px] transition-all flex items-center gap-2 focus:ring-4 focus:ring-[#68dba9]/30 outline-none shadow-sm">
                  Lihat Pipeline Log
                </button>
              </Link>
            </div>

            {/* Box 7: RSS Sources */}
            <div className="group bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between min-h-[260px]">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Database className="w-32 h-32 text-[#006948]" />
              </div>
              <div>
                <div className="w-12 h-12 bg-[#eef0ff] rounded-2xl flex items-center justify-center mb-6 border border-[#dae2fd]">
                  <Database className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>RSS & VIDEO SOURCES</h3>
                <p className="text-slate-500 text-lg mb-8 max-w-[85%]">Atur sumber ingestion feed RSS dan channel ID YouTube yang terhubung dengan 5 pilar.</p>
              </div>
              <Link href={`/admin/sources`}>
                <button className="self-start px-6 py-3 bg-[#006948] hover:bg-[#00855d] text-white rounded-xl font-bold min-h-[52px] transition-all flex items-center gap-2 focus:ring-4 focus:ring-[#68dba9]/30 outline-none">
                  Sumber Ingestion
                </button>
              </Link>
            </div>

            {/* Box 8: Feature Flags */}
            <div className="group bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-sm hover:shadow-lg transition-all relative overflow-hidden flex flex-col justify-between min-h-[260px]">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sliders className="w-32 h-32 text-white" />
              </div>
              <div>
                <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/20">
                  <Sliders className="w-6 h-6 text-rose-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>FEATURE FLAGS</h3>
                <p className="text-slate-400 text-lg mb-8 max-w-[85%]">Kontrol on/off modul opsional telemetri BigQuery, FRED feed, dan USDA recipe matcher.</p>
              </div>
              <Link href={`/dashboard`}>
                <button className="self-start px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold min-h-[52px] transition-all flex items-center gap-2 outline-none shadow-sm">
                  Aktifkan / Matikan Fitur
                </button>
              </Link>
            </div>

            {/* Box 9: AI Autopost Center */}
            <div className="group bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between min-h-[260px]">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Send className="w-32 h-32 text-[#006948]" />
              </div>
              <div>
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                  <Send className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>AI AUTOPOST CENTER</h3>
                <p className="text-slate-500 text-lg mb-8 max-w-[85%]">Pantau log autoposting media sosial & Web 2.0 (Telegram, Reddit, Threads, Discord, WordPress) secara real-time.</p>
              </div>
              <Link href={`/admin/autopost`}>
                <button className="self-start px-6 py-3 bg-[#006948] hover:bg-[#00855d] text-white rounded-xl font-bold min-h-[52px] transition-all flex items-center gap-2 focus:ring-4 focus:ring-[#68dba9]/30 outline-none">
                  Buka Autopost Center
                </button>
              </Link>
            </div>

          </div>

        </main>
      </div>
    </HydrationGuard>
  );
}
