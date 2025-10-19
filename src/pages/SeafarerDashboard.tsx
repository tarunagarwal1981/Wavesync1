import { useAuth } from '../contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './SeafarerDashboard.module.css';

const SeafarerDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>
        Welcome back, {profile?.full_name || 'Seafarer'}!
      </h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <div className={styles.iconContainer}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Pending Assignments</h3>
            <p className={styles.statNumber}>3</p>
            <p className={styles.statSubtext}>2 new this week</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.success}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 21H21L19 7H5L3 21Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 9V13" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 9V13" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Active Contract</h3>
            <p className={styles.statNumber}>1</p>
            <p className={styles.statSubtext}>MV Ocean Pioneer</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.warning}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 13H8" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 17H8" stroke="currentColor" strokeWidth="2"/>
                <path d="M10 9H8" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Documents</h3>
            <p className={styles.statNumber}>12</p>
            <p className={styles.statSubtext} style={{ color: 'var(--color-error)' }}>2 expiring soon</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.info}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 10V6C22 4.89543 21.1046 4 20 4H4C2.89543 4 2 4.89543 2 6V10" stroke="currentColor" strokeWidth="2"/>
                <path d="M22 10H2" stroke="currentColor" strokeWidth="2"/>
                <path d="M4 10V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V10" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 14H16" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Training</h3>
            <p className={styles.statNumber}>8</p>
            <p className={styles.statSubtext} style={{ color: 'var(--color-success)' }}>All up to date</p>
          </div>
        </div>
      </div>
      
      <div className={styles.actionsCard}>
        <h2 className={styles.actionsTitle}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <button 
            className={`${styles.actionButton} ${styles.primary}`}
            onClick={() => navigate('/my-assignments')}
          >
            View Assignments
          </button>
          <button 
            className={`${styles.actionButton} ${styles.success}`}
            onClick={() => navigate('/my-documents')}
          >
            Upload Document
          </button>
          <button 
            className={`${styles.actionButton} ${styles.info}`}
            onClick={() => navigate('/my-travel')}
          >
            View Travel
          </button>
          <button 
            className={`${styles.actionButton} ${styles.secondary}`}
            onClick={() => navigate('/tasks')}
          >
            Check Tasks
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeafarerDashboard;
