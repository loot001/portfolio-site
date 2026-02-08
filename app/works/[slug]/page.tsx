import Link from 'next/link'
import { client, urlFor } from '@/lib/sanity.client'
import { notFound } from 'next/navigation'
import { groq } from 'next-sanity'
import WorkContent from './WorkContent'
import { siteConfig } from '@/lib/metadata'
import type { Metadata } from 'next'

export const revalidate = 60

const workBySlugQuery = groq`
  *[_type == "work" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    year,
    yearNumeric,
    workType,
    "materials": materials[]->name,
    dimensions,
    sizeCategory,
    themes,
    description,
    aiInvolved,
    aiRole,
    aiTools,
    "thumbnail": coalesce(
      thumbnail.asset->url,
      contentBlocks[_type == "imageBlock"][0].image.asset->url,
      images[0].asset->url
    ),
    contentBlocks[] {
      _type,
      _key,
      content[] {
        ...,
        markDefs[] {
          ...,
          _type == "workLink" => {
            "work": work-> {
              _id,
              title,
              "slug": slug.current,
              "thumbnail": coalesce(
                thumbnail.asset->url,
                contentBlocks[_type == "imageBlock"][0].image.asset->url,
                images[0].asset->url
              )
            }
          }
        }
      },
      image { asset-> },
      alt,
      size,
      platform,
      url,
      caption,
      // mosaicBlock fields
      images[] {
        _key,
        image { asset-> },
        caption,
        alt
      }
    },
    images[] {
      asset->,
      title,
      caption,
      alt
    },
    videos,
    currentLocation,
    status
  }
`

const allWorksQuery = groq`
  *[_type == "work" && defined(slug.current)] | order(yearNumeric desc, monthNumeric desc, dayNumeric desc, title asc) {
    "slug": slug.current,
    title
  }
`

async function getWork(slug: string) {
  return await client.fetch(workBySlugQuery, { slug })
}

async function getNavigation(slug: string) {
  const allWorks = await client.fetch(allWorksQuery)
  
  if (!allWorks || allWorks.length === 0) {
    return { prev: null, next: null }
  }
  
  const currentIndex = allWorks.findIndex((w: any) => w.slug === slug)
  
  if (currentIndex === -1) {
    return { prev: null, next: null }
  }
  
  const prev = currentIndex > 0 ? allWorks[currentIndex - 1] : null
  const next = currentIndex < allWorks.length - 1 ? allWorks[currentIndex + 1] : null
  
  return { prev, next }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  const work = await getWork(slug)
  
  if (!work) {
    return {
      title: 'Work Not Found'
    }
  }

  const title = `${work.title}${work.year ? `, ${work.year}` : ''}`
  
  // Build description from available data
  let description = ''
  if (work.workType) description += `${work.workType}. `
  if (work.materials && work.materials.length > 0) {
    description += `${work.materials.join(', ')}. `
  }
  if (work.dimensions) description += `${work.dimensions}. `
  if (work.description) {
    description += work.description.substring(0, 150)
  }
  if (!description) {
    description = `Artwork by ${siteConfig.name}`
  }

  const ogImage = work.thumbnail 
    ? `${work.thumbnail}?w=1200&h=630&fit=crop`
    : `${siteConfig.url}${siteConfig.ogImage}`

  return {
    title,
    description: description.trim(),
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description: description.trim(),
      type: 'article',
      url: `${siteConfig.url}/works/${slug}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: work.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteConfig.name}`,
      description: description.trim(),
      images: [ogImage]
    }
  }
}

export default async function WorkPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const [work, navigation] = await Promise.all([
    getWork(slug),
    getNavigation(slug)
  ])

  if (!work) {
    notFound()
  }

  // Pass work directly - let ContentBlocks handle responsive images
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Top Navigation */}
      <nav className="flex justify-between items-center mb-8 text-sm">
        <div className="w-1/3">
          {navigation.prev && (
            <Link 
              href={`/works/${navigation.prev.slug}`}
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
          <Link href="/works" className="text-gray-600 hover:text-gray-900 transition-colors">
            All Works
          </Link>
        </div>
        
        <div className="w-1/3 text-right">
          {navigation.next && (
            <Link 
              href={`/works/${navigation.next.slug}`}
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

      {/* Title and metadata */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{work.title}</h1>
        <div className="text-gray-600 space-y-1">
          <p>{work.year}</p>
          {work.workType && <p className="capitalize">{work.workType}</p>}
          {work.dimensions && <p>{work.dimensions}</p>}
          {work.materials && work.materials.length > 0 && (
            <p>{work.materials.join(', ')}</p>
          )}
        </div>
      </div>

      {/* Work Content with Lightbox - pass raw work data */}
      <WorkContent work={work} />

      {/* Themes and AI info */}
      {(work.themes || work.aiInvolved) && (
        <div className="border-t pt-8 mt-12 space-y-4">
          {work.themes && work.themes.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Themes</h3>
              <div className="flex flex-wrap gap-2">
                {work.themes.map((theme: string) => (
                  <span key={theme} className="px-3 py-1 bg-gray-100 text-sm rounded">
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {work.aiInvolved && (
            <div>
              <h3 className="font-medium mb-2">AI Collaboration</h3>
              <p className="text-gray-600">
                {work.aiRole && <span className="capitalize">{work.aiRole}</span>}
                {work.aiTools && work.aiTools.length > 0 && (
                  <span> • {work.aiTools.join(', ')}</span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="flex justify-between items-center mt-16 pt-8 border-t">
        <div className="w-1/2 pr-4">
          {navigation.prev && (
            <Link href={`/works/${navigation.prev.slug}`} className="group block">
              <span className="text-sm text-gray-500 group-hover:text-gray-700">← Previous</span>
              <span className="block text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {navigation.prev.title}
              </span>
            </Link>
          )}
        </div>
        
        <div className="w-1/2 pl-4 text-right">
          {navigation.next && (
            <Link href={`/works/${navigation.next.slug}`} className="group block">
              <span className="text-sm text-gray-500 group-hover:text-gray-700">Next →</span>
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
