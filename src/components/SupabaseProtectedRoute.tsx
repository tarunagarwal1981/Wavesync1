import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/SupabaseAuthContext'
import styles from './SupabaseProtectedRoute.module.css'

interface SupabaseProtectedRouteProps {
  children: React.ReactNode
  requiredUserType?: 'seafarer' | 'company' | 'admin'
}

export const SupabaseProtectedRoute: React.FC<SupabaseProtectedRouteProps> = ({ 
  children, 
  requiredUserType 
}) => {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    )
  }

  // Redirect to login if not authenticated
  // Only require user to be authenticated, profile is optional
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check user type if required (and profile exists)
  if (requiredUserType && profile && profile.user_type !== requiredUserType) {
    return (
      <div className={styles.accessDeniedContainer}>
        <div className={styles.accessDeniedCard}>
          <div className={styles.accessDeniedIcon}>🚫</div>
          <h2 className={styles.accessDeniedTitle}>Access Denied</h2>
          <p className={styles.accessDeniedMessage}>
            You don't have permission to access this page. 
            Required role: <strong>{requiredUserType}</strong>
          </p>
          <p className={styles.accessDeniedSubtext}>
            Your current role: <strong>{profile.user_type}</strong>
          </p>
          <button 
            className={styles.backButton}
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
