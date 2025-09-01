import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that don't require authentication
const publicPaths = ['/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip authentication check for public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for Supabase session cookies
  const supabaseAuthToken = request.cookies.get('sb-access-token')?.value
  const supabaseRefreshToken = request.cookies.get('sb-refresh-token')?.value
  
  // Check for Supabase session in different possible cookie formats
  let hasValidSession = false
  
  // Check if we have access token
  if (supabaseAuthToken) {
    hasValidSession = true
  }
  
  // Also check for Supabase auth session cookie (alternative format)
  const supabaseSession = request.cookies.get('sb-' + process.env.NEXT_PUBLIC_SUPABASE_REF + '-auth-token')?.value
  if (supabaseSession) {
    try {
      const sessionData = JSON.parse(supabaseSession)
      if (sessionData.access_token) {
        hasValidSession = true
      }
    } catch (e) {
      // Invalid session data
    }
  }

  // If no valid session, redirect to login
  if (!hasValidSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // User has valid session, allow access
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (handled separately)
     * - login page (public)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|login).*)',
  ],
}