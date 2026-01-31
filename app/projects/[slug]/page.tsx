import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/lib/sanity.client'
import { notFound } from 'next/navigation'
import { groq } from 'next-sanity'
import { PortableText } from '@portabletext/react'

export const revalidate = 60

const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    year,
    projectType,
    excerpt,
    statement,
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

async function getProject(slug: string) {
  return await client.fetch(projectBySlugQuery, { slug })
}

export default async function ProjectPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const project = await getProject(slug)

  if (!project) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back link */}
      <div className="mb-8">
        <Link 
          href="/projects"
          className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Projects
        </Link>
      </div>

      {/* Project Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
        <div className="text-gray-600 mb-6">
          {project.year}
          {project.projectType && ` • ${project.projectType}`}
        </div>
        
        {/* Project Description/Statement */}
        {project.excerpt && (
          <p className="text-lg text-gray-700 max-w-3xl mb-6">
            {project.excerpt}
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
    </div>
  )
}
