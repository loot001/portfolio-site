'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { urlFor } from '@/lib/sanity';
import Link from 'next/link';
import Image from 'next/image';
import styles from './DenseGridView.module.css';
import PreviewPanel from './PreviewPanel';

export default function DenseGridView({ works }) {
  const [hoveredWork, setHoveredWork] = useState(null);
  const [previewWork, setPreviewWork] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const gridRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const rafRef = useRef(null);

  // Track mouse/touch position for ripple effect
  const handlePointerMove = useCallback((e) => {
    if (!gridRef.current) return;
    
    // Cancel any existing RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      const rect = gridRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    });
  }, []);

  // Calculate distance-based scale for each thumbnail
  const calculateScale = useCallback((thumbnailRect) => {
    if (!hoveredWork || !gridRef.current) return 1;
    
    const gridRect = gridRef.current.getBoundingClientRect();
    
    // Center point of thumbnail
    const thumbCenterX = thumbnailRect.left - gridRect.left + thumbnailRect.width / 2;
    const thumbCenterY = thumbnailRect.top - gridRect.top + thumbnailRect.height / 2;
    
    // Distance from mouse to thumbnail center
    const dx = mousePos.x - thumbCenterX;
    const dy = mousePos.y - thumbCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Ripple effect: closer = bigger scale
    // Maximum influence radius: 200px
    const maxRadius = 200;
    if (distance > maxRadius) return 1;
    
    // Ease-out cubic for smooth falloff
    const normalizedDistance = distance / maxRadius;
    const influence = 1 - Math.pow(normalizedDistance, 3);
    
    // Scale from 1.0 to 1.5 based on proximity
    return 1 + (influence * 0.5);
  }, [hoveredWork, mousePos]);

  // Handle hover start - set 2 second timer for preview
  const handleWorkHover = useCallback((work) => {
    setHoveredWork(work);
    
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Set 2-second timer for preview panel
    hoverTimeoutRef.current = setTimeout(() => {
      setPreviewWork(work);
    }, 2000);
  }, []);

  // Handle hover end
  const handleWorkLeave = useCallback(() => {
    setHoveredWork(null);
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Get first image URL for work
  const getWorkImageUrl = (work) => {
    const image = work.images?.[0] || work.featuredImage;
    if (!image) return null;
    
    return urlFor(image)
      .width(200)
      .height(200)
      .fit('crop')
      .auto('format')
      .url();
  };

  // Get higher res image for preview
  const getPreviewImageUrl = (work) => {
    const image = work.images?.[0] || work.featuredImage;
    if (!image) return null;
    
    return urlFor(image)
      .width(400)
      .height(400)
      .fit('crop')
      .auto('format')
      .url();
  };

  return (
    <>
      <div 
        ref={gridRef}
        className={styles.grid}
        onPointerMove={handlePointerMove}
        onPointerLeave={handleWorkLeave}
      >
        {works.map((work) => {
          const imageUrl = getWorkImageUrl(work);
          if (!imageUrl) return null;
          
          return (
            <Thumbnail
              key={work._id}
              work={work}
              imageUrl={imageUrl}
              onHover={handleWorkHover}
              onLeave={handleWorkLeave}
              calculateScale={calculateScale}
              isHovered={hoveredWork?._id === work._id}
            />
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

// Individual thumbnail component for better performance
function Thumbnail({ work, imageUrl, onHover, onLeave, calculateScale, isHovered }) {
  const thumbRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!thumbRef.current) return;
    
    const updateScale = () => {
      if (!thumbRef.current) return;
      const rect = thumbRef.current.getBoundingClientRect();
      const newScale = calculateScale(rect);
      setScale(newScale);
    };
    
    // Update scale on RAF for smooth animation
    let rafId;
    const tick = () => {
      updateScale();
      rafId = requestAnimationFrame(tick);
    };
    
    if (isHovered) {
      rafId = requestAnimationFrame(tick);
    } else {
      setScale(1);
    }
    
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [calculateScale, isHovered]);

  return (
    <div
      ref={thumbRef}
      className={styles.thumbnail}
      onPointerEnter={() => onHover(work)}
      style={{
        transform: `scale(${scale})`,
        zIndex: isHovered ? 10 : 1,
      }}
    >
      <Image
        src={imageUrl}
        alt={work.title}
        width={50}
        height={50}
        loading="lazy"
        className={styles.thumbnailImage}
      />
    </div>
  );
}
