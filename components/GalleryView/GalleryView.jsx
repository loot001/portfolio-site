'use client';

import HomeSlideshow from '@/components/HomeSlideshow/HomeSlideshow';
import styles from './GalleryView.module.css';
import { urlFor } from '@/lib/sanity.client';

export default function GalleryView({ slideshowWorks, recentWorks }) {
  // Prepare works for slideshow - add imageUrl property
  const preparedSlideshowWorks = slideshowWorks.map(work => {
    const image = work.featuredImage || work.images?.[0];
    const imageUrl = image ? urlFor(image).url() : null;
    
    return {
      ...work,
      imageUrl
    };
  }).filter(work => work.imageUrl); // Only include works with valid images
  
  return (
    <div className={styles.container}>
      {/* Existing slideshow */}
      <HomeSlideshow works={preparedSlideshowWorks} />
      
      {/* Recent Works Section */}
      {recentWorks && recentWorks.length > 0 && (
        <section className={styles.recentWorks}>
          <h2 className={styles.sectionTitle}>Recent Works</h2>
          <div className={styles.grid}>
            {recentWorks.map((work) => (
              <WorkCard key={work._id} work={work} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function WorkCard({ work }) {
  const getWorkImage = () => {
    const image = work.featuredImage || work.images?.[0];
    if (!image) return null;
    
    return urlFor(image)
      .width(800)
      .height(800)
      .fit('crop')
      .auto('format')
      .url();
  };

  const imageUrl = getWorkImage();
  if (!imageUrl) return null;

  return (
    <a 
      href={`/works/${work.slug}`}
      className={styles.card}
    >
      <div className={styles.imageContainer}>
        <img 
          src={imageUrl}
          alt={work.title}
          className={styles.image}
          loading="lazy"
        />
      </div>
      <div className={styles.cardInfo}>
        <h3 className={styles.cardTitle}>{work.title}</h3>
        {work.year && (
          <p className={styles.cardYear}>{work.year}</p>
        )}
      </div>
    </a>
  );
}
