import React from "react";
import styles from "./Toast.module.css";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
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

  return (
    <div
      className={[
        styles.toast,
        styles[toast.type],
        isVisible && !isLeaving ? styles.visible : "",
        isLeaving ? styles.leaving : ""
      ].filter(Boolean).join(" ")}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.content}>
        <div className={styles.icon}>{getIcon()}</div>
        <div className={styles.text}>
          <div className={styles.title}>{toast.title}</div>
          {toast.description && (
            <div className={styles.description}>{toast.description}</div>
          )}
        </div>
        <button
          className={styles.closeButton}
          onClick={handleRemove}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
      {toast.action && (
        <div className={styles.action}>
          <button
            className={styles.actionButton}
            onClick={toast.action.onClick}
          >
            {toast.action.label}
          </button>
        </div>
      )}
    </div>
  );
};

export default Toast;
