import React, { useState, useEffect } from 'react';
import styles from './ProgressIndicator.module.css';

interface ProgressIndicatorProps {
  progress: number;
  animated?: boolean;
  showPercentage?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  label?: string;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  animated = true,
  showPercentage = true,
  size = 'medium',
  variant = 'default',
  label,
  className
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayProgress(progress);
    }
  }, [progress, animated]);

  const getVariantClass = () => {
    switch (variant) {
      case 'success': return styles.success;
      case 'warning': return styles.warning;
      case 'danger': return styles.danger;
      default: return styles.default;
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small': return styles.small;
      case 'large': return styles.large;
      default: return styles.medium;
    }
  };

  return (
    <div className={`${styles.progressContainer} ${getSizeClass()} ${className || ''}`}>
      {label && (
        <div className={styles.label}>
          {label}
        </div>
      )}
      
      <div className={styles.progressWrapper}>
        <div className={styles.progressBar}>
          <div 
            className={`${styles.progressFill} ${getVariantClass()}`}
            style={{ 
              width: `${displayProgress}%`,
              transition: animated ? 'width 0.8s ease-in-out' : 'none'
            }}
          />
        </div>
        
        {showPercentage && (
          <div className={styles.percentage}>
            {Math.round(displayProgress)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressIndicator;
