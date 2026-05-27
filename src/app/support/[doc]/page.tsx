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
        'id': `/id/support/${doc}`,
        'es': `/es/support/${doc}`,
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

  const lastUpdated = new Date(data.last_updated_at || Date.now()).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative min-h-screen bg-background pb-20 overflow-x-hidden">
      <div className="ambient-bg" />
      
      <div className="container mx-auto px-gutter-mobile md:px-margin-desktop pt-10 max-w-container-max relative z-10 animate-fade-in">
        
        {/* Navigation Breadcrumb */}
        <Link 
          href={`/${locale || 'en'}/support`}
          className="inline-flex items-center gap-2 text-primary hover:text-primary-container mb-8 transition-all font-bold group min-h-[52px]"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Helpdesk
        </Link>

        <main className="max-w-[720px] mx-auto bg-white rounded-3xl p-8 md:p-12 border border-border soft-shadow">
          <article className="prose prose-slate max-w-none prose-headings:text-foreground prose-headings:font-bold prose-p:leading-relaxed prose-p:mb-6 prose-a:text-primary">
            <header className="mb-8 border-b border-border pb-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">{data.title}</h1>
              <p className="text-on-surface-variant text-[14px]">Terakhir diperbarui: {lastUpdated}</p>
            </header>

            <div 
              className="space-y-6"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </article>
        </main>
      </div>
    </div>
  );
}
