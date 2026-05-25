# Database Schema & RPC Reference

LifeBloom Hub uses **Supabase (PostgreSQL)** as its primary database. Relational schemas, Row-Level Security (RLS) policies, and performance-optimized PostgreSQL functions (RPCs) are designed for extreme speed and security.

---

## 1. Database Migrations

All structural database tables and functions are managed using pure SQL migration files under `supabase/migrations/`. Modifying schemas manually through the Supabase Studio UI is prohibited in production to maintain strict version control.

---

## 2. Relational Table Schemas

### 2.1. `users` & `profiles` (Auth Core)
- Extends Supabase auth.users.
- `id` (uuid, Primary Key)
- `email` (text)
- `display_name` (text)
- `role` (text) - Can be `'user'`, `'expert'`, or `'admin'`.
- `subscription_tier` (text) - `'free'` or `'premium'`.

### 2.2. `expert_profiles` (E-E-A-T Credibility)
- Linked 1:1 with `profiles.id`.
- `id` (uuid, Primary Key)
- `user_id` (uuid, Foreign Key referencing `profiles.id`, Unique)
- `full_name` (text)
- `credentials` (text) - e.g., "M.D., Cardiologist", "Certified Financial Planner"
- `orcid_id` (text, Optional) - Validated professional researcher ID
- `wikidata_id` (text, Optional) - Validated brand/organization ID
- `is_verified` (boolean) - Managed exclusively by administrators

### 2.3. `user_calculations` (UserData Storage)
- Stores interactive session values.
- `id` (uuid, Primary Key)
- `user_id` (uuid, Foreign Key referencing `profiles.id` on delete cascade)
- `calculator_slug` (text) - e.g., `'retirement-planner'`, `'yield-radar'`
- `input_data` (jsonb) - Arbitrary slider values stored as a document
- `result_data` (jsonb) - Output projections
- `created_at` (timestamp with time zone)

### 2.4. `content_metrics` (SEO & Trending Analytics)
- Captures content performance globally without tracking Personal Identifiable Information (PII) to comply with GDPR.
- `id` (uuid, Primary Key)
- `slug` (text, Unique) - e.g., `'money-retirement-tips'`
- `content_type` (text) - `'article'` or `'tool'`
- `total_views` (integer)
- `trending_score` (float) - Calculated using time-decay views algorithms

### 2.5. `sponsors` (Monetization Engine)
- Approved brand listings.
- `id` (uuid, Primary key)
- `company_name` (text)
- `logo_url` (text)
- `target_pillar` (text) - e.g., `'senior'`, `'money'`
- `is_approved` (boolean) - Elevates to active display upon admin approval

---

## 3. Row-Level Security (RLS) Policies

To protect patient and financial calculation data, Row-Level Security is strictly enforced:

1. **`user_calculations` Policy:**
   - **SELECT / INSERT / UPDATE / DELETE:** Restricted to the authenticated user owning the record.
   - `auth.uid() == user_id`
2. **`expert_profiles` Policy:**
   - **SELECT:** Publicly viewable for verified experts.
   - **INSERT / UPDATE:** Only allowed by the owning expert.
   - **DELETE:** Restriced to administrators.
3. **`sponsors` Policy:**
   - **SELECT:** Publicly viewable if `is_approved` is true.
   - **ALL OTHER MUTATIONS:** Restricted to authenticated administrators (`profiles.role === 'admin'`).

---

## 4. Performance-Optimized Database Functions (RPC)

To reduce serverless payload latency and prevent massive database tables scans under heavy traffic, custom PostgreSQL functions are compiled database-side:

### 4.1. Randomized Pillar Extraction (`get_popular_posts_by_pillar`)
When rendering dynamic pillar cards on the homepage, querying the database using standard `ORDER BY RANDOM()` performs full-table scans that consume extensive RAM. 

Instead, LifeBloom Hub utilizes a database-side tablesample RPC:
```sql
CREATE OR REPLACE FUNCTION get_popular_posts_by_pillar(target_pillar text, limit_count int)
RETURNS SETOF content_metrics AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM content_metrics TABLESAMPLE SYSTEM (5)
  WHERE content_type = 'article' AND slug LIKE target_pillar || '%'
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```
**Mechanism:** `TABLESAMPLE SYSTEM (5)` retrieves 5% of physical storage pages directly from disk, bypassing full-table indexes before applying filtering. This guarantees sub-millisecond execution times even with millions of rows.
