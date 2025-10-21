import React from "react";
import styles from "./ActivityFeed.module.css";
import { formatDistanceToNow } from "date-fns";
import { FileText, ClipboardList, CheckSquare, GraduationCap, Bell, MessageSquare } from "lucide-react";
import Button from "./Button";

export type ActivityType = "document" | "assignment" | "task" | "training" | "system" | "message";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  createdAt: string; // ISO
  meta?: string;
}

function TypeIcon({ type }: { type: ActivityType }) {
  const size = 12;
  switch (type) {
    case "document": return <FileText size={size} />;
    case "assignment": return <ClipboardList size={size} />;
    case "task": return <CheckSquare size={size} />;
    case "training": return <GraduationCap size={size} />;
    case "message": return <MessageSquare size={size} />;
    default: return <Bell size={size} />;
  }
}

export interface ActivityFeedProps {
  items: ActivityItem[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ items, onLoadMore, hasMore = false }) => {
  if (!items.length) {
    return <div className={styles.empty}>No recent activity.</div>;
  }

  return (
    <div className={styles.feed}>
      {items.map((a, idx) => {
        const showLine = idx !== items.length - 1;
        return (
          <div key={a.id} className={styles.item}>
            <div className={styles.dotWrap}>
              <div className={[styles.dot, styles[a.type]].join(" ")}> 
                <span className={styles.icon} aria-hidden>
                  <TypeIcon type={a.type} />
                </span>
              </div>
              {showLine && <div className={styles.line} />}
            </div>
            <div className={styles.content}>
              <div className={styles.title}>{a.title}</div>
              <div className={styles.meta}>
                {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                {a.meta ? ` • ${a.meta}` : ""}
              </div>
            </div>
            <div className={styles.meta} aria-hidden>{/* right-side metadata slot if needed */}</div>
          </div>
        );
      })}

      {hasMore && (
        <div className={styles.footer}>
          <Button variant="secondary" onClick={onLoadMore}>Load more</Button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;

