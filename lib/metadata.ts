// lib/metadata.ts
// Centralized metadata configuration for SEO

export const siteConfig = {
  name: 'Luther Thie',
  title: 'Luther Thie | Contemporary Artist',
  description: 'Contemporary artist working with AI-collaborative practices, creating sculptures that evolve through recursive cycles between physical creation, digital photography, AI image generation, and re-materialization.',
  url: 'https://portfolio-site-ten-liart.vercel.app', // Update this to your actual domain
  ogImage: '/og-default.jpg', // We'll create a default OG image
  keywords: [
    'contemporary art',
    'AI art',
    'sculpture',
    'installation art',
    'mixed media',
    'Luther Thie',
    'AI collaboration',
    'generative art'
  ]
}

export function generatePageMetadata({
  title,
  description,
  image,
  path = '',
  noIndex = false
}: {
  title?: string
  description?: string
  image?: string
  path?: string
  noIndex?: boolean
}) {
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title
  const pageDescription = description || siteConfig.description
  const pageUrl = `${siteConfig.url}${path}`
  const pageImage = image || `${siteConfig.url}${siteConfig.ogImage}`

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: pageUrl
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageUrl,
      title: pageTitle,
      description: pageDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: pageTitle
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [pageImage]
    },
    robots: noIndex ? {
      index: false,
      follow: false
    } : {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  }
}
