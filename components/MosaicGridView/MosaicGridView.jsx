'use client';

import { useState, useEffect } from 'react';
import { urlFor } from '@/lib/sanity.client';
import styles from './MosaicGridView.module.css';
import PreviewPanel from './PreviewPanel';

export default function MosaicGridView({ works }) {
  const [previewWork, setPreviewWork] = useState(null);
  const [numColumns, setNumColumns] = useState(3);

  // Respond to viewport width for column count
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setNumColumns(2);
      else if (w < 1280) setNumColumns(3);
      else setNumColumns(4);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Filter out works with no image
  const validWorks = works.filter(work => work.featuredImage || work.images?.[0]);

  // Get thumbnail URL
  const getImageUrl = (work) => {
    const image = work.featuredImage || work.images?.[0];
    if (!image) return null;
    return urlFor(image).width(800).auto('format').url();
  };

  // Get preview URL
  const getPreviewUrl = (work) => {
    const image = work.featuredImage || work.images?.[0];
    if (!image) return null;
    return urlFor(image).width(1600).auto('format').url();
  };

  // Distribute works across columns by index — top-aligned, no balancing
  const columns = Array.from({ length: numColumns }, () => []);
  validWorks.forEach((work, i) => {
    columns[i % numColumns].push(work);
  });

  return (
    <>
      {/* Manual flex columns — no CSS columns balancing */}
      <div className={styles.grid}>
        {columns.map((col, colIdx) => (
          <div key={colIdx} className={styles.column}>
            {col.map((work) => {
              const imgUrl = getImageUrl(work);
              if (!imgUrl) return null;
              return (
                <div
                  key={work._id}
                  className={styles.item}
                  onClick={() => setPreviewWork(work)}
                >
                  <img
                    src={imgUrl}
                    alt={work.title || ''}
                    className={styles.image}
                    loading="lazy"
                  />
                  <div className={styles.overlay}>
                    <p className={styles.title}>{work.title}</p>
                    {work.year && <p className={styles.year}>{work.year}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Preview panel */}
      {previewWork && (
        <PreviewPanel
          work={previewWork}
          imageUrl={getPreviewUrl(previewWork)}
          onClose={() => setPreviewWork(null)}
        />
      )}
    </>
  );
}
