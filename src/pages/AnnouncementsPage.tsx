import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { 
  Megaphone, 
  Pin, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Bell,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import styles from './AnnouncementsPage.module.css';
import { getMyBroadcasts, markBroadcastAsRead, acknowledgeBroadcast } from '../services/broadcast.service';
import { AnnouncementCardSkeleton } from '../components/announcements/AnnouncementCardSkeleton';
import type { BroadcastWithStatus } from '../types/broadcast.types';
import type { BroadcastPriority } from '../types/broadcast.types';

type FilterType = 'all' | BroadcastPriority;

export const AnnouncementsPage: React.FC = () => {
  const { addToast } = useToast();

  const [broadcasts, setBroadcasts] = useState<BroadcastWithStatus[]>([]);
  const [filteredBroadcasts, setFilteredBroadcasts] = useState<BroadcastWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch broadcasts on mount and poll every 5 seconds
  useEffect(() => {
    fetchBroadcasts();

    // Poll for updates every 5 seconds (similar to MessagingPage)
    const interval = setInterval(() => {
      fetchBroadcasts();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Filter broadcasts when filter or broadcasts change
  useEffect(() => {
    filterBroadcasts();
  }, [activeFilter, broadcasts]);

  const fetchBroadcasts = async () => {
    try {
      setError(null);
      const data = await getMyBroadcasts();
      setBroadcasts(data);
    } catch (error: any) {
      setError(error.message || 'Failed to load announcements');
      
      // Only show toast on refresh, not initial load
      if (!loading) {
        addToast({
          title: 'Error',
          description: 'Failed to load announcements',
          type: 'error'
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterBroadcasts = () => {
    if (activeFilter === 'all') {
      setFilteredBroadcasts(broadcasts);
    } else {
      setFilteredBroadcasts(broadcasts.filter(b => b.priority === activeFilter));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBroadcasts();
  };

  const handleMarkAsRead = async (broadcastId: string) => {
    try {
      await markBroadcastAsRead(broadcastId);
      
      // Update local state
      setBroadcasts(prev => 
        prev.map(b => 
          b.id === broadcastId 
            ? { ...b, is_read: true, read_at: new Date().toISOString() }
            : b
        )
      );
      
      addToast({
        title: 'Marked as read',
        description: 'Announcement marked as read',
        type: 'success'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to mark as read',
        type: 'error'
      });
    }
  };

  const handleAcknowledge = async (broadcastId: string) => {
    try {
      await acknowledgeBroadcast(broadcastId);
      
      // Update local state
      setBroadcasts(prev => 
        prev.map(b => 
          b.id === broadcastId 
            ? { ...b, is_acknowledged: true, acknowledged_at: new Date().toISOString(), is_read: true }
            : b
        )
      );
      
      addToast({
        title: 'Acknowledged',
        description: 'Announcement acknowledged',
        type: 'success'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to acknowledge',
        type: 'error'
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadBroadcasts = broadcasts.filter(b => !b.is_read);
      
      await Promise.all(
        unreadBroadcasts.map(b => markBroadcastAsRead(b.id))
      );
      
      // Update local state
      setBroadcasts(prev => 
        prev.map(b => ({ ...b, is_read: true, read_at: new Date().toISOString() }))
      );
      
      addToast({
        title: 'All read',
        description: 'All announcements marked as read',
        type: 'success'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to mark all as read',
        type: 'error'
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 7) {
      return date.toLocaleDateString();
    } else if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle size={18} />;
      case 'important':
        return <Bell size={18} />;
      case 'normal':
        return <Megaphone size={18} />;
      case 'info':
        return <Info size={18} />;
      default:
        return <Megaphone size={18} />;
    }
  };

  const unreadCount = broadcasts.filter(b => !b.is_read).length;
  const pinnedBroadcasts = filteredBroadcasts.filter(b => b.pinned);
  const regularBroadcasts = filteredBroadcasts.filter(b => !b.pinned);

  // Show skeleton loaders on initial load
  if (loading) {
    return (
      <div className={styles.container}>
        {/* Header with skeleton */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Megaphone className={styles.headerIcon} size={32} />
            <div>
              <h1 className={styles.title}>Announcements</h1>
              <p className={styles.subtitle}>Company announcements and updates</p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className={styles.filterSection}>
          <Filter size={18} />
          <span>Loading filters...</span>
        </div>

        {/* Skeleton Cards */}
        <div className={styles.feed}>
          {Array.from({ length: 5 }).map((_, index) => (
            <AnnouncementCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Show error state with retry button
  if (error && broadcasts.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <AlertCircle size={64} className={styles.errorIcon} />
          <h2>Failed to load announcements</h2>
          <p>{error}</p>
          <button onClick={fetchBroadcasts} className={styles.retryButton}>
            <RefreshCw size={18} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Megaphone className={styles.headerIcon} size={32} />
          <div>
            <h1 className={styles.title}>Announcements</h1>
            <p className={styles.subtitle}>
              Company announcements and updates
            </p>
          </div>
        </div>
        <div className={styles.headerRight}>
          {unreadCount > 0 && (
            <div className={styles.unreadBadge}>
              {unreadCount} unread
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={styles.refreshButton}
            title="Refresh"
          >
            <RefreshCw 
              size={18} 
              className={refreshing ? styles.spinning : ''} 
            />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className={styles.markAllButton}
            >
              <CheckCircle size={18} />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <Filter size={16} className={styles.filterIcon} />
        <button
          className={`${styles.filterButton} ${activeFilter === 'all' ? styles.filterActive : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button
          className={`${styles.filterButton} ${activeFilter === 'critical' ? styles.filterActive : ''}`}
          onClick={() => setActiveFilter('critical')}
        >
          Critical
        </button>
        <button
          className={`${styles.filterButton} ${activeFilter === 'important' ? styles.filterActive : ''}`}
          onClick={() => setActiveFilter('important')}
        >
          Important
        </button>
        <button
          className={`${styles.filterButton} ${activeFilter === 'normal' ? styles.filterActive : ''}`}
          onClick={() => setActiveFilter('normal')}
        >
          Normal
        </button>
        <button
          className={`${styles.filterButton} ${activeFilter === 'info' ? styles.filterActive : ''}`}
          onClick={() => setActiveFilter('info')}
        >
          Info
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {filteredBroadcasts.length === 0 ? (
          <div className={styles.emptyState}>
            <Megaphone size={64} className={styles.emptyIcon} />
            <h2>No announcements</h2>
            <p>
              {activeFilter === 'all' 
                ? "You don't have any announcements yet"
                : `No ${activeFilter} announcements`
              }
            </p>
          </div>
        ) : (
          <>
            {/* Pinned Announcements */}
            {pinnedBroadcasts.length > 0 && (
              <div className={styles.pinnedSection}>
                <div className={styles.sectionHeader}>
                  <Pin size={18} />
                  <h2>Pinned Announcements</h2>
                </div>
                <div className={styles.broadcastList}>
                  {pinnedBroadcasts.map(broadcast => (
                    <AnnouncementCard
                      key={broadcast.id}
                      broadcast={broadcast}
                      onMarkAsRead={handleMarkAsRead}
                      onAcknowledge={handleAcknowledge}
                      formatTime={formatTime}
                      getPriorityIcon={getPriorityIcon}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Announcements */}
            {regularBroadcasts.length > 0 && (
              <div className={styles.regularSection}>
                {pinnedBroadcasts.length > 0 && (
                  <div className={styles.sectionHeader}>
                    <h2>All Announcements</h2>
                  </div>
                )}
                <div className={styles.broadcastList}>
                  {regularBroadcasts.map(broadcast => (
                    <AnnouncementCard
                      key={broadcast.id}
                      broadcast={broadcast}
                      onMarkAsRead={handleMarkAsRead}
                      onAcknowledge={handleAcknowledge}
                      formatTime={formatTime}
                      getPriorityIcon={getPriorityIcon}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Announcement Card Component
interface AnnouncementCardProps {
  broadcast: BroadcastWithStatus;
  onMarkAsRead: (id: string) => void;
  onAcknowledge: (id: string) => void;
  formatTime: (date: string) => string;
  getPriorityIcon: (priority: string) => React.ReactNode;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  broadcast,
  onMarkAsRead,
  onAcknowledge,
  formatTime,
  getPriorityIcon
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/announcements/${broadcast.id}`);
  };

  return (
    <div 
      className={`${styles.card} ${styles[`priority${broadcast.priority.charAt(0).toUpperCase() + broadcast.priority.slice(1)}`]} ${!broadcast.is_read ? styles.unread : ''}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <div className={`${styles.priorityBadge} ${styles[`badge${broadcast.priority.charAt(0).toUpperCase() + broadcast.priority.slice(1)}`]}`}>
            {getPriorityIcon(broadcast.priority)}
            <span>{broadcast.priority}</span>
          </div>
          {broadcast.pinned && (
            <div className={styles.pinnedBadge}>
              <Pin size={14} />
              Pinned
            </div>
          )}
          {!broadcast.is_read && (
            <div className={styles.unreadDot} title="Unread" />
          )}
        </div>
        <div className={styles.cardHeaderRight}>
          <span className={styles.timestamp}>{formatTime(broadcast.created_at)}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{broadcast.title}</h3>
        <p className={styles.cardMessage}>{broadcast.message}</p>
        
        {/* Sender Info */}
        <div className={styles.senderInfo}>
          <span className={styles.senderLabel}>From:</span>
          <span className={styles.senderName}>{broadcast.sender_name}</span>
        </div>

        {/* Attachments */}
        {broadcast.attachments && broadcast.attachments.length > 0 && (
          <div className={styles.attachments}>
            <p className={styles.attachmentLabel}>Attachments:</p>
            {/* TODO: Implement attachment display */}
            <p className={styles.attachmentCount}>
              {broadcast.attachments.length} file(s) attached
            </p>
          </div>
        )}

        {/* Expiry Notice */}
        {broadcast.expires_at && (
          <div className={styles.expiryNotice}>
            <Info size={14} />
            <span>Expires {formatTime(broadcast.expires_at)}</span>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className={styles.cardActions}>
        {!broadcast.is_read && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(broadcast.id);
            }}
            className={styles.actionButton}
          >
            <CheckCircle size={16} />
            Mark as read
          </button>
        )}
        {broadcast.requires_acknowledgment && !broadcast.is_acknowledged && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAcknowledge(broadcast.id);
            }}
            className={styles.acknowledgeButton}
          >
            <CheckCircle size={16} />
            Acknowledge
          </button>
        )}
        {broadcast.is_acknowledged && (
          <div className={styles.acknowledgedBadge}>
            <CheckCircle size={14} />
            Acknowledged
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;

