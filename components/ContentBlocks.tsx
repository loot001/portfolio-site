'use client'

import Image from 'next/image'
import { urlFor } from '@/lib/sanity.client'

interface ContentBlocksProps {
  blocks: any[]
}

export default function ContentBlocks({ blocks }: ContentBlocksProps) {
  if (!blocks || blocks.length === 0) return null

  return (
    <div className="space-y-12">
      {blocks.map((block, index) => (
        <div key={index}>
          {renderBlock(block)}
        </div>
      ))}
    </div>
  )
}

function renderBlock(block: any) {
  switch (block._type) {
    case 'textBlock':
      return <TextBlock content={block.content} />
    
    case 'imageBlock':
      return <ImageBlock block={block} />
    
    case 'galleryBlock':
      return <GalleryBlock block={block} />
    
    case 'videoBlock':
      return <VideoBlock block={block} />
    
    case 'quoteBlock':
      return <QuoteBlock block={block} />
    
    case 'twoColumnBlock':
      return <TwoColumnBlock block={block} />
    
    default:
      return null
  }
}

// Text Block Component
function TextBlock({ content }: { content: string }) {
  return (
    <div className="prose max-w-none">
      <p className="whitespace-pre-wrap">{content}</p>
    </div>
  )
}

// Single Image Block Component
function ImageBlock({ block }: { block: any }) {
  const sizeClasses = {
    full: 'w-full',
    large: 'w-4/5 mx-auto',
    medium: 'w-3/5 mx-auto',
    small: 'w-2/5 mx-auto'
  }

  return (
    <div className={sizeClasses[block.size as keyof typeof sizeClasses] || 'w-full'}>
      <Image
        src={urlFor(block.image).width(1200).url()}
        alt={block.alt || block.title || ''}
        width={1200}
        height={800}
        className="w-full h-auto"
      />
      {(block.title || block.caption) && (
        <div className="mt-2 text-sm text-gray-600">
          {block.title && <p className="font-medium">{block.title}</p>}
          {block.caption && <p>{block.caption}</p>}
        </div>
      )}
    </div>
  )
}

// Image Gallery Block Component
function GalleryBlock({ block }: { block: any }) {
  const layoutClasses = {
    'grid-2': 'grid-cols-2',
    'grid-3': 'grid-cols-3',
    'grid-4': 'grid-cols-4',
    'carousel': 'flex overflow-x-auto gap-4 snap-x'
  }

  const layout = block.layout || 'grid-3'
  const isCarousel = layout === 'carousel'

  return (
    <div>
      <div className={`${isCarousel ? layoutClasses.carousel : `grid ${layoutClasses[layout as keyof typeof layoutClasses]} gap-4`}`}>
        {block.images?.map((image: any, idx: number) => (
          <div key={idx} className={isCarousel ? 'flex-none w-96 snap-center' : ''}>
            <Image
              src={urlFor(image).width(600).url()}
              alt={image.alt || image.title || ''}
              width={600}
              height={400}
              className="w-full h-auto"
            />
            {(image.title || image.caption) && (
              <div className="mt-2 text-sm text-gray-600">
                {image.title && <p className="font-medium">{image.title}</p>}
                {image.caption && <p>{image.caption}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
      {block.caption && (
        <p className="mt-4 text-sm text-gray-600 text-center italic">{block.caption}</p>
      )}
    </div>
  )
}

// Video Block Component
function VideoBlock({ block }: { block: any }) {
  const getVideoEmbedUrl = (platform: string, url: string) => {
    if (platform === 'vimeo') {
      const videoId = url.split('/').pop()?.split('?')[0]
      return `https://player.vimeo.com/video/${videoId}`
    } else if (platform === 'youtube') {
      const videoId = url.includes('v=') 
        ? url.split('v=')[1]?.split('&')[0]
        : url.split('/').pop()
      return `https://www.youtube.com/embed/${videoId}`
    }
    return url
  }

  const embedUrl = getVideoEmbedUrl(block.platform, block.url)

  return (
    <div>
      <div className="aspect-video">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
      {block.caption && (
        <p className="mt-2 text-sm text-gray-600">{block.caption}</p>
      )}
    </div>
  )
}

// Quote Block Component
function QuoteBlock({ block }: { block: any }) {
  return (
    <blockquote className="border-l-4 border-gray-300 pl-6 py-4 my-8">
      <p className="text-xl italic text-gray-700">{block.quote}</p>
      {block.attribution && (
        <footer className="mt-2 text-sm text-gray-600">— {block.attribution}</footer>
      )}
    </blockquote>
  )
}

// Two Column Block Component
function TwoColumnBlock({ block }: { block: any }) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        {block.leftColumn?.type === 'text' && (
          <p className="whitespace-pre-wrap">{block.leftColumn.text}</p>
        )}
        {block.leftColumn?.type === 'image' && block.leftColumn.image && (
          <Image
            src={urlFor(block.leftColumn.image).width(600).url()}
            alt=""
            width={600}
            height={400}
            className="w-full h-auto"
          />
        )}
      </div>
      <div>
        {block.rightColumn?.type === 'text' && (
          <p className="whitespace-pre-wrap">{block.rightColumn.text}</p>
        )}
        {block.rightColumn?.type === 'image' && block.rightColumn.image && (
          <Image
            src={urlFor(block.rightColumn.image).width(600).url()}
            alt=""
            width={600}
            height={400}
            className="w-full h-auto"
          />
        )}
      </div>
    </div>
  )
}
