"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface InternalLink {
  target_slug: string;
  anchor_text: string;
}

export default function CrossPillarRec({ currentSlug }: { currentSlug: string }) {
  const [links, setLinks] = useState<InternalLink[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!mounted) return;

    const fetchInternalLinks = async () => {
      const supabase = createClient();
        
      const { data, error } = await supabase
        .from("automated_internal_links")
        .select("target_slug, anchor_text")
        .eq("source_slug", currentSlug)
        .limit(3);

      if (!error && data) {
        setLinks(data as unknown as InternalLink[]);
      }
    };

    fetchInternalLinks();
  }, [mounted, currentSlug]);

  if (!mounted || links.length === 0) return null;

  return (
    <section className="bg-slate-50 border-t border-slate-200 p-6 rounded-b-lg mt-8">
      <h3 className="text-md font-bold text-slate-800 mb-3">Recommended Family Resources</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.target_slug}>
            <Link
              href={`/journal/${link.target_slug}`}
              className="text-blue-600 hover:text-blue-800 text-base font-medium flex items-center gap-1 min-h-[48px]"
            >
              <span>➔</span> {link.anchor_text}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
