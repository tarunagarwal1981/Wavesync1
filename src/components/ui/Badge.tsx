import React from "react";
import styles from "./Badge.module.css";

type BadgeVariant = "primary" | "success" | "warning" | "danger" | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = "neutral", leftIcon, rightIcon, className, children, ...props }) => {
  const classes = [styles.badge, styles[variant], className].filter(Boolean).join(" ");
  return (
    <span className={classes} {...props}>
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </span>
  );
};

export default Badge;

