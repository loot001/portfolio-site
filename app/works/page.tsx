// app/works/page.tsx
// Works archive with responsive image delivery

import { client } from '@/lib/sanity.client'
import { groq } from 'next-sanity'
import WorksArchiveClient from './WorksArchiveClient'

export const revalidate = 60

// Query with FULL image references for responsive srcset generation
// Instead of just URLs, we fetch the asset reference so SanityImage can build srcsets
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
    
    // Full image reference for responsive delivery
    // Priority: dedicated thumbnail → first content block image → first legacy image
    "thumbnailImage": coalesce(
      thumbnail,
      contentBlocks[_type == "imageBlock"][0].image,
      images[0]
    ),
    
    // Alt text fallback chain
    "thumbnailAlt": coalesce(
      thumbnail.asset->altText,
      contentBlocks[_type == "imageBlock"][0].alt,
      images[0].alt,
      title
    ),
    
    // Keep URL as fallback for backward compatibility
    "thumbnail": coalesce(
      thumbnail.asset->url,
      contentBlocks[_type == "imageBlock"][0].image.asset->url,
      images[0].asset->url
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
