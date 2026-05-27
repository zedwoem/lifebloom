// src/components/seo/json-ld-faq.tsx
import React from 'react';

export interface FAQItem {
  question: string;
  answer: string;
}

interface JsonLdFAQProps {
  questions: FAQItem[];
}

export default function JsonLdFAQ({ questions }: JsonLdFAQProps) {
  if (!questions || questions.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': questions.map(q => ({
      '@type': 'Question',
      'name': q.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': q.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
