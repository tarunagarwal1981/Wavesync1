import React from 'react';

interface ModalProps {
  open?: boolean; // primary prop
  isOpen?: boolean; // backward-compatible alias
  title?: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  ariaDescription?: string;
  width?: number; // max-width in px
}

export const Modal: React.FC<ModalProps> = ({
  open,
  isOpen,
  title,
  onClose,
  footer,
  children,
  ariaDescription,
  width = 800,
}) => {
  const visible = typeof open === 'boolean' ? open : !!isOpen;
  if (!visible) return null;

  return (
    <div
      className="ws-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(2, 6, 23, 0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'ws-modal-title' : undefined}
        aria-describedby={ariaDescription ? 'ws-modal-desc' : undefined}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: width, maxHeight: '92vh',
          background: 'var(--bg-surface)', borderRadius: '16px', overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)', border: '1px solid rgba(226,232,240,0.7)'
        }}
      >
        {(
          title !== undefined
        ) && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '24px', borderBottom: '1px solid var(--border-light)',
            background: 'linear-gradient(135deg, rgba(14,165,233,0.06) 0%, rgba(2,132,199,0.06) 100%)'
          }}>
            {title && (
              <h2 id="ws-modal-title" style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                {title}
              </h2>
            )}
            <button
              aria-label="Close modal"
              onClick={onClose}
              style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: 'var(--text-secondary)', borderRadius: 8 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}

        <div style={{ padding: '28px 28px 40px 28px' }}>
          {ariaDescription && (
            <p id="ws-modal-desc" style={{ marginTop: 0, marginBottom: 16, color: 'var(--text-secondary)', fontSize: 13 }}>
              {ariaDescription}
            </p>
          )}
          {children}
        </div>

        {footer && (
          <div style={{
            position: 'sticky', bottom: 0, display: 'flex', justifyContent: 'flex-end', gap: 12,
            padding: '16px 24px', borderTop: '1px solid var(--border-light)',
            background: 'var(--bg-surface)', borderBottomLeftRadius: 16, borderBottomRightRadius: 16
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
