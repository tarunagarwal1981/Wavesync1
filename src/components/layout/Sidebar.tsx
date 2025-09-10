import React from "react";
import styles from "./Sidebar.module.css";
import { Avatar, Badge, Button } from "../ui";
import Navigation from "./Navigation";

export interface NavItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  badge?: string | number;
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  items: NavItem[];
  activeKey?: string;
  user?: { name: string; role?: string; avatarUrl?: string };
  collapsedOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, activeKey, user, collapsedOnMobile, onCloseMobile, className, ...props }) => {
  const classes = [styles.sidebar, collapsedOnMobile ? undefined : styles.open, className].filter(Boolean).join(" ");

  return (
    <aside className={classes} {...props}>
      <div className={styles.brand}>
        <div className={styles.logo} aria-hidden="true">W</div>
        <div className={styles.title} aria-label="WaveSync">WaveSync</div>
        <button aria-label="Close sidebar" className={styles.collapseButton} onClick={onCloseMobile}>✕</button>
      </div>

      <Navigation />

      <div className={styles.profile}>
        <Avatar src={user?.avatarUrl} name={user?.name} />
        <div>
          <div className={styles.name}>{user?.name}</div>
          <div className={styles.role}>{user?.role}</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

