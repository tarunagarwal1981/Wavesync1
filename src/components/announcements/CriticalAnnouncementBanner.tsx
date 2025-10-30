import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';
import { acknowledgeBroadcast, markBroadcastAsRead } from '../../services/broadcast.service';
import { AlertTriangle, X, Eye, CheckCircle } from 'lucide-react';
import styles from './CriticalAnnouncementBanner.module.css';
import type { BroadcastWithStatus } from '../../types/broadcast.types';

export const CriticalAnnouncementBanner: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [criticalAnnouncement, setCriticalAnnouncement] = useState<BroadcastWithStatus | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (!user) {
      setCriticalAnnouncement(null);
      return;
    }

    if (!isAvailable) {
      setCriticalAnnouncement(null);
      return;
    }

    let isMounted = true;

    const fetchCriticalAnnouncement = async () => {
      try {
        // Fetch the most recent unread critical announcement
        const { data, error } = await supabase
          .rpc('get_my_broadcasts');

        if (!isMounted) return;

        // If RPC function doesn't exist (404), disable the component
        if (error) {
          if (error.message?.includes('404') || error.code === '42883' || error.code === 'PGRST202') {
            setIsAvailable(false);
            setCriticalAnnouncement(null);
          }
          return;
        }

        if (data && data.length > 0) {
          // Filter for critical, unread announcements
          const criticalUnread = data.filter((b: BroadcastWithStatus) => 
            b.priority === 'critical' && !b.is_read
          );

          if (criticalUnread.length > 0) {
            // Show the most recent one (first in array, as they're sorted by created_at DESC)
            setCriticalAnnouncement(criticalUnread[0]);
            setIsVisible(true);
            setIsDismissed(false);
          } else {
            setCriticalAnnouncement(null);
            setIsVisible(false);
          }
        } else {
          setCriticalAnnouncement(null);
          setIsVisible(false);
        }
      } catch (error) {
        // Fail silently
        if (isMounted) {
          setIsAvailable(false);
          setCriticalAnnouncement(null);
        }
      }
    };

    // Initial fetch
    fetchCriticalAnnouncement();

    // Poll every 30 seconds
    const pollInterval = setInterval(fetchCriticalAnnouncement, 30000);

    // Only subscribe to real-time if feature is available
    let broadcastsChannel: any;
    let readsChannel: any;

    if (isAvailable) {
      try {
        // Real-time subscription to broadcasts table for critical announcements
        broadcastsChannel = supabase
          .channel('critical-broadcasts-banner')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'broadcasts'
            },
            (payload) => {
              // Refresh if a critical broadcast is involved
              if (payload.new && (payload.new as any).priority === 'critical') {
                fetchCriticalAnnouncement();
              }
            }
          )
          .subscribe();

        // Subscribe to reads changes for the current user
        readsChannel = supabase
          .channel('critical-reads-banner')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'broadcast_reads',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              fetchCriticalAnnouncement();
            }
          )
          .subscribe();
      } catch (error) {
        // Real-time subscriptions failed, disable them
        setIsAvailable(false);
      }
    }

    // Cleanup
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (broadcastsChannel) {
        supabase.removeChannel(broadcastsChannel);
      }
      if (readsChannel) {
        supabase.removeChannel(readsChannel);
      }
    };
  }, [user, isAvailable]);

  const handleViewDetails = () => {
    if (!criticalAnnouncement) return;
    
    // Navigate to announcement detail page
    navigate(`/announcements/${criticalAnnouncement.id}`);
  };

  const handleAcknowledge = async () => {
    if (!criticalAnnouncement) return;

    setIsAcknowledging(true);
    try {
      await acknowledgeBroadcast(criticalAnnouncement.id);

      addToast({
        title: 'Acknowledged',
        description: 'Critical announcement acknowledged',
        type: 'success'
      });

      // Hide banner
      setIsVisible(false);
      setTimeout(() => {
        setCriticalAnnouncement(null);
      }, 300); // Wait for slide-up animation
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to acknowledge announcement',
        type: 'error'
      });
    } finally {
      setIsAcknowledging(false);
    }
  };

  const handleDismiss = async () => {
    if (!criticalAnnouncement) return;

    try {
      // Mark as read (soft dismiss - will still show in list but not in banner)
      await markBroadcastAsRead(criticalAnnouncement.id);

      // Hide banner with animation
      setIsVisible(false);
      setIsDismissed(true);

      setTimeout(() => {
        setCriticalAnnouncement(null);
      }, 300); // Wait for slide-up animation
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to dismiss announcement',
        type: 'error'
      });
    }
  };

  // Show logic
  const showBanner = 
    criticalAnnouncement &&
    criticalAnnouncement.priority === 'critical' &&
    !criticalAnnouncement.is_read &&
    !isDismissed &&
    isVisible;

  if (!showBanner) {
    return null;
  }

  return (
    <div className={`${styles.banner} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <AlertTriangle size={24} />
          </div>
          <div className={styles.textContent}>
            <div className={styles.title}>
              <span className={styles.urgent}>URGENT:</span> {criticalAnnouncement.title}
            </div>
            <div className={styles.subtitle}>
              {criticalAnnouncement.requires_acknowledgment 
                ? 'Immediate action required - Acknowledgment needed'
                : 'Immediate attention required'
              }
            </div>
          </div>
        </div>
        <div className={styles.actions}>
          <button
            onClick={handleViewDetails}
            className={styles.viewButton}
            title="View full details"
          >
            <Eye size={16} />
            View Details
          </button>
          {criticalAnnouncement.requires_acknowledgment && (
            <button
              onClick={handleAcknowledge}
              className={styles.acknowledgeButton}
              disabled={isAcknowledging}
              title="Acknowledge this announcement"
            >
              <CheckCircle size={16} />
              {isAcknowledging ? 'Acknowledging...' : 'Acknowledge'}
            </button>
          )}
          <button
            onClick={handleDismiss}
            className={styles.dismissButton}
            title="Dismiss this banner"
          >
            <X size={16} />
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default CriticalAnnouncementBanner;

