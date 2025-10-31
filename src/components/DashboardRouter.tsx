import { useAuth } from '../contexts/SupabaseAuthContext';
import SeafarerDashboard from '../pages/SeafarerDashboard';
import CompanyDashboard from '../pages/CompanyDashboard';
import AdminDashboard from '../pages/AdminDashboard';

const DashboardRouter = () => {
  const { profile, loading } = useAuth();
  
  console.log('🎯 DashboardRouter - user type:', profile?.user_type);
  
  if (loading || !profile?.user_type) {
    // Avoid rendering wrong dashboard while profile is hydrating
    return null;
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