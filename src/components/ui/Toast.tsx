import React, { useEffect } from 'react';
import styles from './Toast.module.css';

interface ToastProps {
  title?: string;
  description?: string;
  message?: string; // backward compatibility
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  title,
  description,
  message,
  type = 'info',
  duration = 3000,
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const content = message || description || '';

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span className={styles.icon}>{icons[type]}</span>
      <div className={styles.texts}>
        {title && <div className={styles.title}>{title}</div>}
        {content && <div className={styles.message}>{content}</div>}
      </div>
      <button className={styles.closeButton} onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default Toast;
