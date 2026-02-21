'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './PreviewPanel.module.css';

export default function PreviewPanel({ work, imageUrl, onClose }) {
  const backdropRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [panelHeight, setPanelHeight] = useState(null);

  // All hooks must run unconditionally before any early return

  // 1. Measure true viewport height via JS (most reliable cross-device)
  useEffect(() => {
    const measure = () => setPanelHeight(window.innerHeight);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // 2. Body scroll lock
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  // 3. Non-passive touchmove prevention on the backdrop element
  //    React attaches events passively by default — preventDefault() on
  //    React's onTouchMove prop is silently ignored by iOS/Chrome.
  //    Must attach directly to the DOM node with { passive: false }.
  useEffect(() => {
    const el = backdropRef.current;
    if (!el) return;
    const prevent = (e) => e.preventDefault();
    el.addEventListener('touchmove', prevent, { passive: false });
    return () => el.removeEventListener('touchmove', prevent);
  }, []);

  // 4. Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Safe to return null after all hooks
  if (!work || !imageUrl) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const GAP = 32; // 16px padding top + bottom
  const backdropStyle = panelHeight ? { height: `${panelHeight}px` } : {};
  const panelStyle   = panelHeight ? { height: `${panelHeight - GAP}px` } : {};

  return (
    <div
      ref={backdropRef}
      className={styles.backdrop}
      style={backdropStyle}
      onClick={handleBackdropClick}
    >
      <div
        className={styles.panel}
        style={panelStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close preview"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className={styles.imageContainer}>
          {!imageLoaded && <div className={styles.loading}>Loading...</div>}
          <img
            src={imageUrl}
            alt={work.title}
            className={styles.image}
            onLoad={() => setImageLoaded(true)}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        </div>

        <div className={styles.info}>
          <h3 className={styles.title}>{work.title || 'Untitled'}</h3>
          {work.year && <p className={styles.year}>{work.year}</p>}
          {work.materials && typeof work.materials === 'string' && (
            <p className={styles.materials}>{work.materials}</p>
          )}
        </div>

        <Link href={`/works/${work.slug}`} className={styles.cta}>
          View Full Work
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}
