import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PartnerizeService } from '@/lib/services/partnerizeService';
import { secureLogger } from '@/lib/utils/secureLogger';

export const runtime = 'edge';

// Strict request validation using Zod
const AffiliateRequestSchema = z.object({
  vendor: z.string().min(1),
  product_id: z.string().min(1),
  pillar: z.string().optional().default('money')
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parsedParams = AffiliateRequestSchema.parse({
      vendor: searchParams.get('vendor') || '',
      product_id: searchParams.get('product_id') || '',
      pillar: searchParams.get('pillar') || undefined
    });

    // Generate isolated link through the service layer
    const result = PartnerizeService.generateLink({
      vendor: parsedParams.vendor,
      productId: parsedParams.product_id,
      pillar: parsedParams.pillar
    });

    // Fire-and-forget logging strictly isolated in the service layer
    const logPromise = PartnerizeService.logClickAsync(
      result.linkType,
      parsedParams.pillar,
      parsedParams.product_id,
      result.targetUrl
    );

    if (typeof (req as any).waitUntil === 'function') {
      (req as any).waitUntil(logPromise);
    } else {
      logPromise.catch(e => secureLogger.error("Async log failed", e));
    }

    return NextResponse.redirect(result.targetUrl, 307);
  } catch (error: any) {
    secureLogger.error("Affiliate route error", error);
    // Sanitize API-level errors from leaking to client. Standardize response.
    return NextResponse.json({ error: "INVALID_AFFILIATE_REQUEST" }, { status: 400 });
  }
}
