// src/lib/services/affiliateService.ts
// ─────────────────────────────────────────────────────────────────────────────
// Unified Affiliate Service — LifeBloom Hub
// Supports: Travelpayouts · Awin · ShareASale · Boldin · ClickBank · Goldco
//
// Required environment variables (server-side only, never NEXT_PUBLIC_):
//   TRAVELPAYOUTS_MARKER
//   AWIN_PUBLISHER_ID
//   SHAREASALE_PUBLISHER_ID
//   BOLDIN_PARTNER_ID
//   CLICKBANK_AFFILIATE_ID
//   GOLDCO_AFFILIATE_ID
//   AFFILIATE_WEBHOOK_SECRET
//   SUPABASE_SERVICE_ROLE_KEY
//   NEXT_PUBLIC_SUPABASE_URL
// ─────────────────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';
import { secureLogger } from '@/lib/utils/secureLogger';

// Web Crypto API helpers — available in Edge runtime AND Node.js 18+
// We do NOT import the Node.js `crypto` module (not available on Edge).

function randomUUID(): string {
  return globalThis.crypto.randomUUID();
}

async function sha256Hex(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) diff |= aBytes[i] ^ bBytes[i];
  return diff === 0;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type AffiliateNetwork =
  | 'travelpayouts'
  | 'awin'
  | 'shareasale'
  | 'boldin'
  | 'clickbank'
  | 'goldco';

export interface AffiliateRequest {
  /** Affiliate network identifier */
  network: AffiliateNetwork;
  /**
   * Network-specific product/merchant ID:
   *   travelpayouts → destination IATA code or deep-link path
   *   awin          → Awin merchant ID (awinmid)
   *   shareasale    → ShareASale merchant ID
   *   boldin        → leave blank, uses global partner ID
   *   clickbank     → ClickBank vendor account name
   *   goldco        → leave blank, uses global affiliate ID
   */
  productId: string;
  /** LifeBloom pillar: money | travel | senior | pet | home */
  pillar?: string;
  /** Authenticated user UUID (undefined for anonymous visitors) */
  userId?: string;
  /** Anonymous session token from cookie / x-session-id header */
  sessionId?: string;
  /** UI placement for analytics (e.g. 'video_sidebar', 'article_footer') */
  placement?: string;
  /** Raw User-Agent string — will be SHA-256 hashed before storage */
  userAgent?: string;
  /** HTTP Referer header value */
  referrer?: string;
}

export interface AffiliateWebhookPayload {
  network: AffiliateNetwork;
  transactionId: string;
  commission: number;
  currency: string;
  status: 'pending' | 'approved' | 'declined' | 'paid';
  /** The clickId UUID we injected as sub_id / clickref / afftrack / tid */
  subId1?: string;
  raw: unknown;
}

// ─── Config Guard ─────────────────────────────────────────────────────────────

type NetworkConfig = Record<string, string | undefined>;

const NETWORK_ENV_MAP: Record<AffiliateNetwork, NetworkConfig> = {
  travelpayouts: { marker: process.env.TRAVELPAYOUTS_MARKER },
  awin:          { publisherId: process.env.AWIN_PUBLISHER_ID },
  shareasale:    { publisherId: process.env.SHAREASALE_PUBLISHER_ID },
  boldin:        { partnerId: process.env.BOLDIN_PARTNER_ID },
  clickbank:     { affiliateId: process.env.CLICKBANK_AFFILIATE_ID },
  goldco:        { affiliateId: process.env.GOLDCO_AFFILIATE_ID },
};

function getNetworkConfig(network: AffiliateNetwork): Record<string, string> {
  const raw = NETWORK_ENV_MAP[network];
  const resolved: Record<string, string> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (!value || value.trim() === '') {
      throw new Error(
        `AFFILIATE_CONFIG_MISSING: env var for "${network}.${key}" is not set. ` +
        `Add it to .env.local and Vercel environment settings.`
      );
    }
    resolved[key] = value;
  }

  return resolved;
}

// ─── URL Generators ───────────────────────────────────────────────────────────
//
// Each generator receives the full AffiliateRequest and a freshly generated
// clickId UUID. The clickId is injected as the network-specific sub-ID so
// S2S postbacks can be correlated back to a row in affiliate_clicks.

const GENERATORS: Record<
  AffiliateNetwork,
  (req: AffiliateRequest, clickId: string) => string
> = {
  /**
   * Travelpayouts
   * Official format: https://travelpayouts.com/click?marker={marker}&sub_id={clickId}&destination={iata}
   * Docs: https://support.travelpayouts.com/hc/en-us/articles/115000736308
   */
  travelpayouts: (req, clickId) => {
    const { marker } = getNetworkConfig('travelpayouts');
    const destination = encodeURIComponent(req.productId);
    return (
      `https://travelpayouts.com/click` +
      `?marker=${marker}` +
      `&sub_id=${clickId}` +
      `&destination=${destination}`
    );
  },

  /**
   * Awin
   * Official format: https://www.awin1.com/cread.php?awinmid={merchantId}&awinaffid={publisherId}&clickref={clickId}
   * Docs: https://wiki.awin.com/index.php/Affiliate_Deep_Linking
   */
  awin: (req, clickId) => {
    const { publisherId } = getNetworkConfig('awin');
    const merchantId = encodeURIComponent(req.productId);
    return (
      `https://www.awin1.com/cread.php` +
      `?awinmid=${merchantId}` +
      `&awinaffid=${publisherId}` +
      `&clickref=${clickId}`
    );
  },

  /**
   * ShareASale
   * Official format: https://www.shareasale.com/r.cfm?B={merchantId}&U={publisherId}&M={merchantId}&afftrack={clickId}
   * Docs: https://help.shareasale.com/hc/en-us/articles/360000258786
   */
  shareasale: (req, clickId) => {
    const { publisherId } = getNetworkConfig('shareasale');
    const merchantId = encodeURIComponent(req.productId);
    return (
      `https://www.shareasale.com/r.cfm` +
      `?B=${merchantId}` +
      `&U=${publisherId}` +
      `&M=${merchantId}` +
      `&urllink=` +
      `&afftrack=${clickId}`
    );
  },

  /**
   * Boldin (NewRetirement)
   * Format: https://www.boldin.com/?partner={partnerId}&subId={clickId}
   * Contact: partners@boldin.com for exact URL structure
   */
  boldin: (_req, clickId) => {
    const { partnerId } = getNetworkConfig('boldin');
    return (
      `https://www.boldin.com/` +
      `?partner=${partnerId}` +
      `&subId=${clickId}`
    );
  },

  /**
   * ClickBank
   * Official format: https://hop.clickbank.net/?affiliate={affiliateId}&vendor={vendorId}&tid={clickId}
   * Docs: https://support.clickbank.com/hc/en-us/articles/360001695952
   */
  clickbank: (req, clickId) => {
    const { affiliateId } = getNetworkConfig('clickbank');
    const vendor = encodeURIComponent(req.productId);
    return (
      `https://hop.clickbank.net/` +
      `?affiliate=${affiliateId}` +
      `&vendor=${vendor}` +
      `&tid=${clickId}`
    );
  },

  /**
   * Goldco (Gold IRA)
   * Format: https://www.goldco.com/?fid={affiliateId}&sub1={clickId}
   * Contact Goldco partner manager for exact deep-link parameters
   */
  goldco: (_req, clickId) => {
    const { affiliateId } = getNetworkConfig('goldco');
    return (
      `https://www.goldco.com/` +
      `?fid=${affiliateId}` +
      `&sub1=${clickId}`
    );
  },
};

// ─── Supabase Client (Server-Side Only) ───────────────────────────────────────

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_NOT_CONFIGURED: Missing URL or service role key.');
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

// ─── AffiliateService ─────────────────────────────────────────────────────────

export class AffiliateService {
  /**
   * Generates a network-specific tracking URL, logs the click to
   * `affiliate_clicks`, and returns the final redirect target.
   *
   * Called exclusively from server-side Edge API routes — never the browser.
   */
  static async generateTrackingLink(req: AffiliateRequest): Promise<string> {
    const clickId = randomUUID();

    // Hash user-agent for privacy-safe fingerprinting (no PII stored)
    const userAgentHash = req.userAgent
      ? await sha256Hex(req.userAgent)
      : null;

    // ── 1. Persist click record ──────────────────────────────────────────────
    try {
      const supabase = getServiceClient();
      const { error } = await supabase.from('affiliate_clicks').insert({
        id: clickId,
        user_id:         req.userId   ?? null,
        session_id:      req.sessionId ?? null,
        network:         req.network,
        link_type:       'affiliate_product',
        pillar:          req.pillar    ?? 'general',
        placement:       req.placement ?? 'unknown',
        referenced_id:   req.productId,
        referrer:        req.referrer  ?? null,
        user_agent_hash: userAgentHash,
        target_url:      'pending', // filled async below
      });
      if (error) {
        secureLogger.error('AFFILIATE_DB_INSERT_FAILED', error);
        // Graceful degradation — still generate link with a descriptive fallback ID
        return GENERATORS[req.network](req, `db_err_${Date.now()}`);
      }
    } catch (e) {
      secureLogger.error('AFFILIATE_DB_EXCEPTION', e);
      return GENERATORS[req.network](req, `exc_${Date.now()}`);
    }

    // ── 2. Build the tracking URL ────────────────────────────────────────────
    let targetUrl: string;
    try {
      targetUrl = GENERATORS[req.network](req, clickId);
    } catch (e: any) {
      secureLogger.error('AFFILIATE_GENERATOR_FAILED', e);
      throw new Error(`AFFILIATE_LINK_GENERATION_FAILED: ${e.message}`);
    }

    // ── 3. Back-fill target_url asynchronously (fire-and-forget) ────────────
    getServiceClient()
      .from('affiliate_clicks')
      .update({ target_url: targetUrl })
      .eq('id', clickId)
      .then(({ error }) => {
        if (error) secureLogger.error('AFFILIATE_URL_UPDATE_FAILED', error);
      });

    return targetUrl;
  }

  /**
   * Processes an incoming S2S conversion webhook from a network.
   * Verifies HMAC signature before writing to `affiliate_conversions`.
   *
   * @param payload   Normalised webhook data
   * @param signature Hex signature from the network's request header
   * @param secret    AFFILIATE_WEBHOOK_SECRET env variable
   */
  static async processWebhook(
    payload: AffiliateWebhookPayload,
    signature: string,
    secret: string
  ): Promise<boolean> {
    // ── Signature Verification (Web Crypto — Edge-compatible) ────────────────
    if (process.env.NODE_ENV === 'production') {
      let expected: string;

      if (payload.network === 'shareasale') {
        // ShareASale: SHA-256 of "transactionId:date:secret"
        // Note: SAS uses MD5 in legacy docs; we use SHA-256 for modern safety.
        const today = new Date().toISOString().slice(0, 10);
        expected = await sha256Hex(`${payload.transactionId}:${today}:${secret}`);
      } else {
        // Awin & others: HMAC-SHA256 over the raw JSON body string
        expected = await hmacSha256Hex(secret, JSON.stringify(payload.raw));
      }

      if (!timingSafeEqual(expected, signature)) {
        secureLogger.error('WEBHOOK_INVALID_SIGNATURE', { network: payload.network });
        return false;
      }
    }

    // ── Resolve user_id from click record ─────────────────────────────────────
    const supabase = getServiceClient();
    let userId: string | null = null;

    if (payload.subId1) {
      const { data } = await supabase
        .from('affiliate_clicks')
        .select('user_id')
        .eq('id', payload.subId1)
        .single();
      userId = data?.user_id ?? null;
    }

    // ── Upsert conversion (idempotent on transaction_id) ─────────────────────
    const { error } = await supabase.from('affiliate_conversions').upsert(
      {
        click_id:         payload.subId1 ?? null,
        network:          payload.network,
        transaction_id:   payload.transactionId,
        commission_amount: payload.commission,
        currency:         payload.currency,
        status:           payload.status,
        user_id:          userId,
        raw_payload:      payload.raw,
      },
      { onConflict: 'transaction_id' }
    );

    if (error) {
      secureLogger.error('WEBHOOK_DB_UPSERT_FAILED', error);
      return false;
    }

    secureLogger.info('WEBHOOK_PROCESSED', {
      network: payload.network,
      transactionId: payload.transactionId,
    });
    return true;
  }
}
