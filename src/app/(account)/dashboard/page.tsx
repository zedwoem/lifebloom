"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { HydrationGuard } from "@/components/ui/hydration-guard";
import { ExpertView } from "@/components/dashboard/ExpertView";

export default function UnifiedMultiRoleDashboard() {
  const { profile, signOut, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || "en";

  const activeRole = profile?.role || "user";

  // Redirect users on client-side mount based on roles
  useEffect(() => {
    if (loading || !profile) return;

    if (activeRole === "admin") {
      router.push(`/admin`);
    } else if (activeRole === "user") {
      router.push(`/saved`);
    }
  }, [profile, activeRole, loading, locale, router]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-[#FFFDF5] min-h-screen flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-bold tracking-tight text-sm uppercase pl-1">
          Menyinkronkan Sesi Aman...
        </p>
      </div>
    );
  }

  // Not authenticated
  if (!profile) {
    return (
      <div className="bg-[#FFFDF5] min-h-screen flex flex-col justify-center items-center p-6 text-center">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight pl-1">
          Akses Terbatas
        </h2>
        <p className="text-slate-500 text-base max-w-sm mt-2 leading-relaxed">
          Silakan masuk ke akun terverifikasi Anda untuk mengakses panel kontrol LifeBloom.
        </p>
        <button 
          onClick={() => router.push(`/login`)}
          className="mt-6 px-6 py-3 bg-emerald-800 hover:bg-emerald-950 text-white font-black rounded-2xl text-sm transition-all shadow-md cursor-pointer"
        >
          Masuk Sekarang
        </button>
      </div>
    );
  }

  return (
    <HydrationGuard fallbackHeight="h-[800px]">
      <div className="bg-[#FFFDF5] min-h-screen">
        {activeRole === "expert" ? (
          <ExpertView profile={profile} signOut={signOut} locale={locale.toString()} />
        ) : (
          /* Fallback during redirect processing */
          <div className="min-h-screen flex flex-col justify-center items-center">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-bold tracking-tight text-sm uppercase pl-1">
              Mengarahkan Ke Ruang Kerja...
            </p>
          </div>
        )}
      </div>
    </HydrationGuard>
  );
}
