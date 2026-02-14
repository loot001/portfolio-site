'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortableText, PortableTextComponents } from '@portabletext/react'
import { urlFor } from '@/lib/sanity.client'
import Lightbox from './Lightbox'

interface WorkContentProps {
  work: any
}

// Helper to get appropriate image width based on screen size
function getLightboxWidth(): number {
  if (typeof window === 'undefined') return 2400
  const width = window.innerWidth
  if (width <= 768) return 1024      // Mobile - matches srcset pick
  return 2400                         // Tablet/Desktop - matches srcset pick
}

export default function WorkContent({ work }: WorkContentProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxWidth, setLightboxWidth] = useState(1600)
  
  // Set lightbox width based on screen size
  useEffect(() => {
    setLightboxWidth(getLightboxWidth())
  }, [])

  // Determine if using content blocks or legacy
  const useContentBlocks = work.contentBlocks && work.contentBlocks.length > 0

  // Build lightbox images with responsive sizing
  // Collects from BOTH imageBlock AND mosaicBlock in content order
  const getLightboxImages = () => {
    const images: { src: string; alt: string; caption?: string }[] = []
    
    if (useContentBlocks) {
      work.contentBlocks.forEach((block: any) => {
        if (block._type === 'imageBlock' && block.image?.asset) {
          images.push({
            src: urlFor(block.image).width(lightboxWidth).quality(85).auto('format').url(),
            alt: block.alt || block.caption || '',
            caption: block.caption
          })
        }
        if (block._type === 'mosaicBlock' && block.images) {
          block.images.forEach((item: any) => {
            if (item.image?.asset) {
              images.push({
                src: urlFor(item.image).width(lightboxWidth).quality(85).auto('format').url(),
                alt: item.alt || item.caption || '',
                caption: item.caption
              })
            }
          })
        }
      })
    } else if (work.images) {
      work.images.forEach((image: any) => {
        if (image.asset?.url) {
          images.push({
            src: `${image.asset.url}?w=${lightboxWidth}&q=85&auto=format`,
            alt: image.alt || image.title || work.title,
            caption: image.caption
          })
        }
      })
    }
    return images
  }

  // Preload lightbox-sized images in the background after page settles
  useEffect(() => {
    if (lightboxWidth === 1600) return // still default, wait for real value
    
    const timer = setTimeout(() => {
      const images = getLightboxImages()
      images.forEach(({ src }) => {
        const img = new Image()
        img.src = src
      })
    }, 1500) // delay so visible page images load first
    
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxWidth])

  // Track image indices for lightbox — unified across imageBlock + mosaicBlock
  const imageIndexMap: { [key: string]: number } = {}
  let imageCounter = 0
  
  if (useContentBlocks) {
    work.contentBlocks.forEach((block: any) => {
      if (block._type === 'imageBlock' && block.image?.asset) {
        imageIndexMap[block._key] = imageCounter++
      }
      if (block._type === 'mosaicBlock' && block.images) {
        block.images.forEach((item: any, idx: number) => {
          if (item.image?.asset) {
            imageIndexMap[`${block._key}-mosaic-${idx}`] = imageCounter++
          }
        })
      }
    })
  } else if (work.images) {
    work.images.forEach((_: any, index: number) => {
      imageIndexMap[`legacy-${index}`] = imageCounter++
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
      },
      pdfLink: ({ children, value }) => {
        const pdfUrl = value?.pdf?.asset?.url
        if (!pdfUrl) {
          return <span className="text-gray-400">{children}</span>
        }
        
        const target = value?.openInNewTab !== false ? '_blank' : '_self'
        const rel = value?.openInNewTab !== false ? 'noopener noreferrer' : undefined
        
        return (
          <a 
            href={pdfUrl} 
            target={target}
            rel={rel}
            className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
          >
            {children}
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
            </svg>
          </a>
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
              
              // Build responsive srcset - matches lightbox breakpoints
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
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1400px"
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
            
            {/* ===== MOSAIC GRID BLOCK ===== */}
            if (block._type === 'mosaicBlock' && block.images?.length > 0) {
              // Split images into two columns for top-aligned masonry
              const validImages = block.images.filter((item: any) => item.image?.asset)
              const leftCol: any[] = []
              const rightCol: any[] = []
              validImages.forEach((item: any, idx: number) => {
                if (idx % 2 === 0) leftCol.push({ ...item, originalIdx: idx })
                else rightCol.push({ ...item, originalIdx: idx })
              })
              
              const renderMosaicItem = (item: any) => {
                const lightboxIdx = imageIndexMap[`${block._key}-mosaic-${item.originalIdx}`]
                
                const thumbSrcSet = `
                  ${urlFor(item.image).width(400).quality(80).auto('format').url()} 400w,
                  ${urlFor(item.image).width(600).quality(80).auto('format').url()} 600w,
                  ${urlFor(item.image).width(800).quality(85).auto('format').url()} 800w,
                  ${urlFor(item.image).width(1200).quality(85).auto('format').url()} 1200w
                `.trim()
                
                const thumbSrc = urlFor(item.image).width(800).quality(85).auto('format').url()
                
                return (
                  <div
                    key={item._key || item.originalIdx}
                    onClick={() => openLightbox(lightboxIdx)}
                    className="mb-3 sm:mb-4 cursor-zoom-in"
                  >
                    <img
                      src={thumbSrc}
                      srcSet={thumbSrcSet}
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 45vw, 700px"
                      alt={item.alt || item.caption || ''}
                      className="w-full h-auto rounded-sm"
                      loading="lazy"
                    />
                    {item.caption && (
                      <span className="block mt-1 text-xs text-gray-500 text-left">
                        {item.caption}
                      </span>
                    )}
                  </div>
                )
              }
              
              return (
                <div key={block._key}>
                  <div className="flex gap-3 sm:gap-4 items-start">
                    <div className="flex-1 min-w-0">
                      {leftCol.map(renderMosaicItem)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {rightCol.map(renderMosaicItem)}
                    </div>
                  </div>
                  {block.caption && (
                    <p className="mt-2 text-sm text-gray-600">{block.caption}</p>
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
                
                // Build responsive srcset - matches lightbox breakpoints
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
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1400px"
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
        images={getLightboxImages()}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  )
}
