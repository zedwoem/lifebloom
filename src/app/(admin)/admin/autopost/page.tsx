// src/app/[locale]/(admin)/admin/autopost/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Activity, 
  RefreshCw, 
  ExternalLink,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { HydrationGuard } from "@/components/ui/hydration-guard";

interface AutopostLog {
  id: string;
  content_type: string;
  content_id: string;
  platform: string;
  status: 'success' | 'failed' | 'skipped';
  hook_text: string | null;
  post_url: string | null;
  error_message: string | null;
  created_at: string;
}

export default function AdminAutopostPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || "en";
  const supabase = createClient();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<AutopostLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load Database Values on Mount
  useEffect(() => {
    async function checkAdminAndLoadLogs() {
      const { data: adminCheck } = await supabase.rpc("is_admin");
      const isUserAdmin = adminCheck === true;

      if (!isUserAdmin) {
        setIsAdmin(false);
        toast.error("Access denied. Administrator role required.");
        router.push(`/${locale}/dashboard`);
        return;
      }

      setIsAdmin(true);
      await loadLogs();
    }

    if (profile !== undefined) {
      checkAdminAndLoadLogs();
    }
  }, [profile, router, locale]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('autopost_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs((data || []) as any[]);
    } catch (err: any) {
      console.error('Failed to load autopost logs:', err.message);
      toast.error('Gagal memuat log autopost.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
    toast.success('Log berhasil diperbarui.');
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006948]"></div>
      </div>
    );
  }

  if (isAdmin === false) {
    return null;
  }

  // Aggregate stats
  const totalPosts = logs.length;
  const successPosts = logs.filter(l => l.status === 'success').length;
  const failedPosts = logs.filter(l => l.status === 'failed').length;
  const successRate = totalPosts > 0 ? Math.round((successPosts / (successPosts + failedPosts || 1)) * 100) : 100;

  return (
    <HydrationGuard fallbackHeight="h-screen">
      <div className="bg-[#FFFDF5] text-slate-900 min-h-screen p-6 md:p-12 font-sans selection:bg-[#85f8c4] selection:text-[#002114]">
        
        {/* Header */}
        <header className="max-w-[1120px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200 mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/admin`}>
              <button className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                <ArrowLeft className="w-6 h-6 text-slate-500" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 Atkinson-font">
                AI SOCIAL AUTOPOST CENTER
              </h1>
              <p className="text-slate-500 mt-1 text-lg">Pantau & moderasi sistem autoposting media sosial otonom terintegrasi LLM</p>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:border-[#006948]/30 hover:bg-[#f5fff7] rounded-xl text-base font-bold transition-all min-h-[52px] shadow-sm text-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-[#006948] ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Logs
          </button>
        </header>

        <main className="max-w-[1120px] mx-auto space-y-8">
          
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shrink-0">
                <CheckCircle className="w-6 h-6 text-[#006948]" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Sukses Terkirim</span>
                <strong className="text-2xl font-black Atkinson-font">{successPosts} Postingan</strong>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100 shrink-0">
                <XCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Gagal Posting</span>
                <strong className="text-2xl font-black Atkinson-font">{failedPosts} Error</strong>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Di-skip (Off Flag)</span>
                <strong className="text-2xl font-black Atkinson-font">
                  {logs.filter(l => l.status === 'skipped').length} Skipped
                </strong>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-lg flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shrink-0">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Success Rate</span>
                <strong className="text-2xl font-black Atkinson-font text-emerald-400">{successRate}%</strong>
              </div>
            </div>

          </div>

          {/* Active Integrations Grid */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-2xl font-bold Atkinson-font flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#006948]" /> Platform Integrasi Aktif
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex flex-col justify-between min-h-[120px]">
                <div>
                  <strong className="text-slate-800 font-bold block text-sm sm:text-base">Telegram</strong>
                  <span className="text-xs text-slate-400">Direct Message Alert</span>
                </div>
                <span className="self-start px-2 py-0.5 bg-emerald-50 text-[#006948] text-[10px] font-bold rounded-full border border-emerald-100">
                  CONNECTED
                </span>
              </div>

              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex flex-col justify-between min-h-[120px]">
                <div>
                  <strong className="text-slate-800 font-bold block text-sm sm:text-base">Pinterest</strong>
                  <span className="text-xs text-slate-400">Visual Growth Loop</span>
                </div>
                <span className={`self-start px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                  process.env.NEXT_PUBLIC_FEATURE_PINTEREST_AUTO_PIN === 'true'
                    ? 'bg-emerald-50 text-[#006948] border-emerald-100'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  {process.env.NEXT_PUBLIC_FEATURE_PINTEREST_AUTO_PIN === 'true' ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>

              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex flex-col justify-between min-h-[120px]">
                <div>
                  <strong className="text-slate-800 font-bold block text-sm sm:text-base">Threads</strong>
                  <span className="text-xs text-slate-400">Conversational Threads</span>
                </div>
                <span className={`self-start px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                  process.env.NEXT_PUBLIC_FEATURE_THREADS_AUTO_POST === 'true'
                    ? 'bg-emerald-50 text-[#006948] border-emerald-100'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  {process.env.NEXT_PUBLIC_FEATURE_THREADS_AUTO_POST === 'true' ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>

              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex flex-col justify-between min-h-[120px]">
                <div>
                  <strong className="text-slate-800 font-bold block text-sm sm:text-base">Bluesky</strong>
                  <span className="text-xs text-slate-400">AT Protocol Skeets</span>
                </div>
                <span className="self-start px-2 py-0.5 bg-emerald-50 text-[#006948] text-[10px] font-bold rounded-full border border-emerald-100">
                  CONNECTED
                </span>
              </div>

              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex flex-col justify-between min-h-[120px]">
                <div>
                  <strong className="text-slate-800 font-bold block text-sm sm:text-base">Mastodon</strong>
                  <span className="text-xs text-slate-400">Fediverse Toot</span>
                </div>
                <span className="self-start px-2 py-0.5 bg-emerald-50 text-[#006948] text-[10px] font-bold rounded-full border border-emerald-100">
                  CONNECTED
                </span>
              </div>

              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex flex-col justify-between min-h-[120px]">
                <div>
                  <strong className="text-slate-800 font-bold block text-sm sm:text-base">Reddit</strong>
                  <span className="text-xs text-slate-400">Organic Discussion Hook</span>
                </div>
                <span className={`self-start px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                  process.env.NEXT_PUBLIC_FEATURE_REDDIT_AUTO_POST === 'true'
                    ? 'bg-emerald-50 text-[#006948] border-emerald-100'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  {process.env.NEXT_PUBLIC_FEATURE_REDDIT_AUTO_POST === 'true' ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>

              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex flex-col justify-between min-h-[120px]">
                <div>
                  <strong className="text-slate-800 font-bold block text-sm sm:text-base">Discord</strong>
                  <span className="text-xs text-slate-400">Community Webhook</span>
                </div>
                <span className={`self-start px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                  process.env.NEXT_PUBLIC_FEATURE_DISCORD_AUTO_POST === 'true'
                    ? 'bg-emerald-50 text-[#006948] border-emerald-100'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  {process.env.NEXT_PUBLIC_FEATURE_DISCORD_AUTO_POST === 'true' ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>

              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex flex-col justify-between min-h-[120px]">
                <div>
                  <strong className="text-slate-800 font-bold block text-sm sm:text-base">WordPress</strong>
                  <span className="text-xs text-slate-400">Web 2.0 Syndication</span>
                </div>
                <span className={`self-start px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                  process.env.NEXT_PUBLIC_FEATURE_WORDPRESS_AUTO_POST === 'true'
                    ? 'bg-emerald-50 text-[#006948] border-emerald-100'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  {process.env.NEXT_PUBLIC_FEATURE_WORDPRESS_AUTO_POST === 'true' ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>

            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-2xl font-bold Atkinson-font flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#006948]" /> Riwayat Log Ingest & Autopost
            </h3>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#006948] mx-auto mb-4"></div>
                  <p className="text-slate-400 font-medium">Memuat riwayat log...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-sans border border-dashed border-slate-200 rounded-2xl">
                  🎉 Belum ada data log autopost di dalam database.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 pr-4">Tanggal & Waktu</th>
                      <th className="pb-3 pr-4">Platform</th>
                      <th className="pb-3 pr-4">Hook AI</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-100 text-sm hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pr-4 text-slate-500 font-medium whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-4 pr-4 whitespace-nowrap">
                          <span className="font-bold text-slate-800 uppercase tracking-wide bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            {log.platform}
                          </span>
                        </td>
                        <td className="py-4 pr-4 max-w-sm truncate text-slate-600 font-medium">
                          {log.hook_text || <span className="text-slate-300 italic">No hook generated</span>}
                        </td>
                        <td className="py-4 pr-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full border ${
                            log.status === 'success'
                              ? 'bg-emerald-50 text-[#006948] border-emerald-100'
                              : log.status === 'failed'
                              ? 'bg-rose-50 text-rose-700 border-rose-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {log.status === 'success' && <CheckCircle className="w-3.5 h-3.5" />}
                            {log.status === 'failed' && <XCircle className="w-3.5 h-3.5" />}
                            {log.status === 'skipped' && <AlertTriangle className="w-3.5 h-3.5" />}
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4">
                          {log.status === 'success' && log.post_url ? (
                            <a 
                              href={log.post_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#006948] hover:text-[#005439] hover:underline flex items-center gap-1 font-bold text-xs"
                            >
                              View Post <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : log.status === 'failed' && log.error_message ? (
                            <span className="text-rose-500 text-xs font-medium max-w-[150px] block truncate" title={log.error_message}>
                              {log.error_message}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs font-bold italic">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </main>
      </div>
    </HydrationGuard>
  );
}
