import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';
import {
  ArrowLeft,
  Users,
  Eye,
  CheckCircle,
  Clock,
  Download,
  Send,
  Loader2
} from 'lucide-react';
import styles from './AnnouncementAnalytics.module.css';

interface Recipient {
  user_id: string;
  full_name: string;
  rank?: string;
  vessel_name?: string;
  is_read: boolean;
  read_at?: string;
  is_acknowledged: boolean;
  acknowledged_at?: string;
}

interface AnalyticsData {
  total_recipients: number;
  read_count: number;
  acknowledged_count: number;
  read_percentage: number;
  acknowledged_percentage: number;
}

interface AnnouncementAnalyticsProps {
  broadcastId: string;
  broadcastTitle: string;
  requiresAcknowledgment: boolean;
  onBack: () => void;
}

export const AnnouncementAnalytics: React.FC<AnnouncementAnalyticsProps> = ({
  broadcastId,
  broadcastTitle,
  requiresAcknowledgment,
  onBack
}) => {
  const { addToast } = useToast();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [broadcastId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch analytics summary
      const { data: analyticsData, error: analyticsError } = await supabase
        .rpc('get_broadcast_analytics', { p_broadcast_id: broadcastId });

      if (analyticsError) throw analyticsError;

      if (analyticsData && analyticsData.length > 0) {
        setAnalytics(analyticsData[0]);
      }

      // Fetch recipient details
      const { data: recipientsData, error: recipientsError } = await supabase
        .rpc('get_broadcast_recipients', { p_broadcast_id: broadcastId });

      if (recipientsError) throw recipientsError;

      setRecipients(recipientsData || []);
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load analytics',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const getRecipientStatus = (recipient: Recipient) => {
    if (recipient.is_acknowledged) {
      return {
        icon: <CheckCircle size={18} className={styles.iconAcknowledged} />,
        text: 'Read & Acknowledged',
        time: recipient.acknowledged_at ? formatTimeAgo(recipient.acknowledged_at) : '',
        className: styles.statusAcknowledged
      };
    }
    if (recipient.is_read) {
      return {
        icon: <Eye size={18} className={styles.iconRead} />,
        text: 'Read',
        time: recipient.read_at ? formatTimeAgo(recipient.read_at) : '',
        className: styles.statusRead
      };
    }
    return {
      icon: <Clock size={18} className={styles.iconUnread} />,
      text: 'Not read yet',
      time: '',
      className: styles.statusUnread
    };
  };

  const handleExportCSV = () => {
    try {
      setExporting(true);

      // Prepare CSV data
      const headers = ['Name', 'Rank', 'Vessel', 'Read Status', 'Read Time', 'Acknowledged', 'Acknowledged Time'];
      const rows = recipients.map(r => [
        r.full_name,
        r.rank || 'N/A',
        r.vessel_name || 'N/A',
        r.is_read ? 'Read' : 'Unread',
        r.read_at || 'N/A',
        r.is_acknowledged ? 'Yes' : 'No',
        r.acknowledged_at || 'N/A'
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `announcement-analytics-${broadcastId}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast({
        title: 'Exported',
        description: 'Analytics exported to CSV',
        type: 'success'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to export CSV',
        type: 'error'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleSendReminder = async () => {
    try {
      setSendingReminder(true);

      // Get unread recipients
      const unreadRecipients = recipients.filter(r => !r.is_read);

      if (unreadRecipients.length === 0) {
        addToast({
          title: 'No Action Needed',
          description: 'All recipients have read this announcement',
          type: 'info'
        });
        return;
      }

      // TODO: Implement email reminder functionality
      // This would require a backend function to send emails
      addToast({
        title: 'Coming Soon',
        description: `Would send reminder to ${unreadRecipients.length} unread recipient(s)`,
        type: 'info'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to send reminder',
        type: 'error'
      });
    } finally {
      setSendingReminder(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={48} />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={styles.error}>
        <p>Failed to load analytics</p>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={18} />
          Back
        </button>
      </div>
    );
  }

  const unreadCount = analytics.total_recipients - analytics.read_count;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={20} />
          Back to My Broadcasts
        </button>
        <h1 className={styles.title}>
          <Users size={24} />
          Announcement Analytics
        </h1>
        <p className={styles.subtitle}>{broadcastTitle}</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        {/* Total Recipients */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{analytics.total_recipients}</div>
            <div className={styles.statLabel}>Total Recipients</div>
          </div>
        </div>

        {/* Read Count */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Eye size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {analytics.read_count} <span className={styles.percentage}>({analytics.read_percentage.toFixed(1)}%)</span>
            </div>
            <div className={styles.statLabel}>Viewed by Seafarers</div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${analytics.read_percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Acknowledged Count */}
        {requiresAcknowledgment && (
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <CheckCircle size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {analytics.acknowledged_count} <span className={styles.percentage}>({analytics.acknowledged_percentage.toFixed(1)}%)</span>
              </div>
              <div className={styles.statLabel}>Acknowledged</div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFillAck} 
                  style={{ width: `${analytics.acknowledged_percentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button
          onClick={handleExportCSV}
          className={styles.exportButton}
          disabled={exporting}
        >
          {exporting ? (
            <>
              <Loader2 className={styles.spinner} size={18} />
              Exporting...
            </>
          ) : (
            <>
              <Download size={18} />
              Export to CSV
            </>
          )}
        </button>
        {unreadCount > 0 && (
          <button
            onClick={handleSendReminder}
            className={styles.reminderButton}
            disabled={sendingReminder}
          >
            {sendingReminder ? (
              <>
                <Loader2 className={styles.spinner} size={18} />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Send Reminder to {unreadCount} Unread
              </>
            )}
          </button>
        )}
      </div>

      {/* Recipients List */}
      <div className={styles.recipientsSection}>
        <h2 className={styles.recipientsTitle}>Recipients List</h2>
        <div className={styles.recipientsList}>
          {recipients.map((recipient, index) => {
            const status = getRecipientStatus(recipient);
            return (
              <div key={index} className={`${styles.recipientItem} ${status.className}`}>
                <div className={styles.recipientIcon}>
                  {status.icon}
                </div>
                <div className={styles.recipientInfo}>
                  <div className={styles.recipientName}>{recipient.full_name}</div>
                  <div className={styles.recipientMeta}>
                    {recipient.rank && <span>{recipient.rank}</span>}
                    {recipient.vessel_name && <span> • {recipient.vessel_name}</span>}
                  </div>
                </div>
                <div className={styles.recipientStatus}>
                  <div className={styles.statusText}>{status.text}</div>
                  {status.time && <div className={styles.statusTime}>{status.time}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementAnalytics;

