import React from "react";
import styles from "./NotificationItem.module.css";
import { ClipboardList, FileText, CheckSquare, GraduationCap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export type NotificationType = "assignment" | "document" | "task" | "training";

export interface NotificationItemProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string; // ISO
  read?: boolean;
  onMarkRead?: (id: string) => void;
  onAction?: (id: string) => void;
}

function TypeIcon({ type }: { type: NotificationType }) {
  const icon = {
    assignment: <ClipboardList size={16} />,
    document: <FileText size={16} />,
    task: <CheckSquare size={16} />,
    training: <GraduationCap size={16} />,
  }[type];
  const className = {
    assignment: styles.iconAssignment,
    document: styles.iconDocument,
    task: styles.iconTask,
    training: styles.iconTraining,
  }[type];
  return <div className={[styles.iconWrap, className].join(" ")}>{icon}</div>;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  type,
  title,
  message,
  createdAt,
  read = false,
  onMarkRead,
  onAction,
  className,
  ...props
}) => {
  return (
    <div className={[styles.item, !read ? styles.unread : undefined, className].filter(Boolean).join(" ")} {...props}>
      <TypeIcon type={type} />
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.message}>{message}</div>
        <div className={styles.time}>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</div>
      </div>
      <div className={styles.actions}>
        {!read && <div className={styles.dot} aria-label="Unread" />}
        {onAction && <button onClick={() => onAction(id)}>View</button>}
      </div>
    </div>
  );
};

export default NotificationItem;
