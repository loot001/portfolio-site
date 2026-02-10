// app/works/page.tsx
// Works archive page

import { client } from '@/lib/sanity.client'
import { groq } from 'next-sanity'
import WorksArchiveClient from './WorksArchiveClient'

export const revalidate = 60

// Query with granular date sorting (year -> month -> day -> title)
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
    "materials": materials[]->name,
    dimensions,
    themes,
    aiInvolved,
    
    // Thumbnail URL with fallback chain
    "thumbnail": coalesce(
      thumbnail.asset->url,
      contentBlocks[_type == "imageBlock"][0].image.asset->url,
      images[0].asset->url
    ),
    
    // Alt text fallback
    "thumbnailAlt": coalesce(
      thumbnail.asset->altText,
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
