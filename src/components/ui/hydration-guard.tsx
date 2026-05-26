"use client";

import React, { useEffect, useState } from "react";

interface HydrationGuardProps {
  children: React.ReactNode;
  fallbackHeight?: string; // Tailwind class like "h-[200px]" or "h-[400px]"
}

export function HydrationGuard({ children, fallbackHeight = "h-48" }: HydrationGuardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        className={`w-full ${fallbackHeight} rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700 flex items-center justify-center`}
      >
        <span className="text-slate-400 text-sm font-semibold">Loading component...</span>
      </div>
    );
  }

  return <>{children}</>;
}
