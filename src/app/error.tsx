"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-lg border border-slate-100 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-4">We apologize, something went wrong</h1>
        <p className="text-slate-600 mb-8 leading-relaxed text-lg">
          Our system encountered a temporary hiccup. Don&apos;t worry, you haven&apos;t done anything wrong.
        </p>
        
        <div className="flex flex-col gap-4">
          <Button 
            onClick={() => reset()} 
            className="w-full h-14 text-lg font-bold bg-brand-green hover:bg-brand-green-dark text-white rounded-xl"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Try Again
          </Button>
          <Link 
            href="/"
            className="flex items-center justify-center w-full h-14 text-lg font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
