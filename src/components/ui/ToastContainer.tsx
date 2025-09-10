import React from "react";
import styles from "./ToastContainer.module.css";
import Toast, { Toast as ToastType } from "./Toast";

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

  return (
    <div className={[styles.container, styles[position]].filter(Boolean).join(" ")}>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

export default ToastContainer;
