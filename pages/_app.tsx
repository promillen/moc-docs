import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/globals.css'

interface User {
  id: string
  email: string
  role?: string
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Skip auth check for login page and API routes
    if (router.pathname === '/login' || router.pathname.startsWith('/api/')) {
      setLoading(false)
      return
    }

    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session?.user) {
          // Redirect to login if not authenticated
          router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`)
          return
        }

        // Check if user has developer or admin role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single()

        if (roleError || !roleData) {
          console.error('Role check error:', roleError)
          router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`)
          return
        }

        if (roleData.role !== 'developer') {
          // User doesn't have the required role
          await supabase.auth.signOut()
          router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`)
          return
        }

        // Set authenticated user with role
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: roleData.role
        })

      } catch (error) {
        console.error('Auth check failed:', error)
        router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null)
        if (router.pathname !== '/login') {
          router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  // Show loading spinner while checking authentication
  if (loading && router.pathname !== '/login' && !router.pathname.startsWith('/api/')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  return <Component {...pageProps} user={user} />
}