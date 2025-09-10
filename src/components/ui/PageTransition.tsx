import React from "react";
import styles from "./PageTransition.module.css";

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={[styles.container, isVisible ? styles.visible : "", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
};

export default PageTransition;
