import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vendor = searchParams.get('vendor');
  const productId = searchParams.get('product_id');

  // Edge Proxy logic to bypass ad-blockers and hide actual affiliate tags
  let redirectUrl = 'https://www.chewy.com/'; // Fallback

  if (vendor === 'chewy' && productId) {
    const affiliateTag = process.env.CHEWY_AFFILIATE_ID || 'mock-affiliate-id';
    redirectUrl = `https://www.chewy.com/dp/${productId}?utm_source=partner&utm_campaign=${affiliateTag}`;
  } else if (vendor === 'amazon' && productId) {
    const affiliateTag = process.env.AMAZON_AFFILIATE_ID || 'mock-amazon-id';
    redirectUrl = `https://www.amazon.com/dp/${productId}?tag=${affiliateTag}`;
  }

  // Record click event anonymously in Edge before redirecting
  console.log(`[Edge Analytics] Affiliate click: ${vendor} - ${productId}`);

  return NextResponse.redirect(redirectUrl, 302);
}
