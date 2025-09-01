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

  // Check for auth token in cookies (multiple possible cookie names)
  const authToken = request.cookies.get('moc-auth-token')?.value
  const authSession = request.cookies.get('moc-session')?.value
  const sbToken = request.cookies.get('sb-access-token')?.value
  const supabaseAuth = request.cookies.get('supabase.auth.token')?.value

  const hasAuth = !!(authToken || authSession || sbToken || supabaseAuth)
  
  console.log('Auth check - has any auth cookie:', hasAuth)

  // If no auth token, redirect to login
  if (!hasAuth) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    console.log('No auth found, redirecting to:', loginUrl.toString())
    return NextResponse.redirect(loginUrl)
  }

  // User has auth cookies, allow access (role checking will be done client-side)
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