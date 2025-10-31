import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../lib/supabase';

/**
 * Custom hook to fetch and track unread announcements count
 * Polls every 30 seconds and subscribes to real-time updates
 */
export const useUnreadAnnouncements = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    if (!isAvailable) {
      setUnreadCount(0);
      return;
    }

    let isMounted = true;

    const fetchUnreadCount = async () => {
      try {
        // Call the RPC function to get unread broadcasts count
        const { data, error } = await supabase.rpc('get_unread_broadcasts_count');

        if (!isMounted) return;

        // If RPC function doesn't exist (404), disable the hook
        if (error) {
          if (error.message?.includes('404') || error.code === '42883' || error.code === 'PGRST202') {
            setIsAvailable(false);
            setUnreadCount(0);
          }
          return;
        }

        setUnreadCount(data || 0);
      } catch (error) {
        // Fail silently - will retry on next poll
        if (isMounted) {
          setIsAvailable(false);
          setUnreadCount(0);
        }
      }
    };

    // Initial fetch
    fetchUnreadCount();

    // Poll every 30 seconds
    const pollInterval = setInterval(fetchUnreadCount, 30000);

    // Only subscribe to real-time if feature is available
    let broadcastsChannel: any;
    let readsChannel: any;

    if (isAvailable) {
      try {
        // Subscribe to real-time updates on broadcasts table
        broadcastsChannel = supabase
          .channel('broadcasts-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'broadcasts'
            },
            () => {
              // Refresh count when broadcasts change
              fetchUnreadCount();
            }
          )
          .subscribe();

        // Subscribe to real-time updates on broadcast_reads table
        readsChannel = supabase
          .channel('broadcast-reads-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'broadcast_reads',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              // Refresh count when user reads broadcasts
              fetchUnreadCount();
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

  return unreadCount;
};

