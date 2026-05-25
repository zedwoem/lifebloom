import React from "react";
import { generateProductJsonLd } from "@/lib/utils/seoHelpers";

interface JsonLdProductProps {
  name: string;
  description: string;
  image: string;
  price: string;
  currency: string;
}

export default function JsonLdProduct({
  name,
  description,
  image,
  price,
  currency,
}: JsonLdProductProps) {
  const jsonLd = generateProductJsonLd({
    name,
    description,
    image,
    price,
    currency,
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
