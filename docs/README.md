# LifeBloom Hub Documentation

Welcome to the central documentation directory for **LifeBloom Hub**, an accessible, AI-powered multi-pillar wellness portal designed for modern adults and seniors. 

Our documentation standardizes on **English** as the default language for both code structures and guidelines, supporting multiple dynamic locales (`en`, `id`, `es`, `fr`, `de`) via `next-intl`.

---

## Table of Documents

For detailed technical references, architectural specs, and development rules, please refer to the following flat-hierarchy markdown files:

1. **[Architecture & Core Stack](file:///Users/mac/Downloads/PROYEK/LIFEBLOOMHUB/docs/architecture.md)**
   Overview of the technical framework (Next.js 15, React 19, Supabase, Tailwind CSS, Radix UI), application directory structure, edge-rendering strategies, Partial Prerendering (PPR), and E-E-A-T/AEO structured data insertion.

2. **[Product Requirements & Specifications](file:///Users/mac/Downloads/PROYEK/LIFEBLOOMHUB/docs/product_specs.md)**
   Product vision, 3-Tier Role-Based Access Control (RBAC) details, Entity Relationship Diagram (ERD) in Mermaid syntax, high-fidelity UX flows, and automated Pinterest virality mechanisms.

3. **[Database Schema & RPC Reference](file:///Users/mac/Downloads/PROYEK/LIFEBLOOMHUB/docs/database_schema.md)**
   Detailed relational schemas (Users, Experts, Calculations, Metrics, Sponsors), Row-Level Security (RLS) policies, and high-performance database-side PostgreSQL triggers and RPC functions (such as randomized samples).

4. **[Translation & Content Pipeline](file:///Users/mac/Downloads/PROYEK/LIFEBLOOMHUB/docs/translation_pipeline.md)**
   Dual-provider translation system adapter (DeepL & LibreTranslate), mock localization fallback modes, dynamic URL routing middleware, and keyword-based NLP pillar ingestion services for RSS streams.

5. **[API Reference](file:///Users/mac/Downloads/PROYEK/LIFEBLOOMHUB/docs/api_reference.md)**
   Endpoints index including secure client-side dynamic affiliate link masking proxies (`/api/affiliate`), automated cron handlers (`/api/cron/...`), and semantic search parameters.

6. **[Development & Setup Guide](file:///Users/mac/Downloads/PROYEK/LIFEBLOOMHUB/docs/development_guide.md)**
   Step-by-step local installation, comprehensive environment variables blueprint, Mock Auth Mode execution rules, absolute coding accessibility standards (WCAG 2.2 AA), and AI prompting workflows.

7. **[Testing & Quality Assurance Strategy](file:///Users/mac/Downloads/PROYEK/LIFEBLOOMHUB/docs/testing_strategy.md)**
   Verification checklists, Core Web Vitals targets, Lighthouse accessibility compliance targets, and end-to-end integration strategies.
