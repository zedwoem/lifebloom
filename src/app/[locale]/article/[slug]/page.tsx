import { notFound } from 'next/navigation';
import { StructuredData } from '@/components/seo/StructuredData';
import { Article, MedicalWebPage, WithContext } from 'schema-dts';
import { AccessibleArticleReader } from '@/components/content/accessible-article-reader';

// Dummy data fetching with advanced SEO metadata
function getArticleData(slug: string) {
  const decodedSlug = decodeURIComponent(slug).replace(/-/g, ' ');
  
  // Simple heuristic for category mapping
  let category: 'health' | 'finance' | 'tech' | 'general' = 'general';
  let expertReviewer = null;

  if (slug.includes('health') || slug.includes('medicare') || slug.includes('arthritis')) {
    category = 'health';
    expertReviewer = { name: 'Dr. Sarah Jenkins, MD', url: 'https://lifebloom.hub/author/sarah-jenkins' };
  } else if (slug.includes('money') || slug.includes('social-security') || slug.includes('savings')) {
    category = 'finance';
    expertReviewer = { name: 'Michael Chen, CFP', url: 'https://lifebloom.hub/author/michael-chen' };
  } else if (slug.includes('smart-home') || slug.includes('gadgets')) {
    category = 'tech';
    expertReviewer = { name: 'Alex Rivera, Tech Analyst', url: 'https://lifebloom.hub/author/alex-rivera' };
  }

  return {
    title: decodedSlug,
    source: "LifeBloom Hub Curation",
    date: new Date('2026-05-20T08:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    datePublished: new Date('2026-05-20T08:00:00Z').toISOString(),
    dateModified: new Date().toISOString(),
    author: { name: "Editorial Team", url: "https://lifebloom.hub/about" },
    category,
    expertReviewer,
    content: `
      <p>This is a full-page dedicated reader view for aggregated news and blogs. It is designed to keep users on our platform instead of bouncing them to external sites.</p>
      <h2>Why Zen Mode Matters</h2>
      <p>For senior users and those with visual impairments, a clean, distraction-free reading environment is crucial. By stripping away heavy navigation headers, sidebars, and pop-up ads, we provide a superior reading experience.</p>
      <h2>Optimized for SEO</h2>
      <p>This page automatically injects JSON-LD Article schema, ensuring search engines index our curated content perfectly.</p>
    `,
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop" // 1200px width min for Google Discover
  };
}

export default async function ArticleReaderPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params;
  const article = getArticleData(slug);

  if (!article) notFound();

  // Base Schema Properties
  const baseSchema = {
    '@context': 'https://schema.org',
    headline: article.title,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: {
      '@type': 'Person',
      name: article.author.name,
      url: article.author.url
    },
    publisher: {
      '@type': 'Organization',
      name: 'LifeBloom Hub',
      logo: {
        '@type': 'ImageObject',
        url: 'https://lifebloom.hub/logo.png'
      }
    },
    image: [article.imageUrl] // Discover requirement: array of high-res images
  };

  // Generate Category-Specific Schema
  let articleSchema: any = {
    ...baseSchema,
    '@type': 'Article'
  };

  if (article.category === 'health') {
    articleSchema = {
      ...baseSchema,
      '@type': 'MedicalWebPage',
      reviewedBy: article.expertReviewer ? {
        '@type': 'Person',
        name: article.expertReviewer.name,
        url: article.expertReviewer.url
      } : undefined,
      lastReviewed: article.dateModified
    } as WithContext<MedicalWebPage>;
  } else if (article.category === 'finance') {
    articleSchema = {
      ...baseSchema,
      '@type': 'Article', // FinancialArticle is an extension
      articleSection: 'Personal Finance',
      reviewedBy: article.expertReviewer ? {
        '@type': 'Person',
        name: article.expertReviewer.name,
        url: article.expertReviewer.url
      } : undefined
    } as WithContext<Article>;
  }

  return (
    <>
      <StructuredData data={articleSchema} />
      <AccessibleArticleReader article={article} locale={locale} slug={slug} />
    </>
  );
}
