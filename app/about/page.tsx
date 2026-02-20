import Image from 'next/image'
import Link from 'next/link'
import { client, urlFor } from '@/lib/sanity.client'
import { PortableText } from '@portabletext/react'
import { aboutQuery } from '@/lib/sanity.queries'

export const revalidate = 60

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
    // External link
    link: ({ children, value }: any) => {
      const target = value?.openInNewTab ? '_blank' : '_self'
      const rel = value?.openInNewTab ? 'noreferrer noopener' : undefined
      return (
        <a href={value.href} target={target} rel={rel} className="text-blue-600 hover:underline">
          {children}
        </a>
      )
    },
    // Link to Work
    workLink: ({ value, children }: any) => {
      const slug = value?.work?.slug
      if (!slug) return <span>{children}</span>
      return (
        <Link href={`/works/${slug}`} className="text-blue-600 hover:underline">
          {children}
        </Link>
      )
    },
    // Link to Project
    projectLink: ({ value, children }: any) => {
      const slug = value?.project?.slug
      if (!slug) return <span>{children}</span>
      return (
        <Link href={`/projects/${slug}`} className="text-blue-600 hover:underline">
          {children}
        </Link>
      )
    },
    // Link to PDF
    pdfLink: ({ value, children }: any) => {
      const pdfUrl = value?.pdf?.asset?.url
      if (!pdfUrl) return <span>{children}</span>
      const target = value?.openInNewTab !== false ? '_blank' : '_self'
      const rel = value?.openInNewTab !== false ? 'noopener noreferrer' : undefined
      return (
        <a
          href={pdfUrl}
          target={target}
          rel={rel}
          className="text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          {children}
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
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
