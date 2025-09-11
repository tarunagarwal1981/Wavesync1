import React from 'react';
import SmartAssignmentCreation from '../components/SmartAssignmentCreation';
import styles from './AIAssignmentPage.module.css';

const AIAssignmentPage: React.FC = () => {
  return (
    <div className={styles.aiAssignmentPage}>
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>
            AI-Powered Assignment Matching
          </h1>
          <p className={styles.pageSubtitle}>
            Intelligent seafarer matching system that analyzes qualifications, experience, 
            availability, and performance to find the perfect candidates for your assignments.
          </p>
        </div>
        <div className={styles.aiFeatures}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎯</div>
            <h3>Smart Scoring</h3>
            <p>AI analyzes multiple factors to score and rank candidates</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h3>Real-time Matching</h3>
            <p>Instant results with live AI processing and insights</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3>Predictive Analytics</h3>
            <p>Success probability and response time predictions</p>
          </div>
        </div>
      </div>
      
      <SmartAssignmentCreation />
    </div>
  );
};

export default AIAssignmentPage;
