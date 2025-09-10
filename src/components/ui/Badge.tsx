import React from "react";
import styles from "./Badge.module.css";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";
type BadgeSize = "small" | "medium" | "large";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  variant = "default", 
  size = "medium",
  leftIcon, 
  rightIcon, 
  className, 
  children, 
  ...props 
}) => {
  const classes = [
    styles.badge, 
    styles[variant], 
    styles[size], 
    className
  ].filter(Boolean).join(" ");
  
  return (
    <span className={classes} {...props}>
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </span>
  );
};

export default Badge;

