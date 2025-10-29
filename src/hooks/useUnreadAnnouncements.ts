import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../lib/supabase';

/**
 * Custom hook to fetch and track unread announcements count
 * Polls every 30 seconds and subscribes to real-time updates
 */
export const useUnreadAnnouncements = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        // Call the RPC function to get unread broadcasts count
        const { data, error } = await supabase.rpc('get_unread_broadcasts_count');

        if (error) {
          return;
        }

        setUnreadCount(data || 0);
      } catch (error) {
        // Fail silently - will retry on next poll
      }
    };

    // Initial fetch
    fetchUnreadCount();

    // Poll every 30 seconds
    const pollInterval = setInterval(fetchUnreadCount, 30000);

    // Subscribe to real-time updates on broadcasts table
    const broadcastsChannel = supabase
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
    const readsChannel = supabase
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

    // Cleanup
    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(broadcastsChannel);
      supabase.removeChannel(readsChannel);
    };
  }, [user]);

  return unreadCount;
};

