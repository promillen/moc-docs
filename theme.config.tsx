import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>MOC-IoT Documentation</span>,
  project: {
    link: 'https://github.com/promillen/moc-docs',
  },
  docsRepositoryBase: 'https://github.com/promillen/moc-docs/edit/main/pages/',
  footer: {
    content: <span>Copyright © 2025 MOC-IoT Engineering Team</span>,
  }
}

export default config