import { Mail, PhoneCall, BookOpen, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function HelpdeskPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = createAdminClient();

  // Query documents dynamically from Supabase
  const { data: docs } = await supabase
    .from('support_documents')
    .select('slug, title, last_updated_at')
    .order('slug');

  return (
    <div className="animate-fade-in space-y-12">
      <div>
        <h1 className="text-4xl font-extrabold text-[#131b2e] mb-3 Atkinson-font" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
          Help Center & Legal Documents
        </h1>
        <p className="text-xl text-slate-500 font-medium">
          Find system manuals, privacy protection policies, and dynamic integration guides.
        </p>
      </div>

      {/* Dynamic Documentation Bento Grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider Atkinson-font">
          Official Documents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {docs?.map((doc) => {
            let icon = <BookOpen className="w-6 h-6" />;
            let desc = "Knowledge base and system manuals to maximize your LifeBloom experience.";
            let colorClass = "bg-indigo-50/70 border-indigo-100 hover:border-indigo-300 text-indigo-950";
            let iconBgClass = "bg-indigo-100 text-indigo-700";

            if (doc.slug === 'terms') {
              icon = <FileText className="w-6 h-6" />;
              desc = "Service agreements, content copyright, limitation of liability, and member rules.";
              colorClass = "bg-[#f5fff7] border-[#006948]/15 hover:border-[#006948]/40 text-[#006948]";
              iconBgClass = "bg-[#d8f3e5] text-[#006948]";
            } else if (doc.slug === 'privacy') {
              icon = <ShieldCheck className="w-6 h-6" />;
              desc = "Privacy policy, medical database confidentiality, calculator encryption, and GDPR compliance.";
              colorClass = "bg-orange-50/70 border-orange-100 hover:border-orange-300 text-[#904d00]";
              iconBgClass = "bg-orange-100 text-[#904d00]";
            }

            return (
              <Link 
                key={doc.slug}
                href={`/${locale}/support/${doc.slug}`}
                className={`border rounded-2xl p-6 hover:shadow-soft-ambient transition-all duration-200 flex flex-col justify-between group ${colorClass}`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-inner ${iconBgClass}`}>
                    {icon}
                  </div>
                  <h3 className="font-extrabold text-xl mb-2 Atkinson-font leading-tight">{doc.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mt-1">{desc}</p>
                </div>
                <div className="flex items-center gap-1 mt-6 text-sm font-bold text-slate-800 group-hover:translate-x-1 transition-transform">
                  Read More <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Support Methods */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider Atkinson-font">
          Contact Support Desk
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 flex items-start gap-4 hover:border-brand-green/30 transition-colors">
            <div className="p-3 bg-brand-blue/10 rounded-xl text-brand-blue shadow-inner shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Email Support</h3>
              <p className="text-slate-500 mt-1">Get comprehensive responses within 24 hours.</p>
              <p className="font-bold text-[#006948] mt-2">support@lifebloomhub.vercel.app</p>
            </div>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 flex items-start gap-4 hover:border-brand-green/30 transition-colors">
            <div className="p-3 bg-brand-green/10 rounded-xl text-[#006948] shadow-inner shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Phone Support</h3>
              <p className="text-slate-500 mt-1">Available Monday-Friday, 9:00 - 17:00 EST.</p>
              <p className="font-bold text-[#006948] mt-2">1-800-LIFE-BLOOM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable FAQs */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider Atkinson-font">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            { q: "How do I reset my password?", a: "Click on 'Forgot Password' on the login page and follow the instructions. A one-time verification link (OTP) will be sent to your email instantly." },
            { q: "Are all LifeBloom calculators 15% contingency safe?", a: "Yes, all calculators include official built-in contingency buffers (like a 15% budget buffer for the Home Renovator) to protect family assets from hidden costs." },
            { q: "How is my personal medical and financial data protected?", a: "Calculations run inside your local browser. Sensitive records are encrypted before they are saved to our Supabase database. We guarantee an absolute zero cookies/profile sales policy." }
          ].map((faq, idx) => (
            <details key={idx} className="group border border-slate-200 rounded-xl bg-white [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer p-4 font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors min-h-[52px]">
                {faq.q}
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="p-4 pt-0 text-slate-500 leading-relaxed border-t border-slate-100 mt-2 pt-4">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
