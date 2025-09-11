import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true);
      
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <div className={`${styles.pageTransition} ${isTransitioning ? styles.transitioning : ''}`}>
      <div className={styles.pageContent}>
        {children}
      </div>
    </div>
  );
};

export default PageTransition;