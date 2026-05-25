"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  subscription_tier: "free" | "premium";
  role: "user" | "admin" | "expert";
  default_locale: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithMagicLink: (email: string, locale: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  mockLogin: (profileType: "user" | "admin" | "expert") => void; // Dev Only Mock Login
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- MOCK PROFILES ---
const MOCK_PROFILES = {
  "user": {
    user: { id: "mock-user", email: "user@lifebloom.local", role: "authenticated" } as User,
    profile: {
      id: "mock-user",
      email: "user@lifebloom.local",
      display_name: "Standard User",
      subscription_tier: "free" as const,
      role: "user" as const,
      default_locale: "en",
      created_at: new Date().toISOString(),
    }
  },
  "admin": {
    user: { id: "mock-admin", email: "admin@lifebloom.local", role: "authenticated" } as User,
    profile: {
      id: "mock-admin",
      email: "admin@lifebloom.local",
      display_name: "Platform Admin",
      subscription_tier: "premium" as const,
      role: "admin" as const,
      default_locale: "en",
      created_at: new Date().toISOString(),
    }
  },
  "expert": {
    user: { id: "mock-expert", email: "expert@lifebloom.local", role: "authenticated" } as User,
    profile: {
      id: "mock-expert",
      email: "expert@lifebloom.local",
      display_name: "Verified Expert",
      subscription_tier: "premium" as const,
      role: "expert" as const,
      default_locale: "en",
      created_at: new Date().toISOString(),
    }
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  
  const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true";

  useEffect(() => {
    if (isMockMode) {
      // Check if there is a mock session in localStorage
      const savedMock = localStorage.getItem("lifebloom_mock_session");
      if (savedMock && MOCK_PROFILES[savedMock as keyof typeof MOCK_PROFILES]) {
        const mockData = MOCK_PROFILES[savedMock as keyof typeof MOCK_PROFILES];
        setUser(mockData.user);
        setProfile(mockData.profile);
      }
      setLoading(false);
      return;
    }

    // --- LOGIKA SUPABASE ASLI ---
    const getActiveSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    getActiveSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMockMode]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, display_name, subscription_tier, role, default_locale, created_at")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data as UserProfile);
    }
  };

  const signInWithMagicLink = async (email: string, locale: string) => {
    if (isMockMode) {
      let type: "user" | "admin" | "expert" = "user";
      if (email.includes("admin")) type = "admin";
      
      mockLogin(type);
      return { error: null };
    }

    const redirectUrl = `${window.location.origin}/${locale}/callback`;
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
  };

  const signOut = async () => {
    if (isMockMode) {
      setUser(null);
      setProfile(null);
      localStorage.removeItem("lifebloom_mock_session");
      return { error: null };
    }
    return await supabase.auth.signOut();
  };

  const mockLogin = (profileType: "user" | "admin" | "expert") => {
    const mockData = MOCK_PROFILES[profileType];
    setUser(mockData.user);
    setProfile(mockData.profile);
    localStorage.setItem("lifebloom_mock_session", profileType);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithMagicLink, signOut, mockLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
