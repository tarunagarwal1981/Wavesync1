import { useAuth } from '../contexts/SupabaseAuthContext';
import styles from './CompanyDashboard.module.css';

const CompanyDashboard = () => {
  const { profile } = useAuth();
  
  return (
    <div className={styles.dashboard}>
      <div className={styles.demoBanner}>
        Welcome: {profile?.full_name} - {profile?.user_type}
      </div>
      
      <h1 className={styles.title}>
        Company Dashboard
      </h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <div className={styles.iconContainer}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Active Crew</h3>
            <p className={styles.statNumber}>45</p>
            <p className={styles.statSubtext}>12 officers, 33 crew</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.success}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 10H17" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 14H13" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Open Positions</h3>
            <p className={styles.statNumber}>12</p>
            <p className={styles.statSubtext}>3 urgent</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.warning}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 21H21L19 7H5L3 21Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 9V13" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 9V13" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Vessels</h3>
            <p className={styles.statNumber}>8</p>
            <p className={styles.statSubtext}>7 active, 1 dry dock</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.info}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Pending Approvals</h3>
            <p className={styles.statNumber}>6</p>
            <p className={styles.statSubtext}>2 contracts, 4 documents</p>
          </div>
        </div>
      </div>
      
      <div className={styles.actionsCard}>
        <h2 className={styles.actionsTitle}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <button className={`${styles.actionButton} ${styles.primary}`}>
            Manage Crew
          </button>
          <button className={`${styles.actionButton} ${styles.success}`}>
            Post Job
          </button>
          <button className={`${styles.actionButton} ${styles.secondary}`}>
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
