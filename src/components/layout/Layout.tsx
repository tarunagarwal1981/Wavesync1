import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNavigation } from "../../hooks/useNavigation";
import { useAuth } from "../../contexts/AuthContext";
import { NavigationItem } from "../../utils/nav";
import styles from "./Layout.module.css";

interface LayoutProps {
  title: string;
  navItems: NavigationItem[];
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ title, navItems, children }) => {
  const { mobileOpen, setMobileOpen } = useNavigation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    return `${user.firstName} ${user.lastName}`;
  };

  const getUserRole = () => {
    if (!user) return 'User';
    return user.role.replace('_', ' ').toUpperCase();
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🌊</div>
          <span className={styles.logoText}>WaveSync</span>
        </div>

        {/* Navigation */}
        <nav className={styles.navigation}>
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className={styles.navItem}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.badge && (
                <span className={styles.badge}>
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* User Profile */}
        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>
            {getUserInitials()}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>
              {getUserDisplayName()}
            </div>
            <div className={styles.userRole}>
              {getUserRole()}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>
            {title}
          </h1>
          
          <div className={styles.headerActions}>
            {/* Search */}
            <input
              type="text"
              placeholder="Search crew, vessels, tasks..."
              className={styles.searchInput}
            />
            
            {/* Notifications */}
            <button className={styles.notificationButton}>
              🔔
              <span className={styles.notificationBadge}>3</span>
            </button>

            {/* User Menu */}
            <div className={styles.userMenuContainer}>
              <button 
                className={styles.userMenuButton}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className={styles.userMenuAvatar}>
                  {getUserInitials()}
                </div>
                <span className={styles.userMenuName}>
                  {getUserDisplayName()}
                </span>
                <span className={styles.userMenuArrow}>
                  {showUserMenu ? '▲' : '▼'}
                </span>
              </button>

              {showUserMenu && (
                <div className={styles.userMenuDropdown}>
                  <div className={styles.userMenuHeader}>
                    <div className={styles.userMenuInfo}>
                      <div className={styles.userMenuFullName}>
                        {getUserDisplayName()}
                      </div>
                      <div className={styles.userMenuEmail}>
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.userMenuDivider}></div>
                  
                  <div className={styles.userMenuItems}>
                    <button 
                      className={styles.userMenuItem}
                      onClick={() => navigate('/profile')}
                    >
                      👤 Profile Settings
                    </button>
                    <button 
                      className={styles.userMenuItem}
                      onClick={() => navigate('/settings')}
                    >
                      ⚙️ Preferences
                    </button>
                    <button 
                      className={styles.userMenuItem}
                      onClick={() => navigate('/help')}
                    >
                      ❓ Help & Support
                    </button>
                  </div>
                  
                  <div className={styles.userMenuDivider}></div>
                  
                  <div className={styles.userMenuItems}>
                    <button 
                      className={`${styles.userMenuItem} ${styles.logoutButton}`}
                      onClick={handleLogout}
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.pageContent}>
          {children}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div 
          className={styles.mobileOverlay}
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;