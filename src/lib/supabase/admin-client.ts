import { createClient } from '@supabase/supabase-js'

// Server-side only — uses service role key to bypass RLS
// Safe to import from server components, API routes, and storefront helpers
// NEVER bundle this in client components (service role key must stay server-side)
export function createAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
