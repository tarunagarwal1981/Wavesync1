import React from 'react';
import { AlertTriangle, AlertCircle, Info, Pin, CheckCircle } from 'lucide-react';
import styles from './AnnouncementCard.module.css';

export interface AnnouncementCardProps {
  id: string;
  title: string;
  message: string;
  priority: 'critical' | 'important' | 'normal' | 'info';
  senderName: string;
  createdAt: string;
  isRead: boolean;
  isPinned: boolean;
  requiresAcknowledgment: boolean;
  isAcknowledged: boolean;
  attachments?: Array<{ url: string; filename: string }>;
  onRead: (id: string) => void;
  onAcknowledge: (id: string) => void;
  onClick: (id: string) => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  id,
  title,
  message,
  priority,
  senderName,
  createdAt,
  isRead,
  isPinned,
  requiresAcknowledgment,
  isAcknowledged,
  attachments,
  onRead,
  onAcknowledge,
  onClick
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on acknowledge button
    if ((e.target as HTMLElement).closest(`.${styles.acknowledgeButton}`)) {
      return;
    }
    
    // Mark as read and open
    if (!isRead) {
      onRead(id);
    }
    onClick(id);
  };

  const handleAcknowledge = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAcknowledge(id);
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle size={20} />;
      case 'important':
        return <AlertCircle size={20} />;
      case 'normal':
        return <Info size={20} />;
      case 'info':
        return <Info size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 7) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes > 0 ? `${minutes}m ago` : 'Just now';
    }
  };

  const truncateMessage = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div
      className={`
        ${styles.card}
        ${styles[`priority${priority.charAt(0).toUpperCase() + priority.slice(1)}`]}
        ${!isRead ? styles.unread : ''}
        ${isPinned ? styles.pinned : ''}
      `}
      onClick={handleCardClick}
    >
      {/* Left: Priority Icon */}
      <div className={styles.iconContainer}>
        <div className={`${styles.iconCircle} ${styles[`icon${priority.charAt(0).toUpperCase() + priority.slice(1)}`]}`}>
          {getPriorityIcon()}
        </div>
        {isPinned && (
          <div className={styles.pinnedIndicator}>
            <Pin size={12} />
          </div>
        )}
      </div>

      {/* Center: Content */}
      <div className={styles.content}>
        {/* Header Row */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h3 className={`${styles.title} ${!isRead ? styles.titleUnread : ''}`}>
              {title}
            </h3>
            {!isRead && <div className={styles.unreadDot} />}
          </div>
          <span className={styles.timestamp}>{formatTime(createdAt)}</span>
        </div>

        {/* Message Preview */}
        <p className={styles.messagePreview}>
          {truncateMessage(message)}
        </p>

        {/* Meta Info */}
        <div className={styles.meta}>
          <span className={styles.sender}>From: {senderName}</span>
          {attachments && attachments.length > 0 && (
            <span className={styles.attachmentBadge}>
              📎 {attachments.length}
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className={styles.actions}>
        {requiresAcknowledgment && !isAcknowledged && (
          <button
            className={styles.acknowledgeButton}
            onClick={handleAcknowledge}
            title="Acknowledge this announcement"
          >
            <CheckCircle size={16} />
            <span className={styles.acknowledgeText}>Acknowledge</span>
          </button>
        )}
        {isAcknowledged && (
          <div className={styles.acknowledgedBadge}>
            <CheckCircle size={14} />
            <span>Acknowledged</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementCard;

