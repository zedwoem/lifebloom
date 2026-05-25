"use client";

import { useEffect, useRef } from 'react';
import { MetricsService, ContentType } from '@/lib/services/metricsService';
import { useAuth } from '@/lib/hooks/useAuth';

export function useTrackView(slug: string, type: ContentType, title: string, category: string) {
  const hasTracked = useRef(false);
  const { user } = useAuth();

  useEffect(() => {
    // Only track once per mount/session to prevent spam
    if (!hasTracked.current && slug && title) {
      hasTracked.current = true;
      
      // We can use a simple localStorage check to prevent spamming refresh on the same article
      const cacheKey = `viewed_${slug}`;
      const lastViewed = localStorage.getItem(cacheKey);
      const now = Date.now();
      
      // Only track if haven't viewed in the last 1 hour (3600000 ms)
      if (!lastViewed || now - parseInt(lastViewed) > 3600000) {
        MetricsService.recordView(slug, type, title, category, user?.id);
        localStorage.setItem(cacheKey, now.toString());
      }
    }
  }, [slug, type, title, category, user?.id]);
}
