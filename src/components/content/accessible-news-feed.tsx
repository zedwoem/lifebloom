"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Newspaper, ZoomIn, ZoomOut, Contrast, ExternalLink } from 'lucide-react';

const DUMMY_NEWS = {
  money: [
    { title: "Top 5 Strategies to Maximize Your Social Security Benefits", source: "AARP Finance", date: "May 24, 2026", snippet: "Delaying your claims might seem like a good idea, but here is what the math says for the average retiree." },
    { title: "Why High-Yield Savings Accounts Are Essential Right Now", source: "Forbes Advisor", date: "May 22, 2026", snippet: "With interest rates stabilizing, securing a high-yield account is critical for protecting cash against inflation." },
    { title: "Estate Planning 101: What You Need to Know", source: "Kiplinger", date: "May 20, 2026", snippet: "Ensure your assets are protected and your family is taken care of with these fundamental estate planning tips." },
    { title: "Navigating Medicare Advantage Open Enrollment", source: "Healthline", date: "May 18, 2026", snippet: "Don't miss the window to optimize your healthcare coverage for the upcoming year." },
    { title: "Downsizing Your Home in Retirement", source: "WSJ Real Estate", date: "May 15, 2026", snippet: "How to financially and emotionally prepare for moving to a smaller, more manageable space." }
  ],
  home: [
    { title: "Smart Home Gadgets That Make Aging in Place Safer", source: "SmartHome Weekly", date: "May 25, 2026", snippet: "From voice-activated lights to smart locks, these devices provide peace of mind for both seniors and their families." },
    { title: "Bathroom Renovation Grants for Seniors", source: "Housing Authority", date: "May 20, 2026", snippet: "Discover federal and state grants available to help cover the costs of installing grab bars and walk-in tubs." },
    { title: "Best Anti-Slip Flooring Options", source: "HomeAdvisor", date: "May 18, 2026", snippet: "Prevent falls with these highly-rated, affordable flooring solutions designed for safety." },
    { title: "DIY Home Accessibility Hacks", source: "Family Handyman", date: "May 15, 2026", snippet: "Simple, low-cost modifications you can make this weekend to improve home safety." },
    { title: "Choosing the Right Stairlift", source: "Consumer Reports", date: "May 12, 2026", snippet: "A comprehensive guide to comparing models, pricing, and installation requirements." }
  ],
  pet: [
    { title: "Why Senior Dogs Make the Best Companions for Retirees", source: "PetFinder Blog", date: "May 23, 2026", snippet: "Skip the puppy phase! Older dogs offer calm temperaments and are often already trained." },
    { title: "Managing Arthritis in Older Cats", source: "Feline Health Monthly", date: "May 18, 2026", snippet: "Simple dietary changes and environment adjustments can drastically improve your senior cat's quality of life." },
    { title: "Affordable Pet Insurance for Senior Pets", source: "NerdWallet", date: "May 15, 2026", snippet: "How to find coverage that won't break the bank when your furry friend reaches their golden years." },
    { title: "Top 10 Low-Maintenance Pets for Seniors", source: "AKC", date: "May 10, 2026", snippet: "Looking for companionship without the high energy demands? Consider these wonderful breeds." },
    { title: "Dietary Needs of Aging Dogs", source: "VetStreet", date: "May 05, 2026", snippet: "What to look for in senior dog food to support cognitive function and joint health." }
  ],
  senior: [
    { title: "The New Medicare Part D Changes Explained", source: "Healthline", date: "May 25, 2026", snippet: "Understanding the new out-of-pocket maximums and how they affect your monthly prescription costs." },
    { title: "Daily Exercises to Improve Balance and Prevent Falls", source: "SilverSneakers", date: "May 21, 2026", snippet: "A 10-minute daily routine that strengthens your core and improves spatial awareness." },
    { title: "Eating for Cognitive Health", source: "Mayo Clinic", date: "May 18, 2026", snippet: "Discover the MIND diet and how specific foods can protect against dementia and Alzheimer's." },
    { title: "Social Connections and Longevity", source: "Harvard Health", date: "May 15, 2026", snippet: "Why maintaining strong friendships is just as important as diet and exercise for a long, healthy life." },
    { title: "Managing Multiple Medications Safely", source: "AARP Health", date: "May 10, 2026", snippet: "Tips and tools for keeping track of your prescriptions and avoiding dangerous interactions." }
  ],
  travel: [
    { title: "The 10 Most Wheelchair-Accessible Cities in Europe", source: "Accessible Journeys", date: "May 24, 2026", snippet: "From smooth pavements in Barcelona to accessible trams in Vienna, plan your next seamless European adventure." },
    { title: "TSA Guidelines for Traveling with Medical Equipment", source: "Travel & Leisure", date: "May 19, 2026", snippet: "Know your rights and prepare your documents before heading to the airport with CPAP machines or oxygen tanks." },
    { title: "Best Cruises for Seniors with Limited Mobility", source: "Cruise Critic", date: "May 15, 2026", snippet: "A breakdown of the cruise lines offering the best accessible cabins and onboard amenities." },
    { title: "Tips for Road Tripping with Seniors", source: "AAA Travel", date: "May 10, 2026", snippet: "How to plan frequent stops, pack essential medical supplies, and ensure a comfortable ride." },
    { title: "Navigating National Parks in a Wheelchair", source: "NPS Guide", date: "May 05, 2026", snippet: "A guide to the most accessible trails and facilities in America's stunning national parks." }
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
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors focus:ring-2 focus:ring-brand-blue ${fontSize === 'normal' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
            aria-label="Normal font size"
          >
            A
          </button>
          <button 
            onClick={() => setFontSize('large')}
            className={`px-3 py-1.5 rounded-lg text-lg font-bold transition-colors focus:ring-2 focus:ring-brand-blue ${fontSize === 'large' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
            aria-label="Large font size"
          >
            A
          </button>
          <button 
            onClick={() => setFontSize('xlarge')}
            className={`px-3 py-1.5 rounded-lg text-xl font-bold transition-colors focus:ring-2 focus:ring-brand-blue ${fontSize === 'xlarge' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
            aria-label="Extra large font size"
          >
            A
          </button>
          <div className="w-px h-6 bg-current/20 mx-2"></div>
          <button 
            onClick={() => setHighContrast(!highContrast)}
            className={`p-2 rounded-lg transition-colors focus:ring-2 focus:ring-brand-blue ${highContrast ? 'bg-white text-black shadow-sm' : 'hover:bg-white/50'}`}
            aria-label="Toggle High Contrast Mode"
            title="Toggle High Contrast"
          >
            <Contrast className="w-5 h-5" />
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, idx) => (
          <Link 
            key={idx} 
            href={`/en/article/${encodeURIComponent(article.title.replace(/\s+/g, '-').toLowerCase())}`}
            className={`block focus:outline-none focus:ring-4 focus:ring-brand-blue rounded-2xl ${idx === 0 ? 'md:col-span-2 lg:col-span-2' : ''}`}
          >
            <article 
              className={`p-6 rounded-2xl h-full transition-all cursor-pointer group flex flex-col justify-between ${cardClasses} ${idx === 0 ? 'md:p-8 bg-gradient-to-br from-slate-50 to-emerald-50/50' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm font-bold uppercase tracking-wider ${highContrast ? 'text-yellow-300' : 'text-brand-green-dark'} ${idx === 0 ? 'bg-brand-green/10 px-3 py-1 rounded-full' : ''}`}>
                    {idx === 0 ? '🔥 Featured • ' + article.source : article.source}
                  </span>
                  <span className={`text-sm opacity-70`}>{article.date}</span>
                </div>
                <h3 className={`font-bold mb-3 ${idx === 0 ? 'text-2xl md:text-3xl' : titleFontClasses[fontSize]}`}>
                  {article.title}
                </h3>
                <p className={`${idx === 0 ? 'text-lg' : fontClasses[fontSize]} opacity-80 leading-relaxed mb-6`}>
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
