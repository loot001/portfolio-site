// app/works/WorksArchiveClient.tsx
// Updated with responsive SanityImage for optimal image delivery

'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import SanityImage from '@/components/SanityImage'

interface Work {
  _id: string
  title: string
  slug: { current: string }
  year: string
  yearNumeric: number
  workType?: string
  materials?: string
  themes?: string[]
  aiInvolved?: boolean
  // Image data from Sanity (full reference, not just URL)
  thumbnailImage?: any
  thumbnailAlt?: string
  // Fallback: URL string for backward compatibility
  thumbnail?: string
}

interface WorksArchiveClientProps {
  works: Work[]
}

export default function WorksArchiveClient({ works }: WorksArchiveClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')

  // Extract unique types and years for filters
  const workTypes = useMemo(() => {
    const types = new Set<string>()
    works.forEach(work => {
      if (work.workType) types.add(work.workType)
    })
    return Array.from(types).sort()
  }, [works])

  const years = useMemo(() => {
    const yearSet = new Set<string>()
    works.forEach(work => {
      if (work.year) {
        // Strip invisible characters
        const cleanYear = work.year.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '').trim()
        yearSet.add(cleanYear)
      }
    })
    return Array.from(yearSet).sort().reverse()
  }, [works])

  // Filter works
  const filteredWorks = useMemo(() => {
    return works.filter(work => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const matchesTitle = work.title?.toLowerCase().includes(search)
        const matchesMaterials = work.materials?.toLowerCase().includes(search)
        const matchesThemes = work.themes?.some(t => 
          typeof t === 'string' && t.toLowerCase().includes(search)
        )
        if (!matchesTitle && !matchesMaterials && !matchesThemes) return false
      }

      // Type filter
      if (selectedType !== 'all' && work.workType !== selectedType) return false

      // Year filter
      if (selectedYear !== 'all') {
        const cleanWorkYear = work.year?.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '').trim()
        if (cleanWorkYear !== selectedYear) return false
      }

      return true
    })
  }, [works, searchTerm, selectedType, selectedYear])

  const hasFilters = searchTerm || selectedType !== 'all' || selectedYear !== 'all'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Works</h1>
        <p className="text-gray-600">
          {filteredWorks.length} of {works.length} works
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="Search works..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 w-full sm:w-64"
          />

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="all">All Types</option>
            {workTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="all">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedType('all')
                setSelectedYear('all')
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Works Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredWorks.map((work) => (
          <Link 
            key={work._id} 
            href={`/works/${work.slug.current}`}
            className="group block"
          >
            {/* Thumbnail */}
            <div className="aspect-square bg-gray-100 mb-3 overflow-hidden relative">
              {work.thumbnailImage?.asset ? (
                // Use new SanityImage component for responsive delivery
                <SanityImage
                  image={work.thumbnailImage}
                  alt={work.thumbnailAlt || work.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : work.thumbnail ? (
                // Fallback for URL-only thumbnails (backward compatibility)
                <img
                  src={`${work.thumbnail}?w=600&h=600&fit=crop&auto=format`}
                  alt={work.thumbnailAlt || work.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                // Placeholder
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Info */}
            <h3 className="font-medium group-hover:text-gray-600 transition-colors">
              {work.title}
            </h3>
            <div className="text-sm text-gray-600">
              <p>{work.year}</p>
              {work.workType && (
                <p className="capitalize">{work.workType.replace('-', ' ')}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* No results */}
      {filteredWorks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No works found matching your search criteria.
        </div>
      )}
    </div>
  )
}
