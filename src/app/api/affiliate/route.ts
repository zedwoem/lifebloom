import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vendor = searchParams.get('vendor');
  const productId = searchParams.get('product_id') || 'unknown';
  const pillar = searchParams.get('pillar') || 'money'; // Default to money if not specified

  // Edge Proxy logic to bypass ad-blockers and hide actual affiliate tags
  let redirectUrl = 'https://www.chewy.com/'; // Fallback
  let linkType: 'affiliate_product' | 'sponsored_placement' | 'editorial_outgoing' = 'affiliate_product';

  if (vendor === 'chewy' && productId) {
    const affiliateTag = process.env.CHEWY_AFFILIATE_ID || 'mock-affiliate-id';
    redirectUrl = `https://www.chewy.com/dp/${productId}?utm_source=partner&utm_campaign=${affiliateTag}`;
    linkType = 'affiliate_product';
  } else if (vendor === 'amazon' && productId) {
    const affiliateTag = process.env.AMAZON_AFFILIATE_ID || 'mock-amazon-id';
    redirectUrl = `https://www.amazon.com/dp/${productId}?tag=${affiliateTag}`;
    linkType = 'affiliate_product';
  } else if (vendor === 'b2b' && productId) {
    redirectUrl = `${supabaseUrl}/functions/v1/affiliate-url-rewrite?vendor=b2b&product_id=${productId}`;
    linkType = 'sponsored_placement';
  } else if (vendor === 'editorial' && productId) {
    redirectUrl = productId; // Target URL is passed in product_id for outgoing links
    linkType = 'editorial_outgoing';
  }

  // Record click event in affiliate_clicks table asynchronously (non-blocking)
  const logClickPromise = (async () => {
    const { error } = await supabase
      .from('affiliate_clicks')
      .insert({
        link_type: linkType,
        pillar: pillar,
        referenced_id: productId,
        target_url: redirectUrl,
        user_id: null // Edge runtime anonymous logging, can be linked to session later
      });
    if (error) {
      console.error("[Affiliate Click Log Error]:", error.message);
    }
  })();

  // Execute without blocking redirect
  if (typeof (req as any).waitUntil === 'function') {
    (req as any).waitUntil(logClickPromise);
  } else {
    logClickPromise.catch(console.error);
  }

  return NextResponse.redirect(redirectUrl, 307);
}
