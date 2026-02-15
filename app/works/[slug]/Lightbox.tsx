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
  
  // Use refs for live gesture values to avoid re-render during gesture
  const currentScale = useRef(1)
  const currentPosition = useRef({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement>(null)
  
  // Touch/swipe handling
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isSwiping = useRef(false)
  
  // Pinch zoom handling
  const touchStartDistance = useRef(0)
  const touchStartScale = useRef(1)
  const isGesturing = useRef(false)
  
  // Double-tap
  const lastTapTime = useRef(0)

  // Reset zoom when changing images
  useEffect(() => {
    currentScale.current = 1
    currentPosition.current = { x: 0, y: 0 }
    if (imageRef.current) {
      imageRef.current.style.transform = 'scale(1) translate(0px, 0px)'
    }
  }, [currentIndex])

  // Reset to initial index when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      currentScale.current = 1
      currentPosition.current = { x: 0, y: 0 }
      if (imageRef.current) {
        imageRef.current.style.transform = 'scale(1) translate(0px, 0px)'
      }
    }
  }, [isOpen, initialIndex])

  const goToPrevious = useCallback(() => {
    if (currentScale.current === 1) {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    }
  }, [images.length])

  const goToNext = useCallback(() => {
    if (currentScale.current === 1) {
      setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    }
  }, [images.length])

  // Update image transform directly via ref (no React re-render)
  const updateImageTransform = () => {
    if (imageRef.current) {
      const scale = currentScale.current
      const pos = currentPosition.current
      imageRef.current.style.transform = `scale(${scale}) translate(${pos.x / scale}px, ${pos.y / scale}px)`
      imageRef.current.style.cursor = scale > 1 ? 'grab' : 'default'
    }
  }

  const getTouchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return

    if (e.touches.length === 2) {
      // Pinch zoom start
      isGesturing.current = true
      touchStartDistance.current = getTouchDistance(e.touches)
      touchStartScale.current = currentScale.current
    } else if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
      isSwiping.current = false
      isGesturing.current = currentScale.current > 1
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && isGesturing.current) {
      // Pinch zoom
      e.preventDefault()
      const currentDistance = getTouchDistance(e.touches)
      const scaleChange = currentDistance / touchStartDistance.current
      currentScale.current = Math.min(Math.max(1, touchStartScale.current * scaleChange), 4)
      
      if (currentScale.current === 1) {
        currentPosition.current = { x: 0, y: 0 }
      }
      
      updateImageTransform()
    } else if (e.touches.length === 1) {
      const deltaX = Math.abs(touchStartX.current - e.touches[0].clientX)
      const deltaY = Math.abs(touchStartY.current - e.touches[0].clientY)
      
      if (currentScale.current > 1 && isGesturing.current) {
        // Pan when zoomed
        e.preventDefault()
        currentPosition.current = {
          x: currentPosition.current.x + (e.touches[0].clientX - touchStartX.current),
          y: currentPosition.current.y + (e.touches[0].clientY - touchStartY.current)
        }
        touchStartX.current = e.touches[0].clientX
        touchStartY.current = e.touches[0].clientY
        updateImageTransform()
      } else if (currentScale.current === 1 && deltaX > 10 && deltaX > deltaY) {
        isSwiping.current = true
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Double-tap to reset zoom
    if (e.touches.length === 0 && currentScale.current > 1) {
      const now = Date.now()
      if (now - lastTapTime.current < 300) {
        currentScale.current = 1
        currentPosition.current = { x: 0, y: 0 }
        updateImageTransform()
      }
      lastTapTime.current = now
    }
    
    // Swipe navigation
    if (currentScale.current === 1 && isSwiping.current && e.changedTouches[0]) {
      const touchEndX = e.changedTouches[0].clientX
      const deltaX = touchStartX.current - touchEndX
      
      if (Math.abs(deltaX) > 30) {
        if (deltaX > 0) {
          goToNext()
        } else {
          goToPrevious()
        }
      }
    }
    
    isGesturing.current = false
    isSwiping.current = false
  }

  // Desktop: Scroll wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    currentScale.current = Math.min(Math.max(1, currentScale.current + delta), 4)
    
    if (currentScale.current === 1) {
      currentPosition.current = { x: 0, y: 0 }
    }
    
    updateImageTransform()
  }

  // Lock body scroll and keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
    }

    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.overflow = 'hidden'

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
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
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white transition-colors touch-auto"
        style={{ touchAction: 'auto' }}
        aria-label="Close lightbox"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous/Next buttons - desktop only, hidden when zoomed */}
      {images.length > 1 && currentScale.current === 1 && (
        <>
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
        </>
      )}

      {/* Instructions */}
      {images.length > 1 && (
        <p className="absolute top-16 left-0 right-0 text-center text-white/60 text-sm sm:hidden pointer-events-none">
          Swipe to navigate • Pinch to zoom
        </p>
      )}

      {/* Image */}
      <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img
          ref={imageRef}
          src={currentImage.src}
          alt={currentImage.alt}
          className="max-w-[90vw] max-h-[85vh] object-contain select-none"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          style={{
            transform: 'scale(1) translate(0px, 0px)',
            transition: isGesturing.current ? 'none' : 'transform 0.2s ease-out',
            touchAction: 'none',
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
