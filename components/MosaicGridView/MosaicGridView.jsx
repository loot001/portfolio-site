'use client';

import { useState } from 'react';
import { urlFor } from '@/lib/sanity.client';
import Link from 'next/link';
import Image from 'next/image';
import styles from './MosaicGridView.module.css';
import PreviewPanel from './PreviewPanel';

export default function MosaicGridView({ works }) {
  const [previewWork, setPreviewWork] = useState(null);

  // Filter out works without any images (same logic as Works grid)
  const validWorks = works.filter(work => work.featuredImage || (work.images && work.images.length > 0));

  // Get image URL - same priority as Works grid: featuredImage first, then images[0]
  const getWorkImageUrl = (work) => {
    const image = work.featuredImage || work.images?.[0];
    if (!image) return null;
    
    return urlFor(image)
      .width(800)
      .auto('format')
      .url();
  };

  // Get higher res image for preview
  const getPreviewImageUrl = (work) => {
    const image = work.featuredImage || work.images?.[0];
    if (!image) return null;
    
    return urlFor(image)
      .width(1600)
      .auto('format')
      .url();
  };

  // Assign size class based on position (creates variation)
  const getSizeClass = (index) => {
    const patterns = ['small', 'medium', 'large', 'wide', 'tall'];
    return patterns[index % patterns.length];
  };

  return (
    <>
      <div className={styles.grid}>
        {validWorks.map((work, index) => {
          const imageUrl = getWorkImageUrl(work);
          if (!imageUrl) return null;
          
          const sizeClass = getSizeClass(index);
          
          return (
            <div
              key={work._id}
              className={`${styles.item} ${styles[sizeClass]}`}
              onClick={() => setPreviewWork(work)}
            >
              <div className={styles.imageWrapper}>
                <img
                  src={imageUrl}
                  alt={work.title}
                  className={styles.image}
                  loading="lazy"
                />
                <div className={styles.overlay}>
                  <h3 className={styles.title}>{work.title}</h3>
                  {work.year && (
                    <p className={styles.year}>{work.year}</p>
                  )}
                </div>
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
