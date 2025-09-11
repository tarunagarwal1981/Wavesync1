import { useAuth } from '../contexts/AuthContext';
import SeafarerDashboard from '../pages/SeafarerDashboard';
import CompanyDashboard from '../pages/CompanyDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();
  
  console.log('🎯 DashboardRouter - user role:', user?.role);
  
  if (user?.role === 'company' || user?.role === 'company_user') {
    console.log('🎯 Rendering CompanyDashboard');
    return <CompanyDashboard />;
  }
  
  if (user?.role === 'admin') {
    console.log('🎯 Rendering CompanyDashboard for admin');
    return <CompanyDashboard />; // Use company dashboard for admin for now
  }
  
  console.log('🎯 Rendering SeafarerDashboard (default)');
  return <SeafarerDashboard />; // Default to seafarer
};

export default DashboardRouter;