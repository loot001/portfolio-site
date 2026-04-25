'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { urlFor } from '@/lib/sanity.client';
import styles from './MosaicGridView2.module.css';

export default function MosaicGridView2({ works }) {
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

  // Image priority: thumbnail → firstContentImage (matches Sanity schema)
  const getImage = (work) => work.thumbnail || work.firstContentImage || null;

  // slug is a plain string from the query ("slug": slug.current)
  const validWorks = works.filter((work) => getImage(work) && work.slug);

  const getThumbUrl = (work) => {
    const img = getImage(work);
    if (!img) return null;
    return urlFor(img).width(800).auto('format').url();
  };

  // Distribute works into columns top-down by index — no CSS balancing
  const columns = Array.from({ length: numColumns }, () => []);
  validWorks.forEach((work, i) => {
    columns[i % numColumns].push(work);
  });

  return (
    <div className={styles.grid}>
      {columns.map((col, colIdx) => (
        <div key={colIdx} className={styles.column}>
          {col.map((work) => {
            const thumbUrl = getThumbUrl(work);
            if (!thumbUrl) return null;
            return (
              <Link
                key={work._id}
                href={`/works/${work.slug}`}
                className={styles.item}
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
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
