"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { UserCircle2, Mail, ShieldAlert, CheckCircle2, Lock, ChevronRight } from "lucide-react";

export default function LoginPage() {
  const { user, signInWithMagicLink, mockLogin, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  // Form States
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // Tab State for Dev Mode
  const [activeTab, setActiveTab] = useState<"magic" | "quick">("magic");

  const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true";

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push(`/${locale}/dashboard`);
    }
  }, [user, loading, router, locale]);

  const handleMagicLinkSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signInWithMagicLink(email, locale);
      if (error) {
        setErrorMsg(error.message || "Failed to send magic link. Please try again.");
      } else {
        if (isMockMode) {
          // In mock mode, signInWithMagicLink automatically logs the user in
          router.push(`/${locale}/dashboard`);
        } else {
          setSuccessMsg("Success! We've sent a secure sign-in link to your email. Please check your inbox (and spam folder) to log in.");
        }
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (role: "user" | "admin" | "expert") => {
    mockLogin(role);
    router.push(`/${locale}/dashboard`);
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
          <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Lock className="w-8 h-8 text-brand-blue" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Secure Access Control</h1>
          <p className="text-slate-500 mt-2 text-base">
            Sign in to access your secure LifeBloom Hub profile, calculations, and active collections.
          </p>
        </div>

        {/* Tab Selector (Only displayed in DEV Mock Mode to avoid cluttering Production) */}
        {isMockMode && (
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab("magic")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "magic"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Secure Magic Link
            </button>
            <button
              onClick={() => setActiveTab("quick")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "quick"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Developer Quick Access
            </button>
          </div>
        )}

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

        {/* TAB 1: SECURE MAGIC LINK FORM (Production default or Dev option) */}
        {(activeTab === "magic" || !isMockMode) && (
          <form onSubmit={handleMagicLinkSubmit} className="space-y-5">
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

            <Button
              type="submit"
              disabled={isSubmitting || successMsg.length > 0}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 text-base rounded-2xl min-h-[50px] flex items-center justify-center gap-2 shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Requesting Secure Key...</span>
                </>
              ) : (
                <>
                  <span>Send Passwordless Magic Link</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* TAB 2: DEVELOPER QUICK ACCESS */}
        {activeTab === "quick" && isMockMode && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Simulate Access Roles:</p>
            {[
              { role: "user" as const, name: "Standard Member Profile", desc: "View history, calculations, and saved items." },
              { role: "expert" as const, name: "Verified Healthcare Expert", desc: "Expert profiles with ORCID academic integrations." },
              { role: "admin" as const, name: "Platform Administrator", desc: "Full administrative panel and system logs access." }
            ].map((item) => (
              <button
                key={item.role}
                onClick={() => handleQuickLogin(item.role)}
                className="w-full text-left p-4 border border-slate-200 hover:border-brand-green/30 bg-slate-50 hover:bg-slate-50/50 rounded-2xl transition-all flex justify-between items-center group"
              >
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-brand-blue transition-colors text-base">{item.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </div>
                <UserCircle2 className="w-6 h-6 text-slate-400 group-hover:text-brand-green transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

