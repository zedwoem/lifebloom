import { getProfileFromId } from "@/lib/utils/profileGenerator";
import { notFound } from "next/navigation";
import { ShieldCheck, Award, ArrowLeft, Building2, UserCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const locale = "en";

export default async function ExpertProfilePage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params;
  const profile = getProfileFromId(slug);

  if (!profile) {
    notFound();
  }

  const isOrg = profile.entityType === 'institution' || profile.entityType === 'organization';

  return (
    <div className="animate-fade-in space-y-8 max-w-5xl mx-auto px-6 py-12">
      {/* Back Button */}
      <Link 
        href={``}
        className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-brand-blue transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
        Back to Home
      </Link>

      {/* Main Profile Header */}
      <div className="bg-gradient-to-br from-emerald-900 to-brand-green rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/20 bg-white/10 shadow-inner flex items-center justify-center shrink-0">
            <Image 
              src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`}
              alt={profile.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-grow">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider border border-white/30">
                {isOrg ? <Building2 className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                {profile.entityType || "Editorial Expert"}
              </span>
              {profile.verified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 text-blue-100 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Expert
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{profile.name}</h1>
            <p className="text-lg text-emerald-100 mt-1">{profile.title}</p>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* E-E-A-T Academic Index Metrics */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b pb-2">
            <Award className="w-5 h-5 text-brand-green" />
            Academic Credentials
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
              <span className="text-sm font-semibold text-slate-400 block uppercase">h-Index</span>
              <span className="text-3xl font-black text-slate-800 mt-1 block">{profile.hIndex || "N/A"}</span>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
              <span className="text-sm font-semibold text-slate-400 block uppercase">Citations</span>
              <span className="text-3xl font-black text-slate-800 mt-1 block">{profile.citationCount?.toLocaleString() || "N/A"}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4 leading-normal">
            Verified via Google Scholar API to maintain strict E-E-A-T guidelines for our wellness content.
          </p>
        </div>

        {/* Content Review Area */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="font-bold text-lg text-slate-800 mb-3">Editorial & Review Role</h3>
          <p className="text-slate-600 text-base leading-relaxed mb-6">
            This expert is part of the LifeBloom Hub editorial board. They review, fact-check, and author articles across our specialized pillars to ensure all health, financial, and lifestyle information is accurate and medically/financially sound.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-green mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-slate-800">E-E-A-T Trust & Safety Commitment</h4>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                Experts have no direct financial ties to the products reviewed unless explicitly stated in a conflict of interest disclosure. All medical claims are cross-referenced with peer-reviewed literature.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Actions */}
      <div className="flex flex-wrap gap-4 border-t pt-6">
        <Link 
          href={`/support/contact?ref=expert_${slug}`} 
          className="flex-grow md:flex-grow-0 px-6 py-3 bg-brand-green hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <span>Business Inquiry / Media Request</span>
          <ExternalLink className="w-4 h-4 opacity-70" />
        </Link>
        <Link href={`/support`} className="flex-grow md:flex-grow-0 px-6 py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center">
          Open Support Case
        </Link>
      </div>
    </div>
  );
}
