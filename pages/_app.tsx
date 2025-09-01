import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  roles?: string[]
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
        const response = await fetch('/api/auth/verify')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          // Redirect to login if not authenticated
          router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Show loading spinner while checking authentication
  if (loading && router.pathname !== '/login' && !router.pathname.startsWith('/api/')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  return <Component {...pageProps} user={user} />
}