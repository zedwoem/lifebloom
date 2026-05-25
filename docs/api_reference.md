# Internal API Reference

LifeBloom Hub uses Next.js Route Handlers (`/api/*`) for serverless and edge operations. These endpoints are strictly protected by standard Web API conventions.

---

## 1. Security Layers (Global)
All internal API endpoints employ the following zero-trust checks:
- **CORS & Origin Validation:** Rejects requests not originating from `NEXT_PUBLIC_BASE_URL`.
- **Referer Validation:** Blocks direct bot or cURL access without a valid browser referer.
- **Rate Limiting:** IP-based request throttling using KV/Upstash (default 60/min).

---

## 2. Dynamic Affiliate Routing Proxy

### `GET /api/affiliate`
To prevent ad-blockers or malicious browser extensions from hijacking affiliate commission tracking, all product links are proxy-routed internally.

- **Parameters:**
  - `id`: The internal database identifier for the product/deal.
  - `target`: The original affiliate URL payload.
- **Response:**
  - `HTTP 307 Temporary Redirect` to the sanitized affiliate URL, with `Referrer-Policy: no-referrer` injected to protect the click source.
- **Side Effect:** Automatically asynchronously logs a user tracking metric (incrementing the product's internal `trending_score`).

---

## 3. Serverless Cron Integrations

Vercel Cron triggers these endpoints automatically on predefined schedules. They are secured by the `CRON_SECRET` bearer token to prevent public invocation.

### `GET /api/cron/rss-ingest`
- **Schedule:** Daily at 04:00 UTC.
- **Action:** Triggers the `rssService.ts` pipeline. Pulls XML feeds from medical/financial authorities, runs text through Grok/NLP for pillar categorization, deduplicates via SHA-256 hash checks, and upserts translated entries into Supabase.

### `GET /api/cron/pinterest-auto-pin`
- **Schedule:** Weekly on Sunday.
- **Action:** If `NEXT_PUBLIC_FEATURE_PINTEREST_AUTO_PIN` is true, scans for products with >15% price drops, generates an infographic via headless HTML-to-Image, and posts it to the configured Pinterest Board.
