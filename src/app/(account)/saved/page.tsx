"use client";

import React, { useState } from "react";
import { useSavedItems } from "@/lib/hooks/useSavedItems";
import { useAuth } from "@/lib/hooks/useAuth";
import { Heart, Search, Trash2, ExternalLink, Activity, BookOpen, Download, Calculator, MapPin, ArrowRight } from "lucide-react";
import { HydrationGuard } from "@/components/ui/hydration-guard";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";

// Prevent Leaflet SSR crash by loading dynamically with ssr: false
const DynamicTravelMap = dynamic(
  () => import("@/components/travel/TravelMap"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] rounded-3xl bg-[#faf8ff] border border-slate-100 animate-pulse flex items-center justify-center text-slate-400 font-sans">
        Loading Adware-Free Leaflet Map...
      </div>
    )
  }
);
import Link from "next/link";
import { useParams } from "next/navigation";

export default function UserWorkspacePage() {
  const { profile } = useAuth();
  const { savedItems, loading, toggleSaveItem } = useSavedItems();
  const params = useParams();
  const locale = params.locale || "en";
  
  const [textSize, setTextSize] = useState<"A-" | "A" | "A+">("A");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#006948] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center flex-col">
        <h2 className="text-2xl font-black text-slate-800" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>Restricted Access</h2>
        <p className="text-slate-500 mt-2">Please sign in first to manage your saved items.</p>
      </div>
    );
  }

  const calculators = savedItems.filter(item => item.item_type === "calculation");
  const articles = savedItems.filter(item => item.item_type === "article");

  // Handle Text Size Scaling
  let textClass = "text-base";
  if (textSize === "A-") textClass = "text-sm";
  if (textSize === "A+") textClass = "text-xl";

  return (
    <HydrationGuard fallbackHeight="h-screen">
      <div className={`bg-[#FFFDF5] min-h-screen pb-12 font-sans selection:bg-[#85f8c4] selection:text-[#002114] ${textClass}`}>
        
        {/* Header Area */}
        <header className="border-b border-slate-200 bg-white">
          <div className="max-w-[1120px] mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-[#f5fff7] rounded-2xl flex items-center justify-center border border-[#006948]/20">
                <span className="text-2xl">🧓</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                RUANG NYAMAN SAYA
              </h1>
            </div>
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button 
                onClick={() => setTextSize("A-")}
                className={`px-4 py-2 rounded-lg font-bold min-h-[44px] transition-all ${textSize === "A-" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
              >
                A-
              </button>
              <button 
                onClick={() => setTextSize("A")}
                className={`px-4 py-2 rounded-lg font-bold min-h-[44px] transition-all ${textSize === "A" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
              >
                A
              </button>
              <button 
                onClick={() => setTextSize("A+")}
                className={`px-4 py-2 rounded-lg font-bold min-h-[44px] transition-all ${textSize === "A+" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
              >
                A+
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-[1120px] mx-auto px-6 py-8 space-y-10">

          {/* Section 1: User Feature Pebble Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            {/* Pebble Card 1: Safe Calculators */}
            <Card className="rounded-3xl bg-white border border-slate-100 shadow-soft-ambient p-8 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                  <Calculator className="w-6 h-6 text-[#006948]" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>Kalkulator & Yield Perjalanan</h3>
                <p className="text-slate-500 text-lg leading-relaxed mb-6">
                  Pantau pertumbuhan yield tabungan jangka panjang Anda secara live.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/money-future/yield-radar`} className="flex-1">
                  <button className="w-full px-5 py-3.5 bg-[#006948] hover:bg-[#005439] text-white rounded-xl font-bold text-base min-h-[52px] transition-all flex items-center justify-center gap-2">
                    Buka Alat <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </Card>

            {/* Pebble Card 2: Pet Safety Milestones */}
            <Card className="rounded-3xl bg-white border border-slate-100 shadow-soft-ambient p-8 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 border border-rose-100">
                  <Heart className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>Keamanan Dapur Peliharaan</h3>
                <p className="text-slate-500 text-lg leading-relaxed mb-6">
                  Pengecekan bahan masakan beracun terintegrasi dengan database Wiki & USDA.
                </p>
              </div>
              <div className="px-4 py-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-emerald-800 font-bold flex items-center gap-2 text-sm min-h-[52px]">
                🐾 14 family recipes scanned this week. 100% pet-safe!
              </div>
            </Card>

            {/* Pebble Card 3: Adware-Free Multi-Gen Travel Planner */}
            <Card className="rounded-3xl bg-white border border-slate-100 shadow-soft-ambient p-8 space-y-6 md:col-span-2">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#faf8ff] rounded-2xl flex items-center justify-center border border-slate-100">
                    <MapPin className="w-6 h-6 text-[#006948]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>Rute & Peta Ramah Aksesibilitas</h3>
                    <p className="text-slate-500 text-base">Perencanaan slow travel multigenerasi, 100% bebas iklan dan tracker pihak ketiga.</p>
                  </div>
                </div>
                <Link href={`/travel/trip-planner`}>
                  <button className="px-5 py-3.5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-base min-h-[52px] transition-all">
                    Buka Peta Rute
                  </button>
                </Link>
              </div>
              <DynamicTravelMap />
            </Card>
          </section>
          
          {/* Section 2: Saved Calculations */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
              PANDUAN & KALKULASI YANG SAYA SIMPAN:
            </h2>
            
            {calculators.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold text-lg">Belum ada kalkulasi yang disimpan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {calculators.map(item => {
                  const title = item.metadata?.name || item.referenced_id.replace("-", " ");
                  return (
                    <div key={item.id} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shrink-0">
                          <span className="text-2xl">{item.metadata?.pillar === "pet" ? "🐾" : "🧓"}</span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 leading-tight capitalize" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                            {title}
                          </h3>
                          <p className="text-slate-500 mt-2">
                            Terakhir Diperbarui: {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Link href={`/${item.metadata?.pillar || "home"}`} className="flex-1">
                          <button className="w-full px-5 py-3 bg-[#006948] hover:bg-[#00855d] text-white rounded-xl font-bold min-h-[52px] transition-all outline-none focus:ring-4 focus:ring-[#68dba9]/30">
                            Buka Hasil
                          </button>
                        </Link>
                        {item.item_type === "calculation" && (
                          <button className="px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold min-h-[52px] transition-all flex items-center justify-center gap-2">
                            <Download className="w-5 h-5" /> PDF
                          </button>
                        )}
                        <button 
                          onClick={() => toggleSaveItem(item.item_type, item.referenced_id)}
                          className="px-5 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold min-h-[52px] transition-all flex items-center justify-center"
                          aria-label="Hapus Kalkulasi"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 2: Articles & Reading List */}
          <section>
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                <BookOpen className="w-6 h-6 text-[#006948]" /> ARTIKEL & BREADCRUMBS YANG SAYA IKUTI
              </h2>
              
              {articles.length === 0 ? (
                <p className="text-slate-500 text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl">Belum ada artikel yang dibaca/disimpan.</p>
              ) : (
                <ul className="space-y-4">
                  {articles.map(item => (
                    <li key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-200">
                      <div className="flex items-start gap-3">
                        <span className="text-[#006948] font-bold shrink-0 mt-1">-</span>
                        <div>
                          <Link href={`/article/${item.referenced_id}`} className="hover:underline hover:text-[#006948] decoration-2 underline-offset-4">
                            <h3 className="font-bold text-slate-900 text-lg">&quot;{item.metadata?.title || item.referenced_id}&quot;</h3>
                          </Link>
                          <p className="text-slate-500 mt-1">Disimpan pada {new Date(item.created_at).toLocaleDateString("id-ID")}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleSaveItem(item.item_type, item.referenced_id)}
                        className="px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-xl font-bold min-h-[52px] transition-all flex items-center gap-2 shrink-0"
                      >
                        <Trash2 className="w-5 h-5" /> Hapus
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

        </main>
      </div>
    </HydrationGuard>
  );
}
