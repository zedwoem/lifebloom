"use client";

import React, { useEffect, useState } from "react";
import { Plane, Calendar, ExternalLink, ArrowRight, ShieldCheck, MapPin } from "lucide-react";
import Link from "next/link";

interface FlightRate {
  airline: string;
  price: number;
  departure_at: string;
  direct: boolean;
  transfers: number;
  booking_url: string;
}

interface ContextualTravelDealsProps {
  origin?: string;
  destination?: string;
  title?: string;
  subtitle?: string;
}

export function ContextualTravelDeals({ 
  origin = "CGK", 
  destination = "DPS",
  title = "Accessible Senior Flights",
  subtitle = "Direct routes mapped for comfort and minimal transit time."
}: ContextualTravelDealsProps) {
  const [rates, setRates] = useState<FlightRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        // Only fetch direct flights for senior-friendly defaults
        const res = await fetch(`/api/travel/rates?origin=${origin}&destination=${destination}&direct=true`);
        if (!res.ok) throw new Error("Failed to fetch rates");
        const data = await res.json();
        setRates(data.rates || []);
      } catch (err) {
        console.error("Travel deals fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, [origin, destination]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  };

  if (error) return null; // Graceful degradation if API fails

  return (
    <div className="bg-white rounded-3xl p-6 border border-emerald-200/60 shadow-sm relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-50 rounded-full blur-2xl opacity-70 pointer-events-none" />
      
      <div className="relative z-10 mb-5 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center shadow-sm">
            <Plane className="w-4 h-4" />
          </div>
          <h3 className="font-black text-brand-blue font-display text-lg tracking-tight">
            {title}
          </h3>
        </div>
        <p className="text-xs text-slate-500 font-medium leading-relaxed flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {subtitle}
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          // Skeleton Loader
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-3 bg-slate-200 rounded w-16"></div>
              </div>
              <div className="h-6 bg-slate-200 rounded w-20"></div>
            </div>
          ))
        ) : rates.length > 0 ? (
          rates.slice(0, 3).map((rate, idx) => (
            <div key={idx} className="group flex items-center justify-between p-4 bg-[#FAF8F3] hover:bg-emerald-50 rounded-2xl border border-slate-200/50 hover:border-emerald-200 transition-all duration-300">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-800 text-sm">
                  {rate.airline}
                </span>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-600" /> {origin}-{destination}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(rate.departure_at)}</span>
                </div>
              </div>
              
              <Link 
                href={rate.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-end group-hover:scale-105 transition-transform"
              >
                <span className="text-brand-green font-black tracking-tight text-sm">
                  {formatPrice(rate.price)}
                </span>
                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                  Direct <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center p-4 bg-slate-50 rounded-2xl">
            <p className="text-xs text-slate-500 font-medium">No direct flights available right now.</p>
          </div>
        )}
      </div>

      <div className="mt-5">
        <Link 
          href={`/api/affiliate?vendor=travelpayouts&product_id=${origin}-${destination}&pillar=travel`}
          target="_blank"
          className="flex items-center justify-center w-full py-2.5 bg-white border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-black uppercase tracking-wider transition-all gap-2"
        >
          View All Accessible Flights <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
