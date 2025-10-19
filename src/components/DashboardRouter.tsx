import { useAuth } from '../contexts/SupabaseAuthContext';
import SeafarerDashboard from '../pages/SeafarerDashboard';
import CompanyDashboard from '../pages/CompanyDashboard';
import AdminDashboard from '../pages/AdminDashboard';

const DashboardRouter = () => {
  const { profile } = useAuth();
  
  console.log('🎯 DashboardRouter - user type:', profile?.user_type);
  
  if (profile?.user_type === 'company') {
    console.log('🎯 Rendering CompanyDashboard');
    return <CompanyDashboard />;
  }
  
  if (profile?.user_type === 'admin') {
    console.log('🎯 Rendering AdminDashboard');
    return <AdminDashboard />;
  }
  
  console.log('🎯 Rendering SeafarerDashboard (default)');
  return <SeafarerDashboard />; // Default to seafarer
};

export default DashboardRouter;