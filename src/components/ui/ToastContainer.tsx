import React from "react";
import Toast from "./Toast";

export interface ToastType {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ 
  toasts, 
  onRemove, 
  position = "top-right" 
}) => {
  if (toasts.length === 0) return null;

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 9999,
      pointerEvents: 'none' as const,
      padding: '16px',
    };

    switch (position) {
      case "top-right":
        return { ...baseStyles, top: 0, right: 0 };
      case "top-left":
        return { ...baseStyles, top: 0, left: 0 };
      case "bottom-right":
        return { ...baseStyles, bottom: 0, right: 0 };
      case "bottom-left":
        return { ...baseStyles, bottom: 0, left: 0 };
      case "top-center":
        return { ...baseStyles, top: 0, left: '50%', transform: 'translateX(-50%)' };
      case "bottom-center":
        return { ...baseStyles, bottom: 0, left: '50%', transform: 'translateX(-50%)' };
      default:
        return { ...baseStyles, top: 0, right: 0 };
    }
  };

  return (
    <div style={getPositionStyles()}>
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <Toast 
            type={toast.type}
            title={toast.title}
            description={toast.message}
            duration={toast.duration}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;