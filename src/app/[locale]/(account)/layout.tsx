"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${params.locale}/login`);
    }
  }, [user, loading, router, params.locale]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <p className="text-xl text-slate-600 font-semibold">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) return null; // Will redirect

  return (
    <div className="min-h-screen bg-warm-beige">
      <main>{children}</main>
    </div>
  );
}
