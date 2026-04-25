import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/lib/sanity.client'
import { worksQuery } from '@/lib/sanity.queries'

export const revalidate = 60

async function getAllWorks() {
  return await client.fetch(worksQuery)
}

export default async function WorksArchive() {
  const works = await getAllWorks()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Archive</h1>
        <p className="text-gray-600">
          {works.length} works • Sorted by newest first
        </p>
      </div>

      {/* TODO: Add filters here - year, type, materials, AI, etc */}

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
            <div className="text-sm text-gray-600">
              <p>{work.year}</p>
              {work.workType && <p className="capitalize">{work.workType}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
