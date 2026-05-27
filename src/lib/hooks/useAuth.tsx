"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

const locale = "en";

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  subscription_tier: "free" | "premium";
  role: "user" | "admin" | "expert";
  default_locale: string;
  created_at: string;
  bloom_points?: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithMagicLink: (email: string, locale: string) => Promise<{ error: any }>;
  signInWithGoogle: (locale?: string) => Promise<{ error: any }>;
  signInWithEmailPassword: (email: string, password: string) => Promise<{ data?: any, error: any }>;
  signUpWithEmailPassword: (email: string, password: string, locale?: string) => Promise<{ data?: any, error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // 6-second SRE Timeout Guard to unconditionally dismantle the loading spinner
    const timeoutId = setTimeout(() => {
      setLoading(false);
      console.warn("[useAuth] Session recovery timed out. Dismantling loading state gracefully.");
    }, 6000);

    const getActiveSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!error && user) {
          setUser(user);
          await fetchProfile(user.id);
        }
      } catch (e) {
        console.error("[useAuth getActiveSession error]:", e);
      } finally {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    };

    getActiveSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (e) {
        console.error("[useAuth onAuthStateChange error]:", e);
      } finally {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, display_name, subscription_tier, role, default_locale, created_at, bloom_points")
        .eq("id", userId)
        .maybeSingle();

      if (!error && data) {
        let userProfile = data as UserProfile;
        
        setProfile(userProfile);
      }
    } catch (e) {
      console.error("[useAuth fetchProfile error]:", e);
    }
  };

  const signInWithMagicLink = async (email: string, locale: string) => {
    const redirectUrl = `${window.location.origin}/callback`;
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
  };

  const signInWithGoogle = async (locale: string = "en") => {
    const redirectUrl = `${window.location.origin}/callback`;
    return await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
  };

  const signInWithEmailPassword = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signUpWithEmailPassword = async (email: string, password: string, locale: string = "en") => {
    const redirectUrl = `${window.location.origin}/callback`;
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
  };

  const signOut = async () => {
    const res = await supabase.auth.signOut();
    window.location.href = `/${profile?.default_locale || "en"}/login`;
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithMagicLink, signInWithGoogle, signInWithEmailPassword, signUpWithEmailPassword, signOut }}>
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

