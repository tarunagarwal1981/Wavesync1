import React from "react";
import styles from "./NotificationCenter.module.css";
import { Button } from "./index";
import NotificationItem, { NotificationType } from "./NotificationItem";

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string; // ISO
  read?: boolean;
}

export interface NotificationCenterProps {
  notifications: NotificationData[];
  isOpen: boolean;
  onClose: () => void;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onClearAll?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  onLoadMore,
  hasMore = false,
}) => {
  const centerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!centerRef.current?.contains(e.target as Node)) onClose();
    }
    if (isOpen) {
      document.addEventListener("mousedown", onDoc);
    }
    return () => document.removeEventListener("mousedown", onDoc);
  }, [isOpen, onClose]);

  const grouped = notifications.reduce((acc, n) => {
    const key = n.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {} as Record<NotificationType, NotificationData[]>);

  const typeLabels: Record<NotificationType, string> = {
    assignment: "Assignments",
    document: "Documents",
    task: "Tasks",
    training: "Training",
  };

  if (!isOpen) return null;

  return (
    <div className={styles.center} ref={centerRef}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.title}>Notifications</div>
          <div className={styles.actions}>
            {onMarkAllRead && <Button variant="ghost" onClick={onMarkAllRead}>Mark all read</Button>}
            {onClearAll && <Button variant="ghost" onClick={onClearAll}>Clear all</Button>}
          </div>
        </div>

        <div className={styles.body}>
          {notifications.length === 0 ? (
            <div className={styles.empty}>No notifications</div>
          ) : (
            Object.entries(grouped).map(([type, items]) => (
              <div key={type} className={styles.group}>
                <div className={styles.groupHeader}>{typeLabels[type as NotificationType]} ({items.length})</div>
                <div className={styles.items}>
                  {items.map(n => (
                    <NotificationItem
                      key={n.id}
                      {...n}
                      onMarkRead={onMarkRead}
                      onAction={() => {/* navigate to relevant page */}}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {hasMore && (
          <div className={styles.footer}>
            <Button variant="secondary" onClick={onLoadMore}>Load more</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
