"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useTranslations } from "next-intl";
import { Settings, Calculator, BookOpen, Heart, Activity, ArrowRight } from "lucide-react";
import { YieldRadar } from "@/components/calculators/yield-radar";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { profile, signOut } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  
  const bloomPoints = profile?.subscription_tier === 'premium' ? 1500 : 420;

  useEffect(() => {
    if (profile?.id) {
      fetch(`/api/user/calculations?userId=${profile.id}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setHistory(data);
        })
        .catch(console.error);
    }
  }, [profile?.id]);
  
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b-2 border-brand-green pb-6">
        <div>
          <h1 className="text-4xl font-bold text-brand-blue mb-2">
            Welcome back, {profile?.display_name}!
          </h1>
          <p className="text-brand-slate mt-2 text-lg">
            Your personalized dashboard. Bloom Points: <strong className="text-brand-green">{bloomPoints}</strong>
          </p>
        </div>
        <Button 
          onClick={() => signOut()}
          variant="danger"
          className="mt-4 md:mt-0"
        >
          Sign Out
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* SIDEBAR NAVIGATION */}
        <nav className="md:col-span-1 flex flex-col gap-3">
          <button className="flex items-center gap-3 text-left px-4 py-4 bg-brand-blue text-white rounded-xl font-bold shadow-md focus:ring-4 focus:ring-blue-300 transition-transform hover:scale-105">
            <Calculator className="w-5 h-5 text-brand-green" /> Saved Calculators
          </button>
          <button className="flex items-center gap-3 text-left px-4 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all">
            <Heart className="w-5 h-5 text-rose-500" /> Saved Products
          </button>
          <button className="flex items-center gap-3 text-left px-4 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all">
            <BookOpen className="w-5 h-5 text-brand-blue" /> Article History
          </button>
        </nav>

        {/* MAIN CONTENT AREA */}
        <main className="md:col-span-3 space-y-8">
          
          {/* EXPERT SPECIFIC SECTION */}
          {profile?.role === 'expert' && (
            <div className="bg-gradient-to-r from-brand-slate-light to-white p-6 rounded-2xl border-2 border-brand-blue shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-brand-blue" />
                <h2 className="text-2xl font-bold text-brand-blue">Expert Profile & Authorship</h2>
              </div>
              <p className="text-slate-600 mb-6 max-w-xl">
                As a verified expert, your profile bolsters the platform&apos;s E-E-A-T score. Link your external academic and professional identifiers here.
              </p>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">ORCID ID</label>
                    <input type="text" placeholder="0000-0000-0000-0000" className="w-full mt-2 border-b-2 border-brand-green bg-transparent focus:outline-none text-lg text-slate-800" />
                  </div>
                  <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Wikidata Q-ID</label>
                    <input type="text" placeholder="Q1234567" className="w-full mt-2 border-b-2 border-brand-green bg-transparent focus:outline-none text-lg text-slate-800" />
                  </div>
                </div>
                <Button className="w-full sm:w-auto">Update Authorship Data</Button>
              </div>
            </div>
          )}
          
          {/* DYNAMIC CALCULATIONS HISTORY */}
          {history.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-brand-blue mb-4">Your Saved Tools</h2>
              {history.map((item, idx) => (
                <Card key={idx} className="flex flex-col sm:flex-row items-center justify-between group hover:border-brand-green transition-all p-6 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-slate-light flex items-center justify-center border-2 border-brand-slate-light">
                      <Activity className="w-6 h-6 text-brand-green" />
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-blue capitalize">{item.calculator_slug.replace('-', ' ')}</h3>
                      <p className="text-sm text-brand-slate">
                        Saved on {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link href={`/en/${item.calculator_slug === 'retirement' ? 'money' : 'home'}`}>
                    <Button variant="outline" size="sm" className="gap-2 mt-4 sm:mt-0">
                      View <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="flex-1 group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Settings className="w-32 h-32 text-brand-green" />
              </div>
              <CardTitle className="mb-4">No Saved Calculations Yet</CardTitle>
              <CardDescription className="mb-6 max-w-md relative z-10">
                Try out our interactive tools in the Money or Home pillars and save your progress to see it here.
              </CardDescription>
              <Link href="/en/money">
                <Button className="relative z-10">
                  Explore Tools
                </Button>
              </Link>
            </Card>
          )}

        </main>
      </div>
    </div>
  );
}
