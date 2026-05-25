"use client";

import { ReactNode } from "react";
import { useMounted } from "@/lib/hooks/useMounted";

interface HydrationGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function HydrationGuard({ children, fallback = null }: HydrationGuardProps) {
  const isMounted = useMounted();

  if (!isMounted) {
    return fallback;
  }

  return <>{children}</>;
}
