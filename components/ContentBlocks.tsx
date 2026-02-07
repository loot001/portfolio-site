// components/ContentBlocks.tsx
// Content blocks renderer - no external dependencies

'use client'

import Image from 'next/image'
import { urlFor } from '@/lib/sanity.client'
import { useState } from 'react'

interface ContentBlocksProps {
  blocks: any[]
}

export default function ContentBlocks({ blocks }: ContentBlocksProps) {
  if (!blocks || blocks.length === 0) return null

  return (
    <div className="space-y-12">
      {blocks.map((block, index) => (
        <div key={block._key || index}>
          {renderBlock(block)}
        </div>
      ))}
    </div>
  )
}

function renderBlock(block: any) {
  switch (block._type) {
    case 'textBlock':
      return <TextBlock content={block.content} />
    
    case 'imageBlock':
      return <ImageBlock block={block} />
    
    case 'galleryBlock':
      return <GalleryBlock block={block} />
    
    case 'videoBlock':
      return <VideoBlock block={block} />
    
    case 'quoteBlock':
      return <QuoteBlock block={block} />
    
    case 'twoColumnBlock':
      return <TwoColumnBlock block={block} />
    
    default:
      return null
  }
}

// ============================================
// Text Block
// ============================================
function TextBlock({ content }: { content: string }) {
  return (
    <div className="prose max-w-none">
      <p className="whitespace-pre-wrap">{content}</p>
    </div>
  )
}

// ============================================
// Single Image Block - with lightbox
// ============================================
function ImageBlock({ block }: { block: any }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const sizeClasses = {
    full: 'w-full',
    large: 'w-4/5 mx-auto',
    medium: 'w-3/5 mx-auto',
    small: 'w-2/5 mx-auto'
  }

  const displaySize = (block.size as keyof typeof sizeClasses) || 'full'
  
  // Generate responsive srcset for different screen sizes
  const imageSrcSet = block.image?.asset ? `
    ${urlFor(block.image).width(800).quality(80).url()} 800w,
    ${urlFor(block.image).width(1200).quality(85).url()} 1200w,
    ${urlFor(block.image).width(1800).quality(85).url()} 1800w,
    ${urlFor(block.image).width(2400).quality(85).url()} 2400w
  `.trim() : ''
  
  const imageSrc = block.image?.asset 
    ? urlFor(block.image).width(1200).quality(85).url()
    : null

  if (!imageSrc) return null

  return (
    <>
      <figure className={sizeClasses[displaySize]}>
        <img
          src={imageSrc}
          srcSet={imageSrcSet}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
          alt={block.alt || block.title || ''}
          className="w-full h-auto cursor-pointer hover:opacity-95 transition-opacity"
          onClick={() => setLightboxOpen(true)}
          loading="lazy"
        />
        {(block.title || block.caption) && (
          <figcaption className="mt-2 text-sm text-gray-600">
            {block.title && <p className="font-medium">{block.title}</p>}
            {block.caption && <p>{block.caption}</p>}
          </figcaption>
        )}
      </figure>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          imageUrl={urlFor(block.image).width(3840).quality(90).url()}
          alt={block.alt || block.title || ''}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}

// ============================================
// Gallery Block
// ============================================
function GalleryBlock({ block }: { block: any }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const layoutClasses = {
    'grid-2': 'grid-cols-1 sm:grid-cols-2',
    'grid-3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    'grid-4': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    'carousel': 'flex overflow-x-auto gap-4 snap-x snap-mandatory'
  }

  const layout = (block.layout as keyof typeof layoutClasses) || 'grid-3'
  const isCarousel = layout === 'carousel'

  return (
    <>
      <div className={isCarousel ? layoutClasses.carousel : `grid ${layoutClasses[layout]} gap-4`}>
        {block.images?.map((item: any, idx: number) => {
          const imageAsset = item.image?.asset ? item.image : item.asset ? item : null
          if (!imageAsset) return null
          
          const imageSrc = urlFor(imageAsset).width(800).quality(85).url()
          const imageSrcSet = `
            ${urlFor(imageAsset).width(400).quality(80).url()} 400w,
            ${urlFor(imageAsset).width(600).quality(85).url()} 600w,
            ${urlFor(imageAsset).width(800).quality(85).url()} 800w,
            ${urlFor(imageAsset).width(1200).quality(85).url()} 1200w
          `.trim()

          return (
            <div 
              key={item._key || idx} 
              className={isCarousel ? 'flex-shrink-0 w-4/5 snap-center' : 'relative aspect-[4/3]'}
            >
              <img
                src={imageSrc}
                srcSet={imageSrcSet}
                sizes={isCarousel ? '80vw' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px'}
                alt={item.alt || item.caption || ''}
                className={`
                  ${isCarousel ? 'w-full h-auto' : 'w-full h-full object-cover'}
                  cursor-pointer hover:opacity-95 transition-opacity
                `}
                onClick={() => setLightboxIndex(idx)}
                loading="lazy"
              />
              {item.caption && !isCarousel && (
                <p className="mt-1 text-xs text-gray-500 truncate">{item.caption}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Gallery Lightbox with navigation */}
      {lightboxIndex !== null && block.images && (
        <GalleryLightbox
          images={block.images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  )
}

// ============================================
// Video Block
// ============================================
function VideoBlock({ block }: { block: any }) {
  const getVideoEmbedUrl = (platform: string, url: string): string => {
    if (!url) return ''
    
    // Normalize platform check (handle case sensitivity)
    const normalizedPlatform = platform?.toLowerCase()
    
    if (normalizedPlatform === 'vimeo') {
      // Extract video ID from various Vimeo URL formats
      const cleanUrl = url.replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove invisible chars
      const videoId = cleanUrl.split('/').pop()?.split('?')[0]
      return `https://player.vimeo.com/video/${videoId}`
    } else if (normalizedPlatform === 'youtube') {
      const cleanUrl = url.replace(/[\u200B-\u200D\uFEFF]/g, '')
      const videoId = cleanUrl.includes('v=') 
        ? cleanUrl.split('v=')[1]?.split('&')[0]
        : cleanUrl.split('/').pop()?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    return url
  }

  const embedUrl = getVideoEmbedUrl(block.platform, block.url)

  return (
    <figure>
      <div className="aspect-video bg-black">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {block.caption && (
        <figcaption className="mt-2 text-sm text-gray-600">{block.caption}</figcaption>
      )}
    </figure>
  )
}

// ============================================
// Quote Block
// ============================================
function QuoteBlock({ block }: { block: any }) {
  return (
    <blockquote className="border-l-4 border-gray-300 pl-6 py-4 my-8">
      <p className="text-xl italic text-gray-700">{block.quote}</p>
      {block.attribution && (
        <footer className="mt-2 text-sm text-gray-600">— {block.attribution}</footer>
      )}
    </blockquote>
  )
}

// ============================================
// Two Column Block
// ============================================
function TwoColumnBlock({ block }: { block: any }) {
  const renderColumn = (column: any) => {
    if (!column) return null
    
    if (column.type === 'text') {
      return <p className="whitespace-pre-wrap">{column.text}</p>
    }
    
    if (column.type === 'image' && column.image?.asset) {
      const srcSet = `
        ${urlFor(column.image).width(400).quality(80).url()} 400w,
        ${urlFor(column.image).width(600).quality(85).url()} 600w,
        ${urlFor(column.image).width(900).quality(85).url()} 900w,
        ${urlFor(column.image).width(1200).quality(85).url()} 1200w
      `.trim()
      return (
        <img
          src={urlFor(column.image).width(800).quality(85).url()}
          srcSet={srcSet}
          sizes="(max-width: 768px) 100vw, 50vw"
          alt={column.alt || ''}
          className="w-full h-auto"
          loading="lazy"
        />
      )
    }
    
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>{renderColumn(block.leftColumn)}</div>
      <div>{renderColumn(block.rightColumn)}</div>
    </div>
  )
}

// ============================================
// Lightbox Component
// ============================================
function Lightbox({ 
  imageUrl, 
  alt, 
  onClose 
}: { 
  imageUrl: string
  alt: string
  onClose: () => void 
}) {
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button 
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <img
        src={imageUrl}
        alt={alt}
        className="max-h-[90vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

// ============================================
// Gallery Lightbox with Navigation
// ============================================
function GalleryLightbox({
  images,
  currentIndex,
  onClose,
  onNavigate
}: {
  images: any[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}) {
  const currentImage = images[currentIndex]
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < images.length - 1

  // Get image URL - full 4K for lightbox
  const imageUrl = currentImage.image?.asset 
    ? urlFor(currentImage.image).width(3840).quality(90).url()
    : currentImage.asset 
      ? urlFor(currentImage).width(3840).quality(90).url()
      : ''

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft' && hasPrev) onNavigate(currentIndex - 1)
    if (e.key === 'ArrowRight' && hasNext) onNavigate(currentIndex + 1)
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close button */}
      <button 
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        onClick={onClose}
        aria-label="Close"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous button */}
      {hasPrev && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10 p-2"
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1) }}
          aria-label="Previous image"
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Image */}
      <img
        src={imageUrl}
        alt={currentImage.alt || currentImage.caption || ''}
        className="max-h-[85vh] max-w-[85vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next button */}
      {hasNext && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10 p-2"
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1) }}
          aria-label="Next image"
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Caption */}
      {(currentImage.caption || currentImage.title) && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white text-center max-w-lg px-4">
          {currentImage.title && <p className="font-medium">{currentImage.title}</p>}
          {currentImage.caption && <p className="text-sm text-gray-300">{currentImage.caption}</p>}
        </div>
      )}
    </div>
  )
}
