import { fetchWithTimeout } from '@/lib/utils/apiTimeout';

interface CitationProps {
  doi?: string;
  pmcid?: string;
}

export async function CitationsEngine({ doi, pmcid }: CitationProps) {
  let citation = null;
  let error = null;

  try {
    if (doi) {
      // Fetch from CrossRef
      const url = `https://api.crossref.org/works/${doi}`;
      const data = await fetchWithTimeout<any>(url, {}, 4000);
      const work = data.message;
      const authors = work.author?.map((a: any) => `${a.family}, ${a.given}`).join('; ') || 'Unknown Authors';
      const year = work.created['date-parts'][0][0];
      const title = work.title[0];
      const publisher = work.publisher;
      
      citation = {
        text: `${authors} (${year}). ${title}. ${publisher}. https://doi.org/${doi}`,
        title,
        authors,
        year,
        publisher,
        url: `https://doi.org/${doi}`
      };
    } else if (pmcid) {
      // Mock PubMed fetch for MVP
      citation = {
        text: `National Library of Medicine (${new Date().getFullYear()}). Medical Article ${pmcid}. PubMed Central.`,
        title: `Medical Article ${pmcid}`,
        authors: 'NLM',
        year: new Date().getFullYear(),
        publisher: 'PubMed Central',
        url: `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`
      };
    }
  } catch (err: any) {
    error = err.message;
  }

  // JSON-LD Injection
  const jsonLd = citation ? {
    "@context": "https://schema.org",
    "@type": "MedicalScholarlyArticle",
    "headline": citation.title,
    "author": {
      "@type": "Person",
      "name": citation.authors
    },
    "datePublished": citation.year.toString(),
    "publisher": {
      "@type": "Organization",
      "name": citation.publisher
    },
    "url": citation.url
  } : null;

  return (
    <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-200">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <h3 className="text-lg font-bold text-slate-800 mb-4">Scientific Citations & Evidence</h3>
      {error ? (
        <p className="text-sm text-red-500">Failed to load citation: {error}</p>
      ) : citation ? (
        <div className="text-sm text-slate-600 leading-relaxed font-serif bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          {citation.text}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No citations provided.</p>
      )}
    </div>
  );
}
