# LifeBloom Hub - Enterprise Digital Wellness Platform

**LifeBloom Hub** is an AI-powered, senior-friendly digital wellness hub that curates content, interactive calculators, masterclass videos, and curated product recommendations across five foundational life pillars: **Home**, **Money**, **Pet**, **Senior Wellness**, and **Travel**.

Designed strictly for an aging demographic (65+), the platform prioritizes friction-free authentication, gamified engagement (Bloom Points), unparalleled accessibility (WCAG 2.1 AA), and robust programmatic SEO.

---

## 🏗️ Technology Stack & Core Infrastructure
- **Framework:** Next.js 15 (App Router, Server Components, Partial Prerendering)
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Edge Functions)
- **State & Rate Limiting:** Upstash Redis (Serverless KV & Sliding Window Limits)
- **Telemetry & Error Tracking:** Sentry
- **Deployment & Edge Network:** Vercel
- **Translation Engine:** Cloudflare Workers (Edge translation, decoupled from Next.js build)
- **Styling:** Tailwind CSS + shadcn/ui

---

## 🗺️ Directory Map & Critical Routing

A strict enterprise architecture is maintained to separate client boundaries, edge execution, and server logic.

### 📂 File Structure
```
/docs                    # PRDs, system audits, and implementation plans
/src
 ├── app                 # Next.js 15 Routing (Pages, API, Layouts)
 │    ├── admin/         # Secure Back-office (CMS, Affiliate Analytics, User Management)
 │    ├── api/           # Edge Functions & Webhooks (Cron, Proxies)
 │    └── [locale]/      # Localized front-end pages
 ├── components          # React UI Components
 │    ├── admin/         # Admin dashboard components
 │    ├── calculators/   # Interactive tools (e.g., Pet Matchmaker, Retirement Planner)
 │    ├── seo/           # Programmatic JSON-LD and Schema components
 │    └── ui/            # Reusable generic UI elements (buttons, inputs)
 ├── lib                 # Business Logic & Infrastructure
 │    ├── actions/       # Server Actions for mutations
 │    ├── services/      # Abstraction layers (RSS, AI Scrapers, Video Sync)
 │    └── supabase/      # Client configurations (server.ts, pooler.ts, middleware.ts)
/supabase
 ├── migrations/         # Version-controlled SQL schema modifications
 └── seed.sql            # Local development base data
```

### 🛣️ Critical Routing Paths
- **Edge Proxy (Monetization):** `/api/affiliate` (Proxies all outbound affiliate clicks, shielded by Upstash IP Rate Limits and logs to Postgres securely).
- **Gamification Engine:** `/api/user/calculations` (Tracks interaction points with a 3x/24h cap via Redis).
- **Background Automation:** `/api/cron/*` (Ingests RSS feeds, YouTube transcripts, and processes automated content queues. Secured via `CRON_SECRET` & QStash Signatures).
- **Localization Middleware:** intercepts routing to serve dynamic translations via CF workers, heavily caching translations to prevent Vercel bandwidth spikes.

---

## 🛡️ Architectural Rules & Constraints

**1. Edge Runtime Contamination**
Next.js Edge runtime does not support Node.js native modules (`net`, `tls`, `crypto`). 
*   **RULE:** Never import `postgres` (or files utilizing it like `pooler.ts`) into Edge functions (`export const runtime = 'edge'`). Always inject `import 'server-only';` at the top of Node-exclusive database pooling utilities.

**2. Asynchronous State (`after()`)**
LifeBloom heavily utilizes Next.js 15 `after()` for non-blocking server mutations (e.g., gamification logs, affiliate tracking).
*   **RULE:** All `after()` blocks must be wrapped in `try/catch` and pipe errors to Sentry. An unhandled rejection in `after()` dies silently and evades Vercel logs.

**3. Row Level Security (RLS) & Service Roles**
*   **RULE:** Client-side DB requests must hit strict RLS policies.
*   **RULE:** Server-side background jobs (like affiliate click logging in `after()`) must use `supabaseAdmin` (Service Role Key) to bypass RLS, as the anonymous or unauthenticated context will reject the insert.

**4. External Assets & Caching**
*   **RULE:** Next.js `next.config.ts` must maintain strict `remotePatterns`. Never allow wildcard `*` hostnames for images.
*   **RULE:** Sentry's `hideSourceMaps: true` must always be enforced in `next.config.ts` to prevent proprietary code leakage.

---

## 🔧 Maintenance & Administration Guide

For platform admins and lead developers, adhere to these maintenance runbooks:

### Routine Maintenance Checklist
- [ ] **Redis Monitoring:** Check Upstash console for `ratelimit` hits. Adjust `SlidingWindow` rules in `route.ts` if legitimate users (e.g., active seniors using calculators) are being blocked.
- [ ] **Supabase Indices:** Ensure high-traffic tables (like `affiliate_clicks`, `canonical_articles`) maintain `BTREE` indices on queried columns to avoid CPU-draining Seq Scans.
- [ ] **Cache Invalidation:** If updating translation dictionaries or CMS content, trigger the `/api/revalidate` endpoint. Vercel aggressively caches static pages.
- [ ] **Sentry Triage:** Check Sentry weekly for "Hydration Mismatches" (usually caused by 3rd-party scripts like video players) or "Promise Rejections" from orphaned server actions.

### Environment Management
Always keep `.env.example` mirrored with `.env.local`. Ensure variables are typed correctly in an `env.mjs` or Zod schema validation layer.

---

## 💻 Development Guidelines & Rules

To maintain high code quality and architectural integrity, all developers must adhere to the following rules:

### 1. File Modification Rules
- **DO NOT** edit legacy files outside of your scoped feature branch.
- **DO NOT** introduce arbitrary third-party UI libraries. Use `shadcn/ui` and standard Tailwind classes for all styling.
- **DO NOT** use `export const runtime = 'edge'` on API routes that require standard Node.js libraries (e.g., direct PostgreSQL pooling or heavy file parsing). Use Server Actions or standard Node API routes instead.

### 2. State & Data Fetching
- Favor **React Server Components (RSC)** for all non-interactive data fetching to reduce client bundle sizes.
- Use `use client` strictly at the leaf nodes of the component tree (e.g., interactive calculators, form inputs, or video players).
- All Supabase mutations must go through **Server Actions** (`/src/lib/actions/*`) and be validated by `zod` schemas.

### 3. Localization Strategy
- Hardcoded text must be avoided. Use the localization keys provided by the platform.
- New translations should be synchronized with the Edge Cloudflare Worker dictionary, not stored as massive static JSON files inside the Next.js bundle.

---

## 🏛️ Foundational & Critical Files

When debugging or extending the platform, developers should familiarize themselves with these key files:

- **`next.config.ts`**: Governs strict `remotePatterns` for images, Sentry configurations (`hideSourceMaps`), and security headers. Modifying this requires a full build cycle.
- **`src/lib/supabase/server.ts`**: The core Supabase SSR client initiator. Always imported by Server Components or Server Actions to interact securely with RLS.
- **`src/lib/supabase/pooler.ts`**: The dedicated Postgres connection pooler isolated for Server-only operations.
- **`src/app/api/affiliate/route.ts`**: The critical edge proxy for monetization. Contains Upstash rate limits and asynchronous background tracking using `after()`.
- **`src/lib/upstash.ts`**: The centralized Redis client initiator used for global rate-limiting and cache invalidation.
- **`supabase/migrations/`**: Contains the irreversible SQL history of the database structure. **NEVER** edit past migrations; always create a new one using `npx supabase migration new <name>`.

---

## 🚀 Roadmap & Future Expansion

The LifeBloom ecosystem is continuously evolving. The following phases dictate the next cycle of feature implementations and asset inclusions:

### Phase 1: Contextual Monetization Maturity
- **Dynamic Affiliate Engine:** Linking semantic keywords inside AI-generated articles directly to Partner APIs (Amazon, Awin, Impact) dynamically based on user localization.
- **Yield Radar Integration:** Connect to real-time Treasury API and CoinGecko to provide live yield stats for the Retirement Planner.

### Phase 2: OpenFDA & Clinical Integrations
- **Drug Checker 2.0:** Establish deep polling to the OpenFDA database to pull real-time adverse reaction data into the "Prescription Drug Checker" tool.
- **Veterinary Data APIs:** Enhance the "Canine Symptom Checker" with TheDogAPI and localized vet clinic maps (Google Places API).

### Phase 3: Video Hub & Transcription AI
- **Automated YouTube Transcripts:** Using the existing `api/cron/fetch-transcripts` to pull standard YouTube videos, pass them through a Gemini/DeepSeek summarization layer, and generate Senior-friendly "Masterclass" articles.
- **Custom Player:** Implement a bespoke, high-accessibility video wrapper over YouTube embeds to prevent confusing ad overlays for seniors.

### Phase 4: Data Pipeline & Localization
- **Multi-lingual Scaling:** Move beyond English and Indonesian. Implement aggressive pre-generation for ES, FR, and DE locales in the background queues, saving to Supabase before edge retrieval.
- **DDoS/WAF Upgrades:** Transition critical proxy endpoints to Cloudflare WAF entirely if Upstash limits become too costly.

---

*For deeper architectural documentation, refer to the `/docs/audit` directory and individual component implementations.*
