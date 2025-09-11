import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import SeafarerDashboard from '../pages/SeafarerDashboard';
import CompanyDashboard from '../pages/CompanyDashboard';
import AdminDashboard from '../pages/AdminDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();
  
  console.log('🎯 DashboardRouter - user role:', user?.role);
  
  if (user?.role === UserRole.COMPANY_USER) {
    console.log('🎯 Rendering CompanyDashboard');
    return <CompanyDashboard />;
  }
  
  if (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) {
    console.log('🎯 Rendering AdminDashboard');
    return <AdminDashboard />;
  }
  
  console.log('🎯 Rendering SeafarerDashboard (default)');
  return <SeafarerDashboard />; // Default to seafarer
};

export default DashboardRouter;