'use client';

import { useState, useEffect } from 'react';
import HomeViewSelector from '@/components/HomeViewSelector/HomeViewSelector';
import GalleryView from '@/components/GalleryView/GalleryView';
import MosaicGridView from '@/components/MosaicGridView/MosaicGridView';
import styles from './HomePageOrchestrator.module.css';

const DEFAULT_VIEW = 'gallery';
const STORAGE_KEY = 'portfolio-home-view';

export default function HomePageOrchestrator({ slideshowWorks, recentWorks, allWorks }) {
  const [currentView, setCurrentView] = useState(DEFAULT_VIEW);
  const [isClient, setIsClient] = useState(false);

  // Hydration: load saved view preference from localStorage
  useEffect(() => {
    setIsClient(true);
    const savedView = localStorage.getItem(STORAGE_KEY);
    if (savedView) {
      setCurrentView(savedView);
    }
  }, []);

  // Save view preference when it changes
  const handleViewChange = (viewId) => {
    setCurrentView(viewId);
    localStorage.setItem(STORAGE_KEY, viewId);
  };

  // Prevent hydration mismatch - show nothing until client-side
  if (!isClient) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* View selector - top left below nav */}
      <div className={styles.selectorWrapper}>
        <HomeViewSelector 
          currentView={currentView}
          onViewChange={handleViewChange}
        />
      </div>

      {/* Render appropriate view */}
      <div className={styles.viewContainer}>
        {currentView === 'gallery' && (
          <GalleryView 
            slideshowWorks={slideshowWorks}
            recentWorks={recentWorks}
          />
        )}
        
        {currentView === 'dense-grid' && (
          <MosaicGridView works={allWorks} />
        )}
        
        {/* Future views can be added here:
        {currentView === 'timeline' && (
          <TimelineView works={allWorks} />
        )}
        */}
      </div>
    </div>
  );
}
