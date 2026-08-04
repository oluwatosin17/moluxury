import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const redirectTo = NextResponse.redirect(`${origin}/admin/dashboard`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Only set on the redirect response — cookieStore.set() can
              // throw in some Next.js contexts and kill the exchange
              try { cookieStore.set(name, value, options) } catch { /* ok */ }
              redirectTo.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return redirectTo
      }
      console.error('[auth/callback] Code exchange error:', error.message)
    } catch (e) {
      console.error('[auth/callback] Code exchange threw:', e)
    }
  } else {
    console.error('[auth/callback] No code param in URL:', request.url)
  }

  return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`)
}
