import React from "react";
import styles from "./Skeleton.module.css";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  lines?: number;
  variant?: "text" | "rectangular" | "circular" | "card";
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width, 
  height, 
  borderRadius, 
  className, 
  lines = 1,
  variant = "rectangular" 
}) => {
  const baseStyle: React.CSSProperties = {
    width: width || "100%",
    height: height || "1em",
    borderRadius: borderRadius || "var(--radius-12)",
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={[styles.skeleton, className].filter(Boolean).join(" ")}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={styles.line}
            style={{
              ...baseStyle,
              width: i === lines - 1 ? "60%" : "100%",
              height: "1em",
              marginBottom: i < lines - 1 ? "0.5em" : "0",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={[styles.skeleton, className].filter(Boolean).join(" ")}
      style={baseStyle}
    />
  );
};

export default Skeleton;
