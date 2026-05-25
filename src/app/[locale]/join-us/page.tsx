import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';

export default async function JoinUsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  return (
    <div className="min-h-screen bg-warm-beige py-24">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <Sparkles className="w-16 h-16 text-emerald-500 mx-auto mb-8" />
        <h1 className="text-5xl font-black text-brand-blue mb-6 font-display tracking-tight">
          Welcome to the LifeBloom Family
        </h1>
        <p className="text-xl text-slate-600 mb-12 leading-relaxed">
          We&apos;re thrilled you&apos;re here. LifeBloom Hub is dedicated to empowering your journey with expertly curated advice on health, wealth, and lifestyle. By joining our community, you help shape the future of our platform.
        </p>
        
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 mb-12 text-left">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Why Create an Account?</h2>
          <ul className="space-y-4 text-slate-600">
            <li className="flex items-start gap-3">
              <Heart className="w-6 h-6 text-emerald-500 shrink-0" />
              <span><strong>Save Your Favorites:</strong> Bookmark articles, calculators, and videos to access them anytime.</span>
            </li>
            <li className="flex items-start gap-3">
              <Heart className="w-6 h-6 text-emerald-500 shrink-0" />
              <span><strong>Personalized Insights:</strong> Get recommendations based on your interests and mood.</span>
            </li>
            <li className="flex items-start gap-3">
              <Heart className="w-6 h-6 text-emerald-500 shrink-0" />
              <span><strong>Direct Support:</strong> Connect with our experts and community for guided help.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href={`/${locale}/login`}
            className="flex items-center gap-2 px-8 py-4 bg-brand-blue hover:bg-blue-800 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:-translate-y-1"
          >
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full font-bold text-lg transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
