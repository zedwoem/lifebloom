"use client";

import { useTrackView } from '@/lib/hooks/useTrackView';
import { ContentType } from '@/lib/services/metricsService';

interface ViewTrackerProps {
  slug: string;
  type: ContentType;
  title: string;
  category: string;
}

export function ViewTracker({ slug, type, title, category }: ViewTrackerProps) {
  useTrackView(slug, type, title, category);
  return null; // This component renders nothing
}
