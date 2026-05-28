import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
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
