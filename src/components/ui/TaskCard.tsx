import React from "react";
import styles from "./TaskCard.module.css";
import { Avatar, Button } from "./index";
import { formatDistanceToNow } from "date-fns";

export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export interface TaskCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  priority: TaskPriority;
  due?: string; // ISO
  assigneeName?: string;
  assigneeAvatar?: string;
  tags?: string[];
  stepsCompleted?: number;
  stepsTotal?: number;
  attachments?: number;
  onQuickEdit?: () => void;
  onComplete?: () => void;
}

function PriorityChip({ priority }: { priority: TaskPriority }) {
  const className = {
    High: styles.prioHigh,
    Medium: styles.prioMedium,
    Low: styles.prioLow,
    Urgent: styles.prioUrgent,
  }[priority];
  return (
    <span className={[styles.prio, className].join(" ")}>
      <span className={styles.dot} aria-hidden />
      <span>{priority}</span>
    </span>
  );
}

function DueChip({ due }: { due?: string }) {
  if (!due) return <span className={styles.chip}>No due</span>;
  const diff = +new Date(due) - Date.now();
  const days = Math.ceil(diff / 86400000);
  let color = "var(--gray-700)";
  if (days < 0) color = "var(--color-error)";
  else if (days <= 2) color = "var(--color-warning)";
  else if (days <= 7) color = "var(--color-success)";
  return <span className={styles.chip} style={{ color }}>{days < 0 ? "Overdue" : `Due ${formatDistanceToNow(new Date(due), { addSuffix: true })}`}</span>;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  title,
  description,
  priority,
  due,
  assigneeName,
  assigneeAvatar,
  tags = [],
  stepsCompleted = 0,
  stepsTotal = 0,
  attachments = 0,
  onQuickEdit,
  onComplete,
  className,
  ...props
}) => {
  const pct = stepsTotal > 0 ? Math.round((stepsCompleted / stepsTotal) * 100) : 0;

  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")} {...props}>
      <div className={styles.row}>
        <div className={styles.title}>{title}</div>
        <PriorityChip priority={priority} />
      </div>
      {description && <div className={styles.desc}>{description}</div>}
      <div className={styles.meta}>
        <DueChip due={due} />
        <span className={styles.chip}>Attachments: {attachments}</span>
      </div>
      {stepsTotal > 0 && (
        <div className={styles.progress} aria-label="Progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} role="progressbar">
          <div className={styles.bar} style={{ width: `${pct}%` }} />
        </div>
      )}
      <div className={styles.footer}>
        <div className={styles.avatarWrap}>
          <Avatar name={assigneeName} src={assigneeAvatar} size="sm" />
          <span className={styles.chip}>{assigneeName || "Unassigned"}</span>
        </div>
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onQuickEdit}>Edit</Button>
          <Button variant="secondary" onClick={onComplete}>Complete</Button>
        </div>
      </div>
      {tags.length > 0 && (
        <div className={styles.tags}>
          {tags.map(tag => <span key={tag} className={styles.tag}>{tag}</span>)}
        </div>
      )}
    </div>
  );
};

export default TaskCard;

