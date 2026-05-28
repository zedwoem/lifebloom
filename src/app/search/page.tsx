"use client";

import { useSearchParams, useParams } from 'next/navigation';
import { searchIndex } from '@/components/ui/global-search';
import Fuse from 'fuse.js';
import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Search as SearchIcon } from 'lucide-react';

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const locale = "en";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const resolvedLocale = "en";
  
  const initialQuery = searchParams.get('q') || '';
  const [localQuery, setLocalQuery] = useState(initialQuery);
  const query = initialQuery;

  useEffect(() => {
    setLocalQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(localQuery)}`);
    }
  };

  const fuse = useMemo(() => new Fuse(searchIndex, {
    keys: ['title', 'category', 'tags'],
    threshold: 0.5,
    includeScore: true
  }), []);

  let results = query ? fuse.search(query) : [];

  // Fallback word matcher if no strict match
  if (query && results.length === 0) {
    const words = query.toLowerCase().split(' ').filter(w => w.length > 2);
    const fallback = searchIndex.filter(item => {
      return words.some(w => item.category.toLowerCase().includes(w)) || 
             words.some(w => item.tags.some(t => t.toLowerCase().includes(w))) ||
             words.some(w => item.title.toLowerCase().includes(w));
    });
    results = fallback.map((item, idx) => ({ item, refIndex: idx, score: 0.5 }));
  }

  return (
    <div className="min-h-[70vh] bg-background py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-500/10 rounded-2xl text-[#006948]">
              <SearchIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 font-display">Search Results</h1>
              <p className="text-slate-500 font-medium mt-1">
                {query ? `Showing results for "${query}"` : 'Discover our resources and tools.'}
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full max-w-2xl bg-white p-2 rounded-2xl border border-slate-200 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
            <SearchIcon className="w-5 h-5 text-slate-400 ml-3" />
            <input 
              type="text" 
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-slate-800 placeholder:text-slate-400"
            />
            <button type="submit" className="px-6 py-2.5 bg-[#006948] text-white font-bold rounded-xl hover:bg-[#005439] transition-colors">
              Search
            </button>
          </form>
        </div>

        {query && results.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 animate-fade-in">
            {results.map(({ item }) => {
              const targetUrl = item.url;
              return (
                <Link 
                  key={item.id}
                  href={targetUrl}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group"
                >
                <div>
                  <h3 className="text-xl font-bold text-brand-blue group-hover:text-brand-green-dark transition-colors mb-2">
                    {item.title}
                  </h3>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-brand-slate-light text-brand-slate text-xs font-bold uppercase tracking-wider rounded-lg">
                      {item.category}
                    </span>
                    {item.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-400 text-xs font-semibold rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-brand-slate-light rounded-xl group-hover:bg-brand-green group-hover:text-white transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Link>
              );
            })}
          </div>
        ) : query ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-700 mb-2">No exact matches found</h2>
            <p className="text-slate-500 mb-4">Try adjusting your keywords or browsing our categories.</p>
            <Link href="/" className="px-6 py-2 bg-emerald-100 text-emerald-800 rounded-full font-bold inline-block hover:bg-emerald-200 transition-colors">Go Home</Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-brand-blue font-bold text-xl">Loading search results...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
