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

### 3.2. 4-Tier AI Engine Architecture
LifeBloom Hub heavily relies on AI as a background autopilot, utilizing a 4-tier provider strategy to balance speed, reasoning, and cost.

**1. Primary Real-Time Engine (Grok by xAI):**
- **Sistem & Cara Kerja:** Grok is integrated via the `XAI_API_KEY` configuration. It is exceptionally fast and has real-time context capabilities.
- **Kegunaan:** Digunakan sebagai mesin utama untuk NLP ringan yang butuh kecepatan tinggi: kategorisasi RSS feed instan, deteksi pilar semantik (Home, Money, Pet), sentiment analysis, dan penulisan ulang judul untuk AEO (AI Engine Optimization).

**2. Primary Advanced Engine (Gemini by Google AI Studio):**
- **Sistem & Cara Kerja:** Gemini integrated via `GEMINI_API_KEY`.
- **Kegunaan:** Digunakan sebagai AI utama kedua untuk tugas analitis yang lebih mendalam, penalaran *multi-modal* (gambar & teks), atau ekstraksi data terstruktur panjang (*long-form extraction*) seperti mengubah hasil *scrape* halaman penuh menjadi objek JSON yang siap masuk ke Supabase.

**3. Algorithmic & Backend Engine (Anthropic Claude):**
- **Sistem & Cara Kerja:** Claude (via `ANTHROPIC_API_KEY`) sangat unggul dalam logika *coding* dan penjadwalan kompleks.
- **Saran Penggunaan (Sistem & Operasi):** Sangat disarankan untuk memproses tugas internal *backend*: penyusunan algoritma *feed ranking* yang dinamis, orkestrasi *workflow* (memutuskan urutan tugas AI lain), audit keamanan konten, dan ekstraksi *knowledge graph* secara periodik.

**4. Operations & Fallback Engine (OpenAI):**
- **Sistem & Cara Kerja:** OpenAI (via `OPENAI_API_KEY`) digunakan sebagai pilar stabilitas.
- **Saran Penggunaan:** Operasi sinkronisasi data skala besar, pembuatan *embedding vectors* untuk pencarian semantik (menggunakan `text-embedding-3-small`), dan operasi *fallback* jika penyedia lain sedang *downtime*.

### 3.3. Translation Adapter Architecture
The `TranslationService` in `/src/lib/services/translationAdapter.ts` dynamically routes requests:
- If `DEEPL_API_KEY` is provided, it uses the high-performance DeepLProvider.
- If DeepL is missing but `LIBRETRANSLATE_URL` exists, it uses LibreTranslate.
- If neither are present (typical in local dev), it returns a mocked translation string (`"[Mock Translated to {lang}]: {text}"`), preventing development blockages.
