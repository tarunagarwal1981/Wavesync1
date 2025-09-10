import React from "react";
import styles from "./ErrorBoundary.module.css";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error; retry: () => void }> = ({ error, retry }) => {
  return (
    <div className={styles.errorFallback}>
      <div className={styles.icon}>⚠️</div>
      <h2 className={styles.title}>Something went wrong</h2>
      <p className={styles.description}>
        We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
      </p>
      {process.env.NODE_ENV === "development" && error && (
        <details className={styles.errorDetails}>
          <summary>Error Details</summary>
          <pre className={styles.errorStack}>{error.stack}</pre>
        </details>
      )}
      <button className={styles.retryButton} onClick={retry}>
        Try Again
      </button>
    </div>
  );
};

export default ErrorBoundary;
