import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Navigation.module.css";
import { useNavigation } from "../../hooks/useNavigation";
import { Badge } from "../ui";

export const Navigation: React.FC = () => {
  const { items, activeKey, setActiveKey } = useNavigation();
  const location = useLocation();

  React.useEffect(() => {
    const match = items.find(i => i.href === location.pathname);
    setActiveKey(match?.key);
  }, [location.pathname, items, setActiveKey]);

  return (
    <nav className={styles.nav} aria-label="Primary">
      {items.map(item => {
        const isActive = item.key === activeKey;
        const linkClass = [styles.link, isActive ? styles.active : undefined].filter(Boolean).join(" ");
        return (
          <Link key={item.key} to={item.href} className={linkClass} aria-current={isActive ? "page" : undefined}>
            <span className={styles.icon} aria-hidden>{item.icon}</span>
            <span>{item.label}</span>
            {item.badge != null && <span className={styles.badge}><Badge variant="info">{item.badge}</Badge></span>}
          </Link>
        );
      })}
    </nav>
  );
};

export default Navigation;

