import { client } from '@/lib/sanity.client'
import { groq } from 'next-sanity'
import WorksArchiveClient from './WorksArchiveClient'

export const revalidate = 60

// Inline query - no $slug parameter needed for archive
const worksArchiveQuery = groq`
  *[_type == "work" && defined(slug.current)] | order(yearNumeric desc, title asc) {
    _id,
    title,
    slug,
    year,
    yearNumeric,
    workType,
    materials,
    dimensions,
    themes,
    aiInvolved,
    "thumbnail": images[0].asset->url,
    "thumbnailAlt": images[0].alt
  }
`

async function getAllWorks() {
  return await client.fetch(worksArchiveQuery)
}

export default async function WorksArchive() {
  const works = await getAllWorks()

  return <WorksArchiveClient works={works} />
}
