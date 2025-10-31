import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { SidebarBase } from './SidebarBase';
import { getNavigationForRole } from '../../utils/navigationConfig';
import { useUnreadAnnouncements } from '../../hooks/useUnreadAnnouncements';

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
  // IMPORTANT: All hooks must be called BEFORE any conditional returns
  // This prevents "Rendered fewer hooks than expected" errors
  const { user, profile, loading } = useAuth();
  const unreadCount = useUnreadAnnouncements();
  
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

  // Get navigation sections and add unread badge to announcements
  const navigationSections = useMemo(() => {
    const sections = getNavigationForRole(profile.user_type);
    
    // Update announcements item with unread count badge
    return sections.map(section => ({
      ...section,
      items: section.items.map(item => {
        if (item.id === 'announcements') {
          return {
            ...item,
            badge: unreadCount > 0 ? unreadCount : undefined
          };
        }
        return item;
      })
    }));
  }, [profile.user_type, unreadCount]);

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
