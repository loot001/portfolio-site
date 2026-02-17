import { client } from '@/lib/sanity.client';
import HomePageOrchestrator from '@/components/HomePageOrchestrator/HomePageOrchestrator';

export const revalidate = 60; // Revalidate every 60 seconds

// Query all works with images for slideshow
async function getSlideshowWorks() {
  const works = await client.fetch(
    `*[_type == "work" && defined(images) && count(images) > 0] {
      _id,
      title,
      "slug": slug.current,
      images,
      featuredImage
    }`
  );
  return works;
}

// Query recent works (last 6 for gallery view)
async function getRecentWorks() {
  const works = await client.fetch(
    `*[_type == "work"] | order(year desc, _createdAt desc)[0...6] {
      _id,
      title,
      "slug": slug.current,
      year,
      images,
      featuredImage
    }`
  );
  return works;
}

// Query ALL works for dense grid view
async function getAllWorks() {
  const works = await client.fetch(
    `*[_type == "work"] | order(year desc, _createdAt desc) {
      _id,
      title,
      "slug": slug.current,
      year,
      materials,
      images,
      featuredImage
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
