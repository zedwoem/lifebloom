import React from 'react';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { DynamicNewsFeedClient } from './dynamic-news-feed-client';

interface DynamicNewsFeedProps {
  pillarSlug: string;
  locale: string;
}

export async function DynamicNewsFeed({ pillarSlug, locale }: DynamicNewsFeedProps) {
  const supabase = createServiceClient();
  
  // 1. Fetch canonical articles for this pillar
  const { data: canonicalArticles, error } = await supabase
    .from('canonical_articles')
    .select('id, title, slug, published_at, pillar')
    .eq('pillar', pillarSlug)
    .order('published_at', { ascending: false })
    .limit(6);

  if (error || !canonicalArticles || canonicalArticles.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-3xl">
        <p className="text-slate-500 font-bold">
          {locale === 'id' ? 'Belum ada artikel. Jalankan Cron Ingest untuk menarik artikel.' : 'No articles available yet. Run the Cron Ingest to populate articles.'}
        </p>
      </div>
    );
  }

  // 2. Fetch translations for these articles in the current locale
  const articleIds = canonicalArticles.map(a => a.id);
  const { data: translations } = await supabase
    .from('translated_articles')
    .select('article_id, title_translated, content_html_translated')
    .eq('locale', locale)
    .in('article_id', articleIds);

  const translationMap = new Map<string, string>(
    (translations || [])
      .filter((t): t is typeof t & { article_id: string } => t.article_id !== null)
      .map(t => [t.article_id, t.title_translated])
  );

  // 3. Map articles to localized title and descriptions
  const processedArticles = canonicalArticles.map((article, idx) => {
    const translatedTitle = translationMap.get(article.id) || article.title;
    
    // Create a readable formatted date
    const dateObj = new Date(article.published_at ?? new Date().toISOString());
    const dateStr = dateObj.toLocaleDateString(
      locale === 'id' ? 'id-ID' : 'en-US',
      { month: 'long', day: 'numeric', year: 'numeric' }
    );

    return {
      id: article.id,
      title: translatedTitle,
      source: "LifeBloom Curation",
      date: dateStr,
      slug: article.slug,
      snippet: locale === 'id' 
        ? `Panduan mendalam mengenai ${translatedTitle.toLowerCase()} khusus lansia dan keluarga.`
        : `A detailed senior-focused advisory on ${translatedTitle.toLowerCase()}.`
    };
  });

  return (
    <DynamicNewsFeedClient 
      articles={processedArticles} 
      locale={locale} 
      pillarSlug={pillarSlug} 
    />
  );
}
