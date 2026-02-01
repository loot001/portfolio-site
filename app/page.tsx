// app/page.tsx
// Homepage with responsive image delivery for featured works

import Link from 'next/link'
import { client } from '@/lib/sanity.client'
import { groq } from 'next-sanity'
import SanityImage from '@/components/SanityImage'

export const revalidate = 60

// Featured works query with full image references
const homeQuery = groq`
  *[_type == "work" && defined(slug.current)] | order(yearNumeric desc, title asc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    year,
    
    // Full image reference for responsive delivery
    "thumbnailImage": coalesce(
      thumbnail,
      contentBlocks[_type == "imageBlock"][0].image,
      images[0]
    ),
    
    // Alt text
    "thumbnailAlt": coalesce(
      thumbnail.asset->altText,
      contentBlocks[_type == "imageBlock"][0].alt,
      images[0].alt,
      title
    ),
    
    // URL fallback
    "thumbnail": coalesce(
      thumbnail.asset->url,
      contentBlocks[_type == "imageBlock"][0].image.asset->url,
      images[0].asset->url
    )
  }
`

async function getFeaturedWorks() {
  return await client.fetch(homeQuery)
}

export default async function HomePage() {
  const works = await getFeaturedWorks()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="mb-16">
        <h1 className="text-5xl font-bold mb-4">Luther Thie</h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Contemporary artist working with AI-collaborative practices, 
          creating sculptures, installations, and mixed media pieces.
        </p>
      </div>

      {/* Featured Works */}
      <div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Recent Works</h2>
          <Link 
            href="/works" 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {works.map((work: any) => (
            <Link 
              key={work._id} 
              href={`/works/${work.slug}`}
              className="group block"
            >
              <div className="aspect-square bg-gray-100 mb-3 overflow-hidden relative">
                {work.thumbnailImage?.asset ? (
                  <SanityImage
                    image={work.thumbnailImage}
                    alt={work.thumbnailAlt || work.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : work.thumbnail ? (
                  <img
                    src={`${work.thumbnail}?w=600&h=600&fit=crop&auto=format`}
                    alt={work.thumbnailAlt || work.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                      />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="font-medium group-hover:text-gray-600 transition-colors">
                {work.title}
              </h3>
              <p className="text-sm text-gray-600">{work.year}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
