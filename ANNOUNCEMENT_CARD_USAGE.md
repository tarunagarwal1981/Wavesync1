# AnnouncementCard Component - Usage Guide

## 📦 Quick Start

### Import the Component

```typescript
// Option 1: Direct import
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard';

// Option 2: Named import from index
import { AnnouncementCard } from '@/components/announcements';

// With types
import { AnnouncementCard, type AnnouncementCardProps } from '@/components/announcements';
```

---

## 🔄 Integration with AnnouncementsPage

### Current Structure (AnnouncementsPage.tsx)

The `AnnouncementsPage.tsx` currently has an inline `AnnouncementCard` component. You can replace it with this reusable component.

### Step 1: Import the Component

At the top of `AnnouncementsPage.tsx`, add:

```typescript
import { AnnouncementCard } from '@/components/announcements';
```

### Step 2: Replace the Inline Component

**Old (inline in AnnouncementsPage.tsx):**
```typescript
const AnnouncementCard: React.FC<{
  broadcast: BroadcastWithStatus;
  onMarkAsRead: (id: string) => Promise<void>;
  onAcknowledge: (id: string) => Promise<void>;
  formatTime: (date: string) => string;
  getPriorityIcon: (priority: BroadcastPriority) => JSX.Element;
}> = ({ broadcast, onMarkAsRead, onAcknowledge, formatTime, getPriorityIcon }) => {
  // ... component code ...
};
```

**New (using reusable component):**
```typescript
// Remove the inline component definition entirely
// Use the imported component instead
```

### Step 3: Update the Usage in JSX

**Old:**
```typescript
<AnnouncementCard
  broadcast={broadcast}
  onMarkAsRead={handleMarkAsRead}
  onAcknowledge={handleAcknowledge}
  formatTime={formatTime}
  getPriorityIcon={getPriorityIcon}
/>
```

**New:**
```typescript
<AnnouncementCard
  id={broadcast.broadcast_id}
  title={broadcast.title}
  message={broadcast.message}
  priority={broadcast.priority as 'critical' | 'important' | 'normal' | 'info'}
  senderName={broadcast.sender_name}
  createdAt={broadcast.created_at}
  isRead={broadcast.is_read}
  isPinned={broadcast.pinned}
  requiresAcknowledgment={broadcast.requires_acknowledgment}
  isAcknowledged={broadcast.is_acknowledged}
  attachments={broadcast.attachments}
  onRead={handleMarkAsRead}
  onAcknowledge={handleAcknowledge}
  onClick={handleOpenAnnouncement}
/>
```

### Step 4: Add Click Handler

Add a handler for opening announcements:

```typescript
const handleOpenAnnouncement = (id: string) => {
  // Navigate to announcement detail page
  console.log('Opening announcement:', id);
  // TODO: Navigate to /announcements/:id
};
```

---

## 📋 Complete Example

Here's a complete example of how to use the component in a list:

```typescript
import React, { useState, useEffect } from 'react';
import { AnnouncementCard } from '@/components/announcements';
import { getMyBroadcasts, markBroadcastAsRead, acknowledgeBroadcast } from '@/services/broadcast.service';
import type { BroadcastWithStatus } from '@/types/broadcast.types';

const AnnouncementsPage: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<BroadcastWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const data = await getMyBroadcasts();
      setBroadcasts(data);
    } catch (error) {
      console.error('Failed to fetch broadcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markBroadcastAsRead(id);
      // Update local state
      setBroadcasts(prev =>
        prev.map(b => b.broadcast_id === id ? { ...b, is_read: true } : b)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeBroadcast(id);
      // Update local state
      setBroadcasts(prev =>
        prev.map(b => 
          b.broadcast_id === id 
            ? { ...b, is_acknowledged: true, is_read: true } 
            : b
        )
      );
    } catch (error) {
      console.error('Failed to acknowledge:', error);
    }
  };

  const handleOpenAnnouncement = (id: string) => {
    console.log('Opening announcement:', id);
    // TODO: Navigate to detail view
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Announcements</h1>
      </header>

      <div className={styles.feed}>
        {broadcasts.map(broadcast => (
          <AnnouncementCard
            key={broadcast.broadcast_id}
            id={broadcast.broadcast_id}
            title={broadcast.title}
            message={broadcast.message}
            priority={broadcast.priority as 'critical' | 'important' | 'normal' | 'info'}
            senderName={broadcast.sender_name}
            createdAt={broadcast.created_at}
            isRead={broadcast.is_read}
            isPinned={broadcast.pinned}
            requiresAcknowledgment={broadcast.requires_acknowledgment}
            isAcknowledged={broadcast.is_acknowledged}
            attachments={broadcast.attachments}
            onRead={handleMarkAsRead}
            onAcknowledge={handleAcknowledge}
            onClick={handleOpenAnnouncement}
          />
        ))}
      </div>
    </div>
  );
};
```

---

## 🎨 Styling in Parent Container

### Recommended List Layout

```css
/* In your page CSS module */
.feed {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md); /* 16px gap between cards */
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}
```

### Grid Layout (Optional)

```css
.feed {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
}

@media (max-width: 768px) {
  .feed {
    grid-template-columns: 1fr;
  }
}
```

---

## 🔧 Props Reference

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Unique identifier for the announcement |
| `title` | `string` | Announcement title |
| `message` | `string` | Full message content (will be truncated in preview) |
| `priority` | `'critical' \| 'important' \| 'normal' \| 'info'` | Priority level |
| `senderName` | `string` | Name of the sender |
| `createdAt` | `string` | ISO timestamp |
| `isRead` | `boolean` | Whether the announcement has been read |
| `isPinned` | `boolean` | Whether the announcement is pinned |
| `requiresAcknowledgment` | `boolean` | Whether acknowledgment is required |
| `isAcknowledged` | `boolean` | Whether the announcement has been acknowledged |
| `onRead` | `(id: string) => void` | Callback when marked as read |
| `onAcknowledge` | `(id: string) => void` | Callback when acknowledged |
| `onClick` | `(id: string) => void` | Callback when card is clicked |

### Optional Props

| Prop | Type | Description |
|------|------|-------------|
| `attachments` | `Array<{ url: string; filename: string }>` | List of attachments |

---

## 🎯 Event Handling

### onRead Callback

**Triggered:** When user clicks the card and it's unread

**Purpose:** Mark the announcement as read in the database

**Example:**
```typescript
const handleRead = async (id: string) => {
  try {
    await markBroadcastAsRead(id);
    // Update state to reflect read status
    setBroadcasts(prev => 
      prev.map(b => b.id === id ? { ...b, isRead: true } : b)
    );
  } catch (error) {
    console.error('Failed to mark as read:', error);
  }
};
```

### onAcknowledge Callback

**Triggered:** When user clicks the "Acknowledge" button

**Purpose:** Record acknowledgment in the database

**Example:**
```typescript
const handleAcknowledge = async (id: string) => {
  try {
    await acknowledgeBroadcast(id);
    // Update state to reflect acknowledged status
    setBroadcasts(prev => 
      prev.map(b => 
        b.id === id 
          ? { ...b, isAcknowledged: true, isRead: true } 
          : b
      )
    );
    toast.success('Announcement acknowledged');
  } catch (error) {
    console.error('Failed to acknowledge:', error);
    toast.error('Failed to acknowledge announcement');
  }
};
```

### onClick Callback

**Triggered:** When user clicks anywhere on the card (except acknowledge button)

**Purpose:** Open the full announcement view

**Example:**
```typescript
const handleClick = (id: string) => {
  // Navigate to detail page
  navigate(`/announcements/${id}`);
  
  // Or open modal
  setSelectedAnnouncementId(id);
  setIsModalOpen(true);
};
```

---

## 💡 Tips & Best Practices

### 1. Optimistic Updates

Update the UI immediately before the API call completes:

```typescript
const handleMarkAsRead = async (id: string) => {
  // Optimistic update
  setBroadcasts(prev =>
    prev.map(b => b.id === id ? { ...b, isRead: true } : b)
  );
  
  try {
    await markBroadcastAsRead(id);
  } catch (error) {
    // Rollback on error
    setBroadcasts(prev =>
      prev.map(b => b.id === id ? { ...b, isRead: false } : b)
    );
    toast.error('Failed to mark as read');
  }
};
```

### 2. Loading States

Show loading state while fetching:

```typescript
{loading ? (
  <div className={styles.loading}>
    <RefreshCw className={styles.spin} />
    <p>Loading announcements...</p>
  </div>
) : (
  broadcasts.map(broadcast => (
    <AnnouncementCard key={broadcast.id} {...props} />
  ))
)}
```

### 3. Empty State

Show empty state when no announcements:

```typescript
{broadcasts.length === 0 && (
  <div className={styles.empty}>
    <Megaphone size={48} />
    <p>No announcements yet</p>
  </div>
)}
```

### 4. Filtering

Filter announcements by priority:

```typescript
const [activeFilter, setActiveFilter] = useState<string>('all');

const filteredBroadcasts = broadcasts.filter(b => 
  activeFilter === 'all' || b.priority === activeFilter
);
```

### 5. Sorting

Sort announcements (pinned first, then by date):

```typescript
const sortedBroadcasts = [...broadcasts].sort((a, b) => {
  // Pinned first
  if (a.isPinned !== b.isPinned) {
    return a.isPinned ? -1 : 1;
  }
  // Then by date (newest first)
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
});
```

---

## 🎨 Customization

### Custom Styling

You can wrap the card in a custom container:

```typescript
<div className={styles.customWrapper}>
  <AnnouncementCard {...props} />
</div>
```

```css
.customWrapper {
  padding: var(--spacing-sm);
  border-radius: var(--radius-lg);
  background: var(--color-background-alt);
}
```

### Priority Badge Colors

The component uses these CSS classes for priority styling:
- `.priorityCritical` - Red border
- `.priorityImportant` - Orange border
- `.priorityNormal` - Blue border
- `.priorityInfo` - Gray border

You can override these in your parent CSS if needed.

---

## 🔗 Related Components

### Potential Future Components

1. **AnnouncementDetail** - Full view of a single announcement
2. **AnnouncementList** - Wrapper component with filtering/sorting
3. **AnnouncementFilters** - Filter bar component
4. **AnnouncementStats** - Statistics dashboard

---

## 🐛 Troubleshooting

### Card Not Showing?

Check that all required props are provided:
```typescript
// ❌ Missing props
<AnnouncementCard id="123" />

// ✅ All required props
<AnnouncementCard
  id="123"
  title="Title"
  message="Message"
  priority="normal"
  senderName="Admin"
  createdAt="2025-10-28T10:00:00Z"
  isRead={false}
  isPinned={false}
  requiresAcknowledgment={false}
  isAcknowledged={false}
  onRead={() => {}}
  onAcknowledge={() => {}}
  onClick={() => {}}
/>
```

### Click Not Working?

Make sure callbacks are defined:
```typescript
// ❌ Undefined callback
onClick={undefined}

// ✅ Valid callback
onClick={(id) => console.log('Clicked:', id)}
```

### Styling Issues?

Ensure Ocean Breeze variables are available:
```typescript
import '@/styles/variables.css';
```

---

## ✅ Checklist for Integration

- [ ] Import `AnnouncementCard` component
- [ ] Remove inline card component (if any)
- [ ] Map broadcast data to card props
- [ ] Implement `onRead` handler
- [ ] Implement `onAcknowledge` handler
- [ ] Implement `onClick` handler
- [ ] Test with different priority levels
- [ ] Test with pinned/unpinned announcements
- [ ] Test with read/unread status
- [ ] Test with attachments
- [ ] Test acknowledgment flow
- [ ] Test responsive behavior
- [ ] Verify Ocean Breeze styling
- [ ] Check TypeScript types
- [ ] Test in different browsers

---

**Ready to use!** 🎉

Import, configure props, and start displaying beautiful announcement cards.

