import React from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import { NavigationItem } from '../../utils/nav';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import styles from './Layout.module.css';

interface LayoutProps {
  title: string;
  navItems: NavigationItem[];
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ title, navItems, children }) => {
  const { mobileOpen, setMobileOpen } = useNavigation();

  const handleMenuClick = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <Sidebar 
        navItems={navItems} 
        isOpen={mobileOpen} 
        onClose={() => setMobileOpen(false)} 
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
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;