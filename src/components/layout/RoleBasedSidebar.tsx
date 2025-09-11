import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
  const { user } = useAuth();
  
  if (!user) {
    return null;
  }

  const navigationSections = getNavigationForRole(user.role);

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
