import React, { useState, useEffect } from 'react';
import { useDemo } from '../../contexts/DemoContext';
import { Notification } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import styles from './NotificationSystem.module.css';

interface NotificationSystemProps {
  className?: string;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ className }) => {
  const { notifications, markNotificationAsRead, addNotification } = useDemo();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment': return '📋';
      case 'document': return '📄';
      case 'task': return '✅';
      case 'training': return '🎓';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return styles.urgent;
      case 'high': return styles.high;
      case 'medium': return styles.medium;
      case 'low': return styles.low;
      default: return styles.medium;
    }
  };

  const simulateNewNotification = () => {
    const notificationTypes = [
      {
        title: "New Assignment Posted",
        message: "Chief Engineer position available on MV PACIFIC STAR",
        type: "assignment",
        priority: "high"
      },
      {
        title: "Document Expiring Soon",
        message: "Your Medical Certificate expires in 15 days",
        type: "document",
        priority: "urgent"
      },
      {
        title: "Training Reminder",
        message: "ECDIS Refresher Course starts next week",
        type: "training",
        priority: "medium"
      },
      {
        title: "Task Completed",
        message: "Medical Certificate upload task completed successfully",
        type: "success",
        priority: "low"
      }
    ];

    const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    
    addNotification({
      ...randomNotification,
      actionUrl: `/${randomNotification.type}s`
    });
  };

  return (
    <div className={`${styles.notificationSystem} ${className || ''}`}>
      {/* Notification Bell */}
      <button 
        className={styles.notificationBell}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <span className={styles.bellIcon}>🔔</span>
        {unreadCount > 0 && (
          <span className={styles.unreadBadge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Demo Button */}
      <button 
        className={styles.demoButton}
        onClick={simulateNewNotification}
        title="Simulate new notification"
      >
        ✨ Demo
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className={styles.notificationDropdown}>
          <div className={styles.dropdownHeader}>
            <h3 className={styles.dropdownTitle}>Notifications</h3>
            <button 
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className={styles.notificationList}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔔</div>
                <p className={styles.emptyText}>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 10).map(notification => (
                <div
                  key={notification.id}
                  className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''} ${getPriorityColor(notification.priority)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={styles.notificationIcon}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationTitle}>
                      {notification.title}
                    </div>
                    <div className={styles.notificationMessage}>
                      {notification.message}
                    </div>
                    <div className={styles.notificationTime}>
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </div>
                  </div>

                  {!notification.read && (
                    <div className={styles.unreadIndicator} />
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className={styles.dropdownFooter}>
              <button className={styles.viewAllButton}>
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;
