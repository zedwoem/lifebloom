---
name: lumen-9-protocol
description: >-
  Standardizes engineering excellence, data guardrails, and architectural
  safety under the LUMEN-9 Protocol for the LifeBloom Hub enterprise ecosystem.
---

# LifeBloom Hub: Engineering Excellence (LUMEN-9 Protocol)

## Overview
This skill implements and enforces the **LUMEN-9 Protocol**, the absolute engineering gatekeeper for developers and AI agents working within the LifeBloom Hub ecosystem. It guarantees codebase clean-builds, strict regulatory compliance, bulletproof API fail-soft structures, secure operational procedures, and standard development rituals.

## Dependencies
- `react-doctor` (for quality linting and code architecture scans)
- `supabase` (for schema and RLS testing validation)
- `modern-web-guidance` (for high-contrast a11y standards)

## 1. Quality Gatekeeper (Mandatory Execution)
Before proposing any code change, committing, or initiating a Pull Request, the validating script **must** be executed successfully:
```bash
npm run system-check
```

### Protocol Guidelines:
- **Scope**: The checker executes TypeScript compilation (`tsc`), ESLint validation, and simulated Row Level Security (RLS) configuration audits.
- **AI Rule**: If the `npm run system-check` command exits with a non-zero code or outputs any compilation errors, the AI agent is **strictly prohibited** from committing changes or proposing pull requests. Fix the errors first!

## 2. E-E-A-T & Data Guardrails
LifeBloom Hub operates in sensitive medical (`senior`, `pet-family`) and financial (`money-future`) domains. Under the LUMEN-9 Protocol, the following guardrails are mandatory:

- **Scientific Proof Verification**: All output content streams or recommendation modules must pass through the `CitationsEngine.tsx` component.
  ```tsx
  import { CitationsEngine } from "@/components/content/CitationsEngine";
  
  // Example usage in pages
  <CitationsEngine 
    citations={[{ source: "OpenFDA Clinical Database", url: "https://open.fda.gov" }]} 
  />
  ```
- **Legal Compliance Disclaimers**: You **must** include the global `DISCLAIMER_TEXT` variable inside every interactive slider, checklist, or calculator component.
  ```tsx
  import { DISCLAIMER_TEXT } from "@/lib/constants/disclaimers";
  
  // Render disclaimer below output results
  <p className="text-xs text-slate-500 mt-4">{DISCLAIMER_TEXT.medical}</p>
  ```

## 3. Resilience Pattern (Fail-Soft)
All integrations with external databases or APIs ( FRED, Travelpayouts, CoinGecko, OpenFDA) must implement fail-soft safety barriers:

- **Upstash Redis Circuit Breaker**: Every external API caller must integrate the Upstash Redis rate-limiter or circuit breaker to prevent cascade failures when vendor endpoints are unresponsive or depleted.
- **Aggressive Fallback Layer**: Every service adapter must expose `DEFAULT_FALLBACK_DATA`. Services must **never** return `null` or `undefined` to Next.js Client Components, eliminating runtime hydration or render crashes.
  ```typescript
  // Canonical fallback pattern inside adapters
  try {
    const data = await fetchWithTimeout(api_url);
    return data;
  } catch (error) {
    console.warn("[Adapter Error] Falling back to default static data:", error);
    return DEFAULT_FALLBACK_DATA;
  }
  ```

## 4. Operational Maintenance & Security
- **Cron Authentication**: Every Next.js API Route triggered by Cron Jobs (e.g. `/api/cron/rss-ingest`) must enforce Webhook Signature Verification using the `CRON_SECRET` to prevent unauthorized external triggers.
- **Secure Key Loading**: Direct access to `process.env` inside the root or body of frontend components is a **fatal security violation**. All environment keys and client config must be loaded through the standard loader:
  ```typescript
  // Load environment variables securely
  import { loadEnv } from "@/scripts/loadEnv";
  ```

## 5. Development Rituals & Git Standards
- **I.M.V. Protocol**: Before modifying any source file, execute the **I.M.V. (Initialize, Map, Verify) Protocol**:
  1. **Initialize**: Confirm that the local state is clean.
  2. **Map**: Locate the specific component boundaries.
  3. **Verify**: Ensure that the compiler builds cleanly before coding.
- **Automated Changelogs**: Every successful git commit must append its concise modification description directly to `CHANGELOG.md` to ensure a transparent, chronological ledger of progress.

## Common Mistakes
1. **Reusing Aborted Signals**: Reusing the same `AbortSignal` across sequential LLM fallback requests. Always generate a fresh `AbortController` per try inside retries.
2. **Unauthenticated Server Actions**: Exporting actions in `"use server"` without adding an explicit auth check (`createClient()` verification) at the top of the file.
3. **Raw String Copywriting**: Hardcoding technical or raw developer terms in place of empathetic, caregiver-centric English descriptions.
