import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import postgres from "postgres"
import type { Database } from './types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Error if setting cookie in Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Error if removing cookie in Server Component
          }
        },
      },
    }
  )
}

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

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

let serviceClient: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function createServiceClient() {
  if (serviceClient) return serviceClient;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("[Supabase Service Role Client] Credentials are not configured.");
  }
  
  serviceClient = createSupabaseClient<Database>(supabaseUrl, supabaseKey);
  return serviceClient;
}
