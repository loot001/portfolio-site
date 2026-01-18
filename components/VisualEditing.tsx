'use client'

import { enableOverlays } from '@sanity/visual-editing'
import { useEffect } from 'react'

export function VisualEditing() {
  useEffect(() => {
    // Enable visual editing overlays
    const disable = enableOverlays({
      zIndex: 999999,
    })
    
    return () => {
      disable()
    }
  }, [])

  return null
}
