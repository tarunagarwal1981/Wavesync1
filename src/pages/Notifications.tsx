import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockNotifications } from '../data/mockData';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle, 
  Clock, 
  Filter,
  Search,
  SortAsc,
  SortDesc,
  MoreVertical,
  Check,
  Trash2,
  Archive,
  Settings,
  Eye,
  ExternalLink,
  Calendar,
  User,
  Briefcase,
  FileText,
  GraduationCap,
  CheckSquare
} from 'lucide-react';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Filter notifications based on selected tab
  const filteredNotifications = notifications.filter(notification => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'unread') return !notification.read;
    if (selectedTab === 'read') return notification.read;
    if (selectedTab === 'archived') return notification.read && notification.readAt; // Simplified archived logic
    return true;
  });

  // Filter by search query
  const searchFilteredNotifications = filteredNotifications.filter(notification => {
    const query = searchQuery.toLowerCase();
    return (
      notification.title.toLowerCase().includes(query) ||
      notification.message.toLowerCase().includes(query) ||
      notification.type.toLowerCase().includes(query)
    );
  });

  // Sort notifications
  const sortedNotifications = [...searchFilteredNotifications].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'priority':
        const priorityOrder = { urgent: 3, high: 2, medium: 1, low: 0 };
        comparison = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return AlertTriangle;
      case 'high': return AlertTriangle;
      case 'medium': return Info;
      case 'low': return Info;
      default: return Info;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment': return Briefcase;
      case 'document': return FileText;
      case 'task': return CheckSquare;
      case 'training': return GraduationCap;
      case 'system': return Settings;
      default: return Bell;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true, readAt: new Date().toISOString() }
        : notification
    ));
  };

  const handleMarkAsUnread = (notificationId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: false, readAt: undefined }
        : notification
    ));
  };

  const handleDeleteNotification = (notificationId: string) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    }
  };

  const handleArchiveNotification = (notificationId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true, readAt: new Date().toISOString() }
        : notification
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notification => 
      !notification.read 
        ? { ...notification, read: true, readAt: new Date().toISOString() }
        : notification
    ));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  // Calculate statistics
  const totalNotifications = notifications.length;
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const readNotifications = notifications.filter(n => n.read).length;
  const urgentNotifications = notifications.filter(n => n.priority === 'urgent' && !n.read).length;

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1f2937' }}>
          Notifications
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Stay updated with your maritime activities and important alerts
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#dbeafe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={20} color="#3b82f6" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {totalNotifications}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Total</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="#f59e0b" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {unreadNotifications}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Unread</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#dcfce7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={20} color="#10b981" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {readNotifications}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Read</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#fecaca', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color="#ef4444" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {urgentNotifications}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Urgent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#f9fafb'
              }}
            />
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'type')}
              style={{
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="date">Sort by Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="type">Sort by Type</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
            </button>
          </div>

          {/* Bulk Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadNotifications === 0}
              style={{
                padding: '12px 16px',
                backgroundColor: unreadNotifications === 0 ? '#f1f5f9' : '#3b82f6',
                color: unreadNotifications === 0 ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: unreadNotifications === 0 ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: unreadNotifications === 0 ? 0.6 : 1
              }}
            >
              <Check size={16} />
              Mark All Read
            </button>
            <button
              onClick={handleClearAll}
              disabled={totalNotifications === 0}
              style={{
                padding: '12px 16px',
                backgroundColor: totalNotifications === 0 ? '#f1f5f9' : '#ef4444',
                color: totalNotifications === 0 ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: totalNotifications === 0 ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: totalNotifications === 0 ? 0.6 : 1
              }}
            >
              <Trash2 size={16} />
              Clear All
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'all', label: 'All', count: totalNotifications },
            { key: 'unread', label: 'Unread', count: unreadNotifications },
            { key: 'read', label: 'Read', count: readNotifications },
            { key: 'archived', label: 'Archived', count: readNotifications }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              style={{
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: selectedTab === tab.key ? '#3b82f6' : '#f1f5f9',
                color: selectedTab === tab.key ? 'white' : '#64748b',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {tab.label}
              <span style={{
                backgroundColor: selectedTab === tab.key ? 'rgba(255,255,255,0.2)' : '#d1d5db',
                color: selectedTab === tab.key ? 'white' : '#6b7280',
                padding: '2px 6px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {sortedNotifications.map((notification, index) => {
          const PriorityIcon = getPriorityIcon(notification.priority);
          const TypeIcon = getTypeIcon(notification.type);
          
          return (
            <div key={notification.id} style={{
              padding: '20px',
              borderBottom: index < sortedNotifications.length - 1 ? '1px solid #f1f5f9' : 'none',
              backgroundColor: notification.read ? 'white' : '#f8fafc',
              borderLeft: notification.read ? 'none' : '4px solid #3b82f6'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                {/* Icon */}
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  backgroundColor: `${getPriorityColor(notification.priority)}20`, 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <TypeIcon size={20} color={getPriorityColor(notification.priority)} />
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h3 style={{ 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        margin: '0 0 4px 0', 
                        color: '#1f2937',
                        opacity: notification.read ? 0.7 : 1
                      }}>
                        {notification.title}
                      </h3>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#6b7280', 
                        margin: '0 0 8px 0',
                        lineHeight: '1.4',
                        opacity: notification.read ? 0.7 : 1
                      }}>
                        {notification.message}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        backgroundColor: `${getPriorityColor(notification.priority)}20`,
                        borderRadius: '6px'
                      }}>
                        <PriorityIcon size={14} color={getPriorityColor(notification.priority)} />
                        <span style={{ fontSize: '12px', fontWeight: '500', color: getPriorityColor(notification.priority) }}>
                          {notification.priority.toUpperCase()}
                        </span>
                      </div>
                      <button style={{
                        padding: '8px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        color: '#6b7280'
                      }}>
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} />
                      <span>{formatDate(notification.createdAt)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ textTransform: 'capitalize' }}>{notification.type}</span>
                    </div>
                    {notification.expiresAt && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} />
                        <span>Expires {formatDate(notification.expiresAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!notification.read ? (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <CheckCircle size={14} />
                        Mark as Read
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkAsUnread(notification.id)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#f1f5f9',
                          color: '#64748b',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Clock size={14} />
                        Mark as Unread
                      </button>
                    )}
                    
                    {notification.actionUrl && (
                      <button
                        onClick={() => window.open(notification.actionUrl, '_blank')}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <ExternalLink size={14} />
                        View Details
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleArchiveNotification(notification.id)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Archive size={14} />
                      Archive
                    </button>
                    
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {sortedNotifications.length === 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '48px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <Bell size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
            No notifications found
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            {searchQuery ? 'Try adjusting your search criteria' : 'You\'re all caught up! No notifications match the selected filter.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
