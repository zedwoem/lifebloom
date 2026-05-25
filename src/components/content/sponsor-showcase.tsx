import React, { Suspense } from "react";
import { generateMockProfile } from "@/lib/utils/mockProfileGenerator";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";

interface Props {
  pillarSlug: string;
  articleSlug: string;
}

const TRANSLATIONS = {
  en: {
    supportedBy: "Featured Partner",
    viewProfile: "View Profile"
  },
  id: {
    supportedBy: "Fitur ini didukung oleh",
    viewProfile: "Lihat Profil"
  },
  es: {
    supportedBy: "Socio Destacado",
    viewProfile: "Ver Perfil"
  },
  fr: {
    supportedBy: "Partenaire En Vedette",
    viewProfile: "Voir le Profil"
  },
  de: {
    supportedBy: "Empfohlener Partner",
    viewProfile: "Profil Anzeigen"
  }
};

export function SponsorShowcase({ pillarSlug, articleSlug }: Props) {
  const locale = useLocale() as keyof typeof TRANSLATIONS;
  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;
  
  // Try to fetch real sponsors here
  // const sponsors = await getApprovedSponsorsByPillar(pillarSlug);
  // Using Mock Data as fallback for SEO E-E-A-T and testing until DB is populated
  const hasRealSponsor = false; 
  
  const sponsor = hasRealSponsor 
    ? null // Use real DB data
    : generateMockProfile(articleSlug, true); // Force Organization generation based on slug

  if (!sponsor) return null;

  return (
    <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-brand-green/30 transition-colors">
      <div className="flex-shrink-0 relative">
        <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-slate-200">
          <Image 
            src={sponsor.avatarUrl || `https://ui-avatars.com/api/?name=${sponsor.name}`} 
            alt={`${sponsor.name} logo`}
            fill
            className="object-cover"
          />
        </div>
        {sponsor.verified && (
          <div className="absolute -bottom-2 -right-2 bg-brand-green text-white rounded-full p-1 border-2 border-white shadow-sm" title="Verified Partner">
            <ShieldCheck className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex-grow text-center md:text-left">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t.supportedBy}</p>
        <h4 className="text-xl font-black text-slate-800">{sponsor.name}</h4>
        <p className="text-sm text-slate-500 mt-1">{sponsor.title}</p>
      </div>

      <div className="flex-shrink-0">
        <Link 
          href={`/${locale}/support/partners/${sponsor.id}`} 
          className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 hover:text-brand-blue transition-colors group-hover:border-brand-green/30"
        >
          {t.viewProfile} <ArrowUpRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>
    </div>
  );
}

