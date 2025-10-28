import React from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { SidebarBase } from './SidebarBase';
import { getNavigationForRole } from '../../utils/navigationConfig';

interface RoleBasedSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
}

export const RoleBasedSidebar: React.FC<RoleBasedSidebarProps> = ({ 
  isOpen, 
  onClose, 
  isCollapsed = false 
}) => {
  const { user, profile, loading } = useAuth();
  
  // Don't render sidebar if no user
  if (!user) {
    return null;
  }

  // If profile is loading, show sidebar skeleton/placeholder
  if (loading || !profile) {
    return (
      <div style={{ 
        width: isCollapsed ? '64px' : '260px',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        display: isOpen ? 'block' : 'none'
      }}>
        <div style={{ 
          padding: '20px',
          color: 'white',
          textAlign: 'center',
          opacity: 0.6
        }}>
          Loading...
        </div>
      </div>
    );
  }

  const navigationSections = getNavigationForRole(profile.user_type);

  return (
    <SidebarBase
      navigationSections={navigationSections}
      isOpen={isOpen}
      onClose={onClose}
      isCollapsed={isCollapsed}
    />
  );
};

export default RoleBasedSidebar;
