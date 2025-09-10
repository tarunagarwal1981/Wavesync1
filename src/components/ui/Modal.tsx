import React from "react";
import styles from "./Modal.module.css";

export interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  fullScreenOnMobile?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, children, footer, fullScreenOnMobile }) => {
  const dialogRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  React.useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => previouslyFocused?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  function onBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={onBackdrop}>
      <div
        className={[styles.dialog, fullScreenOnMobile ? styles.fullScreenMobile : undefined].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={dialogRef}
      >
        {title && (
          <div className={styles.header}>
            <span>{title}</span>
            <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
              ✕
            </button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;

