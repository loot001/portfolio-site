import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/lib/sanity.client'
import { featuredWorksQuery } from '@/lib/sanity.queries'

export const revalidate = 60 // Revalidate every 60 seconds

async function getFeaturedWorks() {
  return await client.fetch(featuredWorksQuery)
}

export default async function Home() {
  const works = await getFeaturedWorks()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="mb-20 text-center">
        <h1 className="text-5xl font-bold mb-6">Luther Thie</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Contemporary artist exploring themes of symbiosis, transformation, 
          and AI collaboration through sculpture, installation, and mixed media.
        </p>
      </div>

      {/* Featured Works */}
      <div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Recent Works</h2>
          <Link href="/works" className="text-gray-600 hover:text-gray-900">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {works.map((work: any) => (
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
              <p className="text-sm text-gray-600">{work.year}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
