import 'server-only';
import postgres from "postgres"

let sqlClient: ReturnType<typeof postgres> | null = null;

/**
 * Creates an Edge-compatible direct connection pooling client to connect
 * to Supavisor on Port 6543 (transaction mode).
 * Falls back gracefully to standard REST API clients if pooler URL is not configured.
 */
export function createPoolClient() {
  if (sqlClient) return sqlClient;

  // Expected format: postgres://postgres.[ref]:[password]@db.[ref].supabase.co:6543/postgres
  const connectionString = process.env.SUPABASE_POOLER_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn(
      "[SUPABASE POOLER] SUPABASE_POOLER_URL is missing. Mutative Server Actions will fall back to REST API clients."
    );
    return null;
  }

  try {
    sqlClient = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: "require",
      prepare: true // Enforces Prepared Statements
    });
    return sqlClient;
  } catch (error) {
    console.error("[SUPABASE POOLER] Initialization failed:", error);
    return null;
  }
}
