import Link from 'next/link'
import { client } from '@/lib/sanity.client'
import { PortableText } from '@portabletext/react'
import { cvQuery } from '@/lib/sanity.queries'
import { generatePageMetadata } from '@/lib/metadata'

export const revalidate = 60

export async function generateMetadata() {
  const cv = await client.fetch(cvQuery)
  return generatePageMetadata({
    title: 'CV',
    description: cv?.seo?.metaDescription || undefined,
    path: '/cv'
  })
}

async function getCV() {
  return await client.fetch(cvQuery)
}

const portableTextComponents = {
  marks: {
    link: ({ children, value }: any) => {
      const target = value?.openInNewTab ? '_blank' : '_self'
      const rel = value?.openInNewTab ? 'noreferrer noopener' : undefined
      return (
        <a href={value.href} target={target} rel={rel} className="text-blue-600 hover:underline">
          {children}
        </a>
      )
    },
    workLink: ({ value, children }: any) => {
      const slug = value?.work?.slug
      if (!slug) return <span>{children}</span>
      return (
        <Link href={`/works/${slug}`} className="text-blue-600 hover:underline">
          {children}
        </Link>
      )
    },
    projectLink: ({ value, children }: any) => {
      const slug = value?.project?.slug
      if (!slug) return <span>{children}</span>
      return (
        <Link href={`/projects/${slug}`} className="text-blue-600 hover:underline">
          {children}
        </Link>
      )
    },
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
      <h2 className="text-2xl font-bold mb-6 mt-12 border-b pb-2">{children}</h2>
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

export default async function CVPage() {
  const cv = await getCV()

  if (!cv) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">CV</h1>
        <p className="text-gray-600">
          No CV content yet. Create it in Sanity Studio!
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">{cv.title || 'CV'}</h1>

      {cv.content && (
        <div className="prose prose-lg max-w-none">
          <PortableText
            value={cv.content}
            components={portableTextComponents}
          />
        </div>
      )}
    </div>
  )
}
