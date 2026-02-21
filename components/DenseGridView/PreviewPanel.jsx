'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import styles from './PreviewPanel.module.css';

export default function PreviewPanel({ work, imageUrl, onClose }) {
  const panelRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [vpHeight, setVpHeight] = useState(null);

  // Measure true viewport height (accounts for mobile browser chrome)
  // and lock body scroll — both must run unconditionally before any return
  useEffect(() => {
    // Capture true inner height before any layout shift
    setVpHeight(window.innerHeight);

    const onResize = () => setVpHeight(window.innerHeight);
    window.addEventListener('resize', onResize);

    // Lock body scroll — the position:fixed technique is the only
    // method that works reliably across iOS Safari, Chrome, Firefox
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('resize', onResize);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent touch-scroll bleeding through to page on iOS
  // CSS touch-action alone is not sufficient — need preventDefault on the event
  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
  }, []);

  // Safety check — AFTER all hooks
  if (!work || !imageUrl) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Use measured JS height, fallback to 100vh for SSR
  const panelStyle = vpHeight
    ? { height: `${vpHeight - 32}px`, maxHeight: `${vpHeight - 32}px` }
    : {};

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      onTouchMove={handleTouchMove}
      style={vpHeight ? { height: `${vpHeight}px` } : {}}
    >
      <div
        ref={panelRef}
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        style={panelStyle}
      >
        {/* Close — absolute, always on top, never in flow */}
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

        {/* Image — flex-grow fills remaining space after info + CTA */}
        <div className={styles.imageContainer}>
          {!imageLoaded && (
            <div className={styles.loading}>Loading...</div>
          )}
          <img
            src={imageUrl}
            alt={work.title}
            className={styles.image}
            onLoad={() => setImageLoaded(true)}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        </div>

        {/* Info — flex-shrink: 0, always full height */}
        <div className={styles.info}>
          <h3 className={styles.title}>{work.title || 'Untitled'}</h3>
          {work.year && <p className={styles.year}>{work.year}</p>}
          {work.materials && typeof work.materials === 'string' && (
            <p className={styles.materials}>{work.materials}</p>
          )}
        </div>

        {/* CTA — flex-shrink: 0, always anchored to bottom */}
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
