"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Sparkles } from "lucide-react";
import { useLocale } from "next-intl";

interface UserProfile {
  nickname: string;
  mood: string;
  joinedAt: string;
}

export function NavbarUserStatus() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const locale = useLocale();

  useEffect(() => {
    const fetchProfile = () => {
      const stored = localStorage.getItem("lifebloom_user_profile");
      if (stored) {
        try {
          setProfile(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing user profile", e);
        }
      }
    };

    fetchProfile();

    // Listen for our custom event from the Onboarding Overlay
    window.addEventListener("lifebloom_profile_updated", fetchProfile);
    return () => {
      window.removeEventListener("lifebloom_profile_updated", fetchProfile);
    };
  }, []);

  if (profile) {
    return (
      <Link 
        href={`/${locale}/join-us`}
        className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full text-sm font-bold text-emerald-700 transition-colors shadow-sm"
      >
        <Sparkles className="w-4 h-4 text-emerald-500" />
        Hi, {profile.nickname}
      </Link>
    );
  }

  return (
    <Link 
      href={`/${locale}/dashboard`} 
      className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-sm font-semibold text-brand-blue transition-colors"
    >
      <LayoutDashboard className="w-4 h-4" /> Dashboard
    </Link>
  );
}
