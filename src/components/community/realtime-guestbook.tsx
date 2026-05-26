"use client";

import React, { useState, useEffect, useOptimistic, useRef } from 'react';
import { submitGuestbookAction } from '@/lib/actions/communityActions';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface GuestbookEntry {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export function RealtimeGuestbook({ initialEntries = [] }: { initialEntries?: GuestbookEntry[] }) {
  const [entries, setEntries] = useState<GuestbookEntry[]>(initialEntries);
  const formRef = useRef<HTMLFormElement>(null);
  const supabase = createClient();

  const [optimisticEntries, addOptimisticEntry] = useOptimistic(
    entries,
    (state, newEntry: GuestbookEntry) => [newEntry, ...state]
  );

  useEffect(() => {
    const channel = supabase
      .channel('public:guestbook')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guestbook' }, (payload) => {
        const newRecord = payload.new as GuestbookEntry;
        setEntries((current) => {
          // Prevent duplicates if optimistic UI already added it (naive check by content+author)
          if (current.some(e => e.content === newRecord.content && e.author_name === newRecord.author_name)) {
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
    const content = formData.get('content') as string;

    const newEntry: GuestbookEntry = {
      id: Math.random().toString(),
      author_name: "Anda (Mengirim...)",
      content,
      created_at: new Date().toISOString(),
    };

    addOptimisticEntry(newEntry);
    formRef.current?.reset();

    const res = await submitGuestbookAction({ content });
    if (!res.success) {
      alert("Gagal mengirim: " + res.error);
    }
  }

  return (
    <div className="bg-[#FFFDF5] p-6 md:p-10 rounded-3xl border border-[#dae2fd] shadow-soft-ambient">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-800" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            Buku Tamu Interaktif
          </h3>
          <p className="text-slate-500">Tinggalkan pesan positif untuk komunitas lansia kita.</p>
        </div>
      </div>

      <form ref={formRef} action={handleAction} className="flex gap-3 mb-10">
        <input 
          name="content" 
          type="text" 
          placeholder="Tulis pesan semangat singkat..." 
          required 
          maxLength={500}
          className="flex-1 p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 h-[52px] shadow-sm"
        />
        <Button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-[52px] px-8 font-bold text-base shadow-md">
          Kirim
        </Button>
      </form>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {optimisticEntries.map((entry) => (
          <div key={entry.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2">
            <p className="text-slate-700 font-medium mb-2">{entry.content}</p>
            <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>— {entry.author_name}</span>
              <span>{new Date(entry.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {optimisticEntries.length === 0 && (
          <p className="text-center text-slate-400 py-8">Belum ada pesan. Jadilah yang pertama!</p>
        )}
      </div>
    </div>
  );
}
