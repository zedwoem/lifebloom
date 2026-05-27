"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Shield, LayoutDashboard, Users, Activity, Settings } from "lucide-react";

const locale = "en";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (!loading) {
      if (!user || profile?.role !== 'admin') {
        // Firewall: Redirect non-admins strictly to standard dashboard
        router.push(`/${params.locale}/dashboard`);
      }
    }
  }, [user, profile, loading, router, params.locale]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Shield className="w-12 h-12 text-brand-green animate-pulse mb-4" />
        <p className="text-xl text-slate-600 font-semibold">Authenticating Admin Panel...</p>
      </div>
    );
  }

  // Double check before rendering
  if (!user || profile?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col p-6 shadow-2xl z-10 shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <Shield className="w-8 h-8 text-brand-green" />
          <h2 className="text-xl font-bold tracking-tight">Admin Center</h2>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <Link href={`/${params.locale}/admin`} className="flex items-center gap-3 px-4 py-3 bg-brand-green/20 text-brand-green rounded-xl font-semibold hover:bg-brand-green/30 transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <button className="flex items-center gap-3 px-4 py-3 text-slate-300 rounded-xl font-semibold hover:bg-slate-800 transition-colors text-left">
            <Users className="w-5 h-5" /> User Management
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-slate-300 rounded-xl font-semibold hover:bg-slate-800 transition-colors text-left">
            <Activity className="w-5 h-5" /> Analytics Logs
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-slate-300 rounded-xl font-semibold hover:bg-slate-800 transition-colors text-left">
            <Settings className="w-5 h-5" /> Platform Config
          </button>
        </nav>
        
        <div className="pt-6 border-t border-slate-800 mt-auto">
          <Link href={`/${params.locale}/dashboard`}>
            <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors">
              &larr; Exit Admin Mode
            </button>
          </Link>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
