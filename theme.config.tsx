import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const LogoutButton = () => {
  const handleLogout = () => {
    try {
      // Clear authentication cookies
      document.cookie = 'moc-auth-token=; Max-Age=0; Path=/; Domain=.moc-iot.com'
      document.cookie = 'moc-session=; Max-Age=0; Path=/; Domain=.moc-iot.com'
      document.cookie = 'sb-access-token=; Max-Age=0; Path=/; Domain=.moc-iot.com'
      
      // Redirect to login page
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed:', error)
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
  }
}

export default config