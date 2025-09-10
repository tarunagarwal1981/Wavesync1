import React from "react";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  isAuthenticated, 
  children 
}) => {
  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        background: '#f9fafb'
      }}>
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ marginBottom: '16px', color: '#111827' }}>
            Authentication Required
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Please log in to access the WaveSync platform.
          </p>
          <button style={{
            padding: '12px 24px',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;