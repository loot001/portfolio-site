import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/lib/sanity.client'
import { notFound } from 'next/navigation'
import { groq } from 'next-sanity'
import { PortableText } from '@portabletext/react'
import { siteConfig } from '@/lib/metadata'
import type { Metadata } from 'next'

export const revalidate = 60

const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    year,
    projectType,
    excerpt,
    description,
    dimensions,
    "materials": materials[]->name,
    statement,
    "thumbnail": coalesce(
      featuredImage.asset->url,
      projectImages[0].asset->url
    ),
    featuredImage {
      asset->,
      alt,
      caption
    },
    "includedWorks": includedWorks[]-> {
      _id,
      title,
      "slug": slug.current,
      year,
      workType,
      "thumbnail": coalesce(
        thumbnail.asset->url,
        contentBlocks[_type == "imageBlock"][0].image.asset->url,
        images[0].asset->url
      )
    }
  }
`

const allProjectsQuery = groq`
  *[_type == "project" && defined(slug.current)] | order(year desc, title asc) {
    "slug": slug.current,
    title
  }
`

async function getProject(slug: string) {
  return await client.fetch(projectBySlugQuery, { slug })
}

async function getNavigation(slug: string) {
  const allProjects = await client.fetch(allProjectsQuery)
  
  if (!allProjects || allProjects.length === 0) {
    return { prev: null, next: null }
  }
  
  const currentIndex = allProjects.findIndex((p: any) => p.slug === slug)
  
  if (currentIndex === -1) {
    return { prev: null, next: null }
  }
  
  const prev = currentIndex > 0 ? allProjects[currentIndex - 1] : null
  const next = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null
  
  return { prev, next }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  
  if (!project) {
    return {
      title: 'Project Not Found'
    }
  }

  const title = `${project.title}${project.year ? `, ${project.year}` : ''}`
  const description = project.excerpt || `Art project by ${siteConfig.name}`
  
  const ogImage = project.thumbnail 
    ? `${project.thumbnail}?w=1200&h=630&fit=crop`
    : `${siteConfig.url}${siteConfig.ogImage}`

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      type: 'article',
      url: `${siteConfig.url}/projects/${slug}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: project.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [ogImage]
    }
  }
}

export default async function ProjectPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const [project, navigation] = await Promise.all([
    getProject(slug),
    getNavigation(slug)
  ])

  if (!project) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Top Navigation */}
      <nav className="flex justify-between items-center mb-8 text-sm">
        <div className="w-1/3">
          {navigation.prev && (
            <Link 
              href={`/projects/${navigation.prev.slug}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline truncate max-w-[200px]">{navigation.prev.title}</span>
              <span className="sm:hidden">Previous</span>
            </Link>
          )}
        </div>
        
        <div className="w-1/3 text-center">
          <Link href="/projects" className="text-gray-600 hover:text-gray-900 transition-colors">
            All Projects
          </Link>
        </div>
        
        <div className="w-1/3 text-right">
          {navigation.next && (
            <Link 
              href={`/projects/${navigation.next.slug}`}
              className="flex items-center justify-end gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="hidden sm:inline truncate max-w-[200px]">{navigation.next.title}</span>
              <span className="sm:hidden">Next</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </nav>

      {/* Project Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
        <div className="text-gray-600 space-y-1 mb-6">
          <p>{project.year}</p>
          {project.projectType && <p className="capitalize">{project.projectType.replace('-', ' ')}</p>}
          {project.dimensions && <p>{project.dimensions}</p>}
          {project.materials && project.materials.length > 0 && (
            <p>{project.materials.join(', ')}</p>
          )}
        </div>
        
        {/* Project Description/Statement */}
        {project.excerpt && (
          <p className="text-lg text-gray-700 max-w-3xl mb-6">
            {project.excerpt}
          </p>
        )}
        
        {project.description && (
          <p className="text-gray-700 max-w-3xl mb-6 whitespace-pre-wrap">
            {project.description}
          </p>
        )}
        
        {project.statement && Array.isArray(project.statement) && (
          <div className="prose max-w-3xl">
            <PortableText value={project.statement} />
          </div>
        )}
        
        {/* Handle legacy string statement */}
        {project.statement && typeof project.statement === 'string' && (
          <div className="prose max-w-3xl">
            <p className="whitespace-pre-wrap">{project.statement}</p>
          </div>
        )}
      </div>

      {/* Featured Image */}
      {project.featuredImage?.asset && (
        <div className="mb-12">
          <Image
            src={project.featuredImage.asset.url}
            alt={project.featuredImage.alt || project.title}
            width={1200}
            height={800}
            className="w-full h-auto"
          />
          {project.featuredImage.caption && (
            <p className="mt-2 text-sm text-gray-600">{project.featuredImage.caption}</p>
          )}
        </div>
      )}

      {/* Included Works */}
      {project.includedWorks && project.includedWorks.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">
            Works in this Project
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {project.includedWorks.map((work: any) => (
              <Link 
                key={work._id} 
                href={`/works/${work.slug}`}
                className="group"
              >
                <div className="aspect-square bg-gray-100 mb-3 overflow-hidden">
                  {work.thumbnail ? (
                    <Image
                      src={`${work.thumbnail}?w=600&h=600&fit=crop`}
                      alt={work.title}
                      width={600}
                      height={600}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <h3 className="font-medium group-hover:text-gray-600 transition-colors">
                  {work.title}
                </h3>
                <div className="text-sm text-gray-500">
                  {work.year}
                  {work.workType && ` • ${work.workType}`}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {(!project.includedWorks || project.includedWorks.length === 0) && (
        <div className="text-center py-12 text-gray-500 border-t">
          No works have been added to this project yet.
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="flex justify-between items-center mt-16 pt-8 border-t">
        <div className="w-1/2 pr-4">
          {navigation.prev && (
            <Link href={`/projects/${navigation.prev.slug}`} className="group block">
              <span className="text-sm text-gray-500 group-hover:text-gray-700">← Previous Project</span>
              <span className="block text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {navigation.prev.title}
              </span>
            </Link>
          )}
        </div>
        
        <div className="w-1/2 pl-4 text-right">
          {navigation.next && (
            <Link href={`/projects/${navigation.next.slug}`} className="group block">
              <span className="text-sm text-gray-500 group-hover:text-gray-700">Next Project →</span>
              <span className="block text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {navigation.next.title}
              </span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  )
}
