import React from "react";

interface StructuredDataProps {
  currentUrl: string;
  pageTitle: string;
  pageDescription: string;
  locale: string;
  authorName?: string;
  authorWikidataId?: string;
  authorOrcidId?: string;
  authorScholarUrl?: string;
  publishDate?: string;
  modifiedDate?: string;
  image?: string;
  entityType?: "Article" | "WebPage" | "Tool" | "SoftwareApplication";
  entitySpecificData?: any; // e.g. for Tool or Product
}

export function UnifiedStructuredData({
  currentUrl,
  pageTitle,
  pageDescription,
  locale,
  authorName,
  authorWikidataId,
  authorOrcidId,
  authorScholarUrl,
  publishDate,
  modifiedDate,
  image = "https://lifebloomhub.com/og-image.png",
  entityType = "WebPage",
  entitySpecificData = {},
}: StructuredDataProps) {
  
  // Single Root @id
  const urlId = currentUrl.endsWith("/") ? currentUrl : `${currentUrl}/`;

  const organizationNode = {
    "@type": "Organization",
    "@id": `${urlId}#organization`,
    "name": "LifeBloom Hub",
    "url": "https://lifebloomhub.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://lifebloomhub.com/logo.png"
    },
    "sameAs": [
      "https://twitter.com/lifebloomhub",
      "https://pinterest.com/lifebloomhub"
    ]
  };

  const websiteNode = {
    "@type": "WebSite",
    "@id": `${urlId}#website`,
    "url": "https://lifebloomhub.com",
    "name": "LifeBloom Hub",
    "description": "Inclusive Automated High-Yield Utility Platform",
    "publisher": { "@id": `${urlId}#organization` },
    "inLanguage": locale
  };

  const webpageNode = {
    "@type": "WebPage",
    "@id": `${urlId}#webpage`,
    "url": currentUrl,
    "name": pageTitle,
    "description": pageDescription,
    "isPartOf": { "@id": `${urlId}#website` },
    "about": { "@id": `${urlId}#organization` },
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": image
    },
    "datePublished": publishDate,
    "dateModified": modifiedDate || publishDate,
    "inLanguage": locale
  };

  let mainEntityNode: any = {
    "@type": entityType,
    "@id": `${urlId}#mainEntity`,
    "mainEntityOfPage": { "@id": `${urlId}#webpage` },
    "headline": pageTitle,
    "description": pageDescription,
    "image": image,
    ...entitySpecificData
  };

  if (authorName) {
    const sameAsList = [];
    if (authorWikidataId) sameAsList.push(`https://www.wikidata.org/wiki/${authorWikidataId}`);
    if (authorOrcidId) sameAsList.push(`https://orcid.org/${authorOrcidId}`);
    if (authorScholarUrl) sameAsList.push(authorScholarUrl);

    mainEntityNode.author = {
      "@type": "Person",
      "@id": `${urlId}#author`,
      "name": authorName,
      ...(sameAsList.length > 0 && { "sameAs": sameAsList })
    };
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode,
      websiteNode,
      webpageNode,
      mainEntityNode
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
