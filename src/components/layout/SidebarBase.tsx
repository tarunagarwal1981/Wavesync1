import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Waves,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { NavigationSection, NavigationItem } from '../../utils/navigationConfig';
import styles from './SidebarBase.module.css';
import { NeuralCrewLogo } from '../../assets/logos';
import { BrandText } from '../ui';

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
    const isComingSoon = (item as any).badge === 'Soon' || item.id === 'ai-assignments' || item.id === 'budget-expenses' || item.id === 'scheduling' || item.id === 'training-programs';

    return (
      <li key={item.id} className={styles.navItem}>
        <div className={styles.navItemContainer}>
          {isComingSoon ? (
            <span
              className={`${styles.navLink} ${level > 0 ? styles.nested : ''} ${styles.comingSoon}`}
              aria-disabled={"true"}
              tabIndex={-1}
              title={isCollapsed ? `${item.title} — Coming soon` : undefined}
              data-ai={item.href === '/ai-assignments' ? 'true' : undefined}
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
            </span>
          ) : (
            <NavLink
              to={item.href}
              end={item.href === '/admin' || item.href === '/dashboard'}
              className={({ isActive }) => {
                // For travel route, only highlight the planning section by default
                let shouldBeActive = isActive;
                
                if (item.href === '/travel' && isActive) {
                  shouldBeActive = item.dataSection === 'planning' || !item.dataSection;
                }
                
                return `${styles.navLink} ${shouldBeActive ? styles.active : ''} ${level > 0 ? styles.nested : ''}`;
              }}
              onClick={() => {
                onClose();
              }}
              title={isCollapsed ? item.title : undefined}
              data-ai={item.href === '/ai-assignments' ? 'true' : undefined}
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
          )}
          
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
            <div className={styles.logoIconWrapper}>
              <NeuralCrewLogo width={50} height={50} variant="cyan" animated />
            </div>
            {!isCollapsed && (
              <div className={styles.logoText}>
                <BrandText size="md" variant="gradient" />
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
