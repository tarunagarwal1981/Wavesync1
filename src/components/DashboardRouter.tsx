import { useAuth } from '../contexts/SupabaseAuthContext';
import SeafarerDashboard from '../pages/SeafarerDashboard';
import CompanyDashboard from '../pages/CompanyDashboard';
import AdminDashboard from '../pages/AdminDashboard';

const DashboardRouter = () => {
  const { profile, loading, user } = useAuth();
  
  console.log('🎯 DashboardRouter - user type:', profile?.user_type, 'loading:', loading);
  
  // Show loading spinner instead of null to prevent blank page
  if (loading || (user && !profile?.user_type)) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading dashboard...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!profile) {
    return null; // Should not reach here due to loading check above, but TypeScript needs it
  }

  if (profile.user_type === 'company') {
    console.log('🎯 Rendering CompanyDashboard');
    return <CompanyDashboard />;
  }
  
  if (profile.user_type === 'admin') {
    console.log('🎯 Rendering AdminDashboard');
    return <AdminDashboard />;
  }
  
  console.log('🎯 Rendering SeafarerDashboard (default)');
  return <SeafarerDashboard />; // Default to seafarer
};

export default DashboardRouter;