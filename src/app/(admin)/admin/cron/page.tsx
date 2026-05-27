"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Terminal, Play, RotateCw, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { HydrationGuard } from "@/components/ui/hydration-guard";

export default function AdminCronPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || "en";
  const supabase = createClient();

  const [cronLogs, setCronLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    async function checkAdminAndLoadLogs() {
      const { data: adminCheck } = await supabase.rpc("is_admin");
      const isUserAdmin = adminCheck === true;

      if (!isUserAdmin) {
        setIsAdmin(false);
        toast.error("Akses Ditolak. Anda bukan Administrator.");
        router.push(`/dashboard`);
        return;
      }

      setIsAdmin(true);
      await loadLogs();
      setLoading(false);
    }

    if (profile !== undefined) {
      checkAdminAndLoadLogs();
    }
  }, [profile, router, supabase, locale]);

  const loadLogs = async () => {
    const { data, error } = await supabase
      .from("system_cron_logs")
      .select("*")
      .order("run_time", { ascending: false })
      .limit(50);
      
    if (data) setCronLogs(data);
  };

  const handleManualTrigger = async (jobName: string) => {
    setTriggering(true);
    toast.loading(`Memicu job ingestion ${jobName}...`);

    try {
      // Direct post trigger to admin/cron-trigger route
      const res = await fetch(`/api/admin/cron-trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job: jobName }),
      });

      const body = await res.json();
      toast.dismiss();

      if (res.ok && body.success) {
        toast.success(`Job ${jobName} berhasil dipicu & diproses!`);
        await loadLogs();
      } else {
        toast.error(body.error || "Gagal memproses job");
      }
    } catch (e: any) {
      toast.dismiss();
      toast.error(e.message || "Network Error");
    } finally {
      setTriggering(false);
    }
  };

  if (isAdmin === null || loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006948]"></div>
      </div>
    );
  }

  if (isAdmin === false) {
    return null;
  }

  return (
    <HydrationGuard fallbackHeight="h-screen">
      <div className="bg-[#FFFDF5] text-slate-900 min-h-screen p-6 md:p-12 font-sans selection:bg-[#85f8c4] selection:text-[#002114]">
        
        <header className="max-w-[1120px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200 mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/admin`}>
              <button className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                <ArrowLeft className="w-6 h-6 text-slate-500" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                CRON WORKFLOW MONITOR
              </h1>
              <p className="text-slate-500 mt-1 text-lg">Pantau, Analisis, dan Jalankan Manual Pipeline Ingesti Konten & Kurs FRED</p>
            </div>
          </div>
        </header>

        <main className="max-w-[1120px] mx-auto space-y-8">
          
          {/* Quick Manual Actions Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-2xl font-bold Atkinson-font flex items-center gap-2">
              <Play className="w-6 h-6 text-[#006948]" /> Trigger Manual Pipeline
            </h3>
            <p className="text-slate-500 text-base leading-relaxed">
              Jalankan manual pipeline tanpa menunggu jadwal otomatis cron harian.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                disabled={triggering}
                onClick={() => handleManualTrigger("rss-ingest")}
                className="px-6 py-4 bg-[#006948] hover:bg-[#00855d] text-white rounded-2xl font-bold transition-all min-h-[56px] flex items-center justify-center gap-2 focus:ring-4 focus:ring-[#68dba9]/30 disabled:opacity-50"
              >
                <RotateCw className={`w-5 h-5 ${triggering ? "animate-spin" : ""}`} /> Jalankan Ingesti RSS & Video
              </button>

              <button
                disabled={triggering}
                onClick={() => handleManualTrigger("price-sync")}
                className="px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all min-h-[56px] flex items-center justify-center gap-2 focus:ring-4 focus:ring-slate-800/30 disabled:opacity-50"
              >
                <RotateCw className={`w-5 h-5 ${triggering ? "animate-spin" : ""}`} /> Singkronkan Harga Affiliate & Kurs FRED
              </button>
            </div>
          </div>

          {/* Historical Logs List */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold Atkinson-font flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-500" /> Log Historis System Cron
              </h3>
              <button 
                onClick={loadLogs}
                className="p-2 text-slate-500 hover:text-[#006948] hover:bg-[#faf8ff] rounded-xl border border-slate-200 transition-colors"
                title="Segarkan Log"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-400 uppercase text-xs font-bold tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">Nama Job</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Item Diproses</th>
                    <th className="px-6 py-4">Waktu Eksekusi</th>
                    <th className="px-6 py-4">Keterangan Tambahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-base font-mono">
                  {cronLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#faf8ff]/50 transition-colors">
                      <td className="px-6 py-4">
                        <strong className="text-slate-800 font-sans">{log.job_name}</strong>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-sans ${
                          log.status === "success" 
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}>
                          {log.status === "success" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          )}
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-sans">
                        {log.items_processed || 0} items
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-sans">
                        {new Date(log.run_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-sans max-w-[300px] truncate" title={JSON.stringify(log.details)}>
                        {log.details ? JSON.stringify(log.details) : "-"}
                      </td>
                    </tr>
                  ))}
                  {cronLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 font-sans">
                        Log masih kosong. Jalankan manual pipeline di atas untuk mengisi log.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </HydrationGuard>
  );
}
