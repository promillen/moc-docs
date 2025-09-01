import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that don't require authentication
const publicPaths = ['/login', '/api/auth']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Temporarily disable authentication to test redirect loop fix
  console.log('Middleware hit:', pathname)
  return NextResponse.next()

  // Skip authentication check for public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for auth token in cookies
  const authToken = request.cookies.get('moc-auth-token')?.value
  const authSession = request.cookies.get('moc-session')?.value

  // If no auth token, redirect to login
  if (!authToken && !authSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Continue - the actual validation will be done by the verify API
  // This middleware just ensures users go through the login flow
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