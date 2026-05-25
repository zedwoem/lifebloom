"use client";

import React from "react";
import { useMounted } from "@/lib/hooks/useMounted";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientOnlyProps {
  children: React.ReactNode;
  fallbackHeight?: string; // e.g. "h-[400px]"
  fallbackWidth?: string; // e.g. "w-full"
  className?: string;
}

export function ClientOnly({ 
  children, 
  fallbackHeight = "h-[400px]", 
  fallbackWidth = "w-full",
  className = "" 
}: ClientOnlyProps) {
  const isMounted = useMounted();

  if (!isMounted) {
    return (
      <Skeleton className={`${fallbackHeight} ${fallbackWidth} ${className} rounded-xl`} />
    );
  }

  return <>{children}</>;
}
