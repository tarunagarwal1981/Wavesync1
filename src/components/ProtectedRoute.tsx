import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/ui';
import styles from './ProtectedRoute.module.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackPath = '/login'
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'user:', user);

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('ProtectedRoute - showing loading spinner');
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <Spinner />
          <p className={styles.loadingText}>Authenticating...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('ProtectedRoute - redirecting to login');
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    console.log('ProtectedRoute - access denied for role:', user?.role, 'required:', requiredRole);
    return (
      <div className={styles.accessDeniedContainer}>
        <div className={styles.accessDeniedContent}>
          <div className={styles.accessDeniedIcon}>🚫</div>
          <h2 className={styles.accessDeniedTitle}>Access Denied</h2>
          <p className={styles.accessDeniedMessage}>
            You don't have permission to access this page.
          </p>
          <p className={styles.accessDeniedSubtext}>
            Required role: <strong>{requiredRole}</strong>
          </p>
          <button 
            className={styles.backButton}
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  console.log('ProtectedRoute - rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
