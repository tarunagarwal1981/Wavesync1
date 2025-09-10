import React from "react";
import { ErrorBoundary } from "../components/ui";

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
    <div style={{ 
      display: 'grid', 
      placeItems: 'center', 
      gap: '16px', 
      padding: '32px', 
      textAlign: 'center',
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      margin: '16px'
    }}>
      <div style={{ fontSize: '24px' }}>⚠️</div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
        Something went wrong
      </h2>
      <p style={{ 
        fontSize: '14px', 
        color: '#6b7280', 
        margin: 0,
        maxWidth: '400px',
        lineHeight: '1.5'
      }}>
        We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
      </p>
      {process.env.NODE_ENV === "development" && error && (
        <details style={{ marginTop: '16px', textAlign: 'left', maxWidth: '100%' }}>
          <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            Error Details
          </summary>
          <pre style={{ 
            background: '#f9fafb', 
            border: '1px solid #e5e7eb', 
            borderRadius: '12px', 
            padding: '12px', 
            fontSize: '12px', 
            color: '#374151', 
            overflowX: 'auto', 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-word' 
          }}>
            {error.stack}
          </pre>
        </details>
      )}
      <button 
        onClick={retry}
        style={{
          padding: '12px 24px',
          background: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background-color 0.15s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
        onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorBoundary;