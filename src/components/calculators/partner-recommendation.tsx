"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";

interface Placement {
  id: string;
  partner_name: string;
  logo_url: string;
  target_url: string;
  pinned_calculator: string;
  pinned_row_position: number;
}

interface PartnerRecommendationProps {
  calculatorSlug: string;
}

export function PartnerRecommendation({ calculatorSlug }: PartnerRecommendationProps) {
  const [placement, setPlacement] = useState<Placement | null>(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlacement() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("b2b_placements")
          .select("id, partner_name, logo_url, target_url, pinned_calculator, pinned_row_position")
          .eq("is_active", true)
          .eq("pinned_calculator", calculatorSlug)
          .order("pinned_row_position", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setPlacement(data as Placement);
        }
      } catch (err) {
        console.error("Failed to load partner recommendation:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlacement();
  }, [calculatorSlug]);

  if (loading || !placement) return null;

  // Build the redirection link through the secure obfuscated path
  const redirectUrl = `/api/affiliate?vendor=b2b&product_id=${placement.id}${user?.id ? `&user_id=${user.id}` : ""}`;

  return (
    <div 
      className="my-6 p-5 bg-gradient-to-r from-emerald-50/70 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:border-emerald-200 dark:hover:border-emerald-800/50"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 p-2 flex items-center justify-center border border-slate-100 dark:border-slate-700/50 shadow-sm shrink-0">
          {/* Using custom partner logo URL to avoid adblock patterns */}
          <img 
            src={placement.logo_url} 
            alt={placement.partner_name} 
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback icon if image fails
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>
        <div>
          <p className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">
            Featured Partner Recommendation
          </p>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            {placement.partner_name}
          </h4>
        </div>
      </div>
      
      <a 
        href={redirectUrl} 
        target="_blank" 
        rel="nofollow noopener noreferrer"
        className="px-5 py-2.5 bg-brand-green hover:bg-brand-green-dark text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow hover:scale-[1.02] flex items-center justify-center min-h-[48px] min-w-[120px] text-center"
      >
        Learn More
      </a>
    </div>
  );
}
