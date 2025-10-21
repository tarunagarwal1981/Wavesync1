import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = ''
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  const classes = [
    styles.skeleton,
    styles[variant],
    className
  ].filter(Boolean).join(' ');

  return <div className={classes} style={style} />;
};

// Preset skeletons
export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className={styles.textContainer}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        variant="text" 
        width={i === lines - 1 ? '80%' : '100%'} 
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC = () => (
  <div className={styles.cardContainer}>
    <div className={styles.cardHeader}>
      <Skeleton variant="circular" width={40} height={40} />
      <div style={{ flex: 1 }}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
    <div className={styles.cardBody}>
      <SkeletonText lines={3} />
    </div>
  </div>
);

export default Skeleton;
