# Broadcast System Setup Guide

## Overview

The broadcast system allows company users and administrators to send announcements to multiple users based on various targeting criteria. This guide explains how to set up and use the broadcast system.

## Features

- ✅ **Multi-target broadcasts**: Send to all users, specific vessels, ranks, statuses, or custom user lists
- ✅ **Priority levels**: Critical, Important, Normal, Info
- ✅ **Read tracking**: Track who has read each broadcast
- ✅ **Acknowledgment tracking**: Require and track user acknowledgments
- ✅ **Attachments**: Support for file attachments (stored as JSONB)
- ✅ **Pinned broadcasts**: Pin important broadcasts to the top
- ✅ **Expiration**: Set expiration dates for time-sensitive broadcasts
- ✅ **Analytics**: View read and acknowledgment statistics
- ✅ **Row-Level Security**: Comprehensive RLS policies for data security

## Installation

### Step 1: Run the SQL Migration

Execute the migration file in your Supabase SQL Editor:

```bash
# In Supabase Dashboard -> SQL Editor
# Copy and paste the contents of broadcast-system-setup.sql
# Click "Run"
```

Or use the Supabase CLI:

```bash
supabase db push
```

### Step 2: Verify Installation

Check that the tables and functions were created:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('broadcasts', 'broadcast_reads');

-- Check functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%broadcast%';
```

## Database Schema

### Tables

#### `broadcasts`

Main table for broadcast messages.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| sender_id | UUID | Reference to user_profiles |
| title | TEXT | Broadcast title (required) |
| message | TEXT | Broadcast message (required) |
| priority | ENUM | Priority level (critical, important, normal, info) |
| target_type | ENUM | Target type (all, vessel, rank, status, custom) |
| target_ids | JSONB | Array of target IDs based on target_type |
| attachments | JSONB | Array of attachment objects |
| pinned | BOOLEAN | Whether broadcast is pinned |
| requires_acknowledgment | BOOLEAN | Whether acknowledgment is required |
| expires_at | TIMESTAMP | Expiration date/time |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

#### `broadcast_reads`

Tracks read and acknowledgment status for each user.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| broadcast_id | UUID | Reference to broadcasts |
| user_id | UUID | Reference to user_profiles |
| read_at | TIMESTAMP | When the broadcast was read |
| acknowledged_at | TIMESTAMP | When the broadcast was acknowledged |
| created_at | TIMESTAMP | Creation timestamp |

**Unique Constraint**: (broadcast_id, user_id) - prevents duplicate read records

## RPC Functions

### 1. `get_my_broadcasts()`

Returns all broadcasts visible to the current user with read/acknowledgment status.

**Usage:**
```sql
SELECT * FROM get_my_broadcasts();
```

**Returns:**
```typescript
{
  broadcast_id: string;
  sender_id: string;
  sender_name: string;
  title: string;
  message: string;
  priority: 'critical' | 'important' | 'normal' | 'info';
  target_type: 'all' | 'vessel' | 'rank' | 'status' | 'custom';
  target_ids: any;
  attachments: any;
  pinned: boolean;
  requires_acknowledgment: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  is_read: boolean;
  is_acknowledged: boolean;
  read_at: string | null;
  acknowledged_at: string | null;
}
```

### 2. `get_broadcast_recipients(broadcast_id UUID)`

Returns list of all users who should receive the broadcast with their read status.

**Usage:**
```sql
SELECT * FROM get_broadcast_recipients('broadcast-uuid-here');
```

**Permissions:** Only the sender or company admins can view recipients.

**Returns:**
```typescript
{
  user_id: string;
  full_name: string;
  email: string;
  user_type: string;
  is_read: boolean;
  is_acknowledged: boolean;
  read_at: string | null;
  acknowledged_at: string | null;
}
```

### 3. `mark_broadcast_as_read(broadcast_id UUID)`

Marks a broadcast as read for the current user.

**Usage:**
```sql
SELECT mark_broadcast_as_read('broadcast-uuid-here');
```

### 4. `acknowledge_broadcast(broadcast_id UUID)`

Acknowledges a broadcast (for broadcasts that require acknowledgment).

**Usage:**
```sql
SELECT acknowledge_broadcast('broadcast-uuid-here');
```

### 5. `get_broadcast_analytics(broadcast_id UUID)`

Returns read and acknowledgment statistics for a broadcast.

**Usage:**
```sql
SELECT * FROM get_broadcast_analytics('broadcast-uuid-here');
```

**Permissions:** Only the sender or company admins can view analytics.

**Returns:**
```typescript
{
  total_recipients: number;
  total_read: number;
  total_acknowledged: number;
  read_percentage: number;
  acknowledged_percentage: number;
}
```

## Usage Examples

### Example 1: Create a Broadcast to All Users

```typescript
const { data, error } = await supabase
  .from('broadcasts')
  .insert({
    sender_id: currentUser.id,
    title: 'Company-wide Announcement',
    message: 'All employees are invited to the annual meeting.',
    priority: 'important',
    target_type: 'all'
  });
```

### Example 2: Create a Broadcast to Specific Vessels

```typescript
const { data, error } = await supabase
  .from('broadcasts')
  .insert({
    sender_id: currentUser.id,
    title: 'Vessel Maintenance Notice',
    message: 'Scheduled maintenance for your vessel.',
    priority: 'normal',
    target_type: 'vessel',
    target_ids: ['vessel-uuid-1', 'vessel-uuid-2']
  });
```

### Example 3: Create a Broadcast to Specific Ranks

```typescript
const { data, error } = await supabase
  .from('broadcasts')
  .insert({
    sender_id: currentUser.id,
    title: 'Captain Training Update',
    message: 'New training requirements for captains.',
    priority: 'important',
    target_type: 'rank',
    target_ids: ['Captain', 'Chief Officer']
  });
```

### Example 4: Create a Critical Broadcast with Acknowledgment

```typescript
const { data, error } = await supabase
  .from('broadcasts')
  .insert({
    sender_id: currentUser.id,
    title: 'URGENT: Safety Protocol Update',
    message: 'New safety protocols must be acknowledged.',
    priority: 'critical',
    target_type: 'all',
    requires_acknowledgment: true,
    pinned: true
  });
```

### Example 5: Create a Broadcast with Expiration

```typescript
const expiryDate = new Date();
expiryDate.setDate(expiryDate.getDate() + 7); // Expires in 7 days

const { data, error } = await supabase
  .from('broadcasts')
  .insert({
    sender_id: currentUser.id,
    title: 'Limited Time Offer',
    message: 'Training discount available this week.',
    priority: 'info',
    target_type: 'all',
    expires_at: expiryDate.toISOString()
  });
```

### Example 6: Get User's Broadcasts

```typescript
const { data, error } = await supabase
  .rpc('get_my_broadcasts');

// Filter unread broadcasts
const unreadBroadcasts = data.filter(b => !b.is_read);

// Filter pinned broadcasts
const pinnedBroadcasts = data.filter(b => b.pinned);
```

### Example 7: Mark Broadcast as Read

```typescript
const { error } = await supabase
  .rpc('mark_broadcast_as_read', {
    p_broadcast_id: broadcastId
  });
```

### Example 8: Acknowledge Broadcast

```typescript
const { error } = await supabase
  .rpc('acknowledge_broadcast', {
    p_broadcast_id: broadcastId
  });
```

### Example 9: Get Broadcast Analytics

```typescript
const { data, error } = await supabase
  .rpc('get_broadcast_analytics', {
    p_broadcast_id: broadcastId
  });

console.log(`Read: ${data.read_percentage}%`);
console.log(`Acknowledged: ${data.acknowledged_percentage}%`);
```

### Example 10: Get Broadcast Recipients

```typescript
const { data, error } = await supabase
  .rpc('get_broadcast_recipients', {
    p_broadcast_id: broadcastId
  });

// Get list of users who haven't acknowledged
const pendingAcknowledgments = data.filter(r => !r.is_acknowledged);
```

## Target Types Explained

### 1. `all`
Targets all users in the system.
```json
{
  "target_type": "all",
  "target_ids": null
}
```

### 2. `vessel`
Targets users assigned to specific vessels.
```json
{
  "target_type": "vessel",
  "target_ids": ["vessel-uuid-1", "vessel-uuid-2"]
}
```

### 3. `rank`
Targets users with specific ranks (from seafarer_profiles).
```json
{
  "target_type": "rank",
  "target_ids": ["Captain", "Chief Officer", "Engineer"]
}
```

### 4. `status`
Targets users with specific availability statuses.
```json
{
  "target_type": "status",
  "target_ids": ["available", "on_contract"]
}
```

### 5. `custom`
Targets specific user IDs.
```json
{
  "target_type": "custom",
  "target_ids": ["user-uuid-1", "user-uuid-2", "user-uuid-3"]
}
```

## Attachments Format

Attachments are stored as JSONB arrays:

```json
{
  "attachments": [
    {
      "filename": "safety-protocol.pdf",
      "url": "https://storage.example.com/files/safety-protocol.pdf",
      "type": "application/pdf",
      "size": 245678
    },
    {
      "filename": "training-video.mp4",
      "url": "https://storage.example.com/files/training-video.mp4",
      "type": "video/mp4",
      "size": 15678900
    }
  ]
}
```

## Security & Permissions

### Row-Level Security Policies

1. **Creating Broadcasts**
   - Only company users and admins can create broadcasts
   - Users can only create broadcasts with their own sender_id

2. **Viewing Broadcasts**
   - Company users can view all broadcasts from their company
   - Admins can view all broadcasts
   - Seafarers can only view broadcasts targeted to them
   - Expired broadcasts are automatically filtered out for seafarers

3. **Updating/Deleting Broadcasts**
   - Users can only update/delete their own broadcasts
   - Must be a company user or admin

4. **Read Records**
   - Users can only view and manage their own read records
   - Company users can view read statistics for broadcasts from their company

## Testing

### Test 1: Create a Broadcast

```sql
-- As a company user
INSERT INTO broadcasts (
  sender_id,
  title,
  message,
  priority,
  target_type
) VALUES (
  auth.uid(),
  'Test Broadcast',
  'This is a test message',
  'normal',
  'all'
);
```

### Test 2: View Your Broadcasts

```sql
SELECT * FROM get_my_broadcasts();
```

### Test 3: Mark as Read

```sql
SELECT mark_broadcast_as_read('your-broadcast-id');
```

### Test 4: View Analytics

```sql
SELECT * FROM get_broadcast_analytics('your-broadcast-id');
```

## TypeScript Types

Here are TypeScript types you can use in your application:

```typescript
export type BroadcastPriority = 'critical' | 'important' | 'normal' | 'info';
export type BroadcastTargetType = 'all' | 'vessel' | 'rank' | 'status' | 'custom';

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

export interface BroadcastAttachment {
  filename: string;
  url: string;
  type: string;
  size: number;
}

export interface BroadcastRead {
  id: string;
  broadcast_id: string;
  user_id: string;
  read_at: string;
  acknowledged_at?: string | null;
  created_at: string;
}

export interface BroadcastWithStatus extends Broadcast {
  sender_name: string;
  is_read: boolean;
  is_acknowledged: boolean;
  read_at?: string | null;
  acknowledged_at?: string | null;
}

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

export interface BroadcastAnalytics {
  total_recipients: number;
  total_read: number;
  total_acknowledged: number;
  read_percentage: number;
  acknowledged_percentage: number;
}
```

## Troubleshooting

### Issue: "Permission denied for function get_my_broadcasts"

**Solution:** Make sure the user is authenticated. The functions require authentication.

### Issue: "Broadcast not found"

**Solution:** Check that:
1. The broadcast exists
2. The user has permission to view it
3. The broadcast hasn't expired (for seafarers)

### Issue: "You do not have permission to view recipients"

**Solution:** Only the broadcast sender or company admins can view recipients.

### Issue: Target filtering not working

**Solution:** Verify that:
1. `target_ids` is a valid JSON array
2. For vessel targeting, users must have active assignments
3. For rank/status targeting, seafarer profiles must have these fields populated

## Best Practices

1. **Use appropriate priority levels**
   - `critical`: Safety issues, urgent company-wide alerts
   - `important`: Important updates, deadlines
   - `normal`: Regular announcements, updates
   - `info`: General information, tips

2. **Set expiration dates for time-sensitive content**
   - Training deadlines
   - Event announcements
   - Limited-time offers

3. **Use acknowledgment for critical broadcasts**
   - Safety protocols
   - Policy updates
   - Compliance requirements

4. **Pin important broadcasts**
   - Ongoing important information
   - Reference materials
   - Active emergencies

5. **Monitor analytics**
   - Track read rates
   - Follow up on low engagement
   - Ensure critical broadcasts are acknowledged

## Next Steps

1. ✅ Run the SQL migration
2. ✅ Test basic broadcast creation
3. ✅ Verify RLS policies work correctly
4. ⬜ Implement UI components for broadcast management
5. ⬜ Add real-time subscriptions for new broadcasts
6. ⬜ Implement push notifications for critical broadcasts
7. ⬜ Add email notifications for unread critical broadcasts

## Support

For issues or questions:
1. Check the SQL file comments for implementation details
2. Review the RLS policies for permission issues
3. Test with different user types (seafarer, company, admin)
4. Check Supabase logs for detailed error messages

