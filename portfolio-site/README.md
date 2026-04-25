# Luther Thie Portfolio Website

Modern Next.js portfolio site connected to Sanity CMS.

## Setup Instructions

### 1. Install Dependencies

```bash
cd D:\GitHub\Art-Portfolio\portfolio-site
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=m1ml84cv
NEXT_PUBLIC_SANITY_DATASET=content
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
portfolio-site/
├── app/
│   ├── layout.tsx          # Root layout with navigation
│   ├── page.tsx            # Homepage
│   ├── works/              # Archive & individual work pages
│   ├── projects/           # Project presentations
│   ├── cv/                 # CV page
│   └── about/              # About page
├── lib/
│   ├── sanity.client.ts    # Sanity configuration
│   └── sanity.queries.ts   # Data queries
└── package.json
```

## Features

- ✅ Homepage with recent works
- ✅ Archive page (searchable grid - 3 columns, newest first)
- ✅ Individual work detail pages
- ✅ Video embeds (Vimeo & YouTube)
- ✅ Image galleries with titles/captions
- ✅ Responsive design
- 🚧 Projects (curated presentations) - coming next
- 🚧 CV content - coming next
- 🚧 About page content - coming next
- 🚧 Search/filter functionality - coming next

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Sanity** - Headless CMS
- **Vercel** - Hosting (coming soon)

## Next Steps

1. Test the site locally
2. Add CV content
3. Add About content
4. Build curated project pages
5. Add search/filter to archive
6. Deploy to Vercel
