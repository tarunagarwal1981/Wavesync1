import { useAuth } from '../contexts/AuthContext';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const { user, isDemoMode } = useAuth();
  
  return (
    <div className={styles.dashboard}>
      {isDemoMode && (
        <div className={styles.demoBanner}>
          Demo Mode: Admin Dashboard - {user?.firstName} {user?.lastName}
        </div>
      )}
      
      <h1 className={styles.title}>
        Admin Dashboard
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
            <h3 className={styles.statTitle}>Total Users</h3>
            <p className={styles.statNumber}>1,245</p>
            <p className={styles.statSubtext}>Active users</p>
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
            <h3 className={styles.statTitle}>Companies</h3>
            <p className={styles.statNumber}>68</p>
            <p className={styles.statSubtext}>Registered companies</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.warning}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Active Assignments</h3>
            <p className={styles.statNumber}>234</p>
            <p className={styles.statSubtext}>Currently active</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <div className={`${styles.iconContainer} ${styles.info}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>System Status</h3>
            <p className={styles.statStatus}>Operational</p>
            <p className={styles.statSubtext}>All systems normal</p>
          </div>
        </div>
      </div>
      
      <div className={styles.actionsCard}>
        <h2 className={styles.actionsTitle}>Admin Actions</h2>
        <div className={styles.actionsGrid}>
          <button className={`${styles.actionButton} ${styles.primary}`}>
            Manage Users
          </button>
          <button className={`${styles.actionButton} ${styles.success}`}>
            System Reports
          </button>
          <button className={`${styles.actionButton} ${styles.secondary}`}>
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;