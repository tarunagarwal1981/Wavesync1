import React from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  suggestions?: string[];
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📋',
  title,
  description,
  action,
  suggestions = [],
  className
}) => {
  return (
    <div className={`${styles.emptyState} ${className || ''}`}>
      <div className={styles.emptyIcon}>
        {icon}
      </div>
      
      <div className={styles.emptyContent}>
        <h3 className={styles.emptyTitle}>{title}</h3>
        <p className={styles.emptyDescription}>{description}</p>
        
        {suggestions.length > 0 && (
          <div className={styles.suggestions}>
            <h4 className={styles.suggestionsTitle}>Try these actions:</h4>
            <ul className={styles.suggestionsList}>
              {suggestions.map((suggestion, index) => (
                <li key={index} className={styles.suggestionItem}>
                  <span className={styles.suggestionBullet}>•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {action && (
          <button
            onClick={action.onClick}
            className={styles.actionButton}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;