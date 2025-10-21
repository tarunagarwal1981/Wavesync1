import React, { ReactNode } from 'react';
import styles from './EmptyState.module.css';
import { Button } from './';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => {
  return (
    <div className={styles.container}>
      {icon && (
        <div className={styles.icon}>
          {icon}
        </div>
      )}
      <h3 className={styles.title}>{title}</h3>
      {description && (
        <p className={styles.description}>{description}</p>
      )}
      {action && (
        <Button
          variant="primary"
          size="md"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;