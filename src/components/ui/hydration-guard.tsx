"use client";

import React, { useEffect, useState, useRef } from "react";

interface HydrationGuardProps {
  children: React.ReactNode;
  fallbackHeight?: string; // Tailwind class like "h-[200px]" or "h-[400px]"
}

// Inactivity timeout constant: 15 minutes (15 * 60 * 1000 ms)
// Defined at module scope so it is stable across renders and satisfies
// react-hooks/exhaustive-deps without triggering unnecessary re-renders.
const INACTIVITY_LIMIT = 15 * 60 * 1000;

export function HydrationGuard({ children, fallbackHeight = "h-48" }: HydrationGuardProps) {
  const [mounted, setMounted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);

    // Ephemeral state keys to purge
    const sensitiveKeys = [
      "calculator_state",
      "lifebloom_saved_inputs",
      "temp_calculations",
      "last_search_query"
    ];

    const purgeSensitiveData = () => {
      console.log("[SESSION PURGE] Purging sensitive browser cache states due to inactivity/tab closure.");
      sensitiveKeys.forEach((key) => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch (e) {
          // Fail silently if storage is blocked
        }
      });
    };

    const resetInactivityTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(purgeSensitiveData, INACTIVITY_LIMIT);
    };

    // 1. Setup inactivity listeners
    const activityEvents = ["mousemove", "keydown", "touchstart", "scroll", "click"];
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Initialize timer on mount
    resetInactivityTimer();

    // 2. Setup tab closure protection
    window.addEventListener("beforeunload", purgeSensitiveData);

    return () => {
      // Clean up event listeners
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      window.removeEventListener("beforeunload", purgeSensitiveData);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!mounted) {
    return (
      <div 
        className={`w-full ${fallbackHeight} rounded-3xl bg-slate-50 border border-slate-100 animate-pulse flex items-center justify-center`}
      >
        <span className="text-slate-400 text-sm font-semibold Atkinson-font">Loading secure component...</span>
      </div>
    );
  }

  return <>{children}</>;
}
