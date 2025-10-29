import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { RoleBasedSidebar } from './RoleBasedSidebar';
import { Header } from './Header';
import { CriticalAnnouncementBanner } from '../announcements/CriticalAnnouncementBanner';
import styles from './Layout.module.css';

interface LayoutProps {
  title: string;
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  console.log('🏗️ Layout rendering with title:', title, 'children:', children);
  const { isMobile, sidebarOpen, toggleSidebar, closeSidebar } = useResponsive();

  const handleMenuClick = () => {
    toggleSidebar();
  };

  return (
    <div className={styles.layout}>
      {/* Critical Announcement Banner - Fixed at top of page */}
      <CriticalAnnouncementBanner />

      {/* Role-Based Sidebar */}
      <RoleBasedSidebar 
        isOpen={isMobile ? sidebarOpen : true}
        onClose={closeSidebar}
      />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <Header 
          onMenuClick={handleMenuClick}
          title={title}
        />

        {/* Page Content */}
        <div className={styles.pageContent}>
          {(() => { console.log('🏗️ Layout - rendering children:', children); return null; })()}
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;