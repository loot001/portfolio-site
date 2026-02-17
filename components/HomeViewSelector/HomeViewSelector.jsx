'use client';

import { useState, useEffect } from 'react';
import styles from './HomeViewSelector.module.css';

const VIEWS = [
  { id: 'gallery', label: 'Gallery View', description: 'Slideshow + Recent Works' },
  { id: 'dense-grid', label: 'Archive Grid', description: 'All Works Grid' },
  // Future views can be added here:
  // { id: 'timeline', label: 'Timeline View', description: 'Chronological' },
  // { id: 'experimental', label: 'Experimental', description: 'WebGL/3D' },
];

export default function HomeViewSelector({ currentView, onViewChange }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedView = VIEWS.find(v => v.id === currentView) || VIEWS[0];
  
  return (
    <div className={styles.selector}>
      <button 
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Switch homepage view"
      >
        <span className={styles.label}>{selectedView.label}</span>
        <svg 
          className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
          width="12" 
          height="12" 
          viewBox="0 0 16 16"
          fill="none"
        >
          <path 
            d="M4 6L8 10L12 6" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div 
            className={styles.backdrop} 
            onClick={() => setIsOpen(false)}
          />
          <div className={styles.dropdown}>
            {VIEWS.map(view => (
              <button
                key={view.id}
                className={`${styles.option} ${view.id === currentView ? styles.active : ''}`}
                onClick={() => {
                  onViewChange(view.id);
                  setIsOpen(false);
                }}
              >
                {view.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
