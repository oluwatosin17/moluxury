import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const publicPaths = ['/admin/login', '/admin/auth/callback']
  if (publicPaths.some(p => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options))
        },
      },
    }
  )

  // getSession() decodes the JWT from the cookie locally — no network call.
  // This keeps middleware well within Vercel Edge's execution budget.
  // Full server-side validation still happens inside each API route via
  // createAdminSupabaseClient() which calls the Supabase REST API directly.
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  const email = session.user?.email?.toLowerCase() ?? ''
  if (!ADMIN_EMAILS.includes(email)) {
    return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url))
  }

  return response
}

export const config = { matcher: ['/admin/:path*'] }
