import React, { ReactNode } from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  pulse = false,
  dot = false,
  children,
  className = ''
}) => {
  const classes = [
    styles.badge,
    styles[variant],
    styles[size],
    pulse ? styles.pulse : '',
    dot ? styles.dot : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {dot && <span className={styles.dotIndicator} />}
      {children}
    </span>
  );
};

export default Badge;
