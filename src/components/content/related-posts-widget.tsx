"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Flame, Clock } from 'lucide-react';


export function RelatedPostsWidget({ currentSlug }: { currentSlug: string }) {
  const locale = "en";

  // Mock data for demonstration - in production, this would be fetched based on category/tags
  const previousPost = { title: "Essential Guide to Downsizing", slug: "essential-guide-downsizing" };
  const nextPost = { title: "Top 5 Low-Impact Exercises", slug: "low-impact-exercises" };

  const newAndPopular = [
    { title: "Medicare Part D Changes", slug: "the-new-medicare-part-d-changes-explained", isHot: true },
    { title: "Accessible European Cities", slug: "the-10-most-wheelchair-accessible-cities-in-europe", isHot: false },
    { title: "Building a Pet-Friendly Garden", slug: "pet-friendly-garden", isHot: true },
  ];

  return (
    <div className="mt-16 pt-8 border-t border-slate-200 print:hidden select-none">
      
      {/* Inline Related Posts (often injected mid-article, but placed here for structure) */}
      <div className="mb-12 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
        <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          Related Reading
        </h3>
        <ul className="space-y-3">
          {newAndPopular.slice(0, 2).map((post, idx) => (
            <li key={idx}>
              <Link href={`/${locale}/article/${post.slug}`} className="text-emerald-700 hover:text-emerald-900 font-medium hover:underline flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Previous / Next Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <Link href={`/${locale}/article/${previousPost.slug}`} className="group p-6 rounded-2xl border border-slate-200 hover:border-brand-green/50 hover:bg-slate-50 transition-all flex flex-col items-start text-left">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1 group-hover:text-brand-green">
            <ArrowLeft className="w-4 h-4" /> Previous
          </span>
          <span className="font-bold text-brand-blue group-hover:text-brand-green-dark">{previousPost.title}</span>
        </Link>
        <Link href={`/${locale}/article/${nextPost.slug}`} className="group p-6 rounded-2xl border border-slate-200 hover:border-brand-green/50 hover:bg-slate-50 transition-all flex flex-col items-end text-right">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1 group-hover:text-brand-green">
            Next <ArrowRight className="w-4 h-4" />
          </span>
          <span className="font-bold text-brand-blue group-hover:text-brand-green-dark">{nextPost.title}</span>
        </Link>
      </div>

      {/* New & Popular Sidebar / Widget */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 p-4 border-b border-slate-100">
          <h3 className="font-bold text-brand-blue flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            New & Popular
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {newAndPopular.map((post, idx) => (
            <Link key={idx} href={`/${locale}/article/${post.slug}`} className="block p-4 hover:bg-slate-50 transition-colors group">
              <h4 className="font-bold text-slate-700 group-hover:text-brand-blue text-sm mb-1 line-clamp-2">
                {post.title}
              </h4>
              <div className="flex items-center gap-2 mt-2">
                {post.isHot && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider rounded">Hot</span>}
                <span className="text-xs text-slate-400">3 min read</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
