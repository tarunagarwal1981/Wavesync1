import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../hooks/useToast';
import { supabase } from '../lib/supabase';
import { 
  Megaphone, 
  BarChart3,
  Eye,
  CheckCircle,
  Users,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import styles from './CompanyAnnouncementsPage.module.css';
import { AnnouncementAnalytics, AnnouncementCardSkeleton } from '../components/announcements';
import type { BroadcastWithStatus } from '../types/broadcast.types';

type TabType = 'all' | 'my-broadcasts' | 'analytics';

interface BroadcastStats {
  broadcast_id: string;
  title: string;
  priority: string;
  requires_acknowledgment: boolean;
  created_at: string;
  total_recipients: number;
  read_count: number;
  acknowledged_count: number;
}

export const CompanyAnnouncementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [broadcasts, setBroadcasts] = useState<BroadcastWithStatus[]>([]);
  const [myBroadcasts, setMyBroadcasts] = useState<BroadcastStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastStats | null>(null);

  useEffect(() => {
    if (activeTab === 'all') {
      fetchAllBroadcasts();
    } else if (activeTab === 'my-broadcasts') {
      fetchMyBroadcasts();
    }
  }, [activeTab]);

  const fetchAllBroadcasts = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase.rpc('get_my_broadcasts');

      if (fetchError) throw fetchError;

      setBroadcasts(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load announcements');
      addToast({
        title: 'Error',
        message: 'Failed to load announcements',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBroadcasts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch broadcasts created by current user with analytics
      const { data, error: fetchError } = await supabase
        .from('broadcasts')
        .select(`
          id,
          title,
          priority,
          requires_acknowledgment,
          created_at,
          target_type
        `)
        .eq('sender_id', user?.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Fetch analytics for each broadcast
      const broadcastsWithStats = await Promise.all(
        (data || []).map(async (broadcast) => {
          try {
            const { data: analytics } = await supabase
              .rpc('get_broadcast_analytics', { p_broadcast_id: broadcast.id });

            return {
              broadcast_id: broadcast.id,
              title: broadcast.title,
              priority: broadcast.priority,
              requires_acknowledgment: broadcast.requires_acknowledgment,
              created_at: broadcast.created_at,
              total_recipients: analytics?.[0]?.total_recipients || 0,
              read_count: analytics?.[0]?.read_count || 0,
              acknowledged_count: analytics?.[0]?.acknowledged_count || 0
            };
          } catch (error) {
            // Return fallback data if analytics fetch fails
            return {
              broadcast_id: broadcast.id,
              title: broadcast.title,
              priority: broadcast.priority,
              requires_acknowledgment: broadcast.requires_acknowledgment,
              created_at: broadcast.created_at,
              total_recipients: 0,
              read_count: 0,
              acknowledged_count: 0
            };
          }
        })
      );

      setMyBroadcasts(broadcastsWithStats);
    } catch (err: any) {
      setError(err.message || 'Failed to load your broadcasts');
      addToast({
        title: 'Error',
        message: 'Failed to load your broadcasts',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewAnalytics = (broadcast: BroadcastStats) => {
    setSelectedBroadcast(broadcast);
    setActiveTab('analytics');
  };

  const handleBackFromAnalytics = () => {
    setSelectedBroadcast(null);
    setActiveTab('my-broadcasts');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return styles.priorityCritical;
      case 'important':
        return styles.priorityImportant;
      case 'normal':
        return styles.priorityNormal;
      case 'info':
        return styles.priorityInfo;
      default:
        return styles.priorityNormal;
    }
  };

  // If analytics view is active and a broadcast is selected, show analytics
  if (activeTab === 'analytics' && selectedBroadcast) {
    return (
      <AnnouncementAnalytics
        broadcastId={selectedBroadcast.broadcast_id}
        broadcastTitle={selectedBroadcast.title}
        requiresAcknowledgment={selectedBroadcast.requires_acknowledgment}
        onBack={handleBackFromAnalytics}
      />
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            <Megaphone size={28} />
            Announcements
          </h1>
          <p className={styles.subtitle}>Manage and track company announcements</p>
        </div>
        <button
          onClick={() => navigate('/announcements/create')}
          className={styles.createButton}
        >
          + Create Announcement
        </button>
      </div>

      {/* Tab Switcher */}
      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab('all')}
          className={`${styles.tab} ${activeTab === 'all' ? styles.tabActive : ''}`}
        >
          <Megaphone size={18} />
          All Announcements
        </button>
        <button
          onClick={() => setActiveTab('my-broadcasts')}
          className={`${styles.tab} ${activeTab === 'my-broadcasts' ? styles.tabActive : ''}`}
        >
          <TrendingUp size={18} />
          My Broadcasts
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.skeletonContainer}>
            {Array.from({ length: 5 }).map((_, index) => (
              <AnnouncementCardSkeleton key={index} />
            ))}
          </div>
        ) : error && ((activeTab === 'all' && broadcasts.length === 0) || (activeTab === 'my-broadcasts' && myBroadcasts.length === 0)) ? (
          <div className={styles.errorState}>
            <AlertCircle size={64} className={styles.errorIcon} />
            <h2>Failed to load announcements</h2>
            <p>{error}</p>
            <button 
              onClick={() => activeTab === 'all' ? fetchAllBroadcasts() : fetchMyBroadcasts()} 
              className={styles.retryButton}
            >
              <RefreshCw size={18} />
              Retry
            </button>
          </div>
        ) : activeTab === 'all' ? (
          /* All Announcements Tab */
          <div className={styles.allAnnouncementsSection}>
            {broadcasts.length === 0 ? (
              <div className={styles.emptyState}>
                <Megaphone size={48} />
                <p>No announcements yet</p>
              </div>
            ) : (
              <div className={styles.broadcastsList}>
                {broadcasts.map((broadcast) => (
                  <div 
                    key={broadcast.broadcast_id} 
                    className={styles.broadcastCard}
                    onClick={() => navigate(`/announcements/${broadcast.broadcast_id}`)}
                  >
                    <div className={`${styles.priorityBadge} ${getPriorityColor(broadcast.priority)}`}>
                      {broadcast.priority}
                    </div>
                    <h3 className={styles.broadcastTitle}>{broadcast.title}</h3>
                    <p className={styles.broadcastMeta}>
                      {broadcast.sender_name} • {formatDate(broadcast.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* My Broadcasts Tab */
          <div className={styles.myBroadcastsSection}>
            {myBroadcasts.length === 0 ? (
              <div className={styles.emptyState}>
                <Megaphone size={48} />
                <p>You haven't created any announcements yet</p>
                <button
                  onClick={() => navigate('/announcements/create')}
                  className={styles.createButton}
                >
                  Create Your First Announcement
                </button>
              </div>
            ) : (
              <div className={styles.myBroadcastsList}>
                {myBroadcasts.map((broadcast) => (
                  <div key={broadcast.broadcast_id} className={styles.myBroadcastCard}>
                    <div className={styles.myBroadcastHeader}>
                      <div>
                        <div className={`${styles.priorityBadge} ${getPriorityColor(broadcast.priority)}`}>
                          {broadcast.priority}
                        </div>
                        <h3 className={styles.myBroadcastTitle}>{broadcast.title}</h3>
                        <p className={styles.myBroadcastDate}>{formatDate(broadcast.created_at)}</p>
                      </div>
                      <button
                        onClick={() => handleViewAnalytics(broadcast)}
                        className={styles.analyticsButton}
                      >
                        <BarChart3 size={18} />
                        View Analytics
                      </button>
                    </div>
                    <div className={styles.myBroadcastStats}>
                      <div className={styles.stat}>
                        <Users size={16} />
                        <span>Sent to {broadcast.total_recipients} seafarers</span>
                      </div>
                      <div className={styles.stat}>
                        <Eye size={16} />
                        <span>
                          Read by {broadcast.read_count}/{broadcast.total_recipients} 
                          {' '}({broadcast.total_recipients > 0 ? ((broadcast.read_count / broadcast.total_recipients) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                      {broadcast.requires_acknowledgment && (
                        <div className={styles.stat}>
                          <CheckCircle size={16} />
                          <span>
                            Acknowledged by {broadcast.acknowledged_count}/{broadcast.total_recipients}
                            {' '}({broadcast.total_recipients > 0 ? ((broadcast.acknowledged_count / broadcast.total_recipients) * 100).toFixed(1) : 0}%)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyAnnouncementsPage;

