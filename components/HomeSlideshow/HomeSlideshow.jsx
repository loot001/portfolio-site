'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './HomeSlideshow.module.css';

export default function HomeSlideshow({ works }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Shuffle works once on mount
  const [shuffledWorks] = useState(() => {
    if (!works || works.length === 0) return [];
    const shuffled = [...works];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  // Preload first 10 images
  useEffect(() => {
    if (shuffledWorks.length === 0) return;
    
    let loadedCount = 0;
    const totalImages = Math.min(shuffledWorks.length, 10);
    
    shuffledWorks.slice(0, totalImages).forEach((work) => {
      if (work.imageUrl) {
        const img = new Image();
        img.onload = img.onerror = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setIsLoaded(true);
          }
        };
        img.src = work.imageUrl + '?w=2560&h=1440&fit=max&auto=format';
      }
    });
  }, [shuffledWorks]);

  // Simple reliable interval
  useEffect(() => {
    if (!isLoaded || shuffledWorks.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % shuffledWorks.length);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval);
  }, [isLoaded, shuffledWorks.length]);

  if (!shuffledWorks || shuffledWorks.length === 0 || !isLoaded) {
    return (
      <div className={styles.slideshow}>
        <div className={styles.loading}></div>
      </div>
    );
  }

  return (
    <div className={styles.slideshow}>
      {shuffledWorks.map((work, index) => (
        <Link
          key={work._id}
          href={`/works/${work.slug}`}
          className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}
        >
          <img
            src={work.imageUrl + '?w=2560&h=1440&fit=max&auto=format'}
            alt={work.title}
            className={styles.image}
          />
          <div className={styles.titleOverlay}>
            <h2 className={styles.title}>{work.title}</h2>
          </div>
        </Link>
      ))}
    </div>
  );
}
