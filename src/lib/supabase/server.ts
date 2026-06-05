import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Use in Server Components and Route Handlers that need cookie-based auth
export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )
}

// Re-export for convenience — no next/headers dependency
export { createAdminSupabaseClient } from './admin-client'
