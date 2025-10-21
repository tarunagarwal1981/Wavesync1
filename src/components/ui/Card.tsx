import React, { ReactNode, HTMLAttributes } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  hoverable = false,
  padding = 'md',
  children,
  className = '',
  ...props
}) => {
  const classes = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    hoverable ? styles.hoverable : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Sub-components
interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`${styles.header} ${className}`}>{children}</div>
);

export const CardBody: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`${styles.body} ${className}`}>{children}</div>
);

export const CardFooter: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`${styles.footer} ${className}`}>{children}</div>
);

export default Card;
