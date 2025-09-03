import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      // Import Supabase client dynamically to avoid SSR issues
      const { supabase } = await import('./lib/supabase')
      
      // Sign out from Supabase (this clears the session and cookies)
      await supabase.auth.signOut()
      
      // Redirect to login page
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed:', error)
      // Fallback: clear cookies manually and redirect
      document.cookie = 'sb-access-token=; Max-Age=0; Path=/'
      document.cookie = 'sb-refresh-token=; Max-Age=0; Path=/'
      window.location.href = '/login'
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
    >
      Logout
    </button>
  )
}

const config: DocsThemeConfig = {
  logo: <span>MOC-IoT Documentation</span>,
  project: {
    link: 'https://github.com/promillen/moc-docs',
  },
  docsRepositoryBase: 'https://github.com/promillen/moc-docs/edit/main/pages/',
  footer: {
    content: <span>Copyright © 2025 MOC-IoT Engineering Team</span>,
  },
  navbar: {
    extraContent: <LogoutButton />
  },
  head: (
    <>
      <script src="/mermaid-zoom.js" defer />
    </>
  )
}

export default config