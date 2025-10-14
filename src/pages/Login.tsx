import React from 'react';
import { SupabaseLogin } from '../components/SupabaseLogin';
import { SimpleLoginTest } from '../components/SimpleLoginTest';
import styles from './Login.module.css';

export const Login: React.FC = () => {
  return (
    <div className={styles.loginContainer}>
      {/* Left Side - Branding */}
      <div className={styles.brandingSection}>
        <div className={styles.brandingContent}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>🌊</div>
            <h1 className={styles.logoText}>WaveSync</h1>
            <div className={styles.aiBadge}>
              <span className={styles.aiSparkle}>✨</span>
              <span className={styles.aiText}>AI-Powered</span>
            </div>
          </div>
          <h2 className={styles.brandingTitle}>Maritime Crew Management Platform</h2>
          <p className={styles.brandingSubtitle}>
            Streamline your maritime operations with AI-powered crew management, 
            intelligent assignment matching, and comprehensive fleet oversight.
          </p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🤖</span>
              <span className={styles.featureText}>AI-Powered Matching</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📊</span>
              <span className={styles.featureText}>Real-time Analytics</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>⚓</span>
              <span className={styles.featureText}>Crew Management</span>
            </div>
          </div>
        </div>
        <div className={styles.backgroundElements}>
          <div className={styles.wave1}></div>
          <div className={styles.wave2}></div>
          <div className={styles.wave3}></div>
          <div className={styles.ship}></div>
        </div>
      </div>

      {/* Right Side - Login Test */}
      <div className={styles.loginSection}>
        <SimpleLoginTest />
      </div>
    </div>
  );
};

export default Login;
