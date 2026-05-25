"use client";

import React, { useTransition } from "react";
import Image from "next/image";
import { useSavedItems } from "@/lib/hooks/useSavedItems";
import { useAuth } from "@/lib/hooks/useAuth";
import { Heart, ExternalLink } from "lucide-react";

interface ProductCardProps {
  id: string;
  slug: string;
  pillar: "home" | "money" | "pet" | "senior" | "travel";
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  currency: string;
  image_url: string | null;
  vendor: string;
  rating: number | null;
  reviews_count: number;
}

export default function ProductCard({
  id,
  slug,
  pillar,
  name,
  description,
  price,
  original_price,
  currency = "USD",
  image_url,
  vendor,
  rating,
  reviews_count,
}: ProductCardProps) {
  const { user } = useAuth();
  const { isSaved, toggleSaveItem } = useSavedItems();
  const [isPending, startTransition] = useTransition();

  const saved = isSaved("product", id);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    startTransition(async () => {
      await toggleSaveItem("product", id, { name, slug, pillar, price, vendor });
    });
  };

  // Format currency dynamically based on target senior readability
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getPillarLabel = () => {
    switch (pillar) {
      case "home": return "Home Safety";
      case "money": return "Money Planner";
      case "pet": return "Pet Companions";
      case "senior": return "Senior Wellness";
      case "travel": return "Accessible Travel";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col min-h-[420px]">
      {/* 1. Product Image Section */}
      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50 font-semibold select-none">
            {getPillarLabel()}
          </div>
        )}
        
        {/* Pillar Tag Indicator */}
        <span className="absolute top-3 left-3 bg-brand-blue text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
          {getPillarLabel()}
        </span>

        {/* Heart Wishlist Toggle Button (Elderly Compliant 48x48px Touch Target) */}
        {user && (
          <button
            onClick={handleSaveToggle}
            disabled={isPending}
            aria-label={saved ? "Remove from saved list" : "Save to favorites"}
            className={`absolute top-3 right-3 w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white border shadow-sm ${
              saved
                ? "border-red-200 text-red-500 bg-red-50"
                : "border-slate-200 text-slate-400 hover:text-slate-600"
            }`}
          >
            <Heart className={`w-6 h-6 ${saved ? "fill-current" : ""}`} />
          </button>
        )}
      </div>

      {/* 2. Product Detail Context Section */}
      <div className="p-6 flex flex-col flex-grow">
        <header className="mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{vendor}</span>
          <h3 className="text-xl font-bold text-slate-900 leading-snug line-clamp-2 mt-1">{name}</h3>
        </header>

        {/* Rating stars if available */}
        {rating && (
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-yellow-500 text-base">★</span>
            <span className="text-sm font-bold text-slate-700">{rating}</span>
            <span className="text-xs text-slate-400">({reviews_count} reviews)</span>
          </div>
        )}

        <p className="text-slate-600 text-base line-clamp-3 mb-6 leading-relaxed">
          {description || "Discover high-quality, specialized products tailored for safety and elderly comfort."}
        </p>

        {/* 3. Footer: Pricing and Call To Action */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            {original_price && original_price > price && (
              <span className="text-sm text-slate-400 line-through leading-none mb-1">
                {formatPrice(original_price)}
              </span>
            )}
            <span className="text-2xl font-black text-brand-green leading-none">
              {formatPrice(price)}
            </span>
          </div>

          {/* Masked Redirect URL Link Anchor (Elderly compliant size) */}
          <a
            href={`/api/affiliate/${slug}${user ? `?user_id=${user.id}` : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 bg-brand-green text-white font-bold rounded-xl flex items-center gap-2 hover:bg-green-800 transition-colors focus:ring-4 focus:ring-green-300 min-h-[48px]"
          >
            <span>Cek Harga</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
