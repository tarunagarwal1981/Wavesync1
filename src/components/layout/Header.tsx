import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  Menu,
  ChevronDown,
  Anchor,
  Waves,
  FileText,
  GraduationCap
} from 'lucide-react';
import NotificationBell from '../NotificationBell';
import styles from './Header.module.css';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, title }) => {
  // Safely get auth context with fallback
  let user, profile, signOut;
  try {
    const authContext = useAuth();
    user = authContext.user;
    profile = authContext.profile;
    signOut = authContext.signOut;
  } catch (error) {
    // If useAuth fails, provide fallback values
    console.warn('Header: useAuth not available, using fallback values');
    user = null;
    profile = null;
    signOut = () => Promise.resolve();
  }
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await signOut();
    setShowUserMenu(false);
  };


  return (
    <header className={styles.header}>
      {/* Mobile Menu Button */}
      <button className={styles.mobileMenuButton} onClick={onMenuClick}>
        <Menu size={24} />
      </button>

      {/* Page Title */}
      <div className={styles.titleSection}>
        <h1 className={styles.pageTitle}>{title}</h1>
        {profile?.user_type && (
          <div className={styles.demoBadge}>
            <Waves size={14} />
            <span>{profile.user_type.charAt(0).toUpperCase() + profile.user_type.slice(1)}</span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search assignments, documents, training..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className={styles.actionsSection}>
        {/* Notifications */}
        <NotificationBell />

        {/* User Profile */}
        <div className={styles.userContainer}>
          <button 
            className={styles.userButton}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className={styles.userAvatar}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} />
              ) : (
                <User size={20} />
              )}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{profile?.full_name}</span>
              <span className={styles.userRole}>{profile?.user_type}</span>
            </div>
            <ChevronDown size={16} className={styles.chevron} />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className={styles.userDropdown}>
              <div className={styles.userDropdownHeader}>
                <div className={styles.userDropdownAvatar}>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} />
                  ) : (
                    <User size={24} />
                  )}
                </div>
                <div className={styles.userDropdownInfo}>
                  <h3>{profile?.full_name}</h3>
                  <p>{user?.email}</p>
                  <span className={styles.userDropdownRole}>{profile?.user_type}</span>
                </div>
              </div>
              <div className={styles.userDropdownMenu}>
                <button className={styles.userDropdownItem}>
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button className={styles.userDropdownItem}>
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <hr className={styles.userDropdownDivider} />
                <button 
                  className={styles.userDropdownItem}
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;