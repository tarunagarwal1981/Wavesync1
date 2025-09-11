import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, title, message, duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#10b981" />;
      case 'error':
        return <XCircle size={20} color="#ef4444" />;
      case 'warning':
        return <AlertTriangle size={20} color="#f59e0b" />;
      case 'info':
        return <Info size={20} color="#3b82f6" />;
      default:
        return <Info size={20} color="#3b82f6" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#dcfce7';
      case 'error':
        return '#fecaca';
      case 'warning':
        return '#fef3c7';
      case 'info':
        return '#dbeafe';
      default:
        return '#dbeafe';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return '#bbf7d0';
      case 'error':
        return '#fca5a5';
      case 'warning':
        return '#fde68a';
      case 'info':
        return '#bfdbfe';
      default:
        return '#bfdbfe';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return '#166534';
      case 'error':
        return '#991b1b';
      case 'warning':
        return '#92400e';
      case 'info':
        return '#1e40af';
      default:
        return '#1e40af';
    }
  };

  return (
    <div
      style={{
        backgroundColor: getBackgroundColor(),
        border: `1px solid ${getBorderColor()}`,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        minWidth: '320px',
        maxWidth: '400px',
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        {getIcon()}
      </div>
      
      <div style={{ flex: 1 }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '600',
          margin: '0 0 4px 0',
          color: getTextColor(),
        }}>
          {title}
        </h4>
        {message && (
          <p style={{
            fontSize: '13px',
            margin: 0,
            color: getTextColor(),
            opacity: 0.8,
            lineHeight: '1.4',
          }}>
            {message}
          </p>
        )}
      </div>
      
      <button
        onClick={() => onClose(id)}
        style={{
          flexShrink: 0,
          padding: '4px',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          borderRadius: '4px',
          color: getTextColor(),
          opacity: 0.7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.7';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;