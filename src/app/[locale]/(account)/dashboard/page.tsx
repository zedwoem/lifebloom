"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useTranslations } from "next-intl";
import { Settings, Calculator, BookOpen, Heart, Activity, ArrowRight, Shield, Trash2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HydrationGuard } from "@/components/ui/hydration-guard";
import { useParams } from "next/navigation";

export default function DashboardPage() {
  const { profile, signOut } = useAuth();
  const params = useParams();
  const locale = params.locale || "en";
  const [activeTab, setActiveTab] = useState<"calculators" | "products" | "articles">("calculators");
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const bloomPoints = profile?.bloom_points ?? 0;

  const fetchSavedItems = async () => {
    if (!profile?.id) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/saved-items");
      if (res.ok) {
        const data = await res.json();
        setSavedItems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedItems();
  }, [profile?.id]);

  const handleRemoveItem = async (referencedId: string) => {
    try {
      const res = await fetch(`/api/user/saved-items?referenced_id=${referencedId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setSavedItems(prev => prev.filter(item => item.referenced_id !== referencedId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const calculators = savedItems.filter(item => item.item_type === "calculation" || item.item_type === "calculator");
  const products = savedItems.filter(item => item.item_type === "product");
  const articles = savedItems.filter(item => item.item_type === "article");

  return (
    <HydrationGuard fallbackHeight="h-[600px]">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b-2 border-brand-green pb-6 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-brand-blue tracking-tight">
              Welcome back, {profile?.display_name || "User"}!
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Your personalized workspace. Bloom Points: <strong className="text-brand-green">{bloomPoints}</strong>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {profile?.role === "admin" && (
              <Link href={`/${locale}/admin`}>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-base font-bold shadow-md hover:bg-slate-800 transition-all min-h-[48px]">
                  <Shield className="w-5 h-5 text-brand-green animate-pulse" /> Admin Command Center
                </button>
              </Link>
            )}
            <button 
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-base font-bold transition-all min-h-[48px]"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* SIDEBAR NAVIGATION */}
          <nav className="md:col-span-1 flex flex-col gap-3">
            <button 
              onClick={() => setActiveTab("calculators")}
              className={`flex items-center gap-3 text-left px-4 py-4 rounded-xl font-bold text-base transition-all min-h-[48px] ${
                activeTab === "calculators" 
                  ? "bg-brand-blue text-white shadow-md scale-[1.02]" 
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Calculator className={`w-5 h-5 ${activeTab === "calculators" ? "text-brand-green" : "text-slate-400"}`} /> Saved Tools
            </button>
            <button 
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-3 text-left px-4 py-4 rounded-xl font-bold text-base transition-all min-h-[48px] ${
                activeTab === "products" 
                  ? "bg-brand-blue text-white shadow-md scale-[1.02]" 
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Heart className={`w-5 h-5 ${activeTab === "products" ? "text-rose-500" : "text-slate-400"}`} /> Saved Products
            </button>
            <button 
              onClick={() => setActiveTab("articles")}
              className={`flex items-center gap-3 text-left px-4 py-4 rounded-xl font-bold text-base transition-all min-h-[48px] ${
                activeTab === "articles" 
                  ? "bg-brand-blue text-white shadow-md scale-[1.02]" 
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <BookOpen className={`w-5 h-5 ${activeTab === "articles" ? "text-brand-green" : "text-slate-400"}`} /> Saved Articles
            </button>
          </nav>

          {/* MAIN CONTENT AREA */}
          <main className="md:col-span-3 space-y-6">
            
            {/* EXPERT PROFILE UPDATE */}
            {profile?.role === "expert" && (
              <div className="bg-gradient-to-r from-slate-50 to-white p-6 rounded-2xl border-2 border-brand-blue shadow-sm mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-6 h-6 text-brand-blue" />
                  <h2 className="text-2xl font-bold text-brand-blue">Expert Profile & Authorship</h2>
                </div>
                <p className="text-slate-600 mb-6 max-w-xl text-base">
                  As a verified expert, your profile bolsters the platform&apos;s E-E-A-T score. Link your external academic and professional identifiers here.
                </p>
                
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ORCID ID</label>
                      <input 
                        type="text" 
                        placeholder="0000-0000-0000-0000" 
                        className="w-full mt-2 border-b-2 border-brand-green bg-transparent focus:outline-none text-base text-slate-800 min-h-[40px]" 
                      />
                    </div>
                    <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Wikidata Q-ID</label>
                      <input 
                        type="text" 
                        placeholder="Q1234567" 
                        className="w-full mt-2 border-b-2 border-brand-green bg-transparent focus:outline-none text-base text-slate-800 min-h-[40px]" 
                      />
                    </div>
                  </div>
                  <button className="px-6 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold rounded-xl text-base transition-all min-h-[48px]">
                    Update Authorship Data
                  </button>
                </div>
              </div>
            )}

            {/* TAB CALCULATORS */}
            {activeTab === "calculators" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Your Saved Tools</h2>
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="h-20 bg-slate-100 animate-pulse rounded-xl" />
                    <div className="h-20 bg-slate-100 animate-pulse rounded-xl" />
                  </div>
                ) : calculators.length > 0 ? (
                  calculators.map((item, idx) => (
                    <Card key={idx} className="flex flex-col sm:flex-row items-center justify-between group hover:border-brand-green transition-all p-6 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200 shrink-0">
                          <Activity className="w-6 h-6 text-brand-green" />
                        </div>
                        <div>
                          <h3 className="font-bold text-brand-blue text-lg capitalize">{item.referenced_id.replace("-", " ")}</h3>
                          <p className="text-sm text-slate-400">
                            Saved on {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4 sm:mt-0">
                        <Link href={`/${locale}/${item.metadata?.pillar || "home"}`}>
                          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm transition-all min-h-[48px]">
                            View <ArrowRight className="w-4 h-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleRemoveItem(item.referenced_id)}
                          className="p-3 text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-all min-h-[48px] flex items-center justify-center"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center border-dashed border-2 border-slate-200">
                    <CardTitle className="mb-2 text-slate-700">No Saved Calculators</CardTitle>
                    <CardDescription className="mb-6 text-base">
                      Try out our interactive tools in the Money or Home pillars and save your progress to see it here.
                    </CardDescription>
                    <Link href={`/${locale}/money`}>
                      <button className="px-6 py-2.5 bg-brand-blue text-white hover:bg-brand-blue-dark rounded-xl font-bold text-base transition-all min-h-[48px]">
                        Explore Tools
                      </button>
                    </Link>
                  </Card>
                )}
              </div>
            )}

            {/* TAB PRODUCTS */}
            {activeTab === "products" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Saved Products & Recommendations</h2>
                {isLoading ? (
                  <div className="h-20 bg-slate-100 animate-pulse rounded-xl" />
                ) : products.length > 0 ? (
                  products.map((item, idx) => (
                    <Card key={idx} className="flex flex-col sm:flex-row items-center justify-between group hover:border-brand-green transition-all p-6 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200 shrink-0">
                          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-brand-blue text-lg">{item.metadata?.name || item.referenced_id}</h3>
                          <p className="text-sm text-slate-400">
                            Saved on {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4 sm:mt-0">
                        <a href={item.metadata?.affiliate_url || "#"} target="_blank" rel="nofollow noopener noreferrer">
                          <button className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white font-semibold rounded-lg hover:bg-brand-green-dark text-sm transition-all min-h-[48px]">
                            Buy Now <ArrowRight className="w-4 h-4" />
                          </button>
                        </a>
                        <button 
                          onClick={() => handleRemoveItem(item.referenced_id)}
                          className="p-3 text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-all min-h-[48px] flex items-center justify-center"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center border-dashed border-2 border-slate-200">
                    <CardTitle className="mb-2 text-slate-700">No Saved Products</CardTitle>
                    <CardDescription className="mb-6 text-base">
                      Browse recommended products across the LifeBloom pillars and click save to keep them on your checklist.
                    </CardDescription>
                  </Card>
                )}
              </div>
            )}

            {/* TAB ARTICLES */}
            {activeTab === "articles" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Saved Reading List</h2>
                {isLoading ? (
                  <div className="h-20 bg-slate-100 animate-pulse rounded-xl" />
                ) : articles.length > 0 ? (
                  articles.map((item, idx) => (
                    <Card key={idx} className="flex flex-col sm:flex-row items-center justify-between group hover:border-brand-green transition-all p-6 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200 shrink-0">
                          <BookOpen className="w-6 h-6 text-brand-blue" />
                        </div>
                        <div>
                          <h3 className="font-bold text-brand-blue text-lg line-clamp-1">{item.metadata?.title || item.referenced_id}</h3>
                          <p className="text-sm text-slate-400 capitalize">
                            Pillar: {item.metadata?.pillar || "health"} • Saved on {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4 sm:mt-0">
                        <Link href={`/${locale}/article/${item.referenced_id}`}>
                          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm transition-all min-h-[48px]">
                            Read Article <ArrowRight className="w-4 h-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleRemoveItem(item.referenced_id)}
                          className="p-3 text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-all min-h-[48px] flex items-center justify-center"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center border-dashed border-2 border-slate-200">
                    <CardTitle className="mb-2 text-slate-700">Reading List is Empty</CardTitle>
                    <CardDescription className="mb-6 text-base">
                      Articles matching longevity and healthy aging research can be saved here for offline reference.
                    </CardDescription>
                  </Card>
                )}
              </div>
            )}

          </main>
        </div>
      </div>
    </HydrationGuard>
  );
}
