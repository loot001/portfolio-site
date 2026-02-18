import { client } from '@/lib/sanity.client';
import HomePageOrchestrator from '@/components/HomePageOrchestrator/HomePageOrchestrator';

export const revalidate = 60; // Revalidate every 60 seconds

// Query all works with images for slideshow - only published works
async function getSlideshowWorks() {
  const works = await client.fetch(
    `*[_type == "work" && !(_id in path("drafts.**"))] {
      _id,
      title,
      "slug": slug.current,
      featuredImage,
      images
    }`
  );
  return works;
}

// Query recent works (last 6 for gallery view) - only published works
async function getRecentWorks() {
  const works = await client.fetch(
    `*[_type == "work" && !(_id in path("drafts.**"))] | order(year desc, _createdAt desc)[0...6] {
      _id,
      title,
      "slug": slug.current,
      year,
      featuredImage,
      images
    }`
  );
  return works;
}

// Query ALL works for mosaic grid view - only published works
async function getAllWorks() {
  const works = await client.fetch(
    `*[_type == "work" && !(_id in path("drafts.**"))] | order(year desc, _createdAt desc) {
      _id,
      title,
      "slug": slug.current,
      year,
      materials,
      featuredImage,
      images
    }`
  );
  return works;
}

export default async function HomePage() {
  // Fetch data for both views
  const [slideshowWorks, recentWorks, allWorks] = await Promise.all([
    getSlideshowWorks(),
    getRecentWorks(),
    getAllWorks(),
  ]);

  return (
    <main>
      <HomePageOrchestrator
        slideshowWorks={slideshowWorks}
        recentWorks={recentWorks}
        allWorks={allWorks}
      />
    </main>
  );
}
