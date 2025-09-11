import React from 'react';
import SmartAssignmentCreation from '../components/SmartAssignmentCreation';
import styles from './AIAssignmentPage.module.css';

const AIAssignmentPage: React.FC = () => {
  return (
    <div className={styles.aiAssignmentPage}>
      {/* Modern Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <div className={styles.titleWrapper}>
              <h1 className={styles.pageTitle}>
                AI Assignment Matching
              </h1>
              <div className={styles.aiIndicator}>
                <div className={styles.aiDot}></div>
                <span>Powered by AI</span>
              </div>
            </div>
            <p className={styles.pageSubtitle}>
              Intelligent seafarer matching with advanced analytics and predictive insights
            </p>
          </div>
          
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🎯</div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>95%</span>
                <span className={styles.statLabel}>Accuracy</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⚡</div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>1.2s</span>
                <span className={styles.statLabel}>Processing</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>15</span>
                <span className={styles.statLabel}>Factors</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={styles.mainContent}>
        <SmartAssignmentCreation />
      </div>
    </div>
  );
};

export default AIAssignmentPage;
