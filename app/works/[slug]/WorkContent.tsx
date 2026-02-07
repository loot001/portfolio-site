'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PortableText, PortableTextComponents } from '@portabletext/react'
import { urlFor } from '@/lib/sanity.client'
import Lightbox from './Lightbox'

interface WorkContentProps {
  work: any
}

export default function WorkContent({ work }: WorkContentProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Determine if using content blocks or legacy
  const useContentBlocks = work.contentBlocks && work.contentBlocks.length > 0

  // Collect images from ONE source only (content blocks OR legacy, not both)
  const allImages: { src: string; alt: string; caption?: string }[] = []
  const imageIndexMap: { [key: string]: number } = {}

  if (useContentBlocks) {
    // Collect from content blocks only
    work.contentBlocks.forEach((block: any) => {
      if (block._type === 'imageBlock' && block.image?.asset) {
        imageIndexMap[block._key] = allImages.length
        allImages.push({
          src: urlFor(block.image).width(2400).quality(90).auto('format').url(),
          alt: block.alt || block.caption || '',
          caption: block.caption
        })
      }
    })
  } else if (work.images) {
    // Collect from legacy images only
    work.images.forEach((image: any, index: number) => {
      if (image.asset?.url) {
        imageIndexMap[`legacy-${index}`] = allImages.length
        allImages.push({
          src: `${image.asset.url}?w=2400&q=90&auto=format`,
          alt: image.alt || image.title || work.title,
          caption: image.caption
        })
      }
    })
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const portableTextComponents: PortableTextComponents = {
    marks: {
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
      workLink: ({ children, value }) => {
        const linkedWork = value?.work
        if (!linkedWork) {
          return <span>{children}</span>
        }
        
        return (
          <Link 
            href={`/works/${linkedWork.slug}`}
            className="group relative inline-block text-blue-600 hover:text-blue-800 underline"
          >
            {children}
            {linkedWork.thumbnail && (
              <span className="invisible group-hover:visible absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none">
                <span className="block bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={`${linkedWork.thumbnail}?w=200&h=150&fit=crop`}
                    alt={linkedWork.title}
                    className="w-48 h-36 object-cover"
                  />
                  <span className="block px-2 py-1 text-xs text-gray-700 bg-gray-50 truncate max-w-48">
                    {linkedWork.title}
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

  return (
    <>
      {/* Content Blocks */}
      {useContentBlocks && (
        <div className="space-y-8 mb-12">
          {work.contentBlocks.map((block: any) => {
            if (block._type === 'textBlock') {
              if (typeof block.content === 'string') {
                return (
                  <div key={block._key} className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{block.content}</p>
                  </div>
                )
              }
              if (Array.isArray(block.content)) {
                return (
                  <div key={block._key} className="prose max-w-none">
                    <PortableText value={block.content} components={portableTextComponents} />
                  </div>
                )
              }
              return null
            }
            
            if (block._type === 'imageBlock' && block.image?.asset) {
              const sizeClasses = {
                full: 'w-full',
                large: 'w-4/5 mx-auto',
                medium: 'w-3/5 mx-auto'
              }
              const lightboxIdx = imageIndexMap[block._key]
              
              // Build responsive srcset
              const imageSrcSet = `
                ${urlFor(block.image).width(640).quality(80).auto('format').url()} 640w,
                ${urlFor(block.image).width(1024).quality(85).auto('format').url()} 1024w,
                ${urlFor(block.image).width(1600).quality(85).auto('format').url()} 1600w,
                ${urlFor(block.image).width(2400).quality(85).auto('format').url()} 2400w
              `.trim()
              
              const imageSrc = urlFor(block.image).width(1600).quality(85).auto('format').url()
              
              return (
                <div key={block._key} className={sizeClasses[block.size as keyof typeof sizeClasses] || 'w-full'}>
                  <button
                    onClick={() => openLightbox(lightboxIdx)}
                    className="w-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <img
                      src={imageSrc}
                      srcSet={imageSrcSet}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1600px) 1200px, 1600px"
                      alt={block.alt || block.caption || ''}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </button>
                  {block.caption && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>{block.caption}</p>
                    </div>
                  )}
                </div>
              )
            }
            
            if (block._type === 'videoBlock') {
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

      {/* Legacy Layout */}
      {!useContentBlocks && (
        <>
          {work.description && (
            <div className="prose max-w-none mb-12">
              <p className="whitespace-pre-wrap">{work.description}</p>
            </div>
          )}

          {work.images && work.images.length > 0 && (
            <div className="space-y-8 mb-12">
              {work.images.map((image: any, index: number) => {
                const lightboxIdx = imageIndexMap[`legacy-${index}`]
                
                // Build responsive srcset for legacy images
                const baseUrl = image.asset.url
                const imageSrcSet = `
                  ${baseUrl}?w=640&q=80&auto=format 640w,
                  ${baseUrl}?w=1024&q=85&auto=format 1024w,
                  ${baseUrl}?w=1600&q=85&auto=format 1600w,
                  ${baseUrl}?w=2400&q=85&auto=format 2400w
                `.trim()
                
                return (
                  <div key={index}>
                    <button
                      onClick={() => openLightbox(lightboxIdx)}
                      className="w-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <img
                        src={`${baseUrl}?w=1600&q=85&auto=format`}
                        srcSet={imageSrcSet}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1600px) 1200px, 1600px"
                        alt={image.alt || image.title || work.title}
                        className="w-full h-auto"
                        loading="lazy"
                      />
                    </button>
                    {image.caption && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>{image.caption}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {work.videos && work.videos.length > 0 && (
            <div className="space-y-8 mb-12">
              {work.videos.map((video: any, index: number) => {
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

      {/* Lightbox */}
      <Lightbox
        images={allImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  )
}
