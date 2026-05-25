# Testing Strategy & Quality Assurance

To maintain a frictionless and dignified experience for our multi-generational audience, LifeBloom Hub enforces strict accessibility, performance, and compliance metrics.

---

## 1. Accessibility Standards (WCAG 2.2 AA)

Because a significant portion of our users are seniors (55+), UI/UX is heavily tested against physical limitations (presbyopia, limited fine motor control).

- **Contrast Ratios:** Minimum contrast of **4.5:1** for standard text against its background, and **3:1** for large text or interactive UI borders.
- **Touch Targets:** Any interactive element (button, link, slider node, checkbox) MUST have a minimum physical size or padded area of **48x48px**. 
- **Focus Rings:** Visible, high-contrast outlines (e.g., `ring-2 ring-brand-blue`) must appear during keyboard tab navigation.
- **Motion Reduction:** All CSS transitions and animations must be wrapped in `@media (prefers-reduced-motion)` to prevent triggering vertigo.
- **Plain Language:** Forms and tooltips must avoid banking or medical jargon.

---

## 2. Core Web Vitals (Lighthouse Optimization)

The edge-rendering infrastructure is designed to pass Google Lighthouse targets consistently:
- **LCP (Largest Contentful Paint):** Target < 2.5s. Achieved by caching the HTML shell at the edge using PPR and lazy-loading heavy client calculators.
- **CLS (Cumulative Layout Shift):** Target < 0.1. Ad banner containers and client-rendered charts (Recharts) MUST be wrapped in dimensionally-locked skeleton loaders (`min-h-[Xpx]`) so the page layout doesn't shift when they mount.
- **INP (Interaction to Next Paint):** Target < 200ms. Heavy math processing (e.g., Monte Carlo simulations) is delegated to Web Workers or lightweight client hooks rather than blocking the main thread.

---

## 3. End-to-End (E2E) Verification

For local and integration testing:
- **Mock Auth Mode Validation:** Test the behavior of `NEXT_PUBLIC_USE_MOCK_AUTH=true` to ensure the dashboard remains fully navigable and calculator states persist to `localStorage` when the Supabase network layer is bypassed.
- **Anonymous Session Migration Check:** Crucial E2E flow: Verify that anonymous `localStorage` sessions cleanly map and UPSERT into PostgreSQL when a user registers via Magic Link.
