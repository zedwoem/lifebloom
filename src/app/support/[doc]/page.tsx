import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { remark } from 'remark';
import html from 'remark-html';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const locale = "en";

export const revalidate = 60; // ISR

export async function generateStaticParams() {
  const supabase = createAdminClient();
  const { data } = await supabase.from('support_documents').select('slug');
  
  if (!data) return [];

  return data.map((doc) => ({
    doc: doc.slug,
  }));
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ doc: string; locale: string }> 
}): Promise<Metadata> {
  const { doc } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('support_documents')
    .select('title, content')
    .eq('slug', doc)
    .maybeSingle();

  if (!data) return {};

  const cleanDesc = data.content
    ? data.content.replace(/[#*`\[\]]/g, '').substring(0, 155) + '...'
    : 'LifeBloom Support Document';

  return {
    title: `${data.title} | LifeBloom Support`,
    description: cleanDesc,
    alternates: {
      canonical: `/support/${doc}`,
      languages: {
        'x-default': `/en/support/${doc}`,
        'en': `/en/support/${doc}`,
                      }
    }
  };
}

export default async function DocumentPage({ params }: { params: Promise<{ doc: string; locale: string }> }) {
  const { doc, locale } = await params;
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('support_documents')
    .select('*')
    .eq('slug', doc)
    .single();

  if (error || !data) {
    notFound();
  }

  const processedContent = await remark()
    .use(html)
    .process(data.content);
  const contentHtml = processedContent.toString();

  const lastUpdated = new Date(data.last_updated_at || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="prose prose-slate max-w-none prose-headings:text-foreground prose-headings:font-bold prose-p:leading-relaxed prose-p:mb-6 prose-a:text-primary animate-fade-in">
      <header className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#131b2e] mb-3 tracking-tight Atkinson-font" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>{data.title}</h1>
        <p className="text-slate-400 text-sm font-semibold">Last updated: {lastUpdated}</p>
      </header>

      <div 
        className="space-y-6 text-slate-650 font-medium leading-relaxed"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </article>
  );
}
