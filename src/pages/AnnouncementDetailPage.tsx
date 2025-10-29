import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { 
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  Info as InfoIcon,
  Bell,
  User,
  Calendar,
  Paperclip,
  Download,
  CheckCircle,
  X,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  Eye,
  Loader2
} from 'lucide-react';
import styles from './AnnouncementDetailPage.module.css';
import { supabase } from '../lib/supabase';
import { markBroadcastAsRead, acknowledgeBroadcast } from '../services/broadcast.service';
import type { BroadcastWithStatus, BroadcastPriority } from '../types/broadcast.types';

export const AnnouncementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [announcement, setAnnouncement] = useState<BroadcastWithStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [acknowledging, setAcknowledging] = useState(false);
  const [showAckModal, setShowAckModal] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAnnouncement();
    }
  }, [id]);

  const fetchAnnouncement = async () => {
    if (!id || id === 'undefined') {
      navigate('/announcements');
      return;
    }

    try {
      setLoading(true);

      // Fetch all broadcasts and filter by ID (since RPC returns multiple)
      const { data: allData, error } = await supabase
        .rpc('get_my_broadcasts');

      if (error) throw error;

      // Find the specific broadcast by ID
      const data = allData?.find((b: any) => b.id === id);

      if (!data) {
        addToast({
          title: 'Not Found',
          description: 'Announcement not found',
          type: 'error'
        });
        navigate('/announcements');
        return;
      }

      setAnnouncement(data as BroadcastWithStatus);

      // Auto-mark as read if unread
      if (!(data as BroadcastWithStatus).is_read) {
        markAsReadSilently(id);
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load announcement',
        type: 'error'
      });
      navigate('/announcements');
    } finally {
      setLoading(false);
    }
  };

  const markAsReadSilently = async (broadcastId: string) => {
    try {
      await markBroadcastAsRead(broadcastId);
      // Update local state
      if (announcement) {
        setAnnouncement({
          ...announcement,
          is_read: true,
          read_at: new Date().toISOString()
        });
      }
    } catch (error) {
      // Fail silently - don't bother user
    }
  };

  const handleAcknowledge = async () => {
    if (!id) return;

    setAcknowledging(true);
    try {
      await acknowledgeBroadcast(id);

      // Update local state
      if (announcement) {
        setAnnouncement({
          ...announcement,
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          is_read: true
        });
      }

      addToast({
        title: 'Acknowledged',
        description: 'You have acknowledged this announcement',
        type: 'success'
      });

      setShowAckModal(false);
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to acknowledge announcement',
        type: 'error'
      });
    } finally {
      setAcknowledging(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 7) {
      return formatDate(dateString);
    } else if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getPriorityIcon = (priority: BroadcastPriority) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle size={24} />;
      case 'important':
        return <AlertCircle size={24} />;
      case 'normal':
        return <Bell size={24} />;
      case 'info':
        return <InfoIcon size={24} />;
    }
  };

  const getPriorityLabel = (priority: BroadcastPriority) => {
    return priority.toUpperCase();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // File type detection
  const getFileType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    if (['pdf'].includes(extension)) return 'pdf';
    if (['xls', 'xlsx', 'csv'].includes(extension)) return 'spreadsheet';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
    if (['doc', 'docx'].includes(extension)) return 'document';
    return 'file';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return <FileText size={20} />;
      case 'spreadsheet':
        return <FileSpreadsheet size={20} />;
      case 'image':
        return <ImageIcon size={20} />;
      default:
        return <File size={20} />;
    }
  };

  const canPreview = (filename: string): boolean => {
    const type = getFileType(filename);
    return type === 'image' || type === 'pdf';
  };

  // Download single file
  const handleDownload = async (attachment: any) => {
    try {
      setDownloadingFile(attachment.filename);

      // Check if URL is from Supabase Storage
      if (attachment.url && attachment.url.includes('supabase')) {
        // Get signed URL from Supabase Storage
        const pathParts = attachment.url.split('/');
        const filePath = pathParts.slice(pathParts.indexOf('broadcast-attachments') + 1).join('/');

        const { data, error } = await supabase.storage
          .from('broadcast-attachments')
          .createSignedUrl(filePath, 3600); // 1 hour expiry

        if (error) throw error;

        if (data?.signedUrl) {
          // Trigger download
          const link = document.createElement('a');
          link.href = data.signedUrl;
          link.download = attachment.filename;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          addToast({
            title: 'Download Started',
            description: `Downloading ${attachment.filename}`,
            type: 'success'
          });
        }
      } else {
        // Direct URL download
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addToast({
          title: 'Download Started',
          description: `Downloading ${attachment.filename}`,
          type: 'success'
        });
      }
    } catch (error) {
      addToast({
        title: 'Download Failed',
        description: `Failed to download ${attachment.filename}`,
        type: 'error'
      });
    } finally {
      setDownloadingFile(null);
    }
  };

  // Preview file
  const handlePreview = async (attachment: any) => {
    try {
      if (attachment.url && attachment.url.includes('supabase')) {
        // Get signed URL for preview
        const pathParts = attachment.url.split('/');
        const filePath = pathParts.slice(pathParts.indexOf('broadcast-attachments') + 1).join('/');

        const { data, error } = await supabase.storage
          .from('broadcast-attachments')
          .createSignedUrl(filePath, 3600);

        if (error) throw error;

        if (data?.signedUrl) {
          window.open(data.signedUrl, '_blank');
        }
      } else {
        window.open(attachment.url, '_blank');
      }
    } catch (error) {
      addToast({
        title: 'Preview Failed',
        description: `Failed to preview ${attachment.filename}`,
        type: 'error'
      });
    }
  };

  // Download all attachments
  const handleDownloadAll = async () => {
    if (!announcement?.attachments || announcement.attachments.length === 0) return;

    setDownloadingAll(true);
    try {
      let successCount = 0;
      let failCount = 0;

      // Download each attachment sequentially with a small delay
      for (const attachment of announcement.attachments) {
        try {
          await handleDownload(attachment);
          successCount++;
          // Small delay between downloads to avoid overwhelming the browser
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          failCount++;
        }
      }

      if (successCount > 0) {
        addToast({
          title: 'Downloads Complete',
          description: `Successfully downloaded ${successCount} of ${announcement.attachments.length} file(s)`,
          type: 'success'
        });
      }

      if (failCount > 0) {
        addToast({
          title: 'Some Downloads Failed',
          description: `${failCount} file(s) could not be downloaded`,
          type: 'error'
        });
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to download all attachments',
        type: 'error'
      });
    } finally {
      setDownloadingAll(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading announcement...</p>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/announcements')}
        className={styles.backButton}
      >
        <ArrowLeft size={20} />
        Back to Announcements
      </button>

      {/* Main Card */}
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={`${styles.priorityBadge} ${styles[`badge${announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}`]}`}>
            {getPriorityIcon(announcement.priority)}
            <span>{getPriorityLabel(announcement.priority)}</span>
          </div>
          {announcement.pinned && (
            <div className={styles.pinnedBadge}>
              <span>📌 Pinned</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className={styles.title}>{announcement.title}</h1>

        {/* Sender Info */}
        <div className={styles.senderInfo}>
          <div className={styles.avatar}>
            <User size={20} />
          </div>
          <div className={styles.senderDetails}>
            <div className={styles.senderName}>{announcement.sender_name}</div>
            <div className={styles.timestamp}>
              <Calendar size={14} />
              <span>{formatDate(announcement.created_at)}</span>
              <span className={styles.separator}>•</span>
              <span>{formatRelativeTime(announcement.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Message Content */}
        <div className={styles.messageContent}>
          {announcement.message.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph || '\u00A0'}</p>
          ))}
        </div>

        {/* Attachments */}
        {announcement.attachments && announcement.attachments.length > 0 && (
          <>
            <div className={styles.divider}></div>
            <div className={styles.attachmentsSection}>
              <div className={styles.attachmentsHeader}>
                <Paperclip size={20} />
                <h3>Attachments</h3>
              </div>
              <div className={styles.attachmentsList}>
                {announcement.attachments.map((attachment: any, index: number) => {
                  const fileType = getFileType(attachment.filename);
                  const showPreview = canPreview(attachment.filename);
                  const isDownloading = downloadingFile === attachment.filename;

                  return (
                    <div key={index} className={styles.attachmentItem}>
                      <div className={styles.attachmentInfo}>
                        <div className={styles.fileIcon}>
                          {getFileIcon(fileType)}
                        </div>
                        <div className={styles.fileDetails}>
                          <span className={styles.attachmentName}>{attachment.filename}</span>
                          {attachment.size && (
                            <span className={styles.attachmentSize}>
                              {formatFileSize(attachment.size)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={styles.attachmentActions}>
                        {showPreview && (
                          <button
                            onClick={() => handlePreview(attachment)}
                            className={styles.previewButton}
                            title="Preview file"
                          >
                            <Eye size={16} />
                            Preview
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(attachment)}
                          className={styles.downloadButton}
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <>
                              <Loader2 className={styles.spinner} size={16} />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download size={16} />
                              Download
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={handleDownloadAll}
                className={styles.downloadAllButton}
                disabled={downloadingAll || announcement.attachments.length === 0}
              >
                {downloadingAll ? (
                  <>
                    <Loader2 className={styles.spinner} size={18} />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Download All Attachments
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* Expiry Notice */}
        {announcement.expires_at && (
          <>
            <div className={styles.divider}></div>
            <div className={styles.expiryNotice}>
              <InfoIcon size={16} />
              <span>This announcement expires on {formatDate(announcement.expires_at)}</span>
            </div>
          </>
        )}

        {/* Acknowledgment Section */}
        {announcement.requires_acknowledgment && (
          <>
            <div className={styles.divider}></div>
            {announcement.is_acknowledged ? (
              <div className={styles.acknowledgedBox}>
                <CheckCircle size={20} />
                <div>
                  <div className={styles.acknowledgedTitle}>Acknowledged</div>
                  <div className={styles.acknowledgedDate}>
                    You acknowledged this announcement on {formatDate(announcement.acknowledged_at!)}
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.acknowledgmentBox}>
                <div className={styles.acknowledgmentContent}>
                  <AlertCircle size={24} />
                  <div>
                    <div className={styles.acknowledgmentTitle}>
                      This announcement requires your acknowledgment
                    </div>
                    <div className={styles.acknowledgmentText}>
                      Please confirm that you have read and understood this announcement
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowAckModal(true)}
                  className={styles.acknowledgeButton}
                  disabled={acknowledging}
                >
                  <CheckCircle size={18} />
                  I Acknowledge
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Acknowledgment Confirmation Modal */}
      {showAckModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAckModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Acknowledge Announcement</h2>
              <button
                onClick={() => setShowAckModal(false)}
                className={styles.modalClose}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>
                By acknowledging, you confirm that you have read and understood this announcement:
              </p>
              <div className={styles.modalAnnouncementTitle}>
                "{announcement.title}"
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                onClick={() => setShowAckModal(false)}
                className={styles.modalButtonSecondary}
                disabled={acknowledging}
              >
                Cancel
              </button>
              <button
                onClick={handleAcknowledge}
                className={styles.modalButtonPrimary}
                disabled={acknowledging}
              >
                {acknowledging ? 'Acknowledging...' : 'Confirm Acknowledgment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementDetailPage;

