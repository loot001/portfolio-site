import { client } from '@/lib/sanity.client';
import MosaicGridView from '@/components/MosaicGridView/MosaicGridView';

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
      "firstContentImage": contentBlocks[_type == "imageBlock"][0].image
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
