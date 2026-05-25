# LifeBloom Hub - Enterprise Platform

**LifeBloom Hub** is an AI-powered, senior-friendly digital wellness hub that curates content, calculators, and product recommendations across five foundational life pillars: Home, Money, Pet, Senior Wellness, and Travel. 

The platform features frictionless authentication, a gamified engagement system (Bloom Points), and robust programmatic SEO tailored to an aging demographic (65+).

## Project Architecture

This project is built using:
- **Framework:** Next.js 15 (App Router, Server Components, Partial Prerendering)
- **Styling:** Tailwind CSS + shadcn/ui
- **Language:** TypeScript
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Edge Functions)
- **Localization:** `next-intl` (English, Indonesian, Spanish, French, German)

## Directory Structure

We adhere to a strict Enterprise standard layout:
- `/docs`: Project specifications, PRDs, component standards, and prompt libraries.
- `/src/app`: Next.js Routing and UI layout.
- `/src/components`: React components separated by domain (ui, features, calculators, growth).
- `/src/lib`: Core utilities, Supabase client setups, custom hooks, and constants.
- `/supabase`: Database migration scripts and Deno Edge Functions.

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Copy `.env.example` to `.env.local` and configure your Supabase variables.

3. **Development Server:**
   ```bash
   npm run dev
   ```

## Development Guidelines
Please refer to the `/docs/core/1_RULES.md` and `/docs/core/6_SESSION_STARTER.md` before making any major architectural changes or when interacting with AI agent tooling.
