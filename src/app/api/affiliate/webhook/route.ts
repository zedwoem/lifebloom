// src/app/api/affiliate/webhook/route.ts
// Receives S2S conversion postbacks from Awin, ShareASale, and others.
import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  AffiliateService,
  type AffiliateNetwork,
  type AffiliateWebhookPayload,
} from '@/lib/services/affiliateService';
import { secureLogger } from '@/lib/utils/secureLogger';

// Webhooks must NOT run on Edge — they need full Node.js crypto
export const runtime = 'nodejs';

// ─── Webhook Payload Schema ───────────────────────────────────────────────────

const WebhookSchema = z.object({
  network:       z.enum(['travelpayouts', 'awin', 'shareasale', 'boldin', 'clickbank', 'goldco']),
  transactionId: z.string().min(1),
  commission:    z.number().nonnegative(),
  currency:      z.string().length(3).default('USD'),
  status:        z.enum(['pending', 'approved', 'declined', 'paid']),
  subId1:        z.string().uuid().optional(),
});

// ─── POST /api/affiliate/webhook ─────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get('x-awin-signature') ??
      req.headers.get('x-shareasale-signature') ??
      req.headers.get('x-webhook-signature') ??
      '';

    const secret = process.env.AFFILIATE_WEBHOOK_SECRET;
    if (!secret) {
      secureLogger.error('WEBHOOK_SECRET_MISSING');
      return NextResponse.json({ error: 'SERVER_CONFIG_ERROR' }, { status: 500 });
    }

    const parsed = WebhookSchema.safeParse(JSON.parse(rawBody));
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'INVALID_PAYLOAD', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const payload: AffiliateWebhookPayload = {
      network:       data.network as AffiliateNetwork,
      transactionId: data.transactionId,
      commission:    data.commission,
      currency:      data.currency,
      status:        data.status,
      subId1:        data.subId1,
      raw:           JSON.parse(rawBody),
    };

    const ok = await AffiliateService.processWebhook(payload, signature, secret);
    if (!ok) {
      return NextResponse.json({ error: 'PROCESSING_FAILED' }, { status: 422 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    secureLogger.error('WEBHOOK_ROUTE_EXCEPTION', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
