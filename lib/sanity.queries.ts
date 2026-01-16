import { groq } from 'next-sanity'

// Get all works for archive (with filtering)
export const worksQuery = groq`
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

// Get single work by slug
export const workBySlugQuery = groq`
  *[_type == "work" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    year,
    yearNumeric,
    workType,
    materials,
    dimensions,
    sizeCategory,
    themes,
    aiInvolved,
    aiRole,
    aiTools,
    images[] {
      asset->,
      title,
      caption,
      alt
    },
    videos,
    description,
    currentLocation,
    status
  }
`

// Get all projects
export const projectsQuery = groq`
  *[_type == "project" && defined(slug.current)] | order(_createdAt desc) {
    _id,
    title,
    slug,
    year,
    excerpt,
    "thumbnail": featuredImage.asset->url,
    featured,
    status
  }
`

// Get single project by slug
export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    year,
    statement,
    excerpt,
    projectImages[] {
      asset->,
      title,
      caption,
      alt
    },
    featuredImage {
      asset->,
      alt
    },
    includedWorks[]-> {
      _id,
      title,
      slug,
      year,
      "thumbnail": images[0].asset->url
    },
    status
  }
`

// Get featured works for homepage
export const featuredWorksQuery = groq`
  *[_type == "work" && defined(slug.current)] | order(yearNumeric desc) [0...6] {
    _id,
    title,
    slug,
    year,
    workType,
    "thumbnail": images[0].asset->url,
    "thumbnailAlt": images[0].alt
  }
`
