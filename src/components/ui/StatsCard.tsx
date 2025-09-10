import React from "react";
import styles from "./StatsCard.module.css";

export type StatsVariant = "assignments" | "documents" | "training" | "tasks";

export interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value?: number | string;
  icon?: React.ReactNode;
  percentChange?: number; // positive/negative
  loading?: boolean;
  variant?: StatsVariant;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  percentChange,
  loading = false,
  variant = "assignments",
  className,
  ...props
}) => {
  const isUp = (percentChange ?? 0) >= 0;
  const classes = [styles.card, styles[variant], className].filter(Boolean).join(" ");

  return (
    <div className={classes} {...props}>
      {loading ? (
        <div className={[styles.inner, styles.skeleton].join(" ")}>
          <div className={styles.iconWrap} aria-hidden>
            <div className={[styles.shimmer, styles.large].join(" ")} />
          </div>
          <div className={styles.meta}>
            <div className={[styles.shimmer, styles.small].join(" ")} />
            <div className={[styles.shimmer, styles.large].join(" ")} />
          </div>
        </div>
      ) : (
        <div className={styles.inner}>
          <div className={styles.iconWrap} aria-hidden>
            {icon}
          </div>
          <div className={styles.meta}>
            <div className={styles.title}>{title}</div>
            <div className={styles.value}>{value}</div>
            {percentChange != null && (
              <div className={[styles.changeRow, isUp ? styles.changeUp : styles.changeDown].join(" ")}>
                <span className={styles.arrow} aria-hidden>{isUp ? "▲" : "▼"}</span>
                <span>{Math.abs(percentChange)}%</span>
                <span>since last period</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCard;

