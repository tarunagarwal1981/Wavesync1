/**
 * Broadcast System Type Definitions
 * 
 * These types correspond to the database schema defined in broadcast-system-setup.sql
 */

// ============================================================================
// ENUMS
// ============================================================================

export type BroadcastPriority = 'critical' | 'important' | 'normal' | 'info';
export type BroadcastTargetType = 'all' | 'vessel' | 'rank' | 'status' | 'custom';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Broadcast attachment object
 */
export interface BroadcastAttachment {
  filename: string;
  url: string;
  type: string;
  size: number;
}

/**
 * Main broadcast record
 */
export interface Broadcast {
  id: string;
  sender_id: string;
  title: string;
  message: string;
  priority: BroadcastPriority;
  target_type: BroadcastTargetType;
  target_ids?: string[] | null;
  attachments?: BroadcastAttachment[] | null;
  pinned: boolean;
  requires_acknowledgment: boolean;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Broadcast read/acknowledgment record
 */
export interface BroadcastRead {
  id: string;
  broadcast_id: string;
  user_id: string;
  read_at: string;
  acknowledged_at?: string | null;
  created_at: string;
}

/**
 * Broadcast with read status (returned by get_my_broadcasts)
 */
export interface BroadcastWithStatus extends Broadcast {
  sender_name: string;
  is_read: boolean;
  is_acknowledged: boolean;
  read_at?: string | null;
  acknowledged_at?: string | null;
}

/**
 * Broadcast recipient info (returned by get_broadcast_recipients)
 */
export interface BroadcastRecipient {
  user_id: string;
  full_name: string;
  email: string;
  user_type: string;
  is_read: boolean;
  is_acknowledged: boolean;
  read_at?: string | null;
  acknowledged_at?: string | null;
}

/**
 * Broadcast analytics (returned by get_broadcast_analytics)
 */
export interface BroadcastAnalytics {
  total_recipients: number;
  total_read: number;
  total_acknowledged: number;
  read_percentage: number;
  acknowledged_percentage: number;
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

/**
 * Data structure for creating a new broadcast
 */
export interface CreateBroadcastData {
  title: string;
  message: string;
  priority?: BroadcastPriority;
  target_type: BroadcastTargetType;
  target_ids?: string[];
  attachments?: BroadcastAttachment[];
  pinned?: boolean;
  requires_acknowledgment?: boolean;
  expires_at?: string;
}

/**
 * Data structure for updating a broadcast
 */
export interface UpdateBroadcastData {
  title?: string;
  message?: string;
  priority?: BroadcastPriority;
  pinned?: boolean;
  expires_at?: string;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Filters for broadcast list
 */
export interface BroadcastFilters {
  priority?: BroadcastPriority;
  target_type?: BroadcastTargetType;
  is_read?: boolean;
  is_acknowledged?: boolean;
  pinned?: boolean;
  sender_id?: string;
}

// ============================================================================
// UI HELPER TYPES
// ============================================================================

/**
 * Priority configuration for UI display
 */
export interface PriorityConfig {
  label: string;
  color: string;
  icon: string;
  badgeClass: string;
}

/**
 * Target type configuration for UI display
 */
export interface TargetTypeConfig {
  label: string;
  description: string;
  icon: string;
  requiresTargetIds: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const BROADCAST_PRIORITIES: Record<BroadcastPriority, PriorityConfig> = {
  critical: {
    label: 'Critical',
    color: 'red',
    icon: 'AlertTriangle',
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
  important: {
    label: 'Important',
    color: 'orange',
    icon: 'AlertCircle',
    badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  },
  normal: {
    label: 'Normal',
    color: 'blue',
    icon: 'Info',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  info: {
    label: 'Info',
    color: 'gray',
    icon: 'MessageSquare',
    badgeClass: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  },
};

export const BROADCAST_TARGET_TYPES: Record<BroadcastTargetType, TargetTypeConfig> = {
  all: {
    label: 'All Users',
    description: 'Send to all users in the system',
    icon: 'Users',
    requiresTargetIds: false,
  },
  vessel: {
    label: 'By Vessel',
    description: 'Send to users assigned to specific vessels',
    icon: 'Ship',
    requiresTargetIds: true,
  },
  rank: {
    label: 'By Rank',
    description: 'Send to users with specific ranks',
    icon: 'Award',
    requiresTargetIds: true,
  },
  status: {
    label: 'By Status',
    description: 'Send to users with specific availability status',
    icon: 'UserCheck',
    requiresTargetIds: true,
  },
  custom: {
    label: 'Custom Selection',
    description: 'Send to specific selected users',
    icon: 'UserPlus',
    requiresTargetIds: true,
  },
};

