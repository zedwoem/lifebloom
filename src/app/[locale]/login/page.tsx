"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Lock, ChevronRight } from "lucide-react";

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || 'en';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      // Role routing is handled by the callback, but as a fallback:
      router.push(`/${locale}/dashboard`);
    }
  }, [user, loading, router, locale]);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMsg(error.message || "Gagal menghubungi Google SSO. Coba lagi.");
        setIsSubmitting(false);
      }
      // If success, Supabase will redirect to the OAuth provider
    } catch (err: any) {
      setErrorMsg("Terjadi kesalahan sistem. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#006948] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-bold" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>Verifikasi Sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-[#FFFDF5]">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-soft-ambient max-w-[480px] w-full border border-slate-100/80 animate-in fade-in slide-in-from-bottom-4">
        
        {/* Brand Icon and Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#eef0ff] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[#dae2fd]">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#131b2e] mb-3" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            Akses Aman
          </h1>
          <p className="text-slate-500 text-[18px] leading-relaxed">
            Masuk untuk mengakses dasbor personalisasi, kalkulator terenkripsi, dan forum komunitas eksklusif.
          </p>
        </div>

        {/* Alert Notifications */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-3 text-[16px] font-semibold">
            <ShieldAlert className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Massive Accessible Google Button */}
        <Button
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-[18px] rounded-xl h-[60px] flex items-center justify-center gap-4 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
              <span>Menghubungkan...</span>
            </>
          ) : (
            <>
              <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              <span>Continue with Google</span>
              <ChevronRight className="w-5 h-5 ml-auto text-slate-400" />
            </>
          )}
        </Button>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-slate-500 text-sm leading-relaxed">
            Dengan melanjutkan, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi kami. Data Anda tidak akan pernah dijual kepada pihak ketiga.
          </p>
        </div>
      </div>
    </div>
  );
}
