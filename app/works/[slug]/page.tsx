import Image from 'next/image'
import Link from 'next/link'
import { client, urlFor } from '@/lib/sanity.client'
import { notFound } from 'next/navigation'
import { groq } from 'next-sanity'
import { PortableText, PortableTextComponents } from '@portabletext/react'

export const revalidate = 60

const workBySlugQuery = groq`
  *[_type == "work" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    year,
    yearNumeric,
    workType,
    materials,
    dimensions,
    sizeCategory,
    themes,
    aiInvolved,
    aiRole,
    aiTools,
    
    // Content Blocks with rich text and work link expansion
    contentBlocks[] {
      _type,
      _key,
      // Text block - portable text with work links expanded
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
      // Image block
      image { asset-> },
      alt,
      size,
      // Video block
      platform,
      url,
      // Shared
      caption
    },
    
    // Legacy fields (fallback)
    images[] {
      asset->,
      title,
      caption,
      alt
    },
    videos,
    description,
    
    currentLocation,
    status
  }
`

async function getWork(slug: string) {
  return await client.fetch(workBySlugQuery, { slug })
}

// Custom components for rendering Portable Text
const portableTextComponents: PortableTextComponents = {
  marks: {
    // External links
    link: ({ children, value }) => {
      const target = value?.openInNewTab ? '_blank' : undefined
      const rel = value?.openInNewTab ? 'noopener noreferrer' : undefined
      return (
        <a 
          href={value?.href} 
          target={target} 
          rel={rel}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {children}
        </a>
      )
    },
    // Internal work links with hover preview
    workLink: ({ children, value }) => {
      const work = value?.work
      if (!work) {
        return <span>{children}</span>
      }
      
      return (
        <Link 
          href={`/works/${work.slug}`}
          className="group relative inline-block text-blue-600 hover:text-blue-800 underline"
        >
          {children}
          {/* Hover preview tooltip */}
          {work.thumbnail && (
            <span className="invisible group-hover:visible absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none">
              <span className="block bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src={`${work.thumbnail}?w=200&h=150&fit=crop`}
                  alt={work.title}
                  className="w-48 h-36 object-cover"
                />
                <span className="block px-2 py-1 text-xs text-gray-700 bg-gray-50 truncate max-w-48">
                  {work.title}
                </span>
              </span>
            </span>
          )}
        </Link>
      )
    }
  },
  block: {
    h3: ({ children }) => <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>,
    h4: ({ children }) => <h4 className="text-lg font-medium mt-4 mb-2">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>
  }
}

export default async function WorkPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const work = await getWork(slug)

  if (!work) {
    notFound()
  }

  // Check if using content blocks or legacy
  const useContentBlocks = work.contentBlocks && work.contentBlocks.length > 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

      {/* CONTENT BLOCKS (New System) */}
      {useContentBlocks && (
        <div className="space-y-8 mb-12">
          {work.contentBlocks.map((block: any) => {
            // Text Block - Rich Text or Legacy Plain Text
            if (block._type === 'textBlock') {
              // Handle both old plain text and new portable text
              if (typeof block.content === 'string') {
                // Legacy plain text
                return (
                  <div key={block._key} className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{block.content}</p>
                  </div>
                )
              }
              // New Portable Text (rich text)
              if (Array.isArray(block.content)) {
                return (
                  <div key={block._key} className="prose max-w-none">
                    <PortableText 
                      value={block.content} 
                      components={portableTextComponents}
                    />
                  </div>
                )
              }
              return null
            }
            
            // Image Block
            if (block._type === 'imageBlock') {
              const sizeClasses = {
                full: 'w-full',
                large: 'w-4/5 mx-auto',
                medium: 'w-3/5 mx-auto'
              }
              
              return (
                <div key={block._key} className={sizeClasses[block.size as keyof typeof sizeClasses] || 'w-full'}>
                  <Image
                    src={urlFor(block.image).width(1200).url()}
                    alt={block.alt || block.caption || ''}
                    width={1200}
                    height={800}
                    className="w-full h-auto"
                  />
                  {block.caption && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>{block.caption}</p>
                    </div>
                  )}
                </div>
              )
            }
            
            // Video Block - with invisible character fix
            if (block._type === 'videoBlock') {
              // Strip ALL non-printable/invisible characters (fixes Unicode pollution issue)
              const platform = String(block.platform || '').replace(/[^\x20-\x7E]/g, '').toLowerCase().trim()
              const url = String(block.url || '').replace(/[^\x20-\x7E]/g, '').trim()
              
              let embedUrl = ''
              
              if (platform === 'vimeo' && url) {
                const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
                if (vimeoMatch && vimeoMatch[1]) {
                  embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0`
                }
              } else if (platform === 'youtube' && url) {
                const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/)
                if (youtubeMatch && youtubeMatch[1]) {
                  embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`
                }
              }
              
              if (!embedUrl) {
                return (
                  <div key={block._key} className="mb-8 p-4 bg-gray-100 text-gray-600">
                    <p>Video unavailable</p>
                  </div>
                )
              }
              
              return (
                <div key={block._key} className="mb-8">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={embedUrl}
                      className="absolute top-0 left-0 w-full h-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={block.caption || 'Video'}
                    />
                  </div>
                  {block.caption && (
                    <p className="mt-2 text-sm text-gray-600">{block.caption}</p>
                  )}
                </div>
              )
            }
            
            return null
          })}
        </div>
      )}

      {/* LEGACY LAYOUT (Fallback for old content) */}
      {!useContentBlocks && (
        <>
          {/* Description */}
          {work.description && (
            <div className="prose max-w-none mb-12">
              <p className="whitespace-pre-wrap">{work.description}</p>
            </div>
          )}

          {/* Images */}
          {work.images && work.images.length > 0 && (
            <div className="space-y-8 mb-12">
              {work.images.map((image: any, index: number) => (
                <div key={index}>
                  <Image
                    src={image.asset.url}
                    alt={image.alt || image.title || work.title}
                    width={1200}
                    height={800}
                    className="w-full h-auto"
                  />
                  {image.caption && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>{image.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Videos */}
          {work.videos && work.videos.length > 0 && (
            <div className="space-y-8 mb-12">
              {work.videos.map((video: any, index: number) => {
                // Strip invisible characters from legacy videos too
                const platform = String(video.platform || '').replace(/[^\x20-\x7E]/g, '').toLowerCase().trim()
                const url = String(video.url || '').replace(/[^\x20-\x7E]/g, '').trim()
                let embedUrl = ''
                
                if (platform === 'vimeo' && url) {
                  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
                  if (vimeoMatch && vimeoMatch[1]) {
                    embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0`
                  }
                } else if (platform === 'youtube' && url) {
                  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/)
                  if (youtubeMatch && youtubeMatch[1]) {
                    embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`
                  }
                }
                
                if (!embedUrl) return null
                
                return (
                  <div key={index} className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={embedUrl}
                      className="absolute top-0 left-0 w-full h-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={`Video ${index + 1}`}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Additional metadata (always shown) */}
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
    </div>
  )
}
