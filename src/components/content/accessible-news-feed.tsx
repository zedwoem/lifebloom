"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Newspaper, ZoomIn, ZoomOut, Contrast, ExternalLink } from 'lucide-react';

const DUMMY_NEWS = {
  money: [
    { title: "Top 5 Strategies to Maximize Your Social Security Benefits", source: "AARP Finance", date: "May 24, 2026", snippet: "Delaying your claims might seem like a good idea, but here is what the math says for the average retiree." },
    { title: "Why High-Yield Savings Accounts Are Essential Right Now", source: "Forbes Advisor", date: "May 22, 2026", snippet: "With interest rates stabilizing, securing a high-yield account is critical for protecting cash against inflation." },
  ],
  home: [
    { title: "Smart Home Gadgets That Make Aging in Place Safer", source: "SmartHome Weekly", date: "May 25, 2026", snippet: "From voice-activated lights to smart locks, these devices provide peace of mind for both seniors and their families." },
    { title: "Bathroom Renovation Grants for Seniors", source: "Housing Authority", date: "May 20, 2026", snippet: "Discover federal and state grants available to help cover the costs of installing grab bars and walk-in tubs." }
  ],
  pet: [
    { title: "Why Senior Dogs Make the Best Companions for Retirees", source: "PetFinder Blog", date: "May 23, 2026", snippet: "Skip the puppy phase! Older dogs offer calm temperaments and are often already trained." },
    { title: "Managing Arthritis in Older Cats", source: "Feline Health Monthly", date: "May 18, 2026", snippet: "Simple dietary changes and environment adjustments can drastically improve your senior cat's quality of life." }
  ],
  senior: [
    { title: "The New Medicare Part D Changes Explained", source: "Healthline", date: "May 25, 2026", snippet: "Understanding the new out-of-pocket maximums and how they affect your monthly prescription costs." },
    { title: "Daily Exercises to Improve Balance and Prevent Falls", source: "SilverSneakers", date: "May 21, 2026", snippet: "A 10-minute daily routine that strengthens your core and improves spatial awareness." }
  ],
  travel: [
    { title: "The 10 Most Wheelchair-Accessible Cities in Europe", source: "Accessible Journeys", date: "May 24, 2026", snippet: "From smooth pavements in Barcelona to accessible trams in Vienna, plan your next seamless European adventure." },
    { title: "TSA Guidelines for Traveling with Medical Equipment", source: "Travel & Leisure", date: "May 19, 2026", snippet: "Know your rights and prepare your documents before heading to the airport with CPAP machines or oxygen tanks." }
  ]
};

export function AccessibleNewsFeed({ pillarSlug }: { pillarSlug: string }) {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState(false);

  // Fallback to money if the slug doesn't exist in dummy data
  const articles = DUMMY_NEWS[pillarSlug as keyof typeof DUMMY_NEWS] || DUMMY_NEWS.money;

  const fontClasses = {
    normal: 'text-base',
    large: 'text-xl',
    xlarge: 'text-2xl'
  };

  const titleFontClasses = {
    normal: 'text-xl',
    large: 'text-2xl',
    xlarge: 'text-3xl'
  };

  const containerClasses = highContrast 
    ? 'bg-black text-yellow-300 border-2 border-yellow-300' 
    : 'bg-white text-slate-800 border border-slate-200';

  const cardClasses = highContrast
    ? 'bg-gray-900 border border-yellow-300 hover:bg-gray-800'
    : 'bg-slate-50 border border-slate-100 hover:border-brand-green/30';

  return (
    <div className={`mt-16 rounded-3xl p-8 shadow-sm transition-colors duration-300 ${containerClasses}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6 border-current/20">
        
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${highContrast ? 'bg-yellow-300 text-black' : 'bg-brand-blue/10 text-brand-blue'}`}>
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Latest {pillarSlug.charAt(0).toUpperCase() + pillarSlug.slice(1)} News</h2>
            <p className={`opacity-80 ${highContrast ? 'text-yellow-300' : 'text-slate-500'}`}>Curated updates tailored for you.</p>
          </div>
        </div>

        {/* ACCESSIBILITY CONTROLS */}
        <div className="flex items-center gap-2 bg-black/5 p-2 rounded-2xl">
          <button 
            onClick={() => setFontSize('normal')}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${fontSize === 'normal' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
          >
            A
          </button>
          <button 
            onClick={() => setFontSize('large')}
            className={`px-3 py-1.5 rounded-lg text-lg font-bold transition-colors ${fontSize === 'large' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
          >
            A
          </button>
          <button 
            onClick={() => setFontSize('xlarge')}
            className={`px-3 py-1.5 rounded-lg text-xl font-bold transition-colors ${fontSize === 'xlarge' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
          >
            A
          </button>
          <div className="w-px h-6 bg-current/20 mx-2"></div>
          <button 
            onClick={() => setHighContrast(!highContrast)}
            className={`p-2 rounded-lg transition-colors ${highContrast ? 'bg-white text-black shadow-sm' : 'hover:bg-white/50'}`}
            title="Toggle High Contrast"
          >
            <Contrast className="w-5 h-5" />
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article, idx) => (
          <Link 
            key={idx} 
            href={`/en/article/${encodeURIComponent(article.title.replace(/\s+/g, '-').toLowerCase())}`}
            className="block focus:outline-none focus:ring-4 focus:ring-brand-blue rounded-2xl"
          >
            <article 
              className={`p-6 rounded-2xl h-full transition-all cursor-pointer group flex flex-col justify-between ${cardClasses}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm font-bold uppercase tracking-wider ${highContrast ? 'text-yellow-300' : 'text-brand-green-dark'}`}>
                    {article.source}
                  </span>
                  <span className={`text-sm opacity-70`}>{article.date}</span>
                </div>
                <h3 className={`font-bold mb-3 ${titleFontClasses[fontSize]}`}>
                  {article.title}
                </h3>
                <p className={`${fontClasses[fontSize]} opacity-80 leading-relaxed mb-6`}>
                  {article.snippet}
                </p>
              </div>
              <div className={`inline-flex items-center font-bold ${highContrast ? 'text-yellow-300' : 'text-brand-blue group-hover:text-brand-green transition-colors'}`}>
                Read Article <ExternalLink className="w-4 h-4 ml-2" />
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
