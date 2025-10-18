import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../lib/supabase';
import NotificationCenter from './NotificationCenter';
import styles from './NotificationBell.module.css';

const NotificationBell: React.FC = () => {
  const { profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('read', false);

      if (error) throw error;

      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch count on mount and when profile changes
  useEffect(() => {
    if (profile?.id) {
      fetchUnreadCount();
    }
  }, [profile?.id]);

  // Set up real-time subscription for notifications
  useEffect(() => {
    if (!profile?.id) return;

    const subscription = supabase
      .channel('notification_count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`
        },
        (payload) => {
          console.log('Notification count change:', payload);
          fetchUnreadCount(); // Refresh count
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [profile?.id]);

  const handleBellClick = () => {
    setIsNotificationCenterOpen(true);
  };

  const handleCloseNotificationCenter = () => {
    setIsNotificationCenterOpen(false);
    // Refresh count when closing in case notifications were marked as read
    fetchUnreadCount();
  };

  return (
    <>
      <div className={styles.notificationBell} onClick={handleBellClick}>
        <div className={styles.bellIcon}>
          🔔
        </div>
        {unreadCount > 0 && (
          <div className={styles.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
        {loading && (
          <div className={styles.loadingIndicator}></div>
        )}
      </div>

      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={handleCloseNotificationCenter}
      />
    </>
  );
};

export default NotificationBell;

