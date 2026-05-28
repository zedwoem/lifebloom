'use client';

import React from 'react';
import Image from 'next/image';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import type { ScoredProduct } from '@/lib/services/contextualMatcherService';

interface ContextualPartnerCardProps {
  product: ScoredProduct;
  calculatorSlug?: string;
}

export function ContextualPartnerCard({ product, calculatorSlug = 'none' }: ContextualPartnerCardProps) {
  // Use proxy endpoint for auto tracking
  const proxyLink = `/api/affiliate?network=${product.network}&product_id=${product.network_product_id}&pillar=${product.pillar}&calculator_slug=${calculatorSlug}`;

  return (
    <div className="flex flex-col md:flex-row items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
      {/* Product Image Section */}
      <div className="w-full md:w-1/3 aspect-video md:aspect-square relative flex-shrink-0">
        <Image
          src={product.image_url || '/images/placeholders/partner.jpg'}
          alt={`Gambar rekomendasi ${product.name}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col justify-between w-full">
        <div>
          <div className="flex justify-between items-start gap-4 mb-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 leading-tight">
              {product.name}
            </h3>
            {product.is_recurring && (
              <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">
                Berlangganan
              </span>
            )}
          </div>
          
          <p className="text-slate-600 dark:text-slate-400 mb-4 text-base leading-relaxed">
            {product.description}
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <span className="font-semibold">Mengapa direkomendasikan:</span> 
              {product.reason}
            </p>
          </div>
        </div>

        {/* Action Button & Disclaimer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto border-t border-slate-100 dark:border-slate-800 pt-4">
          <a
            href={proxyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full sm:w-auto min-h-[48px] items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900"
            aria-label={`Pelajari lebih lanjut tentang ${product.name}`}
          >
            Lihat Penawaran <ExternalLink size={18} />
          </a>

          {/* Transparent Medical & Affiliate Disclaimer */}
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start sm:items-center gap-1.5 max-w-xs">
            <ShieldCheck size={14} className="flex-shrink-0 mt-0.5 sm:mt-0" />
            Ini adalah tautan mitra afiliasi tersertifikasi. Kami mungkin menerima komisi yang mendukung platform ini.
          </p>
        </div>
      </div>
    </div>
  );
}
