'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// Strip invisible characters
function cleanString(str: any): string {
  if (!str) return ''
  return String(str).replace(/[^\x20-\x7E]/g, '').trim()
}

export default function WorksArchiveClient({ works: initialWorks }: { works: any[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')

  // Get unique types for filters
  const workTypes = useMemo(() => {
    const types: string[] = []
    initialWorks.forEach(w => {
      const type = cleanString(w.workType)
      if (type && !types.includes(type)) {
        types.push(type)
      }
    })
    return types.sort()
  }, [initialWorks])

  // Get unique years for filters - strip invisible characters
  const years = useMemo(() => {
    const uniqueYears: string[] = []
    initialWorks.forEach(w => {
      const year = cleanString(w.year)
      if (year && !uniqueYears.includes(year)) {
        uniqueYears.push(year)
      }
    })
    return uniqueYears.sort().reverse()
  }, [initialWorks])

  // Filter works based on search and filters
  const filteredWorks = useMemo(() => {
    return initialWorks.filter(work => {
      // Search filter
      const searchLower = searchTerm.toLowerCase()
      const titleMatch = work.title?.toLowerCase().includes(searchLower) || false
      
      // Materials are now an array of strings (dereferenced in query) or null
      const materialsMatch = Array.isArray(work.materials) && work.materials.some((m: any) => 
        m && typeof m === 'string' && m.toLowerCase().includes(searchLower)
      )
      
      // Themes
      const themesMatch = Array.isArray(work.themes) && work.themes.some((t: any) => 
        t && typeof t === 'string' && t.toLowerCase().includes(searchLower)
      )
      
      const matchesSearch = searchTerm === '' || titleMatch || materialsMatch || themesMatch

      // Type filter
      const matchesType = selectedType === 'all' || cleanString(work.workType) === selectedType

      // Year filter
      const matchesYear = selectedYear === 'all' || cleanString(work.year) === selectedYear

      return matchesSearch && matchesType && matchesYear
    })
  }, [initialWorks, searchTerm, selectedType, selectedYear])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Works</h1>
        <p className="text-gray-600">
          {filteredWorks.length} of {initialWorks.length} works • Sorted by newest first
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Box */}
        <div>
          <input
            type="text"
            placeholder="Search by title, materials, or themes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">All Types</option>
            {workTypes.map(type => (
              <option key={type} value={type} className="capitalize">
                {type}
              </option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {(searchTerm || selectedType !== 'all' || selectedYear !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedType('all')
                setSelectedYear('all')
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Works Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredWorks.map((work: any) => (
          <Link 
            key={work._id} 
            href={`/works/${work.slug.current}`}
            className="group"
          >
            <div className="aspect-square bg-gray-100 mb-3 overflow-hidden">
              {work.thumbnail && (
                <Image
                  src={work.thumbnail}
                  alt={work.thumbnailAlt || work.title}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
            </div>
            <h3 className="font-medium">{work.title}</h3>
            <div className="text-sm text-gray-600">
              <p>{work.year}</p>
              {work.workType && <p className="capitalize">{work.workType}</p>}
            </div>
          </Link>
        ))}
      </div>

      {/* No results message */}
      {filteredWorks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No works found matching your search criteria.
        </div>
      )}
    </div>
  )
}
