import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'

export default function Login() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { redirect } = router.query

  const handleLogin = () => {
    setIsLoading(true)
    
    // Construct the dashboard login URL with return redirect
    const dashboardLoginUrl = new URL('https://dashboard.moc-iot.com/auth')
    
    // After successful login, dashboard should redirect back here with token
    const returnUrl = new URL('/api/auth/callback', 'https://docs.moc-iot.com')
    if (redirect) {
      returnUrl.searchParams.set('redirect', redirect as string)
    } else {
      returnUrl.searchParams.set('redirect', '/')
    }
    
    dashboardLoginUrl.searchParams.set('redirect', returnUrl.toString())
    
    console.log('Docs login - redirecting to:', dashboardLoginUrl.toString())
    console.log('Docs login - return URL:', returnUrl.toString())
    
    // Redirect to dashboard login
    window.location.href = dashboardLoginUrl.toString()
  }

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify')
        if (response.ok) {
          // User is already authenticated, redirect to docs
          router.push((redirect as string) || '/')
          return
        }
      } catch (error) {
        console.log('Not authenticated')
      }
      
      // If not authenticated, automatically redirect to dashboard login
      handleLogin()
    }

    checkAuth()
  }, [router, redirect])

  return (
    <>
      <Head>
        <title>Login - MOC-IoT Documentation</title>
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              MOC-IoT Documentation
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              This documentation requires developer access
            </p>
          </div>
          
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Redirecting...' : 'Login with Dashboard Account'}
              </button>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>You'll be redirected to dashboard.moc-iot.com to authenticate</p>
              <p className="mt-1">Developer role required for access</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}