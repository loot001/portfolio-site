'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './HomeSlideshow.module.css';

export default function HomeSlideshow({ works }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // Shuffle works on mount to get random order
  const [shuffledWorks] = useState(() => {
    if (!works || works.length === 0) return [];
    const shuffled = [...works];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  // Preload first few images
  useEffect(() => {
    if (shuffledWorks.length === 0) return;
    
    const imagesToPreload = shuffledWorks.slice(0, 3);
    let loadedCount = 0;
    
    imagesToPreload.forEach((work) => {
      if (work.imageUrl) {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === imagesToPreload.length) {
            setImagesLoaded(true);
          }
        };
        img.src = work.imageUrl + '?w=2560&h=1440&fit=max&auto=format';
      }
    });
  }, [shuffledWorks]);

  // Slideshow interval
  useEffect(() => {
    if (!imagesLoaded || shuffledWorks.length === 0) return;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      // After 3 seconds (transition complete), update indices
      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setNextIndex((nextIndex + 1) % shuffledWorks.length);
        setIsTransitioning(false);
      }, 3000);
    }, 6000); // Change image every 6 seconds (3s visible + 3s transition)

    return () => clearInterval(interval);
  }, [nextIndex, shuffledWorks.length, imagesLoaded]);

  if (!shuffledWorks || shuffledWorks.length === 0) {
    return null;
  }

  const currentWork = shuffledWorks[currentIndex];
  const nextWork = shuffledWorks[nextIndex];

  return (
    <div className={styles.slideshow}>
      {/* Current image */}
      {currentWork?.imageUrl && (
        <Link 
          href={`/works/${currentWork.slug}`}
          className={`${styles.slide} ${styles.current}`}
        >
          <img
            src={currentWork.imageUrl + '?w=2560&h=1440&fit=max&auto=format'}
            alt={currentWork.title}
            className={styles.image}
            loading="eager"
          />
        </Link>
      )}

      {/* Next image (fades in during transition) */}
      {nextWork?.imageUrl && (
        <Link 
          href={`/works/${nextWork.slug}`}
          className={`${styles.slide} ${styles.next} ${isTransitioning ? styles.visible : ''}`}
        >
          <img
            src={nextWork.imageUrl + '?w=2560&h=1440&fit=max&auto=format'}
            alt={nextWork.title}
            className={styles.image}
            loading="eager"
          />
        </Link>
      )}
    </div>
  );
}
