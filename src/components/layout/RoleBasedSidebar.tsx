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
  const { user, profile } = useAuth();
  
  if (!user || !profile) {
    return null;
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
