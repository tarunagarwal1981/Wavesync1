import React from "react";
import styles from "./BrandedSpinner.module.css";

export interface BrandedSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export const BrandedSpinner: React.FC<BrandedSpinnerProps> = ({ 
  size = "md", 
  label = "Loading...", 
  className 
}) => {
  return (
    <div className={[styles.container, styles[size], className].filter(Boolean).join(" ")}>
      <div className={styles.spinner} role="status" aria-label={label}>
        <div className={styles.wave}></div>
        <div className={styles.wave}></div>
        <div className={styles.wave}></div>
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
};

export default BrandedSpinner;
