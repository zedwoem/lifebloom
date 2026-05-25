import { Mail, MessageCircle, PhoneCall } from 'lucide-react';

export default function HelpdeskPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-black text-brand-blue mb-4">How can we help you?</h1>
      <p className="text-xl text-slate-500 mb-12">Search our knowledge base or contact our support team.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-start gap-4 hover:border-brand-green/30 transition-colors cursor-pointer">
          <div className="p-3 bg-brand-blue/10 rounded-xl text-brand-blue">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">Email Support</h3>
            <p className="text-slate-500 mt-1">Get a response within 24 hours.</p>
            <p className="font-semibold text-brand-blue mt-2">support@lifebloomhub.com</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-start gap-4 hover:border-brand-green/30 transition-colors cursor-pointer">
          <div className="p-3 bg-brand-green/10 rounded-xl text-brand-green-dark">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">Phone Support</h3>
            <p className="text-slate-500 mt-1">Available Mon-Fri, 9am - 5pm EST.</p>
            <p className="font-semibold text-brand-green-dark mt-2">1-800-LIFE-BLOOM</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-6">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {[
          { q: "How do I reset my password?", a: "Click on 'Forgot Password' on the login screen and follow the email instructions." },
          { q: "Are the calculators free to use?", a: "Yes, all our basic calculators are free. Premium users get access to save unlimited history." },
          { q: "How is my data protected?", a: "We use enterprise-grade encryption and never sell your personal data. Read our Privacy Policy for more details." }
        ].map((faq, idx) => (
          <details key={idx} className="group border border-slate-200 rounded-xl bg-white [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between cursor-pointer p-4 font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
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
  );
}
