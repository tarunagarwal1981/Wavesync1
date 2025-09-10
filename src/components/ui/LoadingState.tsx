import React from "react";
import styles from "./LoadingState.module.css";
import { Skeleton, EmptyState, RetryButton } from "../components/ui";

export interface LoadingStateProps {
  isLoading: boolean;
  error?: string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  emptyState?: React.ReactNode;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  error,
  isEmpty = false,
  onRetry,
  children,
  skeleton,
  emptyState,
  className
}) => {
  if (error) {
    return (
      <div className={[styles.errorContainer, className].filter(Boolean).join(" ")}>
        <RetryButton onRetry={onRetry || (() => {})} error={error} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={[styles.loadingContainer, className].filter(Boolean).join(" ")}>
        {skeleton || <Skeleton variant="card" height="200px" />}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={[styles.emptyContainer, className].filter(Boolean).join(" ")}>
        {emptyState || (
          <EmptyState
            icon="📄"
            title="No data available"
            description="There's nothing to show here yet."
          />
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingState;
