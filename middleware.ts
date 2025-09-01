import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that don't require authentication
const publicPaths = ['/login', '/api/auth']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('Middleware checking path:', pathname)

  // Skip authentication check for public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    console.log('Public path, allowing access:', pathname)
    return NextResponse.next()
  }

  // Check for auth token in cookies
  const authToken = request.cookies.get('moc-auth-token')?.value
  const authSession = request.cookies.get('moc-session')?.value

  console.log('Auth check - token exists:', !!authToken, 'session exists:', !!authSession)

  // If no auth token, redirect to login
  if (!authToken && !authSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    console.log('No auth found, redirecting to:', loginUrl.toString())
    return NextResponse.redirect(loginUrl)
  }

  // Continue - the actual validation will be done by the verify API
  console.log('Auth found, allowing access to:', pathname)
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