import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/lib/sanity.client'
import { groq } from 'next-sanity'

export const revalidate = 60

const projectsQuery = groq`
  *[_type == "project" && defined(slug.current)] | order(year desc, title asc) {
    _id,
    title,
    "slug": slug.current,
    year,
    projectType,
    excerpt,
    "thumbnail": coalesce(
      featuredImage.asset->url,
      projectImages[0].asset->url
    ),
    "workCount": count(includedWorks)
  }
`

async function getProjects() {
  return await client.fetch(projectsQuery)
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Projects</h1>
        <p className="text-gray-600 max-w-3xl">
          Curated presentations of related works, exhibitions, and ongoing series.
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project: any) => (
          <Link 
            key={project._id} 
            href={`/projects/${project.slug}`}
            className="group"
          >
            <div className="aspect-square bg-gray-100 mb-3 overflow-hidden">
              {project.thumbnail ? (
                <Image
                  src={`${project.thumbnail}?w=600&h=600&fit=crop`}
                  alt={project.title}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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
