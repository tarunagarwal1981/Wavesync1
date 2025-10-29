/**
 * Broadcast Service
 * 
 * Service for managing broadcast communications in the WaveSync platform.
 * Provides methods for creating, reading, and managing broadcasts.
 */

import { supabase } from '@/lib/supabase';
import type {
  Broadcast,
  BroadcastWithStatus,
  BroadcastRecipient,
  BroadcastAnalytics,
  CreateBroadcastData,
  UpdateBroadcastData,
} from '@/types/broadcast.types';

// ============================================================================
// BROADCAST CRUD OPERATIONS
// ============================================================================

/**
 * Create a new broadcast
 */
export async function createBroadcast(data: CreateBroadcastData): Promise<Broadcast> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data: broadcast, error } = await supabase
    .from('broadcasts')
    .insert({
      sender_id: user.user.id,
      title: data.title,
      message: data.message,
      priority: data.priority || 'normal',
      target_type: data.target_type,
      target_ids: data.target_ids || null,
      attachments: data.attachments || null,
      pinned: data.pinned || false,
      requires_acknowledgment: data.requires_acknowledgment || false,
      expires_at: data.expires_at || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create broadcast: ${error.message}`);
  }

  return broadcast;
}

/**
 * Update an existing broadcast
 */
export async function updateBroadcast(
  broadcastId: string,
  data: UpdateBroadcastData
): Promise<Broadcast> {
  const { data: broadcast, error } = await supabase
    .from('broadcasts')
    .update(data)
    .eq('id', broadcastId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update broadcast: ${error.message}`);
  }

  return broadcast;
}

/**
 * Delete a broadcast
 */
export async function deleteBroadcast(broadcastId: string): Promise<void> {
  const { error } = await supabase
    .from('broadcasts')
    .delete()
    .eq('id', broadcastId);

  if (error) {
    throw new Error(`Failed to delete broadcast: ${error.message}`);
  }
}

/**
 * Get a single broadcast by ID
 */
export async function getBroadcast(broadcastId: string): Promise<Broadcast> {
  const { data: broadcast, error } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('id', broadcastId)
    .single();

  if (error) {
    throw new Error(`Failed to get broadcast: ${error.message}`);
  }

  return broadcast;
}

// ============================================================================
// USER BROADCASTS
// ============================================================================

/**
 * Get all broadcasts visible to the current user
 */
export async function getMyBroadcasts(): Promise<BroadcastWithStatus[]> {
  const { data, error } = await supabase.rpc('get_my_broadcasts');

  if (error) {
    throw new Error(`Failed to get broadcasts: ${error.message}`);
  }

  return data || [];
}

/**
 * Get unread broadcasts for the current user
 */
export async function getUnreadBroadcasts(): Promise<BroadcastWithStatus[]> {
  const broadcasts = await getMyBroadcasts();
  return broadcasts.filter(b => !b.is_read);
}

/**
 * Get pinned broadcasts for the current user
 */
export async function getPinnedBroadcasts(): Promise<BroadcastWithStatus[]> {
  const broadcasts = await getMyBroadcasts();
  return broadcasts.filter(b => b.pinned);
}

/**
 * Get broadcasts requiring acknowledgment
 */
export async function getBroadcastsRequiringAcknowledgment(): Promise<BroadcastWithStatus[]> {
  const broadcasts = await getMyBroadcasts();
  return broadcasts.filter(b => b.requires_acknowledgment && !b.is_acknowledged);
}

// ============================================================================
// READ & ACKNOWLEDGMENT
// ============================================================================

/**
 * Mark a broadcast as read
 */
export async function markBroadcastAsRead(broadcastId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_broadcast_as_read', {
    p_broadcast_id: broadcastId,
  });

  if (error) {
    throw new Error(`Failed to mark broadcast as read: ${error.message}`);
  }
}

/**
 * Acknowledge a broadcast
 */
export async function acknowledgeBroadcast(broadcastId: string): Promise<void> {
  const { error } = await supabase.rpc('acknowledge_broadcast', {
    p_broadcast_id: broadcastId,
  });

  if (error) {
    throw new Error(`Failed to acknowledge broadcast: ${error.message}`);
  }
}

// ============================================================================
// ANALYTICS & RECIPIENTS
// ============================================================================

/**
 * Get analytics for a broadcast
 */
export async function getBroadcastAnalytics(
  broadcastId: string
): Promise<BroadcastAnalytics> {
  const { data, error } = await supabase.rpc('get_broadcast_analytics', {
    p_broadcast_id: broadcastId,
  });

  if (error) {
    throw new Error(`Failed to get broadcast analytics: ${error.message}`);
  }

  return data[0];
}

/**
 * Get recipients for a broadcast
 */
export async function getBroadcastRecipients(
  broadcastId: string
): Promise<BroadcastRecipient[]> {
  const { data, error } = await supabase.rpc('get_broadcast_recipients', {
    p_broadcast_id: broadcastId,
  });

  if (error) {
    throw new Error(`Failed to get broadcast recipients: ${error.message}`);
  }

  return data || [];
}

// ============================================================================
// COMPANY BROADCASTS
// ============================================================================

/**
 * Get all broadcasts sent by the current user's company
 */
export async function getCompanyBroadcasts(): Promise<Broadcast[]> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  // Get user profile to find company_id
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('company_id')
    .eq('id', user.user.id)
    .single();

  if (!profile?.company_id) {
    return [];
  }

  // Get all broadcasts from users in the same company
  const { data: broadcasts, error } = await supabase
    .from('broadcasts')
    .select(`
      *,
      sender:user_profiles!sender_id (
        full_name,
        email
      )
    `)
    .in('sender_id', 
      supabase
        .from('user_profiles')
        .select('id')
        .eq('company_id', profile.company_id)
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get company broadcasts: ${error.message}`);
  }

  return broadcasts || [];
}

/**
 * Get broadcasts created by the current user
 */
export async function getMyCreatedBroadcasts(): Promise<Broadcast[]> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data: broadcasts, error } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('sender_id', user.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get created broadcasts: ${error.message}`);
  }

  return broadcasts || [];
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

/**
 * Subscribe to new broadcasts
 */
export function subscribeToBroadcasts(
  callback: (broadcast: Broadcast) => void
) {
  return supabase
    .channel('broadcasts')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'broadcasts',
      },
      (payload) => {
        callback(payload.new as Broadcast);
      }
    )
    .subscribe();
}

/**
 * Subscribe to broadcast updates
 */
export function subscribeToBroadcastUpdates(
  broadcastId: string,
  callback: (broadcast: Broadcast) => void
) {
  return supabase
    .channel(`broadcast:${broadcastId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'broadcasts',
        filter: `id=eq.${broadcastId}`,
      },
      (payload) => {
        callback(payload.new as Broadcast);
      }
    )
    .subscribe();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a broadcast has expired
 */
export function isBroadcastExpired(broadcast: Broadcast): boolean {
  if (!broadcast.expires_at) {
    return false;
  }
  return new Date(broadcast.expires_at) < new Date();
}

/**
 * Get the number of days until a broadcast expires
 */
export function getDaysUntilExpiry(broadcast: Broadcast): number | null {
  if (!broadcast.expires_at) {
    return null;
  }
  const now = new Date();
  const expiry = new Date(broadcast.expires_at);
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format broadcast date for display
 */
export function formatBroadcastDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

