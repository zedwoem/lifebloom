"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, ZoomIn, ZoomOut, Contrast, ExternalLink } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

export function AccessibleNewsFeed({ pillarSlug }: { pillarSlug: string }) {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from('canonical_articles')
        .select('*')
        .eq('pillar', pillarSlug)
        .order('published_at', { ascending: false })
        .limit(5);
      
      if (data) {
        setArticles(data.map(d => ({
          title: d.title,
          source: d.source_domain || 'LifeBloom Hub',
          date: new Date(d.published_at || d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          snippet: d.description || d.content?.substring(0, 100) + '...',
          slug: d.slug
        })));
      }
      setIsLoading(false);
    };
    fetchArticles();
  }, [pillarSlug]);

  const fontClasses = {
    normal: 'text-base',
    large: 'text-xl',
    xlarge: 'text-2xl'
  };

  const titleFontClasses = {
    normal: 'text-xl',
    large: 'text-2xl',
    xlarge: 'text-3xl'
  };

  const containerClasses = highContrast 
    ? 'bg-black text-yellow-300 border-2 border-yellow-300' 
    : 'bg-white text-slate-800 border border-slate-200';

  const cardClasses = highContrast
    ? 'bg-gray-900 border border-yellow-300 hover:bg-gray-800'
    : 'bg-slate-50 border border-slate-100 hover:border-brand-green/30';

  return (
    <div className={`mt-16 rounded-3xl p-8 shadow-sm transition-colors duration-300 ${containerClasses}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6 border-current/20">
        
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${highContrast ? 'bg-yellow-300 text-black' : 'bg-brand-blue/10 text-brand-blue'}`}>
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Latest {pillarSlug.charAt(0).toUpperCase() + pillarSlug.slice(1)} News</h2>
            <p className={`opacity-80 ${highContrast ? 'text-yellow-300' : 'text-slate-500'}`}>Curated updates tailored for you.</p>
          </div>
        </div>

        {/* ACCESSIBILITY CONTROLS */}
        <div className="flex items-center gap-2 bg-black/5 p-2 rounded-2xl">
          <button 
            onClick={() => setFontSize('normal')}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors focus:ring-2 focus:ring-brand-blue ${fontSize === 'normal' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
            aria-label="Normal font size"
          >
            A
          </button>
          <button 
            onClick={() => setFontSize('large')}
            className={`px-3 py-1.5 rounded-lg text-lg font-bold transition-colors focus:ring-2 focus:ring-brand-blue ${fontSize === 'large' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
            aria-label="Large font size"
          >
            A
          </button>
          <button 
            onClick={() => setFontSize('xlarge')}
            className={`px-3 py-1.5 rounded-lg text-xl font-bold transition-colors focus:ring-2 focus:ring-brand-blue ${fontSize === 'xlarge' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
            aria-label="Extra large font size"
          >
            A
          </button>
          <div className="w-px h-6 bg-current/20 mx-2"></div>
          <button 
            onClick={() => setHighContrast(!highContrast)}
            className={`p-2 rounded-lg transition-colors focus:ring-2 focus:ring-brand-blue ${highContrast ? 'bg-white text-black shadow-sm' : 'hover:bg-white/50'}`}
            aria-label="Toggle High Contrast Mode"
            title="Toggle High Contrast"
          >
            <Contrast className="w-5 h-5" />
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10 opacity-70">
            Loading articles...
          </div>
        ) : articles.length === 0 ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10 opacity-70">
            No articles found for {pillarSlug}.
          </div>
        ) : articles.map((article, idx) => (
          <Link 
            key={idx} 
            href={`/article/${article.slug || encodeURIComponent(article.title.replace(/\s+/g, '-').toLowerCase())}`}
            className={`block focus:outline-none focus:ring-4 focus:ring-brand-blue rounded-2xl ${idx === 0 ? 'md:col-span-2 lg:col-span-2' : ''}`}
          >
            <article 
              className={`p-6 rounded-2xl h-full transition-all cursor-pointer group flex flex-col justify-between ${cardClasses} ${idx === 0 ? 'md:p-8 bg-gradient-to-br from-slate-50 to-emerald-50/50' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm font-bold uppercase tracking-wider ${highContrast ? 'text-yellow-300' : 'text-brand-green-dark'} ${idx === 0 ? 'bg-brand-green/10 px-3 py-1 rounded-full' : ''}`}>
                    {idx === 0 ? '🔥 Featured • ' + article.source : article.source}
                  </span>
                  <span className={`text-sm opacity-70`}>{article.date}</span>
                </div>
                <h3 className={`font-bold mb-3 ${idx === 0 ? 'text-2xl md:text-3xl' : titleFontClasses[fontSize]}`}>
                  {article.title}
                </h3>
                <p className={`${idx === 0 ? 'text-lg' : fontClasses[fontSize]} opacity-80 leading-relaxed mb-6`}>
                  {article.snippet}
                </p>
              </div>
              <div className={`inline-flex items-center font-bold ${highContrast ? 'text-yellow-300' : 'text-brand-blue group-hover:text-brand-green transition-colors'}`}>
                Read Article <ExternalLink className="w-4 h-4 ml-2" />
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
