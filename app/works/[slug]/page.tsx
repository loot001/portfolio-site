import Image from 'next/image'
import { client, urlFor } from '@/lib/sanity.client'
import { notFound } from 'next/navigation'
import { groq } from 'next-sanity'

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
    
    // Content Blocks (new system)
    contentBlocks[] {
      _type,
      _key,
      
      _type == "textBlock" => {
        content
      },
      
      _type == "imageBlock" => {
        image {
          asset->
        },
        caption,
        alt,
        size
      },
      
      _type == "videoBlock" => {
        platform,
        url,
        caption
      }
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
            // Text Block
            if (block._type === 'textBlock') {
              return (
                <div key={block._key} className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{block.content}</p>
                </div>
              )
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
            
            // Video Block
            if (block._type === 'videoBlock') {
              const getVideoEmbedUrl = (platform: string, url: string) => {
                if (platform === 'vimeo') {
                  const videoId = url.split('/').pop()?.split('?')[0]
                  return `https://player.vimeo.com/video/${videoId}`
                } else if (platform === 'youtube') {
                  const videoId = url.includes('v=') 
                    ? url.split('v=')[1]?.split('&')[0]
                    : url.split('/').pop()
                  return `https://www.youtube.com/embed/${videoId}`
                }
                return url
              }
              
              const embedUrl = getVideoEmbedUrl(block.platform, block.url)
              
              return (
                <div key={block._key}>
                  <div className="aspect-video">
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
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

      {/* LEGACY LAYOUT (Fallback) */}
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
              {work.videos.map((video: any, index: number) => (
                <div key={index} className="aspect-video">
                  {video.platform === 'vimeo' && (
                    <iframe
                      src={`https://player.vimeo.com/video/${video.url.split('/').pop()}`}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                  {video.platform === 'youtube' && (
                    <iframe
                      src={`https://www.youtube.com/embed/${video.url.split('v=')[1] || video.url.split('/').pop()}`}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              ))}
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
