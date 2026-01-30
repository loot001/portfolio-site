'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface LightboxImage {
  src: string
  alt: string
  caption?: string
}

interface LightboxProps {
  images: LightboxImage[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
}

export default function Lightbox({ images, initialIndex = 0, isOpen, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  // Reset to initial index when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
    }
  }, [isOpen, initialIndex])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }, [images.length])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
    }

    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, goToPrevious, goToNext])

  if (!isOpen || images.length === 0) return null

  const currentImage = images[currentIndex]

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white transition-colors"
        aria-label="Close lightbox"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            goToPrevious()
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white/80 hover:text-white transition-colors"
          aria-label="Previous image"
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            goToNext()
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white/80 hover:text-white transition-colors"
          aria-label="Next image"
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Image container */}
      <div 
        className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          className="max-w-full max-h-[85vh] object-contain"
        />
      </div>

      {/* Caption and counter */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white">
        {currentImage.caption && (
          <p className="mb-2 text-sm px-4">{currentImage.caption}</p>
        )}
        {images.length > 1 && (
          <p className="text-sm text-white/60">
            {currentIndex + 1} / {images.length}
          </p>
        )}
      </div>
    </div>
  )
}
