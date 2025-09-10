import React from "react";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isLeaving, setIsLeaving] = React.useState(false);

  React.useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success": return "✅";
      case "error": return "❌";
      case "warning": return "⚠️";
      case "info": return "ℹ️";
      default: return "ℹ️";
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case "success": return "#10b981";
      case "error": return "#ef4444";
      case "warning": return "#f59e0b";
      case "info": return "#3b82f6";
      default: return "#3b82f6";
    }
  };

  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid #e5e7eb`,
        borderLeft: `4px solid ${getBorderColor()}`,
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: '16px',
        marginBottom: '12px',
        maxWidth: '400px',
        transform: isVisible && !isLeaving ? 'translateX(0)' : 'translateX(100%)',
        opacity: isVisible && !isLeaving ? 1 : 0,
        transition: 'transform 0.2s ease, opacity 0.2s ease',
      }}
      role="alert"
      aria-live="polite"
    >
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'auto 1fr auto', 
        gap: '12px', 
        alignItems: 'flex-start' 
      }}>
        <div style={{ 
          width: '24px', 
          height: '24px', 
          display: 'grid', 
          placeItems: 'center', 
          fontSize: '16px' 
        }}>
          {getIcon()}
        </div>
        <div style={{ display: 'grid', gap: '4px' }}>
          <div style={{ fontWeight: '700', color: '#111827', fontSize: '14px' }}>
            {toast.title}
          </div>
          {toast.description && (
            <div style={{ color: '#6b7280', fontSize: '12px', lineHeight: '1.4' }}>
              {toast.description}
            </div>
          )}
        </div>
        <button
          onClick={handleRemove}
          style={{
            width: '24px',
            height: '24px',
            border: 'none',
            background: 'transparent',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            color: '#6b7280',
            fontSize: '12px',
            transition: 'background-color 0.15s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
      {toast.action && (
        <div style={{ 
          marginTop: '12px', 
          paddingTop: '12px', 
          borderTop: '1px solid #e5e7eb' 
        }}>
          <button
            onClick={toast.action.onClick}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
          >
            {toast.action.label}
          </button>
        </div>
      )}
    </div>
  );
};

export default Toast;