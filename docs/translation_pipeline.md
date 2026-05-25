# Translation & Content Pipeline

This document outlines the multi-region internationalization (i18n) model and automated dynamic content pipeline of **LifeBloom Hub**.

---

## 1. Multi-Region Internationalization (i18n)

LifeBloom Hub targets a global multigenerational audience. It uses the `next-intl` framework to manage localized routing and rendering.

### 1.1. Supported Locales
- **`en` (English - Standard Default Locale)**
- `id` (Indonesian)
- `es` (Spanish)
- `fr` (French)
- `de` (German)

All UI-specific labels, forms, buttons, and system text are completely externalized into locale dictionaries located under `src/i18n/messages/` (e.g., `en.json`, `id.json`). Hardcoding raw strings inside visual components is strictly prohibited. If a dictionary key is missing in a secondary locale, the system automatically falls back to the English (`en`) translation.

### 1.2. Localized Routing Middleware
Next.js middleware captures incoming request subdomains or headers and routes visitors to the appropriate locale slug path (e.g., `/en/money-future/retirement-planner`, `/id/money-future/retirement-planner`).

---

## 2. Translation Service Adapter (`TranslationService`)

For automated dynamic database records translation (such as external RSS articles and community posts), the codebase implements a robust, decoupling adapter class.

```
                  ┌───────────────────────────────┐
                  │      TranslationService       │
                  └───────────────┬───────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌───────────────────────────────┐                 ┌───────────────────────────────┐
│         DeepLProvider         │                 │    LibreTranslateProvider     │
│ - Primary choice              │                 │ - Secondary choice            │
│ - Used if DEEPL_API_KEY exists│                 │ - Used if LIBRETRANSLATE_URL  │
└───────────────────────────────┘                 └───────────────────────────────┘
```

- **Dual-Provider Strategy:** The `TranslationService` determines the active provider at startup. If `DEEPL_API_KEY` is present, it uses the high-performance `DeepLProvider`. If `DEEPL_API_KEY` is empty but `LIBRETRANSLATE_URL` is set, it switches to `LibreTranslateProvider`.
- **Offline Mock Fallback:** If no environment credentials are set for either provider during local offline development, the adapter logs a warning and returns a formatted mock translation: `"[Mock Translated to {lang}]: {text}"`. This ensures that local developer sandboxes remain fully operational without paid translation tokens.

---

## 3. RSS Feed Ingestion Pipeline

To supply our pillars with fresh, accessible wellness alerts and financial guides without manually drafting content:

1. **Trigger (Vercel Cron):** A serverless cron runs daily at `/api/cron/rss-ingest`.
2. **Fetch:** Pulls articles from respected sources (Mayo Clinic, Harvard Health, Kiplinger Finance).
3. **Cryptographic Deduplication (ON CONFLICT DO NOTHING):**
   To prevent duplicate content indexing, a SHA-256 hash is generated for each item's combined Title and Link:
   `hashId = SHA256(Title + "|" + Link)`
   The pipeline performs an upsert against the database. If the hash ID already exists, the database ignores it (`ON CONFLICT DO NOTHING`), preserving serverless processing cycles.
4. **NLP Pillar Routing:**
   Instead of manually tagging incoming feeds, the system processes article text using **Compromise NLP** client-side or serverless. It parses for primary entities and matches them to active pillars:
   - Matches like `'money'`, `'retirement'`, or `'budget'` route to `money-future`.
   - Matches like `'pet'`, `'veterinary'`, or `'canine'` route to `pet-family`.
   - Matches like `'accessibility'`, `'senior'`, or `'health'` route to `senior`.
5. **Localization Cascade:**
   The newly ingested article text is piped through the `TranslationService` to automatically generate translated equivalents, storing them in PostgreSQL ready for localized edge-cached readers.
