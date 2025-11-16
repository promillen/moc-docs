import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Script from 'next/script'
import { supabase } from '../lib/supabase'
import '../styles/mermaid.css'

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

        // Check if user has developer role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single()

        if (roleError || !roleData) {
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
      <>
        <Head>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </Head>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '2px solid #e5e7eb',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
            <p style={{ marginTop: '8px', color: '#6b7280' }}>Verifying access...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Script src="/mermaid-zoom.js" strategy="afterInteractive" />
      <Component {...pageProps} user={user} />
    </>
  )
}