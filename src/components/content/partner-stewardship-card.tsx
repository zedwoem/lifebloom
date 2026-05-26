import React from 'react';
import { Building2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PartnerStewardshipCardProps {
  sponsorName: string;
  sponsorLogoUrl?: string;
  stewardshipMessage: string;
  websiteUrl?: string;
}

export function PartnerStewardshipCard({ sponsorName, sponsorLogoUrl, stewardshipMessage, websiteUrl }: PartnerStewardshipCardProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 md:p-8 rounded-3xl border border-indigo-100 mt-12 mb-8">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
        
        {/* Sponsor Logo / Avatar */}
        <div className="w-20 h-20 shrink-0 bg-white rounded-2xl shadow-sm border border-indigo-50 flex items-center justify-center overflow-hidden">
          {sponsorLogoUrl ? (
            <img src={sponsorLogoUrl} alt={`Logo ${sponsorName}`} className="w-full h-full object-contain p-2" />
          ) : (
            <Building2 className="w-8 h-8 text-indigo-300" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
            <Building2 className="w-3.5 h-3.5" />
            Sponsor Edukasi
          </div>
          
          <h3 className="text-xl font-black text-slate-800 mb-2" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            Dipersembahkan oleh {sponsorName}
          </h3>
          
          <p className="text-slate-600 text-[16px] leading-relaxed mb-4">
            {stewardshipMessage}
          </p>

          {websiteUrl && (
            <Link 
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
            >
              Kunjungi Situs Web <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
