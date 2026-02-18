'use client';

import { useState } from 'react';
import { urlFor } from '@/lib/sanity.client';
import styles from './MosaicGridView.module.css';
import PreviewPanel from './PreviewPanel';

export default function MosaicGridView({ works }) {
  const [previewWork, setPreviewWork] = useState(null);

  const getImage = (work) => work.featuredImage || work.firstContentImage || null;

  const validWorks = works.filter(work => getImage(work) !== null);

  const getWorkImageUrl = (work) => {
    const image = getImage(work);
    if (!image) return null;
    return urlFor(image).width(800).auto('format').url();
  };

  const getPreviewImageUrl = (work) => {
    const image = getImage(work);
    if (!image) return null;
    return urlFor(image).width(1600).auto('format').url();
  };

  return (
    <>
      <div className={styles.grid}>
        {validWorks.map((work) => {
          const imageUrl = getWorkImageUrl(work);
          if (!imageUrl) return null;

          return (
            <div
              key={work._id}
              className={styles.item}
              onClick={() => setPreviewWork(work)}
            >
              <img
                src={imageUrl}
                alt={work.title}
                className={styles.image}
                loading="lazy"
              />
              <div className={styles.overlay}>
                <h3 className={styles.title}>{work.title}</h3>
                {work.year && <p className={styles.year}>{work.year}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {previewWork && (
        <PreviewPanel
          work={previewWork}
          imageUrl={getPreviewImageUrl(previewWork)}
          onClose={() => setPreviewWork(null)}
        />
      )}
    </>
  );
}
