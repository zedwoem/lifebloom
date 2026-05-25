# Setup & Deployment Guide

Welcome to the central configuration, setup, and deployment guide for **LifeBloom Hub**. This document covers local development, environment variable documentation, our AI integration pipelines, and mock-mode strategies.

---

## 1. Local Development Setup

### 1.1. Prerequisites
- **Node.js** >= 18.17.0
- **Git**
- **Supabase CLI** (Required if running database migrations locally)
- **Stripe CLI** (For webhook testing if implementing premium features)

### 1.2. Installation Steps
1. Clone the repository to your local machine.
2. Run `npm install` (or `pnpm install` / `yarn install`) to fetch dependencies.
3. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
4. Configure `.env.local` based on the Variable Dictionary below.
5. Start the development server:
   ```bash
   npm run dev
   ```

---

## 2. Environment Variables Dictionary

Our environment variables are grouped into 12 strictly categorized sections. 
*Note: Any key prefixed with `NEXT_PUBLIC_` is exposed to the browser. Do not place sensitive secrets in these keys.*

1. **NEXT.JS CORE SYSTEM & ROUTING:**
   - `NEXT_PUBLIC_APP_URL` & `NEXT_PUBLIC_BASE_URL`: The root domains for CORS and metadata generation.
   - `NEXT_PUBLIC_DEFAULT_LOCALE`: Defaults to `en`.
   - `NEXT_PUBLIC_USE_MOCK_AUTH`: Set to `true` during local development to bypass Supabase credential requirements.

2. **SUPABASE (DATABASE, AUTH, STORAGE):**
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Client-side access restricted by RLS.
   - `SUPABASE_SERVICE_ROLE_KEY`: Server-side only admin key.

3. **KECERDASAN BUATAN (AI / LLM PROVIDERS):**
   - `XAI_API_KEY`: Used to call Grok (xAI) for high-speed categorization, sentiment analysis, and NLP tasks on incoming data streams.
   - `GEMINI_API_KEY`: Fallback for advanced analytical tasks, deep reasoning, or structured data extraction.
   - Translation integrations (`DEEPL_API_KEY`, `LIBRETRANSLATE_URL`).

4. **PAYMENT GATEWAYS:** Stripe & PayPal integrations for sponsorship/pro accounts.
5. **SOCIAL MEDIA AUTO-POSTING:** API Keys for Pinterest, Threads, Mastodon, Bluesky used by Cron Jobs.
6. **CACHING:** Upstash Redis bindings for rate limiting and debounce caching.
7. **LOGGING / APM:** Integrations for Sentry (frontend tracking), DataDog, or New Relic.
8. **EMAIL & NOTIFICATIONS:** Resend (primary), SendGrid (fallback), Twilio (SMS), Telegram (admin alerts).
9. **AFFILIATE NETWORKS:** Amazon Associates, Chewy, and Travelpayouts configurations to securely inject affiliate links without extensions stealing commissions.
10. **NEW INTEGRATIONS:** Third-party APIs like ElevenLabs (TTS), Amadeus (Flights), PetFinder, and OpenFDA.
11. **SECURITY:** `CRON_SECRET` used to authenticate background cron jobs triggered by Vercel.
12. **FEATURE FLAGS:** Toggles for maintenance mode, embedded widgets, and automated pinning.

---

## 3. Advanced Configurations

### 3.1. Mock Auth Mode (`NEXT_PUBLIC_USE_MOCK_AUTH=true`)
When starting development, you may not have active Supabase connections. Setting `NEXT_PUBLIC_USE_MOCK_AUTH=true` forces the internal `metricsService`, authentication hooks, and global search bars to bypass database calls.
- It permits simulated access to protected routes like `/en/dashboard` or `/(admin)`.
- It disables network fetches for `content_metrics` and returns localized mock data arrays instead.
- **WARNING:** Ensure this is set to `false` in Vercel Production Settings.

### 3.2. AI API Pipeline (Grok & Gemini)
LifeBloom Hub heavily relies on AI as a background autopilot:
- **Primary AI (Grok):** We utilize xAI's Grok API via `XAI_API_KEY`. It serves as the primary engine for RSS feed categorization, detecting semantic pillars (Home, Money, Pet, etc.) in raw articles instantly, and rewriting titles for AEO (AI Engine Optimization) efficiently at scale.
- **Advanced AI (Gemini via AI Studio):** For complex tasks requiring multi-modal reasoning or highly structured long-form extraction, we use `GEMINI_API_KEY`. It acts as a resilient fallback and reasoning engine when lightweight NLP is insufficient.

### 3.3. Translation Adapter Architecture
The `TranslationService` in `/src/lib/services/translationAdapter.ts` dynamically routes requests:
- If `DEEPL_API_KEY` is provided, it uses the high-performance DeepLProvider.
- If DeepL is missing but `LIBRETRANSLATE_URL` exists, it uses LibreTranslate.
- If neither are present (typical in local dev), it returns a mocked translation string (`"[Mock Translated to {lang}]: {text}"`), preventing development blockages.
