import { client } from '@/lib/sanity.client';
import MosaicGridView from '@/components/HomePageOrchestrator/MosaicGridView';

export const revalidate = 60;

async function getAllWorks() {
  return await client.fetch(
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
}

export default async function HomePage() {
  const allWorks = await getAllWorks();

  return (
    <main>
      <MosaicGridView works={allWorks} />
    </main>
  );
}
