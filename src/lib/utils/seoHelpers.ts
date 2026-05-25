export function generateProductJsonLd(product: {
  name: string;
  description: string;
  image: string;
  price: string;
  currency: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: 'https://schema.org/InStock'
    }
  };
}
