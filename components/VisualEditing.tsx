'use client'

import { enableVisualEditing } from '@sanity/visual-editing'
import { useEffect } from 'react'

export function VisualEditing() {
  useEffect(() => {
    // Enable visual editing
    const disable = enableVisualEditing({
      zIndex: 999999,
    })
    
    return () => {
      disable()
    }
  }, [])

  return null
}
