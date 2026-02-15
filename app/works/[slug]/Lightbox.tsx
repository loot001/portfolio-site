'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

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
  
  // Zoom state
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  
  // Touch/swipe handling
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isSwiping = useRef(false)
  
  // Pinch zoom handling
  const touchStartDistance = useRef(0)
  const touchStartScale = useRef(1)

  // Reset zoom when changing images
  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [currentIndex])

  // Reset to initial index when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      setScale(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen, initialIndex])

  const goToPrevious = useCallback(() => {
    if (scale === 1) { // Only allow navigation when not zoomed
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    }
  }, [images.length, scale])

  const goToNext = useCallback(() => {
    if (scale === 1) { // Only allow navigation when not zoomed
      setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    }
  }, [images.length, scale])

  // Helper: Get distance between two touch points
  const getTouchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Handle touch gestures (swipe OR pinch-zoom OR pan)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Two fingers = pinch zoom
      e.preventDefault()
      touchStartDistance.current = getTouchDistance(e.touches)
      touchStartScale.current = scale
      isSwiping.current = false
    } else if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
      isSwiping.current = false
      
      if (scale > 1) {
        // When zoomed, prepare for panning
        setIsDragging(true)
        dragStart.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        }
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault() // Prevent all touch-scroll
    
    if (e.touches.length === 2) {
      // Pinch zoom
      const currentDistance = getTouchDistance(e.touches)
      const scaleChange = currentDistance / touchStartDistance.current
      const newScale = Math.min(Math.max(1, touchStartScale.current * scaleChange), 4)
      setScale(newScale)
      
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 })
      }
    } else if (e.touches.length === 1) {
      if (scale > 1 && isDragging) {
        // Pan when zoomed
        setPosition({
          x: e.touches[0].clientX - dragStart.current.x,
          y: e.touches[0].clientY - dragStart.current.y,
        })
      } else if (scale === 1) {
        // Swipe detection when NOT zoomed
        const deltaX = Math.abs(touchStartX.current - e.touches[0].clientX)
        const deltaY = Math.abs(touchStartY.current - e.touches[0].clientY)
        
        if (deltaX > 10 && deltaX > deltaY) {
          isSwiping.current = true
        }
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false)
    
    if (scale === 1 && isSwiping.current) {
      // Handle swipe navigation when not zoomed
      const touchEndX = e.changedTouches[0].clientX
      const deltaX = touchStartX.current - touchEndX
      const minSwipeDistance = 30
      
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          goToNext()
        } else {
          goToPrevious()
        }
      }
    }
    
    isSwiping.current = false
  }

  // Desktop: Scroll wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newScale = Math.min(Math.max(1, scale + delta), 4)
    setScale(newScale)
    
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 })
    }
  }

  // Desktop: Mouse drag when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Lock body scroll and keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
    }

    // Lock scroll — fixes iOS Safari and Chrome mobile scroll-through
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.overflow = 'hidden'

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      
      // Restore scroll position
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [isOpen, onClose, goToPrevious, goToNext])

  if (!isOpen || images.length === 0) return null

  const currentImage = images[currentIndex]

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center overscroll-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white transition-colors sm:top-4"
        aria-label="Close lightbox"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous button - hidden on touch devices and when zoomed */}
      {images.length > 1 && scale === 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            goToPrevious()
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white/80 hover:text-white transition-colors hidden sm:block"
          aria-label="Previous image"
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next button - hidden on touch devices and when zoomed */}
      {images.length > 1 && scale === 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            goToNext()
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white/80 hover:text-white transition-colors hidden sm:block"
          aria-label="Next image"
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Swipe/zoom instruction - mobile only */}
      {images.length > 1 && (
        <p className="absolute top-16 left-0 right-0 text-center text-white/60 text-sm sm:hidden pointer-events-none">
          {scale === 1 ? 'Swipe to navigate • Pinch to zoom' : 'Pinch to zoom out'}
        </p>
      )}

      {/* Zoom indicator - desktop */}
      {scale > 1 && (
        <div className="absolute top-4 left-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full pointer-events-none hidden sm:block">
          {Math.round(scale * 100)}%
        </div>
      )}

      {/* Image container */}
      <div
        className="flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          className="max-w-[90vw] max-h-[85vh] object-contain select-none"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        />
      </div>

      {/* Caption and counter */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white pointer-events-none">
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
