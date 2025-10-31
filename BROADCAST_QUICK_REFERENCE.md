# Broadcast System - Quick Reference

## 🚀 Quick Start

### 1. Installation
```sql
-- Run in Supabase SQL Editor
-- Execute: broadcast-system-setup.sql
```

### 2. Import Types & Service
```typescript
import { createBroadcast, getMyBroadcasts, markBroadcastAsRead } from '@/services/broadcast.service';
import type { BroadcastWithStatus } from '@/types/broadcast.types';
```

## 📝 Common Operations

### Create a Broadcast

```typescript
// To all users
await createBroadcast({
  title: 'Announcement',
  message: 'Important update for everyone',
  target_type: 'all'
});

// To specific vessels
await createBroadcast({
  title: 'Vessel Update',
  message: 'Maintenance scheduled',
  target_type: 'vessel',
  target_ids: ['vessel-id-1', 'vessel-id-2'],
  priority: 'important'
});

// Critical with acknowledgment
await createBroadcast({
  title: 'URGENT',
  message: 'Safety protocol update',
  target_type: 'all',
  priority: 'critical',
  requires_acknowledgment: true,
  pinned: true
});
```

### Get Broadcasts

```typescript
// All broadcasts for current user
const broadcasts = await getMyBroadcasts();

// Only unread
const unread = await getUnreadBroadcasts();

// Pinned
const pinned = await getPinnedBroadcasts();

// Requiring acknowledgment
const pending = await getBroadcastsRequiringAcknowledgment();
```

### Mark as Read / Acknowledge

```typescript
// Mark as read
await markBroadcastAsRead(broadcastId);

// Acknowledge (for broadcasts requiring acknowledgment)
await acknowledgeBroadcast(broadcastId);
```

### Get Analytics

```typescript
const analytics = await getBroadcastAnalytics(broadcastId);
// {
//   total_recipients: 150,
//   total_read: 120,
//   total_acknowledged: 100,
//   read_percentage: 80,
//   acknowledged_percentage: 66.67
// }
```

### Get Recipients

```typescript
const recipients = await getBroadcastRecipients(broadcastId);
// Array of users with read/acknowledgment status
```

## 🎯 Target Types

| Type | Description | Requires IDs |
|------|-------------|--------------|
| `all` | All users | No |
| `vessel` | Users on specific vessels | Yes |
| `rank` | Users with specific ranks | Yes |
| `status` | Users with specific statuses | Yes |
| `custom` | Specific user IDs | Yes |

## 📊 Priority Levels

| Priority | Use Case | Color |
|----------|----------|-------|
| `critical` | Safety issues, emergencies | Red |
| `important` | Important updates, deadlines | Orange |
| `normal` | Regular announcements | Blue |
| `info` | General information | Gray |

## 🔒 Permissions

### Create Broadcasts
- ✅ Company users
- ✅ Admins
- ❌ Seafarers

### View Broadcasts
- ✅ Seafarers: Only broadcasts targeted to them
- ✅ Company users: All company broadcasts
- ✅ Admins: All broadcasts

### View Analytics
- ✅ Broadcast sender
- ✅ Company users (same company)
- ✅ Admins

## 🔔 Real-time Subscriptions

```typescript
// Subscribe to new broadcasts
const channel = subscribeToBroadcasts((broadcast) => {
  console.log('New broadcast:', broadcast);
  // Update UI, show notification, etc.
});

// Unsubscribe
channel.unsubscribe();
```

## 📎 Attachments Format

```typescript
attachments: [
  {
    filename: 'document.pdf',
    url: 'https://storage.example.com/files/document.pdf',
    type: 'application/pdf',
    size: 245678
  }
]
```

## 🧪 Testing Checklist

- [ ] Create broadcast as company user
- [ ] Verify seafarer sees only targeted broadcasts
- [ ] Test read marking
- [ ] Test acknowledgment
- [ ] Check analytics accuracy
- [ ] Verify expiration filtering
- [ ] Test RLS policies

## 🐛 Common Issues

**"Permission denied"**
→ User must be authenticated and have correct user_type

**"Broadcast not found"**
→ Check RLS policies, broadcast might be expired or not targeted to user

**"Cannot view recipients"**
→ Only sender or company admins can view recipients

## 📚 Related Files

- SQL: `broadcast-system-setup.sql`
- Types: `src/types/broadcast.types.ts`
- Service: `src/services/broadcast.service.ts`
- Guide: `BROADCAST_SYSTEM_SETUP_GUIDE.md`

## 💡 Best Practices

1. ✅ Use appropriate priority levels
2. ✅ Set expiration for time-sensitive content
3. ✅ Require acknowledgment for critical updates
4. ✅ Pin important ongoing information
5. ✅ Monitor analytics for engagement
6. ✅ Target appropriately to avoid notification fatigue

## 🔗 RPC Functions

| Function | Purpose | Auth Required |
|----------|---------|---------------|
| `get_my_broadcasts()` | Get user's broadcasts | ✅ |
| `get_broadcast_recipients(id)` | Get recipients list | ✅ (sender/admin) |
| `mark_broadcast_as_read(id)` | Mark as read | ✅ |
| `acknowledge_broadcast(id)` | Acknowledge broadcast | ✅ |
| `get_broadcast_analytics(id)` | Get analytics | ✅ (sender/admin) |

## 🎨 UI Examples

### Broadcast Badge by Priority

```typescript
import { BROADCAST_PRIORITIES } from '@/types/broadcast.types';

const config = BROADCAST_PRIORITIES[broadcast.priority];
// {
//   label: 'Critical',
//   color: 'red',
//   icon: 'AlertTriangle',
//   badgeClass: 'bg-red-100 text-red-800...'
// }
```

### Filter Broadcasts

```typescript
const filtered = broadcasts.filter(b => {
  if (filters.priority && b.priority !== filters.priority) return false;
  if (filters.is_read !== undefined && b.is_read !== filters.is_read) return false;
  if (filters.pinned !== undefined && b.pinned !== filters.pinned) return false;
  return true;
});
```

## 🚨 Critical Workflows

### Send Critical Broadcast

```typescript
const broadcast = await createBroadcast({
  title: '🚨 URGENT: Safety Alert',
  message: 'All vessels must return to port immediately',
  priority: 'critical',
  target_type: 'all',
  requires_acknowledgment: true,
  pinned: true,
  expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
});

// Monitor acknowledgments
const analytics = await getBroadcastAnalytics(broadcast.id);
console.log(`${analytics.acknowledged_percentage}% acknowledged`);
```

### Check Pending Acknowledgments

```typescript
const pending = await getBroadcastsRequiringAcknowledgment();
if (pending.length > 0) {
  // Show warning UI
  console.log(`${pending.length} broadcasts need acknowledgment`);
}
```

