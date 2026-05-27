"use client";

import React, { useState, useOptimistic, useRef } from 'react';
import { submitCommentAction } from '@/lib/actions/communityActions';
import { Button } from '@/components/ui/button';
import { MessageSquare, CornerDownRight, X, User } from 'lucide-react';

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

    if (!name || !content) return;

    const newCommentId = Math.random().toString();
    const newComment: Comment = {
      id: newCommentId,
      author_name: name,
      content,
      created_at: new Date().toISOString(),
      parent_id: replyTo,
    };

    // Optimistically add to state
    addOptimisticComment(newComment);
    formRef.current?.reset();
    
    const activeReplyId = replyTo;
    setReplyTo(null);

    const res = await submitCommentAction({ 
      articleId, 
      parentId: activeReplyId, 
      name, 
      email, 
      content 
    });

    if (!res.success) {
      alert("Gagal mengirim komentar untuk moderasi: " + res.error);
    }
  }

  // 1. Convert Flat Comment Array to Tree structure (Adjacency List)
  const buildCommentTree = (flatComments: Comment[]): Comment[] => {
    const map: Record<string, Comment & { replies: Comment[] }> = {};
    const roots: Comment[] = [];

    // First pass: map nodes
    flatComments.forEach(comment => {
      map[comment.id] = { ...comment, replies: [] };
    });

    // Second pass: wire children to parents
    flatComments.forEach(comment => {
      const mapped = map[comment.id];
      if (comment.parent_id && map[comment.parent_id]) {
        map[comment.parent_id].replies.push(mapped);
      } else {
        roots.push(mapped);
      }
    });

    return roots;
  };

  const commentTree = buildCommentTree(optimisticComments);

  // Get parent author name for context
  const getParentAuthor = () => {
    if (!replyTo) return null;
    const parent = optimisticComments.find(c => c.id === replyTo);
    return parent ? parent.author_name : null;
  };

  // 2. Recursive Comment Component Render
  const renderComment = (comment: Comment, depth = 0) => {
    return (
      <div key={comment.id} className="space-y-4">
        <div 
          className={`p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm transition-all hover:shadow-md ${
            depth > 0 
              ? 'ml-5 md:ml-10 border-l-4 border-l-emerald-600/80 bg-slate-50/50' 
              : ''
          }`}
          role="comment"
          aria-label={`Komentar dari ${comment.author_name}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full flex items-center justify-center font-bold">
                {comment.author_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                  {comment.author_name}
                </p>
                <p className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            
            {depth > 0 && (
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 bg-emerald-100/60 text-emerald-800 rounded-full border border-emerald-200/35">
                Balasan
              </span>
            )}
          </div>
          
          <div className="text-slate-700 text-sm md:text-base whitespace-pre-wrap pl-1 leading-relaxed">
            {comment.content}
          </div>
          
          <div className="flex justify-start mt-3">
            <button 
              onClick={() => {
                setReplyTo(comment.id);
                // Scroll form into view gently
                formRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-black text-emerald-700 flex items-center gap-1.5 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-600 rounded-xl px-3 py-1.5 bg-slate-50 border border-slate-200/60 shadow-sm hover:bg-emerald-50/30 transition-all cursor-pointer h-[32px]"
            >
              <CornerDownRight className="w-3.5 h-3.5" /> Balas
            </button>
          </div>
        </div>
        
        {/* Children replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-4">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 mt-12 border-t border-slate-200/80 pt-8" aria-label="Komentar Artikel">
      <div className="flex items-center gap-3">
        <MessageSquare className="w-6 h-6 text-emerald-700" />
        <h3 
          className="text-xl md:text-2xl font-black text-slate-800 tracking-tight" 
          style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}
        >
          Diskusi Komunitas ({optimisticComments.length})
        </h3>
      </div>

      {commentTree.length === 0 ? (
        <div className="p-8 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-300/80">
          <p className="text-slate-500 font-medium text-sm md:text-base">
            Belum ada komentar untuk artikel ini. Mari mulai diskusinya!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {commentTree.map(comment => renderComment(comment))}
        </div>
      )}

      {/* Comment Form Section */}
      <div className="bg-slate-50/50 p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm mt-8 relative">
        {replyTo && (
          <div className="mb-4 p-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center justify-between">
            <span className="text-xs md:text-sm text-emerald-800 font-semibold flex items-center gap-1.5">
              <CornerDownRight className="w-4 h-4" /> 
              Membalas komentar dari <strong className="font-extrabold">{getParentAuthor()}</strong>
            </span>
            <button 
              onClick={() => setReplyTo(null)}
              className="p-1 hover:bg-emerald-100 rounded-full transition-colors text-emerald-700"
              aria-label="Batalkan balasan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <h4 
          className="font-black text-slate-800 mb-4 text-base md:text-lg"
          style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}
        >
          {replyTo ? "Tuliskan Balasan Anda" : "Tinggalkan Pendapat Anda"}
        </h4>

        <form ref={formRef} action={handleAction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="name-input" className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
                Nama Lengkap (Wajib)
              </label>
              <input 
                id="name-input"
                name="name" 
                type="text" 
                placeholder="cth: Ibu Budi" 
                required 
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 focus:outline-none h-[52px] text-sm md:text-base font-semibold shadow-sm transition-all"
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="email-input" className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
                Email (Opsional - Tidak Dipublikasikan)
              </label>
              <input 
                id="email-input"
                name="email" 
                type="email" 
                placeholder="cth: budi@email.com" 
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 focus:outline-none h-[52px] text-sm md:text-base font-semibold shadow-sm transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label htmlFor="content-input" className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
              Pesan Komentar
            </label>
            <textarea 
              id="content-input"
              name="content" 
              placeholder="Tuliskan saran, pertanyaan, atau masukan berharga Anda disini..." 
              required 
              rows={4}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 focus:outline-none resize-none text-sm md:text-base font-semibold shadow-sm transition-all leading-relaxed"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button 
              type="submit" 
              className="bg-emerald-800 hover:bg-emerald-950 text-white rounded-2xl h-[52px] px-8 font-black text-base transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Kirim Komentar
            </Button>
            {replyTo && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setReplyTo(null)} 
                className="h-[52px] rounded-2xl font-bold border-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </Button>
            )}
          </div>
          
          <p className="text-xs text-slate-500 mt-2 font-medium">
            * Demi kenyamanan bersama, komentar baru akan melalui proses moderasi moderator sebelum tampil secara publik.
          </p>
        </form>
      </div>
    </div>
  );
}
