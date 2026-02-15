// app/page.tsx — Homepage with slideshow + featured works below

import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/lib/sanity.client'
import { groq } from 'next-sanity'
import HomeSlideshow from '@/components/HomeSlideshow/HomeSlideshow'

export const revalidate = 60

const homeQuery = groq`
  *[_type == "work" && defined(slug.current)] | order(yearNumeric desc, monthNumeric desc, dayNumeric desc, title asc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    year,
    "thumbnail": coalesce(
      thumbnail.asset->url,
      contentBlocks[_type == "imageBlock"][0].image.asset->url,
      images[0].asset->url
    ),
    "thumbnailAlt": coalesce(
      thumbnail.asset->altText,
      contentBlocks[_type == "imageBlock"][0].alt,
      images[0].alt,
      title
    )
  }
`

const slideshowQuery = groq`
  *[_type == "work" && defined(contentBlocks) && count(contentBlocks[_type == "imageBlock"]) > 0] {
    _id,
    title,
    "slug": slug.current,
    "imageUrl": contentBlocks[_type == "imageBlock"][0].image.asset->url
  }
`

async function getFeaturedWorks() {
  return await client.fetch(homeQuery)
}

async function getSlideshowWorks() {
  return await client.fetch(slideshowQuery)
}

export default async function HomePage() {
  const works = await getFeaturedWorks()
  const slideshowWorks = await getSlideshowWorks()

  return (
    <>
      {/* Full-viewport slideshow */}
      <HomeSlideshow works={slideshowWorks} />

      {/* Featured works below the fold */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
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
                {work.thumbnail ? (
                  <Image
                    src={work.thumbnail + '?w=600&h=600&fit=crop&auto=format'}
                    alt={work.thumbnailAlt || work.title}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <h3 className="font-medium">{work.title}</h3>
              <p className="text-sm text-gray-600">{work.year}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
