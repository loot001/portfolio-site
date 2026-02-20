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
    "thumbnail": coalesce(
      contentBlocks[_type == "imageBlock"][0].image.asset->url,
      images[0].asset->url
    ),
    "thumbnailAlt": coalesce(
      contentBlocks[_type == "imageBlock"][0].alt,
      images[0].alt
    )
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
    
    // Content Blocks (new system)
    contentBlocks[] {
      _type,
      _key,
      
      _type == "textBlock" => {
        content[] {
          ...,
          markDefs[] {
            ...,
            _type == "workLink" => {
              "work": work-> {
                "slug": slug.current
              }
            },
            _type == "projectLink" => {
              "project": project-> {
                "slug": slug.current
              }
            },
            _type == "pdfLink" => {
              pdf {
                asset->
              }
            }
          }
        }
      },
      
      _type == "imageBlock" => {
        image {
          asset->
        },
        caption,
        alt,
        size
      },
      
      _type == "videoBlock" => {
        platform,
        url,
        caption
      }
    },
    
    // Legacy fields (fallback)
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
      "thumbnail": coalesce(
        contentBlocks[_type == "imageBlock"][0].image.asset->url,
        images[0].asset->url
      )
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
    "thumbnail": coalesce(
      contentBlocks[_type == "imageBlock"][0].image.asset->url,
      images[0].asset->url
    ),
    "thumbnailAlt": coalesce(
      contentBlocks[_type == "imageBlock"][0].alt,
      images[0].alt
    )
  }
`

// Get About page (singleton)
export const aboutQuery = groq`
  *[_type == "about"][0] {
    title,
    heroImage {
      asset->,
      caption,
      alt
    },
    content[] {
      ...,
      markDefs[] {
        ...,
        _type == "workLink" => {
          "work": work-> {
            "slug": slug.current
          }
        },
        _type == "projectLink" => {
          "project": project-> {
            "slug": slug.current
          }
        },
        _type == "pdfLink" => {
          pdf {
            asset->
          }
        }
      },
      // Resolve inline images within portable text
      _type == "image" => {
        asset->
      }
    },
    seo
  }
`
