'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './PreviewPanel.module.css';

export default function PreviewPanel({ work, imageUrl, onClose }) {
  const panelRef = useRef(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Close on click outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={styles.backdrop}
      onClick={handleBackdropClick}
    >
      <div 
        ref={panelRef}
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close preview"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path 
              d="M18 6L6 18M6 6L18 18" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className={styles.imageContainer}>
          <Image
            src={imageUrl}
            alt={work.title}
            width={400}
            height={400}
            className={styles.image}
            priority
          />
        </div>

        <div className={styles.info}>
          <h3 className={styles.title}>{work.title}</h3>
          {work.year && (
            <p className={styles.year}>{work.year}</p>
          )}
          {work.materials && (
            <p className={styles.materials}>{work.materials}</p>
          )}
        </div>

        <Link 
          href={`/works/${work.slug}`}
          className={styles.cta}
        >
          View Full Work
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path 
              d="M4 10H16M16 10L10 4M16 10L10 16" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
