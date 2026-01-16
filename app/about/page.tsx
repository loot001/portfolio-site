import Image from 'next/image'
import { client, urlFor } from '@/lib/sanity.client'
import { PortableText } from '@portabletext/react'
import { groq } from 'next-sanity'

export const revalidate = 60

const aboutQuery = groq`
  *[_type == "about"][0] {
    title,
    heroImage {
      asset->,
      caption,
      alt
    },
    content[] {
      ...,
      _type == "image" => {
        asset->,
        caption,
        alt
      }
    },
    seo
  }
`

async function getAbout() {
  return await client.fetch(aboutQuery)
}

// Portable Text components for rendering rich text
const portableTextComponents = {
  types: {
    image: ({ value }: any) => (
      <div className="my-8">
        <Image
          src={urlFor(value.asset).width(1200).url()}
          alt={value.alt || ''}
          width={1200}
          height={800}
          className="w-full h-auto"
        />
        {value.caption && (
          <p className="text-sm text-gray-600 mt-2 text-center italic">
            {value.caption}
          </p>
        )}
      </div>
    ),
  },
  marks: {
    link: ({ children, value }: any) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined
      return (
        <a href={value.href} rel={rel} className="text-blue-600 hover:underline">
          {children}
        </a>
      )
    },
  },
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-bold mb-4 mt-8">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-semibold mb-3 mt-6">{children}</h3>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-gray-300 pl-6 py-2 my-6 italic text-gray-700">
        {children}
      </blockquote>
    ),
    normal: ({ children }: any) => <p className="mb-4">{children}</p>,
  },
}

export default async function AboutPage() {
  const about = await getAbout()

  // Fallback if no About page exists yet
  if (!about) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">About</h1>
        <p className="text-gray-600">
          No About page content yet. Create it in Sanity Studio!
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">{about.title || 'About'}</h1>
      
      {/* Hero Image */}
      {about.heroImage && (
        <div className="mb-12">
          <Image
            src={urlFor(about.heroImage.asset).width(1200).url()}
            alt={about.heroImage.alt || ''}
            width={1200}
            height={800}
            className="w-full h-auto"
          />
          {about.heroImage.caption && (
            <p className="text-sm text-gray-600 mt-2">{about.heroImage.caption}</p>
          )}
        </div>
      )}

      {/* Rich Text Content */}
      {about.content && (
        <div className="prose prose-lg max-w-none">
          <PortableText 
            value={about.content} 
            components={portableTextComponents}
          />
        </div>
      )}
    </div>
  )
}
