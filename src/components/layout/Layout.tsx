import React from "react";
import styles from "./Layout.module.css";
import Sidebar, { NavItem } from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import { useNavigation } from "../../hooks/useNavigation";

export interface LayoutProps {
  title: string;
  navItems: NavItem[];
  activeKey?: string;
  user?: { name: string; role?: string; avatarUrl?: string };
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ title, navItems, activeKey, user, children }) => {
  const { mobileOpen, setMobileOpen } = useNavigation();

  React.useEffect(() => {
    function onResize() {
      if (window.innerWidth > 900) setMobileOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setMobileOpen]);

  return (
    <div className={styles.layout}>
      <Sidebar
        items={navItems}
        activeKey={activeKey}
        user={user}
        collapsedOnMobile={!mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <main className={styles.main}>
        <Header title={title} onOpenSidebar={() => setMobileOpen(true)} />
        <div className={styles.content}>{children ?? <Outlet />}</div>
      </main>
    </div>
  );
};

export default Layout;

