import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Anchor, 
  Waves,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { NavigationSection, NavigationItem } from '../../utils/navigationConfig';
import styles from './SidebarBase.module.css';

interface SidebarBaseProps {
  navigationSections: NavigationSection[];
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
}

export const SidebarBase: React.FC<SidebarBaseProps> = ({ 
  navigationSections, 
  isOpen, 
  onClose,
  isCollapsed = false 
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const IconComponent = item.icon;

    return (
      <li key={item.id} className={styles.navItem}>
        <div className={styles.navItemContainer}>
          <NavLink
            to={item.href}
            className={({ isActive }) => {
              // Custom active logic for travel items to prevent overlapping highlights
              let shouldBeActive = isActive;
              
              // For travel route, only highlight the first travel item to prevent overlap
              if (item.href === '/travel' && isActive) {
                shouldBeActive = item.dataSection === 'plans' || item.dataSection === 'planning';
              }
              
              return `${styles.navLink} ${shouldBeActive ? styles.active : ''} ${level > 0 ? styles.nested : ''}`;
            }}
            onClick={onClose}
            title={isCollapsed ? item.title : undefined}
          >
            <IconComponent size={20} className={styles.navIcon} />
            {!isCollapsed && (
              <>
                <span className={styles.navLabel}>{item.title}</span>
                {item.badge && (
                  <span className={styles.badge}>{item.badge}</span>
                )}
              </>
            )}
          </NavLink>
          
          {hasChildren && !isCollapsed && (
            <button
              className={styles.expandButton}
              onClick={() => toggleExpanded(item.id)}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          )}
        </div>

        {hasChildren && !isCollapsed && isExpanded && (
          <ul className={styles.nestedList}>
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${isCollapsed ? styles.collapsed : ''}`}>
        {/* Maritime Branding Header */}
        <div className={styles.branding}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <Anchor size={24} />
            </div>
            {!isCollapsed && (
              <div className={styles.logoText}>
                <span className={styles.brandName}>WaveSync</span>
                <span className={styles.brandTagline}>Maritime Platform</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.navigation}>
          {navigationSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={styles.navSection}>
              {!isCollapsed && (
                <h3 className={styles.sectionTitle}>{section.title}</h3>
              )}
              <ul className={styles.navList}>
                {section.items.map(item => renderNavigationItem(item))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Maritime Footer */}
        <div className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerIcon}>
              <Waves size={16} />
            </div>
            {!isCollapsed && (
              <div className={styles.footerText}>
                <span className={styles.footerTitle}>Safe Voyages</span>
                <span className={styles.footerSubtitle}>Maritime Excellence</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarBase;
