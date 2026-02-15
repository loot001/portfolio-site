'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './HomeSlideshow.module.css';

export default function HomeSlideshow({ works }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [fadeState, setFadeState] = useState('showing'); // 'showing' or 'transitioning'
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [shuffledWorks] = useState(() => {
    if (!works || works.length === 0) return [];
    const shuffled = [...works];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  // Preload all images
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

  // Slideshow with proper timing
  useEffect(() => {
    if (!isLoaded || shuffledWorks.length === 0) return;
    
    const timer = setTimeout(() => {
      setFadeState('transitioning');
      
      // After fade completes (3s), update indices and reset
      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setNextIndex((nextIndex + 1) % shuffledWorks.length);
        setFadeState('showing');
      }, 3000);
    }, 3000); // Show for 3 seconds before starting transition

    return () => clearTimeout(timer);
  }, [currentIndex, nextIndex, isLoaded, shuffledWorks.length, fadeState]);

  if (!shuffledWorks || shuffledWorks.length === 0 || !isLoaded) {
    return (
      <div className={styles.slideshow}>
        <div className={styles.loading}></div>
      </div>
    );
  }

  return (
    <div className={styles.slideshow}>
      {/* Current image */}
      <Link 
        href={`/works/${shuffledWorks[currentIndex].slug}`}
        className={`${styles.slide} ${styles.current} ${fadeState === 'transitioning' ? styles.fadeOut : ''}`}
      >
        <img
          src={shuffledWorks[currentIndex].imageUrl + '?w=2560&h=1440&fit=max&auto=format'}
          alt={shuffledWorks[currentIndex].title}
          className={styles.image}
        />
      </Link>

      {/* Next image */}
      <Link 
        href={`/works/${shuffledWorks[nextIndex].slug}`}
        className={`${styles.slide} ${styles.next} ${fadeState === 'transitioning' ? styles.fadeIn : ''}`}
      >
        <img
          src={shuffledWorks[nextIndex].imageUrl + '?w=2560&h=1440&fit=max&auto=format'}
          alt={shuffledWorks[nextIndex].title}
          className={styles.image}
        />
      </Link>
    </div>
  );
}
