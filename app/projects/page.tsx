// app/projects/page.tsx
// Projects grid page

import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/lib/sanity.client'
import { groq } from 'next-sanity'

export const revalidate = 60

const projectsQuery = groq`
{
  "settings": *[_type == "siteSettings"][0] {
    projectsPageTitle,
    projectsPageDescription
  },
  "projects": *[_type == "project" && defined(slug.current)] {
    _id,
    title,
    "slug": slug.current,
    year,
    projectType,
    excerpt,
    
    // Thumbnail URL with fallback
    "thumbnail": coalesce(
      featuredImage.asset->url,
      projectImages[0].asset->url
    ),
    
    "workCount": count(includedWorks)
  }
}
`

async function getProjectsData() {
  return await client.fetch(projectsQuery)
}

export default async function ProjectsPage() {
  const { settings, projects } = await getProjectsData()

  const title = settings?.projectsPageTitle || 'Projects'
  const description = settings?.projectsPageDescription || 
    'Curated presentations of related works, exhibitions, and ongoing series.'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-gray-600 max-w-3xl">{description}</p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project: any) => (
          <Link 
            key={project._id} 
            href={`/projects/${project.slug}`}
            className="group block"
          >
            <div className="aspect-square bg-gray-100 mb-3 overflow-hidden relative">
              {project.thumbnail ? (
                <Image
                  src={`${project.thumbnail}?w=600&h=600&fit=crop&auto=format`}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                    />
                  </svg>
                </div>
              )}
            </div>
            <h2 className="font-medium group-hover:text-gray-600 transition-colors">
              {project.title}
            </h2>
            <div className="text-sm text-gray-500">
              {project.year}
              {project.workCount > 0 && ` • ${project.workCount} works`}
            </div>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No projects found.
        </div>
      )}
    </div>
  )
}
