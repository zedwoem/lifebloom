"use client";

import React, { useState, useEffect, useOptimistic, useRef } from 'react';
import { submitGuestbookAction } from '@/lib/actions/communityActions';
import { Button } from '@/components/ui/button';
import { Heart, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface GuestbookEntry {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export function RealtimeGuestbook({ 
  initialEntries = [], 
  isAuthenticated = false,
  locale = "en"
}: { 
  initialEntries?: GuestbookEntry[];
  isAuthenticated?: boolean;
  locale?: string;
}) {
  const [entries, setEntries] = useState<GuestbookEntry[]>(initialEntries);
  const formRef = useRef<HTMLFormElement>(null);
  const supabase = createClient();
  const router = useRouter();

  const [optimisticEntries, addOptimisticEntry] = useOptimistic(
    entries,
    (state, newEntry: GuestbookEntry) => [newEntry, ...state]
  );

  // PostgreSQL realtime broadcast subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:guestbook')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guestbook' }, (payload) => {
        const newRecord = payload.new as GuestbookEntry;
        setEntries((current) => {
          // Avoid duplicate entries if optimistic update already ran
          if (current.some(e => e.id === newRecord.id || (e.content === newRecord.content && e.author_name === newRecord.author_name))) {
            return current;
          }
          return [newRecord, ...current];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function handleAction(formData: FormData) {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }

    const content = formData.get('content') as string;
    if (!content || !content.trim()) return;

    const newEntry: GuestbookEntry = {
      id: Math.random().toString(),
      author_name: "Anda (Mengirim...)",
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    addOptimisticEntry(newEntry);
    formRef.current?.reset();

    const res = await submitGuestbookAction({ content: content.trim() });
    if (!res.success) {
      alert("Gagal mengirim pesan: " + res.error);
    }
  }

  return (
    <div className="bg-[#FFFDF5] p-6 md:p-10 rounded-3xl border border-[#dae2fd]/60 shadow-sm space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shadow-sm">
          <Heart className="w-6 h-6 fill-rose-600 text-rose-600" />
        </div>
        <div>
          <h3 
            className="text-xl md:text-2xl font-black text-slate-800 tracking-tight"
            style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}
          >
            Buku Tamu Komunitas
          </h3>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            Dinding dukungan moral. Bagikan pesan hangat dan semangat positif untuk lansia tepercaya kita!
          </p>
        </div>
      </div>

      {/* Auth-based interactive posting panel */}
      {isAuthenticated ? (
        <form ref={formRef} action={handleAction} className="flex flex-col sm:flex-row gap-3">
          <input 
            name="content" 
            type="text" 
            placeholder="Tuliskan pesan semangat singkat Anda disini..." 
            required 
            maxLength={100}
            className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-400 focus:outline-none h-[52px] font-semibold text-sm md:text-base shadow-sm transition-all"
            aria-label="Pesan Buku Tamu"
          />
          <Button 
            type="submit" 
            className="bg-rose-500 hover:bg-rose-600 text-white rounded-2xl h-[52px] px-8 font-black text-base shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Kirim Pesan
          </Button>
        </form>
      ) : (
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-slate-400 shrink-0" />
            <p className="text-sm font-semibold text-slate-600 text-center md:text-left leading-relaxed">
              Anda harus masuk untuk ikut menulis di Dinding Dukungan Buku Tamu.
            </p>
          </div>
          <button 
            onClick={() => router.push(`/${locale}/login?redirect=guestbook`)}
            className="w-full md:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-950 text-white font-black rounded-xl text-xs shadow-sm transition-all cursor-pointer min-h-[44px]"
          >
            Masuk / Register
          </button>
        </div>
      )}

      {/* Entries List */}
      <div 
        className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
        role="feed"
        aria-label="Pesan-pesan Dukungan Buku Tamu"
      >
        {optimisticEntries.map((entry) => (
          <div 
            key={entry.id} 
            className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-top-2 leading-relaxed"
          >
            <p className="text-slate-700 font-semibold text-sm md:text-base mb-3 italic">
              &ldquo;{entry.content}&rdquo;
            </p>
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">
              <span>— {entry.author_name}</span>
              <span>{new Date(entry.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        
        {optimisticEntries.length === 0 && (
          <p className="text-center text-slate-400 py-8 font-medium">
            Belum ada pesan yang disematkan. Jadilah yang pertama memberikan semangat hangat!
          </p>
        )}
      </div>

    </div>
  );
}
