// src/components/affiliate/ContextualPartnerCard.tsx
// Renders a branded, senior-friendly affiliate placement card.
// Never renders affiliate credentials — uses the server-side proxy route.
import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import type { AffiliateNetwork } from '@/lib/services/affiliateService';

export interface ContextualPartnerCardProps {
  network: AffiliateNetwork;
  productId: string;
  title: string;
  description: string;
  ctaText?: string;
  placement: string;
  pillar: 'money' | 'travel' | 'senior' | 'pet' | 'home' | 'general';
  /** Optional: additional disclaimer text for regulatory compliance */
  disclaimer?: string;
}

export function ContextualPartnerCard({
  network,
  productId,
  title,
  description,
  ctaText = 'Explore Tool',
  placement,
  pillar,
  disclaimer,
}: ContextualPartnerCardProps) {
  // The proxy URL hides all credentials from the browser and ad-blockers
  const affiliateUrl =
    `/api/affiliate` +
    `?network=${encodeURIComponent(network)}` +
    `&product_id=${encodeURIComponent(productId)}` +
    `&pillar=${encodeURIComponent(pillar)}` +
    `&placement=${encodeURIComponent(placement)}`;

  return (
    <aside
      aria-label={`Sponsored: ${title}`}
      className="not-prose bg-[#f5fff7] border border-[#006948]/20 rounded-2xl p-6 md:p-8 shadow-sm my-8"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Verified Partner Badge */}
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck
              className="w-5 h-5 text-[#006948] shrink-0"
              aria-hidden="true"
            />
            <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
              Verified Partner
            </span>
          </div>

          <h3
            className="text-xl md:text-2xl font-bold text-slate-900 leading-snug mb-2"
            style={{ fontFamily: 'Atkinson Hyperlegible Next, sans-serif' }}
          >
            {title}
          </h3>

          <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-lg">
            {description}
          </p>

          {disclaimer && (
            <p className="mt-3 text-xs text-slate-400 italic">{disclaimer}</p>
          )}
        </div>

        {/* CTA — large tap target for seniors */}
        <Link
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group shrink-0 inline-flex items-center gap-2 bg-[#006948] text-white px-7 py-4 rounded-xl font-bold text-base hover:bg-[#004d34] active:scale-95 transition-all focus-visible:ring-4 focus-visible:ring-[#006948]/40 outline-none min-h-[56px]"
          aria-label={`${ctaText} — ${title} (opens in new tab)`}
        >
          {ctaText}
          <ArrowRight
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
            aria-hidden="true"
          />
        </Link>
      </div>
    </aside>
  );
}
