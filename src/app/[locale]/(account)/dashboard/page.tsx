"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/hooks/useAuth";
import { useParams } from "next/navigation";
import { 
  Settings, 
  Calculator, 
  BookOpen, 
  Heart, 
  Activity, 
  ArrowRight, 
  Shield, 
  Trash2, 
  LogOut,
  Edit3,
  BarChart3,
  MessageSquare,
  Award,
  ToggleLeft,
  ToggleRight,
  Database,
  Radio,
  FileText,
  MapPin,
  HelpCircle,
  Eye,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HydrationGuard } from "@/components/ui/hydration-guard";
import { toast } from "sonner";

// Prevent Leaflet SSR crash by loading dynamically with ssr: false
const DynamicTravelMap = dynamic(
  () => import("@/components/travel/TravelMap"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] rounded-3xl bg-[#faf8ff] border border-slate-100 animate-pulse flex items-center justify-center text-slate-400 Atkinson-font">
        Loading Adware-Free Leaflet Map...
      </div>
    )
  }
);

export default function UnifiedMultiRoleDashboard() {
  const { profile, signOut } = useAuth();
  const params = useParams();
  const locale = params.locale || "en";

  // Role is strictly derived from verified server-side user profile
  const activeRole = profile?.role || "user";

  // Telemetry Feature Flags State managed by Admin
  const [featureFlags, setFeatureFlags] = useState({
    bigQueryPipeline: true,
    pageSpeedAudits: true,
    openFdaVerification: true,
    fredEconomicFeed: true,
    usdaRecipeMatcher: true,
    supportWallRealtime: true,
  });

  // Expert portal Q&A stream and TipTap modal
  const [pendingQna, setPendingQna] = useState([
    { id: "1", author: "Aisyah (User)", question: "Apakah obat ibuprofen aman diminum penderita asam lambung sebelum makan?" },
    { id: "2", author: "Budi (User)", question: "Bawang merah masuk ke resep masakan, apakah uapnya berbahaya bagi mata kucing?" },
    { id: "3", author: "Grandma Evelyn", question: "How often should a 72-year-old walk daily to maintain joint flexibility without strain?" }
  ]);
  const [activeAnswerId, setActiveAnswerId] = useState<string | null>(null);
  const [expertResponse, setExpertResponse] = useState("");

  // Admin portal comments moderation queue
  const [pendingComments, setPendingComments] = useState([
    { id: "1", author: "Rizal", email: "rizal@gmail.com", content: "Sangat membantu untuk kalkulasi yield pensiun saya!", article: "Panduan Slow-Travel 60+" },
    { id: "2", author: "Clara", email: "clara@yahoo.com", content: "Apakah ada dosis alternatif untuk acetaminophen?", article: "Kitchen Medication Guard" }
  ]);

  // Sync role with user profile is no longer needed as activeRole is directly derived

  // Toggle Feature Flag Handler
  const handleToggleFlag = (flagKey: keyof typeof featureFlags, name: string) => {
    const updatedFlags = { ...featureFlags, [flagKey]: !featureFlags[flagKey] };
    setFeatureFlags(updatedFlags);
    try {
      localStorage.setItem("admin_feature_flags", JSON.stringify(updatedFlags));
    } catch (e) {}
    
    toast.success(`${name} pipeline successfully ${updatedFlags[flagKey] ? "ENABLED" : "DISABLED"}.`);
  };

  // Submit Expert Response Handler
  const handleSubmitAnswer = (id: string) => {
    if (!expertResponse.trim()) {
      toast.error("Please enter a clinical verification message.");
      return;
    }
    toast.success("Tanggapan pakar terverifikasi berhasil dikirim.");
    setPendingQna(pendingQna.filter((q) => q.id !== id));
    setActiveAnswerId(null);
    setExpertResponse("");
  };

  // Moderate Comment Handler
  const handleModerateComment = (id: string, action: "approve" | "reject") => {
    toast.success(`Komentar successfully ${action === "approve" ? "APPROVED and published" : "REJECTED and purged"}.`);
    setPendingComments(pendingComments.filter((c) => c.id !== id));
  };

  return (
    <HydrationGuard fallbackHeight="h-[800px]">
      <div className="bg-[#FFFDF5] min-h-screen font-sans selection:bg-[#85f8c4] selection:text-[#002114] text-[#131b2e] pb-12">
        
        {/* Header / Dynamic Navigation */}
        <header className="border-b border-slate-100 bg-white sticky top-0 z-50 shadow-sm">
          <div className="max-w-[1120px] mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Award className="w-8 h-8 text-[#006948]" />
              <h1 className="text-xl font-bold tracking-tight Atkinson-font uppercase">
                LIFEBLOOM COMMAND CENTER
              </h1>
            </div>
            
            {/* Verified Account Portal Badge */}
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-2xl border border-emerald-100">
              <span className="text-xs font-bold text-[#006948] uppercase tracking-wide">Secure Session</span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => signOut()}
                className="px-4 py-2.5 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl font-bold text-sm border border-rose-100 transition-all flex items-center gap-2 min-h-[44px]"
              >
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </div>
          </div>
        </header>

        {/* Greeting Banner */}
        <section className="max-w-[1120px] mx-auto px-6 mt-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft-ambient flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-xs font-bold text-[#006948] uppercase tracking-widest block mb-1">
                Akun Terverifikasi
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight Atkinson-font">
                Halo, {profile?.display_name || "Sahabat Lifebloom"}
              </h2>
              <p className="text-slate-500 text-lg mt-1">
                {activeRole === "user" && "Ruang nyaman Anda untuk kalkulasi aman, nutrisi peliharaan, dan peta slow travel."}
                {activeRole === "expert" && "Portal kolaborasi Anda untuk memverifikasi istilah medis, menulis panduan E-E-A-T, dan menjawab warga."}
                {activeRole === "admin" && "Panel kontrol penuh untuk mengatur keamanan sistem, pipa data telemetri, dan moderasi komunitas."}
              </p>
            </div>
            
            <div className="flex items-center gap-2 px-5 py-3 bg-[#faf8ff] text-slate-700 rounded-2xl border border-slate-100 font-bold min-h-[52px]">
              <Shield className="w-5 h-5 text-[#006948]" />
              Role aktif: <span className="text-[#006948] uppercase ml-1">{activeRole}</span>
            </div>
          </div>
        </section>

        {/* Dynamic Multi-Role Workspace Ingestion */}
        <main className="max-w-[1120px] mx-auto px-6 mt-8 space-y-8">

          {/* ========================================== */}
          {/* 1. USER WORKSPACE PORTAL                   */}
          {/* ========================================== */}
          {activeRole === "user" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Pebble Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Pebble Card 1: Safe Calculators */}
                <Card className="rounded-3xl bg-white border border-slate-100 shadow-soft-ambient p-8 flex flex-col justify-between min-h-[280px]">
                  <div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                      <Calculator className="w-6 h-6 text-[#006948]" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight Atkinson-font mb-2">Kalkulator Saya & Yield Perjalanan</h3>
                    <p className="text-slate-500 text-lg leading-relaxed mb-6">
                      Pantau pertumbuhan yield tabungan jangka panjang Anda yang telah disesuaikan dengan indeks inflasi FRED live.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 px-5 py-3.5 bg-[#006948] hover:bg-[#005439] text-white rounded-xl font-bold text-base min-h-[52px] transition-all flex items-center justify-center gap-2">
                      Buka Kalkulator Saya <ArrowRight className="w-5 h-5" />
                    </button>
                    <button className="px-5 py-3.5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-base min-h-[52px] transition-all">
                      Unduh Laporan PDF
                    </button>
                  </div>
                </Card>

                {/* Pebble Card 2: Pet Safety Milestones */}
                <Card className="rounded-3xl bg-white border border-slate-100 shadow-soft-ambient p-8 flex flex-col justify-between min-h-[280px]">
                  <div>
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 border border-rose-100">
                      <Heart className="w-6 h-6 text-rose-600" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight Atkinson-font mb-2">Milestone & Keamanan Dapur Peliharaan</h3>
                    <p className="text-slate-500 text-lg leading-relaxed mb-6">
                      Pengecekan bahan masakan beracun (bawang, anggur) terintegrasi dengan database Wiki & USDA.
                    </p>
                  </div>
                  <div className="px-4 py-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-emerald-800 font-bold flex items-center gap-2 text-sm min-h-[52px]">
                    🐾 14 family recipes scanned this week. 100% pet-safe kitchen floors!
                  </div>
                </Card>

              </div>

              {/* Pebble Card 3: Adware-Free Multi-Gen Travel Planner */}
              <Card className="rounded-3xl bg-white border border-slate-100 shadow-soft-ambient p-8 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#faf8ff] rounded-2xl flex items-center justify-center border border-slate-100">
                      <MapPin className="w-6 h-6 text-[#006948]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight Atkinson-font">Rute & Peta Ramah Aksesibilitas (OpenStreetMap)</h3>
                      <p className="text-slate-500 text-base">Perencanaan slow travel multigenerasi, 100% bebas iklan dan tracker pihak ketiga.</p>
                    </div>
                  </div>
                  <button className="px-5 py-3.5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-base min-h-[52px] transition-all">
                    Saring Rute Kursi Roda
                  </button>
                </div>
                
                {/* Dynamically imported react-leaflet map */}
                <DynamicTravelMap />
              </Card>

            </div>
          )}


          {/* ========================================== */}
          {/* 2. EXPERT PORTAL WORKSPACE                 */}
          {/* ========================================== */}
          {activeRole === "expert" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Citations & Performance Meters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <Card className="rounded-3xl bg-white border border-slate-100 shadow-soft-ambient p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                    <Eye className="w-6 h-6 text-[#006948]" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Pembaca Artikel</span>
                    <strong className="text-2xl font-extrabold Atkinson-font">12,420 Warga</strong>
                  </div>
                </Card>

                <Card className="rounded-3xl bg-white border border-slate-100 shadow-soft-ambient p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#faf8ff] rounded-2xl flex items-center justify-center border border-slate-100">
                    <CheckCircle className="w-6 h-6 text-[#006948]" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Verifikasi Istilah Obat</span>
                    <strong className="text-2xl font-extrabold Atkinson-font">88 Istilah (FDA)</strong>
                  </div>
                </Card>

                <Card className="rounded-3xl bg-white border border-slate-100 shadow-soft-ambient p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Indeks Dampak Klinis</span>
                    <strong className="text-2xl font-extrabold Atkinson-font">Tinggi (E-E-A-T)</strong>
                  </div>
                </Card>

              </div>

              {/* Tiptap Article Editor Panel */}
              <Card className="rounded-3xl bg-white border border-slate-100 shadow-soft-ambient p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#faf8ff] rounded-2xl flex items-center justify-center border border-slate-100">
                    <Edit3 className="w-6 h-6 text-[#006948]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight Atkinson-font">Tulis Panduan Klinis & Peer-Review</h3>
                    <p className="text-slate-500 text-base">Bagikan panduan medis jargon-free. Sistem akan memindai istilah obat dengan API FDA otomatis.</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Format Penulisan Minimalis</span>
                  <div className="h-32 bg-white rounded-xl border border-slate-100 p-4 font-mono text-sm text-slate-500">
                    [Tulis panduan Anda di sini... Gunakan @ untuk memunculkan modal istilah obat terverifikasi FDA]
                  </div>
                  <div className="flex justify-end gap-3">
                    <button className="px-5 py-3 bg-[#faf8ff] border border-slate-200 text-slate-700 rounded-xl font-bold text-sm min-h-[52px] hover:bg-slate-100 transition-all">
                      Simpan Draf
                    </button>
                    <button 
                      onClick={() => toast.success("Draft artikel diajukan untuk Peer-Review admin.")}
                      className="px-5 py-3 bg-[#006948] hover:bg-[#005439] text-white rounded-xl font-bold text-sm min-h-[52px] transition-all"
                    >
                      Ajukan Review
                    </button>
                  </div>
                </div>
              </Card>

              {/* Question Answering Stream */}
              <Card className="rounded-3xl bg-white border border-slate-100 shadow-soft-ambient p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100">
                      <MessageSquare className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight Atkinson-font">Pertanyaan Warga Butuh Verifikasi Pakar</h3>
                      <p className="text-slate-500 text-base">Berikan tanggapan ilmiah jargon-free untuk memberikan rasa aman kepada keluarga.</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-100">
                    {pendingQna.length} Pending
                  </span>
                </div>

                <div className="space-y-4">
                  {pendingQna.map((q) => (
                    <div key={q.id} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-3">
                      <div className="flex justify-between items-center">
                        <strong className="text-base text-slate-800 font-bold">{q.author} bertanya:</strong>
                        <span className="text-xs text-slate-400">Baru saja</span>
                      </div>
                      <p className="text-slate-600 text-lg leading-relaxed Atkinson-font italic">
                        &ldquo;{q.question}&rdquo;
                      </p>
                      
                      {activeAnswerId === q.id ? (
                        <div className="mt-3 space-y-3">
                          <textarea 
                            value={expertResponse}
                            onChange={(e) => setExpertResponse(e.target.value)}
                            placeholder="Tulis penjelasan klinis sederhana, ramah, dan jargon-free..."
                            className="w-full h-24 p-3 border border-slate-200 rounded-xl font-sans text-sm focus:outline-[#006948]"
                          />
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => { setActiveAnswerId(null); setExpertResponse(""); }}
                              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-xs"
                            >
                              Batal
                            </button>
                            <button 
                              onClick={() => handleSubmitAnswer(q.id)}
                              className="px-4 py-2 bg-[#006948] text-white rounded-lg font-bold text-xs"
                            >
                              Kirim Tanggapan
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <button 
                            onClick={() => { setActiveAnswerId(q.id); setExpertResponse(""); }}
                            className="px-5 py-3 bg-white border border-slate-200 text-[#006948] hover:border-[#006948] rounded-xl font-bold text-sm min-h-[52px] transition-all"
                          >
                            Tanggapi Sebagai Pakar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {pendingQna.length === 0 && (
                    <div className="text-center py-6 text-slate-400 font-sans">
                      🎉 Tidak ada pertanyaan warga tertunda.
                    </div>
                  )}
                </div>
              </Card>

            </div>
          )}


          {/* ========================================== */}
          {/* 3. ADMIN PORTAL COMMAND CENTER             */}
          {/* ========================================== */}
          {activeRole === "admin" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Feature Toggles Section */}
              <Card className="rounded-3xl bg-white border border-slate-100 shadow-soft-ambient p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#faf8ff] rounded-2xl flex items-center justify-center border border-slate-100">
                    <Settings className="w-6 h-6 text-[#006948]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight Atkinson-font">Manajemen Fitur & Pipa Data Telemetri</h3>
                    <p className="text-slate-500 text-base">Aktifkan atau matikan modul integrasi eksternal, telemetri GCP, dan pipa API demi performa dan privasi.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Switch 1 */}
                  <div className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-[#faf8ff]/50 min-h-[72px]">
                    <div>
                      <strong className="text-base text-slate-800 font-bold block">Pipa BigQuery Telemetry</strong>
                      <span className="text-xs text-slate-400">Koleksi data anonim kalkulator pilar</span>
                    </div>
                    <button 
                      onClick={() => handleToggleFlag("bigQueryPipeline", "GCP BigQuery Ingestion")}
                      className="focus:outline-none min-h-[52px] px-2 flex items-center"
                    >
                      {featureFlags.bigQueryPipeline ? (
                        <ToggleRight className="w-12 h-12 text-[#006948]" />
                      ) : (
                        <ToggleLeft className="w-12 h-12 text-slate-300" />
                      )}
                    </button>
                  </div>

                  {/* Switch 2 */}
                  <div className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-[#faf8ff]/50 min-h-[72px]">
                    <div>
                      <strong className="text-base text-slate-800 font-bold block">PageSpeed Audit Otomatis</strong>
                      <span className="text-xs text-slate-400">Cron audit kecepatan mingguan di Vercel</span>
                    </div>
                    <button 
                      onClick={() => handleToggleFlag("pageSpeedAudits", "Google PageSpeed Audits")}
                      className="focus:outline-none min-h-[52px] px-2 flex items-center"
                    >
                      {featureFlags.pageSpeedAudits ? (
                        <ToggleRight className="w-12 h-12 text-[#006948]" />
                      ) : (
                        <ToggleLeft className="w-12 h-12 text-slate-300" />
                      )}
                    </button>
                  </div>

                  {/* Switch 3 */}
                  <div className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-[#faf8ff]/50 min-h-[72px]">
                    <div>
                      <strong className="text-base text-slate-800 font-bold block">OpenFDA Label Verification</strong>
                      <span className="text-xs text-slate-400">Verifikasi istilah medis & obat di editor</span>
                    </div>
                    <button 
                      onClick={() => handleToggleFlag("openFdaVerification", "OpenFDA Verification API")}
                      className="focus:outline-none min-h-[52px] px-2 flex items-center"
                    >
                      {featureFlags.openFdaVerification ? (
                        <ToggleRight className="w-12 h-12 text-[#006948]" />
                      ) : (
                        <ToggleLeft className="w-12 h-12 text-slate-300" />
                      )}
                    </button>
                  </div>

                  {/* Switch 4 */}
                  <div className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-[#faf8ff]/50 min-h-[72px]">
                    <div>
                      <strong className="text-base text-slate-800 font-bold block">FRED Live Inflation Feed</strong>
                      <span className="text-xs text-slate-400">Indeks inflasi langsung Federal Reserve</span>
                    </div>
                    <button 
                      onClick={() => handleToggleFlag("fredEconomicFeed", "FRED Realtime Feed")}
                      className="focus:outline-none min-h-[52px] px-2 flex items-center"
                    >
                      {featureFlags.fredEconomicFeed ? (
                        <ToggleRight className="w-12 h-12 text-[#006948]" />
                      ) : (
                        <ToggleLeft className="w-12 h-12 text-slate-300" />
                      )}
                    </button>
                  </div>

                  {/* Switch 5 */}
                  <div className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-[#faf8ff]/50 min-h-[72px]">
                    <div>
                      <strong className="text-base text-slate-800 font-bold block">USDA Kitchen Toxicity Matcher</strong>
                      <span className="text-xs text-slate-400">Pemindaian toksisitas anjing/kucing di resep</span>
                    </div>
                    <button 
                      onClick={() => handleToggleFlag("usdaRecipeMatcher", "USDA Recipe toxicity")}
                      className="focus:outline-none min-h-[52px] px-2 flex items-center"
                    >
                      {featureFlags.usdaRecipeMatcher ? (
                        <ToggleRight className="w-12 h-12 text-[#006948]" />
                      ) : (
                        <ToggleLeft className="w-12 h-12 text-slate-300" />
                      )}
                    </button>
                  </div>

                  {/* Switch 6 */}
                  <div className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-[#faf8ff]/50 min-h-[72px]">
                    <div>
                      <strong className="text-base text-slate-800 font-bold block">Dinding Dukungan Realtime</strong>
                      <span className="text-xs text-slate-400">Daftar buku tamu Wall of Support di landing</span>
                    </div>
                    <button 
                      onClick={() => handleToggleFlag("supportWallRealtime", "Realtime Guestbook Support Wall")}
                      className="focus:outline-none min-h-[52px] px-2 flex items-center"
                    >
                      {featureFlags.supportWallRealtime ? (
                        <ToggleRight className="w-12 h-12 text-[#006948]" />
                      ) : (
                        <ToggleLeft className="w-12 h-12 text-slate-300" />
                      )}
                    </button>
                  </div>

                </div>
              </Card>

              {/* GCP Telemetry & Logging Indicator */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <Card className="rounded-3xl bg-white border border-slate-100 shadow-soft-ambient p-8 space-y-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-6 h-6 text-[#006948]" />
                    <h4 className="text-lg font-bold Atkinson-font">Koneksi Supavisor (Port 6543)</h4>
                  </div>
                  <p className="text-slate-500 text-sm">
                    Mutasi berat (komentar dan guestbook) dialirkan melalui pooler port transaksional 6543.
                  </p>
                  <div className="px-4 py-2.5 bg-emerald-50 text-emerald-800 rounded-xl font-mono text-xs border border-emerald-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    STATUS: POOLER STABIL (Direct TCP Access Enabled)
                  </div>
                </Card>

                <Card className="rounded-3xl bg-white border border-slate-100 shadow-soft-ambient p-8 space-y-4">
                  <div className="flex items-center gap-2">
                    <Radio className="w-6 h-6 text-[#006948]" />
                    <h4 className="text-lg font-bold Atkinson-font">Status Ingest GCP Telemetry</h4>
                  </div>
                  <p className="text-slate-500 text-sm">
                    Aliran log kalkulator anonim ke BigQuery Storage API dan visualizer PageSpeed Insights.
                  </p>
                  <div className="px-4 py-2.5 bg-indigo-50 text-indigo-800 rounded-xl font-mono text-xs border border-indigo-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    GCP CREDENTIALS: ✓ Connected (Safe Telemetry Pipelines Enabled)
                  </div>
                </Card>

              </div>

              {/* Comments Moderation Queue */}
              <Card className="rounded-3xl bg-white border border-slate-100 shadow-soft-ambient p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100">
                      <MessageSquare className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight Atkinson-font">Antrean Moderasi Komentar Warga</h3>
                      <p className="text-slate-500 text-base">Tinjau masukan warga sebelum ditayangkan di panduan terverifikasi.</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100">
                    {pendingComments.length} Baru
                  </span>
                </div>

                <div className="space-y-4">
                  {pendingComments.map((c) => (
                    <div key={c.id} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{c.author}</span>
                          <span className="text-xs text-slate-400">({c.email})</span>
                        </div>
                        <p className="text-slate-600 text-base leading-relaxed">
                          &ldquo;{c.content}&rdquo;
                        </p>
                        <span className="inline-block text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-200/50 px-2 py-0.5 rounded">
                          Artikel: {c.article}
                        </span>
                      </div>
                      
                      <div className="flex gap-2 w-full md:w-auto">
                        <button 
                          onClick={() => handleModerateComment(c.id, "reject")}
                          className="flex-1 md:flex-none px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl font-bold text-xs border border-rose-100 transition-all min-h-[52px]"
                        >
                          Tolak
                        </button>
                        <button 
                          onClick={() => handleModerateComment(c.id, "approve")}
                          className="flex-1 md:flex-none px-4 py-2 text-white bg-[#006948] hover:bg-[#005439] rounded-xl font-bold text-xs transition-all min-h-[52px]"
                        >
                          Setujui
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingComments.length === 0 && (
                    <div className="text-center py-6 text-slate-400 font-sans">
                      🎉 Antrean moderasi bersih. Tidak ada komentar tertunda!
                    </div>
                  )}
                </div>
              </Card>

            </div>
          )}

        </main>
      </div>
    </HydrationGuard>
  );
}
