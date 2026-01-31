import { client } from '@/lib/sanity.client'
import { groq } from 'next-sanity'
import WorksArchiveClient from './WorksArchiveClient'

export const revalidate = 60

// Sort by year, then month, then day (all descending for newest first)
const worksArchiveQuery = groq`
  *[_type == "work" && defined(slug.current)] | order(yearNumeric desc, monthNumeric desc, dayNumeric desc, title asc) {
    _id,
    title,
    slug,
    year,
    yearNumeric,
    monthNumeric,
    dayNumeric,
    workType,
    materials,
    dimensions,
    themes,
    aiInvolved,
    "thumbnail": coalesce(
      thumbnail.asset->url,
      contentBlocks[_type == "imageBlock"][0].image.asset->url,
      images[0].asset->url
    ),
    "thumbnailAlt": coalesce(
      contentBlocks[_type == "imageBlock"][0].alt,
      images[0].alt,
      title
    )
  }
`

async function getAllWorks() {
  return await client.fetch(worksArchiveQuery)
}

export default async function WorksArchive() {
  const works = await getAllWorks()

  return <WorksArchiveClient works={works} />
}
