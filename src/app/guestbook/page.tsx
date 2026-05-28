import React from 'react';
import { createServiceClient } from '@/lib/supabase/server';
import { RealtimeGuestbook } from '@/components/community/realtime-guestbook';
import { StructuredData } from '@/components/seo/StructuredData';
import { Metadata } from 'next';
import { Heart } from 'lucide-react';

const locale = "en";

export const revalidate = 0; // Dynamic server-side rendering for real-time guestbook entries

export async function generateMetadata({ 
  params 
}: { 
  params: any 
}): Promise<Metadata> {
  
  return {
    title: 'Community Support Guestbook | LifeBloom Hub',
    description: 'Share warm words, moral support, and positive encouragement for seniors in the LifeBloom Hub community wall.',
    alternates: {
      canonical: '/guestbook',
      languages: {
        'x-default': '/en/guestbook',
        'en': '/en/guestbook',
      }
    }
  };
}

export default async function GuestbookPage({
  params
}: {
  params: any
}) {
  
  const supabase = createServiceClient();

  // 1. Check if the current user has a secure authenticated session
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  // 2. Fetch initial guestbook entries with SSR
  const { data: entriesData } = await supabase
    .from('guestbook')
    .select('id, author_name, content, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  const initialEntries = entriesData || [];

  // 3. Compile high-fidelity Structured JSON-LD Data for E-E-A-T validation
  const guestbookSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'LifeBloom Hub Community Support Guestbook',
    description: 'A community wall of support and encouragement. Share your warm wishes with our beloved senior community!',
    publisher: {
      '@type': 'Organization',
      name: 'LifeBloom Hub',
      logo: {
        '@type': 'ImageObject',
        url: 'https://lifebloomhub.vercel.app/logo.png'
      }
    },
    comment: initialEntries.map(entry => ({
      '@type': 'Comment',
      text: entry.content,
      author: {
        '@type': 'Person',
        name: entry.author_name
      },
      dateCreated: entry.created_at
    }))
  };

  return (
    <>
      <StructuredData data={guestbookSchema as any} />
      
      <div className="bg-[#FFFDF5] min-h-screen pb-20 selection:bg-[#85f8c4] selection:text-[#002114]">
        
        {/* Banner Section */}
        <section className="bg-gradient-to-b from-rose-50/40 via-transparent to-transparent pt-12 pb-8">
          <div className="max-w-[1120px] mx-auto px-6 text-center space-y-4">
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-100/40 border border-rose-200/30 px-3.5 py-1.5 rounded-full inline-block">
              Community Interaction Engine
            </span>
            <h1 
              className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight"
              style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}
            >
              Senior Care Support Wall
            </h1>
            <p className="text-slate-500 text-base md:text-lg max-w-xl mx-auto leading-relaxed font-semibold">
              Share comforting words, encouragement, or warm messages to support the emotional well-being of seniors in our community.
            </p>
          </div>
        </section>

        {/* Dynamic Guestbook Wall container */}
        <main className="max-w-[800px] mx-auto px-6">
          <RealtimeGuestbook 
            initialEntries={initialEntries} 
            isAuthenticated={isAuthenticated}
            locale={locale}
          />
        </main>
      </div>
    </>
  );
}
