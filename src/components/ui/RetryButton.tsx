import React from "react";
import styles from "./RetryButton.module.css";

export interface RetryButtonProps {
  onRetry: () => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
  children?: React.ReactNode;
}

export const RetryButton: React.FC<RetryButtonProps> = ({ 
  onRetry, 
  isLoading = false, 
  error, 
  className,
  children = "Try Again"
}) => {
  return (
    <div className={[styles.retryContainer, className].filter(Boolean).join(" ")}>
      {error && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      <button
        className={styles.retryButton}
        onClick={onRetry}
        disabled={isLoading}
        aria-label="Retry operation"
      >
        {isLoading ? (
          <>
            <span className={styles.spinner} />
            Retrying...
          </>
        ) : (
          <>
            <span className={styles.retryIcon}>🔄</span>
            {children}
          </>
        )}
      </button>
    </div>
  );
};

export default RetryButton;
