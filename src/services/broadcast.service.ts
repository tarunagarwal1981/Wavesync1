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

  if (!data) {
    return [];
  }

  // Transform broadcast_id to id to match TypeScript types
  return data.map((b: any) => ({
    ...b,
    id: b.broadcast_id || b.id, // Use broadcast_id if present, fallback to id
  })) as BroadcastWithStatus[];
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
 * Uses direct table insert/update instead of RPC function for reliability
 */
export async function markBroadcastAsRead(broadcastId: string): Promise<void> {
  console.log('📖 markBroadcastAsRead called with broadcastId:', broadcastId);
  
  // Validate broadcastId
  if (!broadcastId || broadcastId === 'undefined' || broadcastId === 'null') {
    console.error('❌ Invalid broadcast ID:', broadcastId);
    throw new Error('Invalid broadcast ID');
  }

  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    console.error('❌ User not authenticated');
    throw new Error('User not authenticated');
  }

  console.log('✅ User authenticated:', user.user.id);

  const readAt = new Date().toISOString();
  console.log('🕐 Setting read_at to:', readAt);

  // Try to update first (if record exists)
  console.log('🔄 Attempting to update existing record...');
  const { data: updateData, error: updateError } = await supabase
    .from('broadcast_reads')
    .update({ read_at: readAt })
    .eq('broadcast_id', broadcastId)
    .eq('user_id', user.user.id)
    .select()
    .maybeSingle(); // Use maybeSingle() instead of single() to avoid error if not found

  console.log('📊 Update result:', { updateData, updateError: updateError?.message });

  // If update returned data, we're done
  if (updateData && !updateError) {
    console.log('✅ Successfully updated existing record');
    return;
  }

  // If update failed or no rows updated, try insert
  console.log('➕ Attempting to insert new record...');
  const { error: insertError } = await supabase
    .from('broadcast_reads')
    .insert({
      broadcast_id: broadcastId,
      user_id: user.user.id,
      read_at: readAt,
    });

  console.log('📊 Insert result:', { insertError: insertError?.message, insertErrorCode: insertError?.code });

  if (insertError) {
    // If insert fails due to duplicate, try update again (race condition handling)
    if (insertError.code === '23505') { // Unique violation
      console.log('⚠️ Duplicate key detected, retrying update...');
      const { error: retryUpdateError } = await supabase
        .from('broadcast_reads')
        .update({ read_at: readAt })
        .eq('broadcast_id', broadcastId)
        .eq('user_id', user.user.id);

      if (retryUpdateError) {
        console.error('❌ Retry update failed:', retryUpdateError.message);
        throw new Error(`Failed to mark broadcast as read: ${retryUpdateError.message}`);
      }
      console.log('✅ Retry update succeeded');
    } else {
      console.error('❌ Insert failed:', insertError.message);
      throw new Error(`Failed to mark broadcast as read: ${insertError.message}`);
    }
  } else {
    console.log('✅ Successfully inserted new record');
  }
}

/**
 * Acknowledge a broadcast
 * Uses direct table insert/update instead of RPC function for reliability
 */
export async function acknowledgeBroadcast(broadcastId: string): Promise<void> {
  console.log('✅ acknowledgeBroadcast called with broadcastId:', broadcastId);
  
  // Validate broadcastId
  if (!broadcastId || broadcastId === 'undefined' || broadcastId === 'null') {
    console.error('❌ Invalid broadcast ID:', broadcastId);
    throw new Error('Invalid broadcast ID');
  }

  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    console.error('❌ User not authenticated');
    throw new Error('User not authenticated');
  }

  console.log('✅ User authenticated:', user.user.id);

  // Check if broadcast requires acknowledgment
  console.log('🔍 Checking if broadcast requires acknowledgment...');
  const { data: broadcast, error: broadcastError } = await supabase
    .from('broadcasts')
    .select('requires_acknowledgment')
    .eq('id', broadcastId)
    .maybeSingle(); // Use maybeSingle() to avoid error if not found

  console.log('📊 Broadcast check result:', { broadcast, broadcastError: broadcastError?.message });

  if (broadcastError) {
    console.error('❌ Broadcast fetch error:', broadcastError.message);
    throw new Error(`Broadcast not found: ${broadcastError.message}`);
  }

  if (!broadcast) {
    console.error('❌ Broadcast not found');
    throw new Error('Broadcast not found');
  }

  if (!broadcast.requires_acknowledgment) {
    console.error('❌ Broadcast does not require acknowledgment');
    throw new Error('This broadcast does not require acknowledgment');
  }

  console.log('✅ Broadcast requires acknowledgment, proceeding...');

  const now = new Date().toISOString();
  console.log('🕐 Setting acknowledged_at and read_at to:', now);

  // Try to update first (if record exists)
  console.log('🔄 Attempting to update existing record...');
  const { data: updateData, error: updateError } = await supabase
    .from('broadcast_reads')
    .update({
      acknowledged_at: now,
      read_at: now, // Also mark as read
    })
    .eq('broadcast_id', broadcastId)
    .eq('user_id', user.user.id)
    .select()
    .maybeSingle(); // Use maybeSingle() instead of single() to avoid error if not found

  console.log('📊 Update result:', { updateData, updateError: updateError?.message });

  // If update returned data, we're done
  if (updateData && !updateError) {
    console.log('✅ Successfully updated existing record');
    return;
  }

  // If update failed, try insert
  console.log('➕ Attempting to insert new record...');
  const { error: insertError } = await supabase
    .from('broadcast_reads')
    .insert({
      broadcast_id: broadcastId,
      user_id: user.user.id,
      read_at: now,
      acknowledged_at: now,
    });

  console.log('📊 Insert result:', { insertError: insertError?.message, insertErrorCode: insertError?.code });

  if (insertError) {
    // If insert fails due to duplicate, try update again (race condition handling)
    if (insertError.code === '23505') { // Unique violation
      console.log('⚠️ Duplicate key detected, retrying update...');
      const { error: retryUpdateError } = await supabase
        .from('broadcast_reads')
        .update({
          acknowledged_at: now,
          read_at: now,
        })
        .eq('broadcast_id', broadcastId)
        .eq('user_id', user.user.id);

      if (retryUpdateError) {
        console.error('❌ Retry update failed:', retryUpdateError.message);
        throw new Error(`Failed to acknowledge broadcast: ${retryUpdateError.message}`);
      }
      console.log('✅ Retry update succeeded');
    } else {
      console.error('❌ Insert failed:', insertError.message);
      throw new Error(`Failed to acknowledge broadcast: ${insertError.message}`);
    }
  } else {
    console.log('✅ Successfully inserted new record');
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

  // First, get all user IDs in the company
  const { data: companyUsers, error: usersError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('company_id', profile.company_id);

  if (usersError) {
    throw new Error(`Failed to get company users: ${usersError.message}`);
  }

  if (!companyUsers || companyUsers.length === 0) {
    return [];
  }

  const userIds = companyUsers.map(u => u.id);

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
    .in('sender_id', userIds)
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

