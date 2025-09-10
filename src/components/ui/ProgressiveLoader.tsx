import React from "react";
import styles from "./ProgressiveLoader.module.css";

export interface ProgressiveLoaderProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "circular" | "linear";
  className?: string;
}

export const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  progress,
  label,
  showPercentage = true,
  size = "md",
  variant = "linear",
  className
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  if (variant === "circular") {
    const radius = size === "sm" ? 20 : size === "lg" ? 40 : 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

    return (
      <div className={[styles.circularContainer, className].filter(Boolean).join(" ")}>
        <svg
          className={styles.circularSvg}
          width={radius * 2 + 8}
          height={radius * 2 + 8}
        >
          <circle
            className={styles.circularTrack}
            cx={radius + 4}
            cy={radius + 4}
            r={radius}
            fill="none"
            stroke="var(--gray-200)"
            strokeWidth="4"
          />
          <circle
            className={styles.circularProgress}
            cx={radius + 4}
            cy={radius + 4}
            r={radius}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${radius + 4} ${radius + 4})`}
          />
        </svg>
        {showPercentage && (
          <div className={styles.percentage}>
            {Math.round(clampedProgress)}%
          </div>
        )}
        {label && <div className={styles.label}>{label}</div>}
      </div>
    );
  }

  return (
    <div className={[styles.linearContainer, className].filter(Boolean).join(" ")}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={[styles.linearTrack, styles[size]].filter(Boolean).join(" ")}>
        <div
          className={styles.linearProgress}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <div className={styles.percentage}>
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
};

export default ProgressiveLoader;
