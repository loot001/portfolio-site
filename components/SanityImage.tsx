// components/SanityImage.tsx
// Responsive image component with proper srcset for Sanity CDN delivery

'use client'

import { urlFor } from '@/lib/sanity.client'
import { useState } from 'react'

interface SanityImageProps {
  image: any // Sanity image reference
  alt: string
  sizes?: string // Responsive sizes attribute
  priority?: boolean
  className?: string
  fill?: boolean
  width?: number // Only used when fill is false
  height?: number // Only used when fill is false
  quality?: number // 1-100, default 80
  onClick?: () => void
}

// Breakpoints for srcset generation
const BREAKPOINTS = [400, 640, 800, 1024, 1200, 1600, 2000, 2400]

export default function SanityImage({
  image,
  alt,
  sizes = '100vw',
  priority = false,
  className = '',
  fill = false,
  width,
  height,
  quality = 80,
  onClick
}: SanityImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  if (!image?.asset) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    )
  }

  // Generate srcset with multiple widths
  const srcSet = BREAKPOINTS
    .map(w => `${urlFor(image).width(w).quality(quality).auto('format').url()} ${w}w`)
    .join(', ')

  // Default src (fallback for browsers that don't support srcset)
  const src = urlFor(image).width(1200).quality(quality).auto('format').url()

  // Get intrinsic dimensions if available (for aspect ratio)
  const aspectRatio = image.asset?.metadata?.dimensions 
    ? image.asset.metadata.dimensions.width / image.asset.metadata.dimensions.height
    : undefined

  const handleLoad = () => setIsLoading(false)
  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  if (hasError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Failed to load image</span>
      </div>
    )
  }

  const imgProps = {
    src,
    srcSet,
    sizes,
    alt,
    loading: priority ? 'eager' as const : 'lazy' as const,
    decoding: 'async' as const,
    onLoad: handleLoad,
    onError: handleError,
    onClick,
    className: `
      ${className}
      ${isLoading ? 'opacity-0' : 'opacity-100'}
      transition-opacity duration-300
      ${onClick ? 'cursor-pointer' : ''}
    `.trim()
  }

  if (fill) {
    return (
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}
        <img
          {...imgProps}
          style={{ 
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
    )
  }

  return (
    <div className="relative" style={aspectRatio ? { aspectRatio } : undefined}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <img
        {...imgProps}
        width={width}
        height={height}
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  )
}

// ============================================
// Utility: Generate image URL with parameters
// ============================================
export function getSanityImageUrl(
  image: any,
  options: {
    width?: number
    height?: number
    quality?: number
    fit?: 'clip' | 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'min'
  } = {}
) {
  const { width = 1200, height, quality = 80, fit } = options
  
  let builder = urlFor(image).width(width).quality(quality).auto('format')
  
  if (height) builder = builder.height(height)
  if (fit) builder = builder.fit(fit)
  
  return builder.url()
}

// ============================================
// Utility: Generate srcset string for manual use
// ============================================
export function getSanitySrcSet(
  image: any,
  options: {
    widths?: number[]
    quality?: number
  } = {}
) {
  const { widths = BREAKPOINTS, quality = 80 } = options
  
  return widths
    .map(w => `${urlFor(image).width(w).quality(quality).auto('format').url()} ${w}w`)
    .join(', ')
}
