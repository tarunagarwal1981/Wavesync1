import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Briefcase, 
  CheckSquare, 
  FileText, 
  GraduationCap, 
  MessageSquare, 
  Plane, 
  Settings, 
  User,
  Anchor,
  Waves
} from 'lucide-react';
import { NavigationItem } from '../../utils/nav';
import styles from './Sidebar.module.css';

interface SidebarProps {
  navItems: NavigationItem[];
  isOpen: boolean;
  onClose: () => void;
}

const iconMap = {
  dashboard: Home,
  assignments: Briefcase,
  tasks: CheckSquare,
  documents: FileText,
  training: GraduationCap,
  messages: MessageSquare,
  travel: Plane,
  settings: Settings,
  profile: User,
};

export const Sidebar: React.FC<SidebarProps> = ({ navItems, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        {/* Maritime Branding Header */}
        <div className={styles.branding}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <Anchor size={24} />
            </div>
            <div className={styles.logoText}>
              <span className={styles.brandName}>WaveSync</span>
              <span className={styles.brandTagline}>Maritime Platform</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.navigation}>
          <div className={styles.navSection}>
            <h3 className={styles.sectionTitle}>Main</h3>
            <ul className={styles.navList}>
              {navItems.map((item) => {
                const IconComponent = iconMap[item.key as keyof typeof iconMap] || Home;
                
                return (
                  <li key={item.key} className={styles.navItem}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) => 
                        `${styles.navLink} ${isActive ? styles.active : ''}`
                      }
                      onClick={onClose}
                    >
                      <IconComponent size={20} className={styles.navIcon} />
                      <span className={styles.navLabel}>{item.label}</span>
                      {item.badge && (
                        <span className={styles.badge}>{item.badge}</span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Maritime Quick Actions */}
          <div className={styles.navSection}>
            <h3 className={styles.sectionTitle}>Quick Actions</h3>
            <ul className={styles.navList}>
              <li className={styles.navItem}>
                <button className={styles.quickAction}>
                  <Waves size={20} className={styles.navIcon} />
                  <span className={styles.navLabel}>Emergency Contact</span>
                </button>
              </li>
              <li className={styles.navItem}>
                <button className={styles.quickAction}>
                  <Anchor size={20} className={styles.navIcon} />
                  <span className={styles.navLabel}>Port Information</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Maritime Footer */}
        <div className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerIcon}>
              <Waves size={16} />
            </div>
            <div className={styles.footerText}>
              <span className={styles.footerTitle}>Safe Voyages</span>
              <span className={styles.footerSubtitle}>Maritime Excellence</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;