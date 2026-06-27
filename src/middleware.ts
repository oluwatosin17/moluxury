import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Allowed admin emails — checked against the JWT payload.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

/**
 * Decode a JWT payload without verification.
 * This is safe because:
 *  - The JWT is issued and signed by Supabase; a forged token still cannot
 *    call any API route (those use the service-role key directly).
 *  - The middleware only gates the admin UI — it does not touch data.
 * Zero network calls → stays well within Vercel Edge's execution budget.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    // Convert base64url → base64, then decode
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(b64))
  } catch {
    return null
  }
}

/**
 * Extract the Supabase access token from the request cookies.
 * @supabase/ssr stores the session as JSON in:
 *   sb-<project-ref>-auth-token
 * When the value is large it is chunked:
 *   sb-<project-ref>-auth-token.0, .1, …
 */
function getAccessToken(request: NextRequest): string | null {
  const PROJECT = 'aurirjornlsqepblndwa'
  const BASE    = `sb-${PROJECT}-auth-token`

  // Try un-chunked cookie first
  const single = request.cookies.get(BASE)?.value
  if (single) {
    try {
      const parsed = JSON.parse(single)
      return parsed?.access_token ?? null
    } catch {
      // Value might already be just the token string
      return single.startsWith('eyJ') ? single : null
    }
  }

  // Try chunked cookies (.0, .1, …)
  const chunks: string[] = []
  for (let i = 0; i < 10; i++) {
    const chunk = request.cookies.get(`${BASE}.${i}`)?.value
    if (!chunk) break
    chunks.push(chunk)
  }
  if (chunks.length) {
    try {
      const joined = chunks.join('')
      const parsed = JSON.parse(joined)
      return parsed?.access_token ?? null
    } catch {
      return null
    }
  }

  return null
}

export function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Login + auth callback are always public
  const PUBLIC = ['/admin/login', '/admin/auth/callback']
  if (PUBLIC.some(p => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // ── Decode session from cookie — no network call ──────────────────────────
  const token = getAccessToken(request)
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  const payload = decodeJwtPayload(token)
  if (!payload) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Check token expiry (exp is Unix seconds)
  const exp = typeof payload.exp === 'number' ? payload.exp : 0
  if (exp && Date.now() / 1000 > exp) {
    // Token expired — let the client refresh it; send to login which will
    // redirect back automatically if a valid refresh token exists.
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Check admin email whitelist
  const email = (typeof payload.email === 'string' ? payload.email : '').toLowerCase()
  if (!email || !ADMIN_EMAILS.includes(email)) {
    return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url))
  }

  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
