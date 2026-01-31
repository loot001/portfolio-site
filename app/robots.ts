// app/robots.ts
// Generates robots.txt

import { siteConfig } from '@/lib/metadata'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/studio/']
      }
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`
  }
}
