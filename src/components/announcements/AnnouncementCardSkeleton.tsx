import React from 'react';
import styles from './AnnouncementCardSkeleton.module.css';

export const AnnouncementCardSkeleton: React.FC = () => {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonBadge}></div>
        <div className={styles.skeletonDot}></div>
      </div>
      <div className={styles.skeletonIcon}></div>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonMessage}></div>
        <div className={styles.skeletonMessageShort}></div>
        <div className={styles.skeletonMeta}>
          <div className={styles.skeletonMetaItem}></div>
          <div className={styles.skeletonMetaItem}></div>
        </div>
      </div>
      <div className={styles.skeletonActions}>
        <div className={styles.skeletonButton}></div>
        <div className={styles.skeletonButton}></div>
      </div>
    </div>
  );
};

export default AnnouncementCardSkeleton;

