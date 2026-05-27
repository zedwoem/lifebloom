import React, { Suspense } from "react";
import { getPopularPostsByPillar, getRandomPostsByPillar, Article } from "@/lib/services/contentService";
import Link from "next/link";
import { Clock, TrendingUp, Sparkles, ChevronRight } from "lucide-react";

const locale = "en";

interface Props {
  pillarSlug: string;
  pillarName: string;
  locale: string;
}

// Sub-component for fetching and rendering Popular
async function PopularPosts({ pillarSlug, locale }: { pillarSlug: string, locale: string }) {
  const posts = await getPopularPostsByPillar(pillarSlug, 2);
  
  if (posts.length === 0) return <div className="text-slate-400 italic">No popular posts yet.</div>;

  return (
    <ul className="space-y-4">
      {posts.map(post => (
        <li key={post.id} className="group">
          <Link href={`/${locale}/article/${post.link.split('/').pop()}`} className="flex items-start gap-3">
            <div className="p-2 bg-rose-50 rounded-lg text-rose-500 group-hover:bg-rose-100 transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-brand-blue transition-colors line-clamp-2">
                {post.title}
              </h4>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-4 h-4" /> {new Date(post.pub_date || post.created_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// Sub-component for fetching and rendering Random/Discovery
async function DiscoveryPosts({ pillarSlug, locale }: { pillarSlug: string, locale: string }) {
  const posts = await getRandomPostsByPillar(pillarSlug, 2);
  
  if (posts.length === 0) return null;

  return (
    <ul className="space-y-4">
      {posts.map(post => (
        <li key={post.id} className="group">
          <Link href={`/${locale}/article/${post.link.split('/').pop()}`} className="flex items-start gap-3">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-500 group-hover:bg-amber-100 transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-brand-blue transition-colors line-clamp-2">
                {post.title}
              </h4>
              <p className="text-sm text-slate-500 mt-1">Discover something new</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2].map(i => (
        <div key={i} className="flex gap-3">
          <div className="w-9 h-9 bg-slate-100 rounded-lg shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-slate-100 rounded w-full" />
            <div className="h-5 bg-slate-100 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DynamicPillarCards({ pillarSlug, pillarName, locale }: Props) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden relative group">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <h3 className="text-2xl font-black text-slate-800">{pillarName}</h3>
        <Link href={`/${locale}/${pillarSlug}`} className="text-brand-blue font-bold flex items-center hover:underline">
          Jelajahi <ChevronRight className="w-5 h-5 ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Sedang Populer
          </h4>
          <Suspense fallback={<SkeletonList />}>
            <PopularPosts pillarSlug={pillarSlug} locale={locale} />
          </Suspense>
        </div>
        
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Mungkin Anda Suka
          </h4>
          <Suspense fallback={<SkeletonList />}>
            <DiscoveryPosts pillarSlug={pillarSlug} locale={locale} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
