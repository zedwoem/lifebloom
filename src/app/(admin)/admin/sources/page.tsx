"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Database, Globe, CheckCircle, ExternalLink, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { HydrationGuard } from "@/components/ui/hydration-guard";

// Target Ingestion Config mapped directly to pillars
const CONTENT_ENGINE_SOURCES = [
  {
    pillar: "Home & Smart Living",
    feeds: [
      { name: "Family Handyman RSS", url: "https://familyhandyman.com/feed", type: "RSS" },
      { name: "Young House Love RSS", url: "https://feeds.feedburner.com/younghouselove", type: "RSS" }
    ]
  },
  {
    pillar: "Money & Future",
    feeds: [
      { name: "The Money Guy Show RSS", url: "https://moneyguy.com/feed/", type: "RSS" },
      { name: "James Shack Channel", url: "https://youtube.com/c/JamesShack", type: "YouTube" }
    ]
  },
  {
    pillar: "Pet Family",
    feeds: [
      { name: "AVMA RSS Feed", url: "https://www.avma.org/news/rss-feeds", type: "RSS" },
      { name: "Bark & Whiskers RSS", url: "https://barkandwhiskers.com/rss", type: "RSS" }
    ]
  },
  {
    pillar: "Seniors & Health",
    feeds: [
      { name: "AARP News RSS Feed", url: "https://www.aarp.org/rss", type: "RSS" },
      { name: "National Institute on Aging", url: "https://www.nia.nih.gov/news/feed", type: "RSS" }
    ]
  },
  {
    pillar: "Slow Travel multigenerasional",
    feeds: [
      { name: "Rick Steves Travel RSS", url: "https://ricksteves.com/rss", type: "RSS" },
      { name: "Lonely Planet Feed", url: "https://lonelyplanet.com/feed", type: "RSS" }
    ]
  }
];

export default function AdminSourcesPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || "en";
  const supabase = createClient();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    async function checkAdminAndLoadStats() {
      const { data: adminCheck } = await supabase.rpc("is_admin");
      const isUserAdmin = adminCheck === true;

      if (!isUserAdmin) {
        setIsAdmin(false);
        toast.error("Akses Ditolak. Anda bukan Administrator.");
        router.push(`/dashboard`);
        return;
      }

      setIsAdmin(true);

      // Load counts per pillar from aggregated_content
      const { data: countsData } = await supabase
        .from("canonical_articles")
        .select("pillar");

      const statsMap: Record<string, number> = {};
      if (countsData) {
        countsData.forEach((c) => {
          if (c.pillar) {
            statsMap[c.pillar] = (statsMap[c.pillar] || 0) + 1;
          }
        });
      }
      setStats(statsMap);
    }

    if (profile !== undefined) {
      checkAdminAndLoadStats();
    }
  }, [profile, router, supabase, locale]);

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
                RSS & VIDEO SOURCES CONFIG
              </h1>
              <p className="text-slate-500 mt-1 text-lg">Konfigurasi Target Ingesti Content Engine per Pilar Komunitas</p>
            </div>
          </div>
        </header>

        <main className="max-w-[1120px] mx-auto space-y-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-2xl font-bold Atkinson-font flex items-center gap-2">
              <Database className="w-6 h-6 text-[#006948]" /> Konfigurasi Sumber Ingestion Aktif
            </h3>
            <p className="text-slate-500 text-base leading-relaxed">
              Berikut adalah daftar feed RSS dan channel YouTube yang secara otomatis dikonsumsi oleh robot parser ingestion Lifebloom Hub untuk memperkaya pilar komunitas secara multi-bahasa.
            </p>

            <div className="space-y-6">
              {CONTENT_ENGINE_SOURCES.map((source, index) => {
                // Map pilar name to lowercase key for stats
                const keyMap: Record<string, string> = {
                  "Home & Smart Living": "home",
                  "Money & Future": "money",
                  "Pet Family": "pet",
                  "Seniors & Health": "senior",
                  "Slow Travel multigenerasional": "travel"
                };
                const pillarKey = keyMap[source.pillar] || "home";
                const totalArticles = stats[pillarKey] || 0;

                return (
                  <div key={index} className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-200/60">
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 Atkinson-font">{source.pillar}</h4>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pilar Target</span>
                      </div>
                      <span className="px-3.5 py-1.5 bg-[#f0fbf5] text-[#006948] text-xs font-bold rounded-full border border-emerald-100">
                        {totalArticles} Ingested Articles
                      </span>
                    </div>

                    <div className="space-y-3">
                      {source.feeds.map((feed, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white border border-slate-150 rounded-xl p-4 shadow-sm min-h-[56px]">
                          <div className="flex items-center gap-3">
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                              feed.type === "RSS" 
                                ? "bg-amber-50 text-amber-700 border border-amber-100" 
                                : "bg-red-50 text-red-700 border border-red-100"
                            }`}>
                              {feed.type}
                            </span>
                            <div>
                              <strong className="text-slate-800 text-sm sm:text-base font-bold">{feed.name}</strong>
                              <span className="text-xs text-slate-400 block max-w-[280px] sm:max-w-md truncate">{feed.url}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Active
                            </span>
                            <a 
                              href={feed.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-slate-400 hover:text-[#006948] transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </HydrationGuard>
  );
}
