import React from "react";
import styles from "./Header.module.css";
import { Avatar, Badge, Button, Input } from "../ui";
import { useNavigation } from "../../hooks/useNavigation";

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  notificationsCount?: number;
  onOpenSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, notificationsCount = 0, onOpenSidebar, className, ...props }) => {
  const { mobileOpen, setMobileOpen } = useNavigation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className={[styles.header, className].filter(Boolean).join(" ")} {...props}>
      <button 
        className={styles.mobileMenuButton} 
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        ☰
      </button>
      <div className={styles.title}>{title}</div>

      <div className={styles.search}>
        <Input placeholder="Search crew, vessels, tasks..." aria-label="Search" />
      </div>

      <div className={styles.actions}>
        <button className={styles.bell} aria-label="Notifications">
          <span aria-hidden>🔔</span>
          {notificationsCount > 0 && (
            <span className={styles.badge}><Badge variant="primary">{notificationsCount}</Badge></span>
          )}
        </button>

        <div className={styles.menu} ref={menuRef}>
          <button className={styles.menuButton} onClick={() => setMenuOpen(v => !v)} aria-expanded={menuOpen} aria-haspopup="menu">
            <Avatar name="Officer" />
            <span>Account</span>
          </button>
          {menuOpen && (
            <div role="menu" className={styles.menuList}>
              <a className={styles.menuItem} role="menuitem" href="#profile">Profile</a>
              <a className={styles.menuItem} role="menuitem" href="#settings">Settings</a>
              <a className={styles.menuItem} role="menuitem" href="#logout">Logout</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

