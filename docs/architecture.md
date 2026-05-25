# Architecture & Core Tech Stack

This document specifies the technical foundation, folder structures, and rendering parameters governing **LifeBloom Hub**.

---

## 1. Core Technology Stack

- **Framework:** Next.js 15+ (App Router, React 19)
- **Language:** TypeScript (Strict Mode)
- **Styling & Layout:** Vanilla CSS and Tailwind CSS 3.4+
- **Interactive UI Components:** Radix UI primitives & `shadcn/ui` accessible UI structures
- **Internationalization (i18n):** `next-intl` (Middleware-based dynamic localized routing)
- **Database & Identity:** Supabase (PostgreSQL with RLS, Supabase Auth via passwordless Magic Links, Edge Functions)
- **Video & Media playback:** Plyr.js (with synced transcribing highlights)
- **Deployment Platform:** Vercel (Edge-cached static pages with Serverless & Edge API routes)

---

## 2. Directory Structure (`/src`)

The codebase uses a clear, highly modular structure optimized for performance, localization, and SEO:

```
src/
├── app/
│   └── [locale]/
│       ├── (account)/          # Private dashboard, user profiles
│       ├── (admin)/            # Secure administration center
│       ├── article/            # Dynamic blog posts & medical alerts
│       ├── embed/              # Third-party calculator integration scripts
│       ├── home-living/        # Pillar 1 Pages (Renovation, Smart Matcher)
│       ├── money-future/       # Pillar 2 Pages (Retirement Planner, Yield Radar)
│       ├── pet-family/         # Pillar 3 Pages (Pet Matcher, Symptom Checker)
│       ├── senior/             # Pillar 4 Pages (Mobility Checklist, Elderly Care)
│       ├── travel/             # Pillar 5 Pages (Multi-gen trip builders)
│       ├── layout.tsx          # Global structural layout with locale context
│       └── page.tsx            # Universal multi-pillar homepage
├── components/
│   ├── ui/                     # Accessible atomic elements (Buttons, Inputs, Modals)
│   ├── seo/                    # Structured JSON-LD metadata injection wrappers
│   └── calculators/            # Client-side computed math engines & sliders
├── lib/
│   ├── actions/                # Next.js Server Actions (Database updates, role elevations)
│   ├── constants/              # Global variables, pillars info, constant indexes
│   ├── hooks/                  # Custom React hooks (useAuth, useMounted)
│   ├── services/               # RSS ingest pipelines, Content fetching, translation adapters
│   └── supabase/               # Browser, Server, and Service-Role database clients
└── i18n/
    └── messages/               # Localization JSON dictionaries (en.json, id.json, etc.)
```

---

## 3. Core Design Principles

1. **Zero-Trust Security:** Row Level Security (RLS) is strictly enforced on all PostgreSQL tables. Client-side Next.js connections are restricted to public read-only profiles. All administrative mutations are isolated inside Next.js Server Actions or server-side Edge APIs.
2. **Client-Side Decentralization:** To keep infrastructure costs low, all complex computational mathematical engines (such as Yield calculations, amortization matrices, and PDF report rendering) are processed entirely in the visitor's browser. Server-side processing is used exclusively for storage, indexing, and authentication.
3. **Hybrid Development Mocks:** The codebase supports an isolated Mock Mode allowing local development of advanced dashboard areas without needing active live credentials or remote databases.
4. **E-E-A-T Optimized Authorship:** To meet medical and financial trust thresholds, article renderers dynamically link to expert profiles, fetching verified ORCID / Wikidata credentials and displaying professional signatures.

---

## 4. Partial Prerendering (PPR) & Edge Performance

To ensure instant page load speeds for seniors and users on slower mobile connections, the system leverages Next.js **Partial Prerendering (PPR)**:
- **Static Edge Shell:** The primary structural shell, core layout, static navigation, and plain-language translations are compiled into static assets and cached globally across CDN nodes.
- **Dynamic Streams (Suspense):** Highly dynamic components—such as personalized user greeting headers, saved calculation histories, or live sponsor logos—are wrapped in React `<Suspense>` components. These stream in from Edge servers once the initial page shell has loaded.

---

## 5. AEO & GEO Schema Injection

For maximum discoverability in AI search engines (Perplexity, Gemini, ChatGPT) as well as traditional search consoles:
- **LLM Scraper Anchors:** Key semantic landing pages render invisible `<LLMAnchor>` components (`data-llm-anchor`) loaded with programmatic context summaries to help AI crawlers quickly synthesize content.
- **Direct Answer Boxes:** Highly optimized direct summary elements are injected directly beneath header rows to capture featured snippets and direct answers in search engines.
