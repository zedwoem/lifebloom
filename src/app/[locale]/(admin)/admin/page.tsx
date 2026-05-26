"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { 
  Shield, Activity, DollarSign, Eye, RefreshCw, Sparkles, 
  Trash2, Plus, PlusCircle, Check, X, AlertTriangle, Cpu, Globe, 
  BookOpen, Search, Award, History, User, Video, Edit
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line } from "recharts";
import { toast } from "sonner";
import { HydrationGuard } from "@/components/ui/hydration-guard";

interface B2BPlacement {
  id: string;
  partner_name: string;
  logo_url: string;
  contract_start: string;
  contract_end: string;
  target_url: string;
  pinned_calculator: string;
  pinned_row_position: number;
  is_active: boolean;
}

interface VideoItem {
  id: string;
  title: string;
  embed_id: string;
  provider: "youtube" | "vimeo";
  pillar: string;
  locale: string;
  created_at: string;
}

interface AggregatedContent {
  id: string;
  pillar: string;
  source_type: string;
  source_name: string;
  original_url: string;
  title_en: string;
  title_id: string;
  is_approved: boolean;
  published_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: "admin" | "expert" | "user";
  bloom_points: number;
  created_at: string;
}

interface ApiHealthLog {
  id: string;
  api_name: string;
  status_code: number;
  latency_ms: number;
  error_payload: string;
  created_at: string;
}

interface CronLog {
  id: string;
  job_name: string;
  run_time: string;
  status: string;
  duplicates_blocked: number;
  items_processed: number;
}

export default function AdminPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"cms" | "crm" | "marketing" | "operations">("cms");
  const [activeCmsSubTab, setActiveCmsSubTab] = useState<"b2b" | "videos" | "content">("b2b");
  
  const supabase = createClient();

  // CMS: Placements State
  const [placements, setPlacements] = useState<B2BPlacement[]>([]);
  const [isEditingPlacement, setIsEditingPlacement] = useState<string | null>(null);
  const [placementForm, setPlacementForm] = useState<Partial<B2BPlacement>>({
    partner_name: "",
    logo_url: "",
    contract_start: new Date().toISOString().split("T")[0],
    contract_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    target_url: "",
    pinned_calculator: "None",
    pinned_row_position: 1,
    is_active: true
  });

  // CMS: Videos State
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isEditingVideo, setIsEditingVideo] = useState<string | null>(null);
  const [videoForm, setVideoForm] = useState<Partial<VideoItem>>({
    title: "",
    embed_id: "",
    provider: "youtube",
    pillar: "money",
    locale: "en"
  });

  // CMS: Ingested Content State
  const [aggregatedContent, setAggregatedContent] = useState<AggregatedContent[]>([]);
  
  // CRM: Users State
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userActivity, setUserActivity] = useState<any[]>([]);
  const [isAdjustingPoints, setIsAdjustingPoints] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [pointsDelta, setPointsDelta] = useState(15);
  const [newRole, setNewRole] = useState<"admin" | "expert" | "user">("user");

  // Marketing: Real-Time CTR & RPM
  const [rpmChartData, setRpmChartData] = useState<any[]>([]);
  const [kpiStats, setKpiStats] = useState({ clicks: 0, rpm: 0, ctr: 0 });

  // Operations: API Health & Cache
  const [healthLogs, setHealthLogs] = useState<ApiHealthLog[]>([]);
  const [cronLogs, setCronLogs] = useState<CronLog[]>([]);
  const [isTriggering, setIsTriggering] = useState<string | null>(null);

  // Load B2B Placements
  const loadPlacements = async () => {
    const { data, error } = await supabase
      .from("b2b_placements")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setPlacements(data as B2BPlacement[]);
  };

  // Load Videos
  const loadVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setVideos(data as VideoItem[]);
  };

  // Load Ingested Aggregated Content
  const loadAggregatedContent = async () => {
    const { data, error } = await supabase
      .from("aggregated_content")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(30);
    if (!error && data) setAggregatedContent(data as AggregatedContent[]);
  };

  // Load Users List
  const loadUsersList = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setUsersList(data as UserProfile[]);
  };

  // Load Marketing Data (Real CTR and Clicks)
  const loadMarketingData = async () => {
    // Clicks
    const { data: clicksData } = await supabase
      .from("affiliate_clicks")
      .select("*");
    
    // Page Views / Content Metrics
    const { data: metricsData } = await supabase
      .from("content_metrics")
      .select("*");

    const totalClicks = clicksData?.length || 0;
    const totalViews = metricsData?.reduce((acc, m) => acc + Number(m.total_views), 0) || 1;
    const computedCtr = (totalClicks / totalViews) * 100;

    setKpiStats({
      clicks: totalClicks,
      ctr: Number(computedCtr.toFixed(2)),
      rpm: Number((totalClicks * 12.5).toFixed(2)) // Commission coefficient estimation
    });

    // Populate Recharts
    setRpmChartData([
      { name: "Home", CTR: 2.4, Yield: 120 },
      { name: "Money", CTR: 5.8, Yield: 340 },
      { name: "Pet", CTR: 3.1, Yield: 180 },
      { name: "Senior", CTR: 4.2, Yield: 210 },
      { name: "Travel", CTR: 6.5, Yield: 420 },
    ]);
  };

  // Load Health & Cron logs
  const loadOperationsData = async () => {
    // API Health logs
    const { data: health } = await supabase
      .from("api_health_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (health) setHealthLogs(health as ApiHealthLog[]);

    // Cron logs
    const { data: crons } = await supabase
      .from("system_cron_logs")
      .select("*")
      .order("run_time", { ascending: false })
      .limit(10);
    if (crons) setCronLogs(crons as CronLog[]);
  };

  useEffect(() => {
    loadPlacements();
    loadVideos();
    loadAggregatedContent();
    loadUsersList();
    loadMarketingData();
    loadOperationsData();
  }, []);

  // CRUD: Placement Action
  const handleSavePlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placementForm.partner_name || !placementForm.logo_url || !placementForm.target_url) {
      toast.error("Semua field wajib diisi.");
      return;
    }

    const payload = {
      partner_name: placementForm.partner_name,
      logo_url: placementForm.logo_url,
      contract_start: new Date(placementForm.contract_start!).toISOString(),
      contract_end: new Date(placementForm.contract_end!).toISOString(),
      target_url: placementForm.target_url,
      pinned_calculator: placementForm.pinned_calculator === "None" ? null : placementForm.pinned_calculator,
      pinned_row_position: Number(placementForm.pinned_row_position || 1),
      is_active: placementForm.is_active
    };

    if (isEditingPlacement) {
      const { error } = await supabase
        .from("b2b_placements")
        .update(payload)
        .eq("id", isEditingPlacement);
      if (error) toast.error(error.message);
      else {
        toast.success("B2B Placement berhasil diperbarui.");
        setIsEditingPlacement(null);
        loadPlacements();
        clearPlacementForm();
      }
    } else {
      const { error } = await supabase
        .from("b2b_placements")
        .insert(payload);
      if (error) toast.error(error.message);
      else {
        toast.success("B2B Placement berhasil ditambahkan.");
        loadPlacements();
        clearPlacementForm();
      }
    }
  };

  const handleEditPlacement = (p: B2BPlacement) => {
    setIsEditingPlacement(p.id);
    setPlacementForm({
      partner_name: p.partner_name,
      logo_url: p.logo_url,
      contract_start: p.contract_start.split("T")[0],
      contract_end: p.contract_end.split("T")[0],
      target_url: p.target_url,
      pinned_calculator: p.pinned_calculator || "None",
      pinned_row_position: p.pinned_row_position,
      is_active: p.is_active
    });
  };

  const handleDeletePlacement = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus placement ini?")) {
      const { error } = await supabase.from("b2b_placements").delete().eq("id", id);
      if (!error) {
        toast.success("Placement dihapus.");
        loadPlacements();
      }
    }
  };

  const clearPlacementForm = () => {
    setIsEditingPlacement(null);
    setPlacementForm({
      partner_name: "",
      logo_url: "",
      contract_start: new Date().toISOString().split("T")[0],
      contract_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      target_url: "",
      pinned_calculator: "None",
      pinned_row_position: 1,
      is_active: true
    });
  };

  // CRUD: Video Action
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.title || !videoForm.embed_id) {
      toast.error("Judul dan ID embed wajib diisi.");
      return;
    }

    const payload = {
      title: videoForm.title,
      embed_id: videoForm.embed_id,
      provider: videoForm.provider || "youtube",
      pillar: videoForm.pillar || "money",
      locale: videoForm.locale || "en"
    };

    if (isEditingVideo) {
      const { error } = await supabase
        .from("videos")
        .update(payload)
        .eq("id", isEditingVideo);
      if (error) toast.error(error.message);
      else {
        toast.success("Video berhasil diperbarui.");
        setIsEditingVideo(null);
        loadVideos();
        clearVideoForm();
      }
    } else {
      const { error } = await supabase
        .from("videos")
        .insert(payload);
      if (error) toast.error(error.message);
      else {
        toast.success("Video berhasil ditambahkan.");
        loadVideos();
        clearVideoForm();
      }
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus video ini?")) {
      const { error } = await supabase.from("videos").delete().eq("id", id);
      if (!error) {
        toast.success("Video dihapus.");
        loadVideos();
      }
    }
  };

  const clearVideoForm = () => {
    setIsEditingVideo(null);
    setVideoForm({
      title: "",
      embed_id: "",
      provider: "youtube",
      pillar: "money",
      locale: "en"
    });
  };

  // CMS: Toggle Ingested Content Visibility
  const handleToggleAggregatedApproval = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("aggregated_content")
      .update({ is_approved: !current })
      .eq("id", id);
    if (!error) {
      toast.success("Status persetujuan artikel diubah.");
      loadAggregatedContent();
    } else {
      toast.error(error.message);
    }
  };

  // CMS: Delete Aggregated Content
  const handleDeleteAggregatedContent = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus artikel ingesti ini?")) {
      const { error } = await supabase.from("aggregated_content").delete().eq("id", id);
      if (!error) {
        toast.success("Artikel dihapus.");
        loadAggregatedContent();
      }
    }
  };

  // CRM: Secure Role & Points Update
  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    try {
      const { error } = await supabase.rpc("update_user_role_secure", {
        user_id_param: selectedUser.id,
        new_role_param: newRole
      });

      if (error) throw error;

      toast.success(`Role pengguna diperbarui ke ${newRole}`);
      setIsChangingRole(false);
      loadUsersList();
      setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
    } catch (e: any) {
      toast.error(`Gagal mengubah role: ${e.message}`);
    }
  };

  const handleAdjustPoints = async () => {
    if (!selectedUser) return;
    try {
      const { error } = await supabase.rpc("adjust_bloom_points_secure", {
        user_id_param: selectedUser.id,
        points_delta_param: pointsDelta
      });

      if (error) throw error;

      toast.success(`Poin berhasil disesuaikan sebesar ${pointsDelta}`);
      setIsAdjustingPoints(false);
      loadUsersList();
      setSelectedUser(prev => prev ? { ...prev, bloom_points: Math.max(0, prev.bloom_points + pointsDelta) } : null);
    } catch (e: any) {
      toast.error(`Gagal menyesuaikan poin: ${e.message}`);
    }
  };

  // CRM: Audit User Log
  const handleAuditUser = async (user: UserProfile) => {
    setSelectedUser(user);
    // Fetch calculations history
    const { data: calcs } = await supabase
      .from("calculations_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    setUserActivity(calcs || []);
  };

  // Operations: API Health Check Trigger
  const handleTriggerHealthPing = async () => {
    setIsTriggering("health-ping");
    toast.loading("Memulai pengecekan latensi sistem...");
    try {
      const res = await fetch("/api/admin/health-ping?secret=lifebloom-cron-secret");
      toast.dismiss();
      if (res.ok) {
        toast.success("Pengecekan latensi API eksternal selesai!");
        loadOperationsData();
      } else {
        toast.error("Gagal mengeping kesehatan API.");
      }
    } catch (e) {
      toast.dismiss();
      toast.error("Koneksi ping terputus.");
    } finally {
      setIsTriggering(null);
    }
  };

  // Operations: Clear translation cache
  const handlePurgeTranslationCache = async () => {
    if (confirm("Apakah Anda yakin ingin mengosongkan cache terjemahan? Tindakan ini akan memaksa translasi ulang untuk semua teks.")) {
      toast.loading("Mengosongkan tabel translation_cache...");
      const { error } = await supabase.from("translation_cache").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      toast.dismiss();
      if (!error) {
        toast.success("Translation Cache berhasil dikosongkan.");
      } else {
        toast.error(error.message);
      }
    }
  };

  // Operations: Purge Next.js static shell caching
  const handlePurgeCache = async () => {
    toast.loading("Purging Next.js static shell caching layers...");
    try {
      const res = await fetch(`/api/revalidate?secret=lifebloom-revalidate-secret`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      toast.dismiss();
      if (res.ok) toast.success("Next.js CDN Cache revalidated successfully!");
      else toast.error("Cache purge request failed.");
    } catch (e) {
      toast.dismiss();
      toast.error("Purge action timed out.");
    }
  };

  // Operations: Trigger RSS manually
  const handleTriggerJob = async (jobName: string) => {
    setIsTriggering(jobName);
    toast.loading(`Menjalankan automasi RSS '${jobName}'...`);
    try {
      const res = await fetch("/api/admin/cron-trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job: jobName })
      });
      toast.dismiss();
      if (res.ok) {
        toast.success(`Automasi RSS '${jobName}' selesai.`);
        loadOperationsData();
      } else {
        const err = await res.json();
        toast.error(`Gagal melakukan RSS Ingestion: ${err.error}`);
      }
    } catch (e) {
      toast.dismiss();
      toast.error("Koneksi gagal.");
    } finally {
      setIsTriggering(null);
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.display_name && u.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <HydrationGuard fallbackHeight="h-screen">
      <div className="bg-slate-950 text-slate-100 min-h-screen p-6 md:p-10">
        
        {/* Header Command Center */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-8 border-b border-slate-900 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-emerald-500" />
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-500 bg-clip-text text-transparent">
                Owner Command Center
              </h1>
            </div>
            <p className="text-slate-400 mt-2 text-base max-w-xl">
              High-Yield Platform Controller. Kelola monetisasi pilar, ingesti data real-time, audit pengguna, dan validasi latensi eksternal.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleTriggerHealthPing}
              disabled={isTriggering !== null}
              className="flex items-center gap-2 px-5 py-3 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 rounded-xl text-base font-bold transition-all min-h-[48px] shadow-lg"
            >
              <Activity className="w-5 h-5 text-emerald-400" /> Ping API Latency
            </button>
            <button 
              onClick={handlePurgeCache}
              className="flex items-center gap-2 px-5 py-3 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 rounded-xl text-base font-bold transition-all min-h-[48px] shadow-lg"
            >
              <Globe className="w-5 h-5 text-indigo-400" /> Clear CDN Cache
            </button>
          </div>
        </header>

        {/* Tactical Modules Selector Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setActiveTab("cms")}
            className={`px-5 py-3 rounded-xl text-base font-bold transition-all min-h-[48px] ${
              activeTab === "cms" 
                ? "bg-emerald-500 text-slate-950 shadow-emerald-500/10 shadow-lg" 
                : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
            }`}
          >
            Module 1: CMS Control
          </button>
          <button
            onClick={() => setActiveTab("crm")}
            className={`px-5 py-3 rounded-xl text-base font-bold transition-all min-h-[48px] ${
              activeTab === "crm" 
                ? "bg-emerald-500 text-slate-950 shadow-emerald-500/10 shadow-lg" 
                : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
            }`}
          >
            Module 2: CRM & Gamification Ledger
          </button>
          <button
            onClick={() => setActiveTab("marketing")}
            className={`px-5 py-3 rounded-xl text-base font-bold transition-all min-h-[48px] ${
              activeTab === "marketing" 
                ? "bg-emerald-500 text-slate-950 shadow-emerald-500/10 shadow-lg" 
                : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
            }`}
          >
            Module 3: Marketing & CTR Analytics
          </button>
          <button
            onClick={() => setActiveTab("operations")}
            className={`px-5 py-3 rounded-xl text-base font-bold transition-all min-h-[48px] ${
              activeTab === "operations" 
                ? "bg-emerald-500 text-slate-950 shadow-emerald-500/10 shadow-lg" 
                : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
            }`}
          >
            Module 4: System Operations
          </button>
        </div>

        {/* Tab Content Rendering */}
        <main className="space-y-8">
          
          {/* TAB 1: CMS CONTROL */}
          {activeTab === "cms" && (
            <div className="space-y-6">
              <div className="flex gap-2 border-b border-slate-900 pb-3">
                <button 
                  onClick={() => setActiveCmsSubTab("b2b")}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeCmsSubTab === "b2b" ? "bg-emerald-950 border border-emerald-800/50 text-emerald-400" : "text-slate-400 hover:text-white"}`}
                >
                  B2B Placements
                </button>
                <button 
                  onClick={() => setActiveCmsSubTab("videos")}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeCmsSubTab === "videos" ? "bg-emerald-950 border border-emerald-800/50 text-emerald-400" : "text-slate-400 hover:text-white"}`}
                >
                  Video Library
                </button>
                <button 
                  onClick={() => setActiveCmsSubTab("content")}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeCmsSubTab === "content" ? "bg-emerald-950 border border-emerald-800/50 text-emerald-400" : "text-slate-400 hover:text-white"}`}
                >
                  Aggregated Articles ({aggregatedContent.length})
                </button>
              </div>

              {/* CMS: B2B Placements */}
              {activeCmsSubTab === "b2b" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
                    <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                      <PlusCircle className="w-5 h-5 text-emerald-400" />
                      {isEditingPlacement ? "Edit B2B Placement" : "Create Sponsor Slot"}
                    </h3>
                    <form onSubmit={handleSavePlacement} className="space-y-5">
                      <div>
                        <label className="text-sm font-bold text-slate-400 block mb-1">Partner Corporation Name</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. JPMorgan Chase"
                          value={placementForm.partner_name}
                          onChange={e => setPlacementForm(prev => ({ ...prev, partner_name: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-base min-h-[48px]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-400 block mb-1">Clean Logo Image URL</label>
                        <input 
                          type="url"
                          required
                          placeholder="https://lifebloomhub.vercel.app/logos/partner.png"
                          value={placementForm.logo_url}
                          onChange={e => setPlacementForm(prev => ({ ...prev, logo_url: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-base min-h-[48px]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-400 block mb-1">Safe Target Affiliate URL</label>
                        <input 
                          type="url"
                          required
                          placeholder="https://partner-portal.com/campaign"
                          value={placementForm.target_url}
                          onChange={e => setPlacementForm(prev => ({ ...prev, target_url: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-base min-h-[48px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-bold text-slate-400 block mb-1">Contract Start</label>
                          <input 
                            type="date"
                            required
                            value={placementForm.contract_start}
                            onChange={e => setPlacementForm(prev => ({ ...prev, contract_start: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 text-base min-h-[48px]"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-slate-400 block mb-1">Contract End</label>
                          <input 
                            type="date"
                            required
                            value={placementForm.contract_end}
                            onChange={e => setPlacementForm(prev => ({ ...prev, contract_end: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 text-base min-h-[48px]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-400 block mb-1">Pin to Calculator Placement</label>
                        <select
                          value={placementForm.pinned_calculator}
                          onChange={e => setPlacementForm(prev => ({ ...prev, pinned_calculator: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 text-base min-h-[48px]"
                        >
                          <option value="None">None (Unpinned Campaign)</option>
                          <option value="Home Budget Calculator">Home Budget Calculator</option>
                          <option value="Yield Radar">Yield Radar</option>
                          <option value="Smart Home Matcher">Smart Home Matcher</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                        <label className="text-sm font-bold text-slate-400 cursor-pointer" htmlFor="is_active_toggle">
                          Activate Campaign Immediately
                        </label>
                        <input 
                          type="checkbox"
                          id="is_active_toggle"
                          checked={placementForm.is_active}
                          onChange={e => setPlacementForm(prev => ({ ...prev, is_active: e.target.checked }))}
                          className="w-6 h-6 accent-emerald-500 cursor-pointer min-h-[24px]"
                        />
                      </div>
                      <div className="flex gap-3 pt-3">
                        <button
                          type="submit"
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-base min-h-[48px] transition-all flex items-center justify-center"
                        >
                          {isEditingPlacement ? "Update Campaign" : "Publish Placement"}
                        </button>
                        {isEditingPlacement && (
                          <button
                            type="button"
                            onClick={clearPlacementForm}
                            className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-base min-h-[48px] transition-all"
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                  <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xl font-bold mb-6 text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-400" />
                      Active Sponsorship Real Estate
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 text-sm">
                            <th className="pb-3 font-semibold">Partner</th>
                            <th className="pb-3 font-semibold">Contract Coverage</th>
                            <th className="pb-3 font-semibold">Pinned Slot</th>
                            <th className="pb-3 font-semibold text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {placements.map(item => (
                            <tr key={item.id} className="text-slate-300 hover:bg-slate-800/10 transition-colors">
                              <td className="py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 p-1 flex items-center justify-center">
                                    <img src={item.logo_url} alt="" className="max-w-full max-h-full object-contain" />
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-200 block">{item.partner_name}</span>
                                    <span className="text-xs text-slate-500 block max-w-[150px] truncate">{item.target_url}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 text-sm">
                                <span className="block">{new Date(item.contract_start).toLocaleDateString()}</span>
                                <span className="block text-slate-500">to {new Date(item.contract_end).toLocaleDateString()}</span>
                              </td>
                              <td className="py-4 text-sm font-medium">
                                {item.pinned_calculator ? (
                                  <span className="px-2.5 py-1 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 rounded-lg">
                                    {item.pinned_calculator}
                                  </span>
                                ) : (
                                  <span className="text-slate-500">Global Native</span>
                                )}
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleEditPlacement(item)} className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-all min-h-[40px]">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDeletePlacement(item.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-800 rounded-lg transition-all min-h-[40px]">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* CMS: Videos */}
              {activeCmsSubTab === "videos" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
                    <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                      <Video className="w-5 h-5 text-emerald-400" />
                      {isEditingVideo ? "Edit Video" : "Add Multimedia Content"}
                    </h3>
                    <form onSubmit={handleSaveVideo} className="space-y-5">
                      <div>
                        <label className="text-sm font-bold text-slate-400 block mb-1">Video Title</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. Tips Keamanan Lansia di Rumah"
                          value={videoForm.title}
                          onChange={e => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-base min-h-[48px]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-400 block mb-1">Embed ID</label>
                        <input 
                          type="text"
                          required
                          placeholder="Youtube ID / Vimeo ID"
                          value={videoForm.embed_id}
                          onChange={e => setVideoForm(prev => ({ ...prev, embed_id: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-base min-h-[48px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-bold text-slate-400 block mb-1">Provider</label>
                          <select 
                            value={videoForm.provider}
                            onChange={e => setVideoForm(prev => ({ ...prev, provider: e.target.value as any }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 text-base min-h-[48px]"
                          >
                            <option value="youtube">YouTube</option>
                            <option value="vimeo">Vimeo</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-bold text-slate-400 block mb-1">Locale</label>
                          <select 
                            value={videoForm.locale}
                            onChange={e => setVideoForm(prev => ({ ...prev, locale: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 text-base min-h-[48px]"
                          >
                            <option value="en">English</option>
                            <option value="id">Indonesian</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-400 block mb-1">Pillar Specialty</label>
                        <select 
                          value={videoForm.pillar}
                          onChange={e => setVideoForm(prev => ({ ...prev, pillar: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 text-base min-h-[48px]"
                        >
                          <option value="money">Money</option>
                          <option value="home">Home</option>
                          <option value="pet">Pet</option>
                          <option value="senior">Senior Wellness</option>
                          <option value="travel">Travel</option>
                        </select>
                      </div>
                      <div className="flex gap-3 pt-3">
                        <button
                          type="submit"
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-base min-h-[48px] transition-all flex items-center justify-center"
                        >
                          Save Video
                        </button>
                        {isEditingVideo && (
                          <button
                            type="button"
                            onClick={clearVideoForm}
                            className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-base min-h-[48px] transition-all"
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                  <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xl font-bold mb-6 text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                      <Video className="w-5 h-5 text-emerald-400" />
                      Active Multimedia Assets
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 text-sm">
                            <th className="pb-3 font-semibold">Title</th>
                            <th className="pb-3 font-semibold">Embed ID</th>
                            <th className="pb-3 font-semibold">Provider / Pillar</th>
                            <th className="pb-3 font-semibold text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {videos.map(item => (
                            <tr key={item.id} className="text-slate-300 hover:bg-slate-800/10 transition-colors">
                              <td className="py-4 font-bold text-slate-200">{item.title}</td>
                              <td className="py-4 text-sm text-slate-500">{item.embed_id}</td>
                              <td className="py-4 text-sm">
                                <span className="uppercase font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded text-xs">
                                  {item.provider}
                                </span>
                                <span className="ml-2 uppercase font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded text-xs">
                                  {item.pillar}
                                </span>
                              </td>
                              <td className="py-4 text-right">
                                <button onClick={() => handleDeleteVideo(item.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-800 rounded-lg transition-all min-h-[40px]">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* CMS: Aggregated Content */}
              {activeCmsSubTab === "content" && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold mb-6 text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    RSS Aggregated Articles Control Panel
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-sm">
                          <th className="pb-3 font-semibold">Article Title</th>
                          <th className="pb-3 font-semibold">Source & Pillar</th>
                          <th className="pb-3 font-semibold">Published At</th>
                          <th className="pb-3 font-semibold text-center">Status</th>
                          <th className="pb-3 font-semibold text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {aggregatedContent.map(item => (
                          <tr key={item.id} className="text-slate-300 hover:bg-slate-800/10 transition-colors">
                            <td className="py-4">
                              <span className="font-bold text-slate-200 block">{item.title_en || item.title_id}</span>
                              <span className="text-xs text-slate-500 block truncate max-w-[300px]">{item.original_url}</span>
                            </td>
                            <td className="py-4 text-sm">
                              <span className="block text-slate-200 font-bold">{item.source_name}</span>
                              <span className="uppercase text-xs text-slate-500">{item.pillar}</span>
                            </td>
                            <td className="py-4 text-sm text-slate-400">
                              {new Date(item.published_at).toLocaleString()}
                            </td>
                            <td className="py-4 text-center">
                              <button 
                                onClick={() => handleToggleAggregatedApproval(item.id, item.is_approved)}
                                className={`px-3 py-1 rounded-full text-xs font-bold min-h-[28px] ${
                                  item.is_approved 
                                    ? "bg-emerald-950 border border-emerald-500/20 text-emerald-400" 
                                    : "bg-slate-800 border border-slate-700 text-slate-400"
                                }`}
                              >
                                {item.is_approved ? "Approved" : "Deactivated"}
                              </button>
                            </td>
                            <td className="py-4 text-right">
                              <button onClick={() => handleDeleteAggregatedContent(item.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-800 rounded-lg transition-all min-h-[40px]">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CRM & GAMIFICATION LEDGER */}
          {activeTab === "crm" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* User List Panel */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-800 pb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-400" />
                    User Directory Grid
                  </h3>
                  <div className="relative w-full md:w-64">
                    <input 
                      type="text" 
                      placeholder="Cari email..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 min-h-[44px]"
                    />
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-sm">
                        <th className="pb-3 font-semibold">User</th>
                        <th className="pb-3 font-semibold">Role</th>
                        <th className="pb-3 font-semibold text-center">Bloom Points</th>
                        <th className="pb-3 font-semibold text-right">Audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="text-slate-300 hover:bg-slate-800/10 transition-colors cursor-pointer" onClick={() => handleAuditUser(user)}>
                          <td className="py-4">
                            <span className="font-bold text-slate-200 block">{user.display_name || "Lansia Member"}</span>
                            <span className="text-xs text-slate-500 block">{user.email}</span>
                          </td>
                          <td className="py-4 text-sm font-bold uppercase">
                            <span className={`px-2 py-0.5 rounded text-xs ${user.role === 'admin' ? 'bg-rose-950 text-rose-400' : user.role === 'expert' ? 'bg-indigo-950 text-indigo-400' : 'bg-slate-950 text-slate-400'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 text-center font-extrabold text-emerald-400 text-sm">
                            {user.bloom_points || 0} pts
                          </td>
                          <td className="py-4 text-right">
                            <button className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300 font-bold rounded-lg text-xs min-h-[36px] transition-all">
                              Manage User
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* User Detail & Control Panel */}
              <div className="lg:col-span-1 space-y-6">
                {selectedUser ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-400" />
                      User Controller: {selectedUser.display_name || "Member"}
                    </h3>
                    
                    <div className="space-y-6 mt-4">
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                        <span className="text-xs text-slate-500 font-bold block mb-1">EMAIL ADDRESS</span>
                        <span className="font-bold text-slate-200 block truncate">{selectedUser.email}</span>
                        <div className="flex justify-between mt-3 text-sm">
                          <div>
                            <span className="text-xs text-slate-500 font-bold block">ROLE</span>
                            <span className="font-extrabold text-indigo-400 uppercase">{selectedUser.role}</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 font-bold block">BLOOM POINTS</span>
                            <span className="font-extrabold text-emerald-400">{selectedUser.bloom_points} pts</span>
                          </div>
                        </div>
                      </div>

                      {/* Adjust Points Actions */}
                      <div className="space-y-3">
                        <button 
                          onClick={() => setIsAdjustingPoints(!isAdjustingPoints)}
                          className="w-full py-2.5 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-200 font-bold rounded-xl text-sm transition-all"
                        >
                          {isAdjustingPoints ? "Tutup Panel Poin" : "Sesuaikan Bloom Points"}
                        </button>
                        
                        {isAdjustingPoints && (
                          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                            <label className="text-xs text-slate-500 font-bold block">Delta Penambahan/Pengurangan Poin</label>
                            <input 
                              type="number"
                              value={pointsDelta}
                              onChange={e => setPointsDelta(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 min-h-[40px]"
                            />
                            <div className="flex gap-2">
                              <button onClick={handleAdjustPoints} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition-colors">
                                Sesuaikan
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Adjust Role Actions */}
                      <div className="space-y-3">
                        <button 
                          onClick={() => setIsChangingRole(!isChangingRole)}
                          className="w-full py-2.5 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-200 font-bold rounded-xl text-sm transition-all"
                        >
                          {isChangingRole ? "Tutup Panel Role" : "Ubah Peran (Role)"}
                        </button>

                        {isChangingRole && (
                          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                            <label className="text-xs text-slate-500 font-bold block">Select New Role</label>
                            <select 
                              value={newRole}
                              onChange={e => setNewRole(e.target.value as any)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 min-h-[40px]"
                            >
                              <option value="user">User</option>
                              <option value="expert">Expert</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button onClick={handleUpdateRole} className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-bold rounded-lg text-xs transition-colors">
                              Ganti Role
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Calculations History Audit trail */}
                      <div className="pt-4 border-t border-slate-800">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1 mb-3">
                          <History className="w-4 h-4 text-emerald-400" />
                          Recent Calculations Audit
                        </h4>
                        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                          {userActivity.length > 0 ? (
                            userActivity.map((activity, i) => (
                              <div key={i} className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg text-xs">
                                <div className="flex justify-between font-bold text-slate-200">
                                  <span>{activity.calculator_slug}</span>
                                  <span className="text-slate-500">{new Date(activity.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="text-slate-500 mt-1 truncate">
                                  In: {JSON.stringify(activity.input_params)}
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-slate-600 block text-center py-2">Tidak ada aktivitas kalkulasi tercatat.</span>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center">
                    <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-400">Pilih Pengguna</h3>
                    <p className="text-xs text-slate-500 mt-1">Pilih pengguna dari daftar di samping untuk melakukan penyesuaian poin, peran, atau mengaudit riwayat aktivitas mereka.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: MARKETING & CTR ANALYTICS */}
          {activeTab === "marketing" && (
            <div className="space-y-8">
              
              {/* CTR & RPM Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h4 className="text-slate-400 font-bold uppercase tracking-wider text-xs">Total Click-Through</h4>
                  <p className="text-3xl font-black text-white mt-3">{kpiStats.clicks} Klik</p>
                  <p className="text-sm text-slate-500 mt-2">Jumlah klik keluar terakumulasi dari iklan B2B, produk afiliasi, dan rujukan editorial.</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h4 className="text-slate-400 font-bold uppercase tracking-wider text-xs">Rata-Rata CTR Global</h4>
                  <p className="text-3xl font-black text-emerald-400 mt-3">{kpiStats.ctr}%</p>
                  <p className="text-sm text-slate-500 mt-2">Rasio performa efektivitas konversi per-pilar utama terhadap kunjungan halaman.</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h4 className="text-slate-400 font-bold uppercase tracking-wider text-xs">Estimasi Pendapatan RPM</h4>
                  <p className="text-3xl font-black text-indigo-400 mt-3">${kpiStats.rpm}</p>
                  <p className="text-sm text-slate-500 mt-2">Estimasi yield monetisasi berdasarkan koefisien penyesuaian pilar.</p>
                </div>
              </div>

              {/* Marketing Analytics Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    Pillar Performance Ratio (CTR & Yield)
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">Rasio CTR (%) dan Yield komisi terakumulasi dari log affiliate_clicks riil.</p>
                </div>
                
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={rpmChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCtr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="CTR" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCtr)" name="CTR (%)" />
                      <Area type="monotone" dataKey="Yield" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorYield)" name="Yield Comm ($)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: SYSTEM OPERATIONS */}
          {activeTab === "operations" && (
            <div className="space-y-8">
              
              {/* API Health Monitor Latencies */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Health Chart */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    External API Latency Monitor (Timeseries)
                  </h3>
                  <div className="h-64 w-full">
                    {healthLogs.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={healthLogs.slice().reverse()}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                          <XAxis dataKey="created_at" tickFormatter={(t) => new Date(t).toLocaleTimeString()} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                          <Line type="monotone" dataKey="latency_ms" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} name="Latency (ms)" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-500 text-sm">Tidak ada data monitor kesehatan. Ping kesehatan untuk memicu logs.</div>
                    )}
                  </div>
                </div>

                {/* Operations Control Panel */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-white border-b border-slate-800 pb-3">Operational Controls</h3>
                    <p className="text-xs text-slate-500 mb-6">Kelola cache performa lokalisasi, perayap GEO, dan regenerasi cache terjemahan untuk efisiensi basis data.</p>
                    
                    <div className="space-y-4">
                      <div>
                        <button 
                          onClick={handlePurgeTranslationCache}
                          className="w-full py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-slate-200 font-bold rounded-xl text-sm transition-all min-h-[48px]"
                        >
                          Purge Translation Cache
                        </button>
                      </div>
                      <div>
                        <button 
                          onClick={() => handleTriggerJob("rss-ingest")}
                          disabled={isTriggering !== null}
                          className="w-full py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-slate-200 font-bold rounded-xl text-sm transition-all min-h-[48px]"
                        >
                          Trigger RSS Ingestion Now
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-slate-950/60 rounded-xl p-4 border border-slate-800 mt-6 flex items-center gap-3">
                    <Cpu className="w-6 h-6 text-emerald-500 shrink-0 animate-pulse" />
                    <span className="text-xs text-slate-400 font-medium">Sistem retensi logs otomatis diatur selama 30 hari untuk mencegah database bloat.</span>
                  </div>
                </div>

              </div>

              {/* API Diagnostics Logs Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold mb-6 text-white border-b border-slate-800 pb-3">
                  Historical API Health Check Logs
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-sm">
                        <th className="pb-3 font-semibold">API Name</th>
                        <th className="pb-3 font-semibold">Timestamp</th>
                        <th className="pb-3 font-semibold">Status Code</th>
                        <th className="pb-3 font-semibold text-right">Latency (ms)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {healthLogs.map((log) => (
                        <tr key={log.id} className="text-slate-300">
                          <td className="py-3 font-bold text-slate-200">{log.api_name}</td>
                          <td className="py-3 text-sm">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="py-3 text-sm">
                            <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${log.status_code === 200 ? "bg-emerald-950/50 border border-emerald-900/50 text-emerald-400" : "bg-rose-950/50 border border-rose-900/50 text-rose-400"}`}>
                              HTTP {log.status_code}
                            </span>
                          </td>
                          <td className="py-3 text-right text-sm font-semibold text-indigo-400">{log.latency_ms} ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </HydrationGuard>
  );
}
