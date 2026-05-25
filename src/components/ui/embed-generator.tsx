"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Code, Copy, Check, Share2, Twitter, Facebook } from 'lucide-react';

export function EmbedGenerator({ slug, title, type = 'tool' }: { slug: string, title: string, type?: 'tool' | 'article' }) {
  const [copiedType, setCopiedType] = useState<'link' | 'embed' | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');
  
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const embedCode = `<iframe src="https://lifebloom.hub/en/embed/${slug}" width="100%" height="800" frameborder="0" title="${title}"></iframe>`;
  const shareTextTitle = `Check out ${title} on LifeBloom Hub!`;
  const shareTextFull = `✨ ${title}\n\nRead more here: ${currentUrl}`;

  const handleCopy = (textToCopy: string, copyType: 'link' | 'embed') => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedType(copyType);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share && currentUrl) {
      try {
        await navigator.share({
          title: 'LifeBloom Hub',
          text: shareTextFull,
          url: currentUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Share failed', err);
        }
      }
    } else {
      navigator.clipboard.writeText(shareTextFull);
      alert('Link and text copied to clipboard!');
    }
  };

  return (
    <div className="bg-brand-slate-light p-6 rounded-2xl border border-slate-200 mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-brand-blue font-bold flex items-center gap-2 mb-1">
            <Code className="w-5 h-5" /> Embed & Share
          </h3>
          <p className="text-sm text-brand-slate">
            Add this {type} to your own website or share it with friends.
          </p>
        </div>
        
        {/* Share Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleNativeShare} variant="outline" size="sm" className="gap-2 bg-white">
            <Share2 className="w-4 h-4" /> Share
          </Button>
          <a 
            href={currentUrl ? `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTextTitle)}` : '#'}
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="bg-white">
              <Twitter className="w-4 h-4 text-sky-500" />
            </Button>
          </a>
          <a 
            href={currentUrl ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}` : '#'}
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="bg-white">
              <Facebook className="w-4 h-4 text-blue-600" />
            </Button>
          </a>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <div className="flex-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Quick Share Link</label>
          <div className="flex gap-2">
            <Input 
              readOnly 
              value={shareTextFull} 
              className="font-mono text-xs text-slate-500 bg-white"
            />
            <Button onClick={() => handleCopy(shareTextFull, 'link')} variant="secondary" className="gap-2 min-w-[100px]">
              {copiedType === 'link' ? <Check className="w-4 h-4 text-brand-green" /> : <Copy className="w-4 h-4" />}
              {copiedType === 'link' ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">HTML Embed Code</label>
          <div className="flex gap-2">
            <Input 
              readOnly 
              value={embedCode} 
              className="font-mono text-xs text-slate-500 bg-white"
            />
            <Button onClick={() => handleCopy(embedCode, 'embed')} variant="secondary" className="gap-2 min-w-[100px]">
              {copiedType === 'embed' ? <Check className="w-4 h-4 text-brand-green" /> : <Copy className="w-4 h-4" />}
              {copiedType === 'embed' ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
