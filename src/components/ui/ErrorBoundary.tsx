import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    console.error('🚨 Error stack:', error.stack);
    console.error('🚨 Error info:', errorInfo);
  }

  public render() {
    console.log('🛡️ ErrorBoundary rendering, hasError:', this.state.hasError);
    if (this.state.hasError) {
      console.log('🛡️ ErrorBoundary showing error fallback');
      return this.props.fallback || (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          background: '#f8f9fa', 
          border: '1px solid #dee2e6', 
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h2 style={{ color: '#dc3545' }}>Something went wrong</h2>
          <p>An error occurred while rendering this component.</p>
          <details style={{ marginTop: '10px' }}>
            <summary>Error details</summary>
            <pre style={{ textAlign: 'left', fontSize: '12px' }}>
              {this.state.error?.stack}
            </pre>
          </details>
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined })}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    console.log('🛡️ ErrorBoundary rendering children normally');
    return this.props.children;
  }
}

export default ErrorBoundary;