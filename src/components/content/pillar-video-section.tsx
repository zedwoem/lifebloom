import React from 'react';
import { createServiceClient } from '@/lib/supabase/server';
import { PillarVideoSectionClient } from './pillar-video-section-client';

const locale = "en";

interface PillarVideoSectionProps {
  pillarSlug: string;
  locale: string;
}

export async function PillarVideoSection({ pillarSlug, locale }: PillarVideoSectionProps) {
  const supabase = createServiceClient();

  // Query videos dynamically from Supabase matching this specific pillar category
  const { data: videos, error } = await supabase
    .from('videos')
    .select('id, title, embed_id, pillar, locale, description')
    .eq('pillar', pillarSlug)
    .eq('locale', locale)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error || !videos || videos.length === 0) {
    // Return empty if there are no videos yet (failsafe)
    return null;
  }

  const processedVideos = videos.map(v => ({
    id: v.id,
    title: v.title,
    embedId: v.embed_id ?? '',
    pillar: v.pillar,
    description: v.description || ("Comprehensive educational masterclass by LifeBloom Hub.")
  })).filter(v => v.embedId !== ''); // Filter video tanpa embed_id valid

  return (
    <PillarVideoSectionClient 
      videos={processedVideos} 
      locale={locale} 
    />
  );
}
