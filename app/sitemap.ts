// app/sitemap.ts
// Auto-generates sitemap.xml with all pages

import { client } from '@/lib/sanity.client'
import { groq } from 'next-sanity'
import { siteConfig } from '@/lib/metadata'

export default async function sitemap() {
  // Fetch all works
  const works = await client.fetch(groq`
    *[_type == "work" && defined(slug.current)] {
      "slug": slug.current,
      _updatedAt
    }
  `)

  // Fetch all projects
  const projects = await client.fetch(groq`
    *[_type == "project" && defined(slug.current)] {
      "slug": slug.current,
      _updatedAt
    }
  `)

  // Static pages
  const staticPages = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1
    },
    {
      url: `${siteConfig.url}/works`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9
    },
    {
      url: `${siteConfig.url}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9
    },
    {
      url: `${siteConfig.url}/cv`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7
    },
    {
      url: `${siteConfig.url}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7
    }
  ]

  // Work pages
  const workPages = works.map((work: any) => ({
    url: `${siteConfig.url}/works/${work.slug}`,
    lastModified: new Date(work._updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8
  }))

  // Project pages
  const projectPages = projects.map((project: any) => ({
    url: `${siteConfig.url}/projects/${project.slug}`,
    lastModified: new Date(project._updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8
  }))

  return [...staticPages, ...workPages, ...projectPages]
}
