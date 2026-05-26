"use client";

import React, { useState, useOptimistic, useRef } from 'react';
import { submitCommentAction } from '@/lib/actions/communityActions';
import { Button } from '@/components/ui/button';
import { MessageSquare, CornerDownRight } from 'lucide-react';

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  replies?: Comment[];
}

export function AccessibleComments({ articleId, initialComments = [] }: { articleId: string, initialComments?: Comment[] }) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment: Comment) => [...state, newComment]
  );

  async function handleAction(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const content = formData.get('content') as string;

    const newComment: Comment = {
      id: Math.random().toString(),
      author_name: name,
      content,
      created_at: new Date().toISOString(),
      parent_id: replyTo,
    };

    addOptimisticComment(newComment);
    formRef.current?.reset();
    setReplyTo(null);

    const res = await submitCommentAction({ articleId, parentId: replyTo, name, email, content });
    if (!res.success) {
      alert("Failed to post: " + res.error);
    }
  }

  return (
    <div className="space-y-8 mt-12 border-t border-slate-100 pt-8" aria-label="Komentar Artikel">
      <h3 className="text-2xl font-black text-slate-800" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
        Diskusi Komunitas
      </h3>

      <div className="space-y-6">
        {optimisticComments.filter(c => !c.parent_id).map((comment) => (
          <div key={comment.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                {comment.author_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-800">{comment.author_name}</p>
                <p className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-slate-700 ml-13 whitespace-pre-wrap">{comment.content}</div>
            
            <button 
              onClick={() => setReplyTo(comment.id)}
              className="mt-3 text-sm font-bold text-brand-blue flex items-center gap-1 ml-13 hover:underline focus:outline-none focus:ring-2 focus:ring-brand-blue rounded"
            >
              <CornerDownRight className="w-4 h-4" /> Balas
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-8">
        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-blue" />
          {replyTo ? "Tulis Balasan" : "Tinggalkan Komentar"}
        </h4>
        <form ref={formRef} action={handleAction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              name="name" 
              type="text" 
              placeholder="Nama Lengkap (Wajib)" 
              required 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue h-[52px]"
            />
            <input 
              name="email" 
              type="email" 
              placeholder="Email (Opsional)" 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue h-[52px]"
            />
          </div>
          <textarea 
            name="content" 
            placeholder="Tuliskan pendapat atau pengalaman Anda..." 
            required 
            rows={4}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue resize-none"
          />
          <div className="flex gap-3">
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-[52px] px-8 font-bold text-base">
              Kirim Komentar
            </Button>
            {replyTo && (
              <Button type="button" variant="outline" onClick={() => setReplyTo(null)} className="h-[52px] rounded-xl font-bold">
                Batal Balas
              </Button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Komentar Anda mungkin perlu dimoderasi sebelum ditampilkan secara publik demi menjaga kenyamanan komunitas.
          </p>
        </form>
      </div>
    </div>
  );
}
