import nextra from 'nextra'

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

export default withNextra({
  trailingSlash: false,
  images: {
    unoptimized: true
  },
  // Force Next.js to include API routes in production build
  generateBuildId: async () => {
    return 'build-' + Date.now()
  }
})