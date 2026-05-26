"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLocale } from "next-intl";
import { Sparkles, User, LogOut, ArrowRight } from "lucide-react";

export function NavbarUserStatus() {
  const { user, profile, loading, signOut } = useAuth();
  const locale = useLocale();

  if (loading) {
    return (
      <div className="h-touch-target flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    const displayName = profile?.display_name || user.email?.split("@")[0] || "User";
    const role = profile?.role || "user";
    
    // Role-based redirect path
    let workspacePath = `/${locale}/saved`;
    if (role === "admin" || role === "expert") {
      workspacePath = `/${locale}/dashboard`;
    }

    return (
      <div className="flex items-center gap-3 animate-fade-in">
        <Link 
          href={workspacePath}
          className="flex items-center gap-2 h-touch-target px-5 bg-brand-green-light hover:bg-[#d8f3e5] border border-brand-green-light rounded-full text-base font-bold text-brand-green-dark transition-all duration-200 shadow-sm hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4 text-brand-green" />
          Hi, {displayName}
        </Link>
        <button
          onClick={() => signOut()}
          className="w-10 h-10 flex items-center justify-center bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-full text-rose-600 transition-colors"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 animate-fade-in">
      <Link 
        href={`/${locale}/login`}
        className="flex items-center justify-center h-touch-target px-6 bg-brand-green-light hover:bg-[#d8f3e5] text-brand-green-dark font-bold text-base rounded-full transition-colors border border-transparent"
      >
        Sign In
      </Link>
      <Link 
        href={`/${locale}/join-us`}
        className="flex items-center justify-center h-touch-target px-6 bg-[#131b2e] hover:bg-[#0a0e1a] text-white font-bold text-base rounded-full transition-colors flex gap-1.5 shadow-md"
      >
        Join Us <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
