import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

/**
 * Server-only Supabase client. Never import this from a "use client" module.
 */
export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.',
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return client;
}
