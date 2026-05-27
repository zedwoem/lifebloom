// src/app/api/affiliate/route.ts
// Proxy redirect route — runs on Edge, never exposes credentials to the browser.
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AffiliateService, type AffiliateNetwork } from '@/lib/services/affiliateService';
import { secureLogger } from '@/lib/utils/secureLogger';

export const runtime = 'edge';

// ─── Validation Schema ────────────────────────────────────────────────────────

const SUPPORTED_NETWORKS = [
  'travelpayouts',
  'awin',
  'shareasale',
  'boldin',
  'clickbank',
  'goldco',
] as const;

const QuerySchema = z.object({
  network:    z.enum(SUPPORTED_NETWORKS),
  product_id: z.string().min(1).max(256),
  pillar:     z.enum(['money', 'travel', 'senior', 'pet', 'home', 'general']).optional(),
  placement:  z.string().max(64).optional(),
});

// ─── GET /api/affiliate ───────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const parsed = QuerySchema.safeParse({
      network:    searchParams.get('network'),
      product_id: searchParams.get('product_id'),
      pillar:     searchParams.get('pillar') ?? undefined,
      placement:  searchParams.get('placement') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { network, product_id, pillar, placement } = parsed.data;

    const targetUrl = await AffiliateService.generateTrackingLink({
      network:   network as AffiliateNetwork,
      productId: product_id,
      pillar,
      placement,
      userAgent: req.headers.get('user-agent') ?? undefined,
      referrer:  req.headers.get('referer')    ?? undefined,
      sessionId: req.headers.get('x-session-id') ?? undefined,
      // userId is not passed here — it must be injected server-side in RSC contexts
    });

    // 307 Temporary Redirect preserves the GET method
    return NextResponse.redirect(targetUrl, 307);
  } catch (error: unknown) {
    secureLogger.error('AFFILIATE_ROUTE_ERROR', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
