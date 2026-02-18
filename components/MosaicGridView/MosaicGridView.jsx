'use client';

import { useState, useEffect } from 'react';
import { urlFor } from '@/lib/sanity.client';
import styles from './MosaicGridView.module.css';
import PreviewPanel from './PreviewPanel';

export default function MosaicGridView({ works }) {
  const [previewWork, setPreviewWork] = useState(null);
  const [numColumns, setNumColumns] = useState(3);

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

  // Image priority: featuredImage → firstContentImage (matches page.tsx query)
  const getImage = (work) => work.featuredImage || work.firstContentImage || null;

  const validWorks = works.filter(work => getImage(work));

  const getThumbUrl = (work) => {
    const img = getImage(work);
    if (!img) return null;
    return urlFor(img).width(800).auto('format').url();
  };

  const getPreviewUrl = (work) => {
    const img = getImage(work);
    if (!img) return null;
    return urlFor(img).width(1600).auto('format').url();
  };

  // Distribute works into columns top-down by index — no CSS balancing
  const columns = Array.from({ length: numColumns }, () => []);
  validWorks.forEach((work, i) => {
    columns[i % numColumns].push(work);
  });

  return (
    <>
      <div className={styles.grid}>
        {columns.map((col, colIdx) => (
          <div key={colIdx} className={styles.column}>
            {col.map((work) => {
              const thumbUrl = getThumbUrl(work);
              if (!thumbUrl) return null;
              return (
                <div
                  key={work._id}
                  className={styles.item}
                  onClick={() => setPreviewWork(work)}
                >
                  <img
                    src={thumbUrl}
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
