import { createClient } from '@supabase/supabase-js'

// Server-side only — uses service role key to bypass RLS.
// Next.js 14 patches global fetch and caches GET responses by default.
// We override fetch with cache: 'no-store' so every query hits Supabase fresh.
export function createAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        fetch: (url, options = {}) =>
          fetch(url, { ...options, cache: 'no-store' }),
      },
    }
  )
}
