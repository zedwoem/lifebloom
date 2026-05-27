"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Mail, ShieldAlert, CheckCircle2, UserPlus, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const { user, signInWithMagicLink, loading, signUpWithEmailPassword } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  // Form States
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push(`/${locale}/dashboard`);
    }
  }, [user, loading, router, locale]);

  const [password, setPassword] = useState("");

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signUpWithEmailPassword(email, password, locale);
      if (error) {
        setErrorMsg(error.message || "Failed to create account. Please try again.");
      } else {
        setSuccessMsg("Success! We've sent a secure confirmation link to your email. Please check your inbox (and spam folder) to activate your account.");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-bold">Verifying secure session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full border border-slate-100 animate-slide-up">
        
        {/* Brand Icon and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
            <UserPlus className="w-8 h-8 text-brand-green" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Create an Account</h1>
          <p className="text-slate-500 mt-2 text-base">
            Join LifeBloom Hub to save your collections, access premium calculators, and get personalized recommendations.
          </p>
        </div>

        {/* Alert Notifications */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 text-sm font-semibold">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-xl flex items-start gap-3 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="space-y-5">
          <div>
            <label htmlFor="email-input" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="email-input"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || successMsg.length > 0}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-brand-blue min-h-[50px] disabled:opacity-50"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password-input" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                id="password-input"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || successMsg.length > 0}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-brand-blue min-h-[50px] disabled:opacity-50"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || successMsg.length > 0}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 text-base rounded-2xl min-h-[50px] flex items-center justify-center gap-2 shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-slate-500 text-sm">
            Already have an account?{" "}
            <Link href={`/${locale}/login`} className="font-bold text-brand-blue hover:text-brand-green transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
