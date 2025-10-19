import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../hooks/useToast';
import { AlertTriangle, CheckCircle, Clock, XCircle, Calendar, FileText, Download } from 'lucide-react';
import styles from './ExpiryDashboard.module.css';

interface ExpirySummary {
  total_documents: number;
  expired: number;
  expiring_urgent: number;
  expiring_soon: number;
  valid: number;
  no_expiry: number;
}

interface ExpiringDocument {
  document_id: string;
  user_id: string;
  seafarer_name: string;
  filename: string;
  document_type: string;
  expiry_date: string;
  days_until_expiry: number;
  status: string;
}

const ExpiryDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { addToast } = useToast();
  const [summary, setSummary] = useState<ExpirySummary | null>(null);
  const [documents, setDocuments] = useState<ExpiringDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (profile?.company_id) {
      fetchExpirySummary();
      fetchExpiringDocuments();
    }
  }, [profile?.company_id, filter]);

  const fetchExpirySummary = async () => {
    if (!profile?.company_id) return;

    try {
      const { data, error } = await supabase
        .rpc('get_company_expiry_summary', {
          p_company_id: profile.company_id
        });

      if (error) throw error;
      setSummary(data);
    } catch (error) {
      console.error('Error fetching expiry summary:', error);
      addToast({
        type: 'error',
        title: 'Failed to load expiry summary',
        duration: 5000
      });
    }
  };

  const fetchExpiringDocuments = async () => {
    if (!profile?.company_id) return;

    try {
      setLoading(true);
      const statusFilter = filter === 'all' ? null : filter;
      
      const { data, error} = await supabase
        .rpc('get_expiring_documents_for_company', {
          p_company_id: profile.company_id,
          p_status: statusFilter
        });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching expiring documents:', error);
      addToast({
        type: 'error',
        title: 'Failed to load documents',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'expired':
        return {
          icon: XCircle,
          label: 'Expired',
          color: '#ef4444',
          bgColor: '#fee2e2'
        };
      case 'expiring_urgent':
        return {
          icon: AlertTriangle,
          label: 'Expiring Urgent',
          color: '#f59e0b',
          bgColor: '#fef3c7'
        };
      case 'expiring_soon':
        return {
          icon: Clock,
          label: 'Expiring Soon',
          color: '#eab308',
          bgColor: '#fef9c3'
        };
      case 'valid':
        return {
          icon: CheckCircle,
          label: 'Valid',
          color: '#10b981',
          bgColor: '#d1fae5'
        };
      default:
        return {
          icon: FileText,
          label: 'Unknown',
          color: '#6b7280',
          bgColor: '#f3f4f6'
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysText = (days: number) => {
    if (days < 0) return `Expired ${Math.abs(days)} days ago`;
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    return `Expires in ${days} days`;
  };

  if (loading && !summary) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading expiry data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Document Expiry & Compliance</h1>
          <p className={styles.subtitle}>Monitor certificate expiration and compliance status</p>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard} style={{ borderLeftColor: '#ef4444' }}>
            <div className={styles.summaryIcon} style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
              <XCircle size={24} />
            </div>
            <div className={styles.summaryContent}>
              <h3 className={styles.summaryNumber}>{summary.expired}</h3>
              <p className={styles.summaryLabel}>Expired</p>
            </div>
          </div>

          <div className={styles.summaryCard} style={{ borderLeftColor: '#f59e0b' }}>
            <div className={styles.summaryIcon} style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
              <AlertTriangle size={24} />
            </div>
            <div className={styles.summaryContent}>
              <h3 className={styles.summaryNumber}>{summary.expiring_urgent}</h3>
              <p className={styles.summaryLabel}>Urgent (30 days)</p>
            </div>
          </div>

          <div className={styles.summaryCard} style={{ borderLeftColor: '#eab308' }}>
            <div className={styles.summaryIcon} style={{ backgroundColor: '#fef9c3', color: '#eab308' }}>
              <Clock size={24} />
            </div>
            <div className={styles.summaryContent}>
              <h3 className={styles.summaryNumber}>{summary.expiring_soon}</h3>
              <p className={styles.summaryLabel}>Expiring Soon (90 days)</p>
            </div>
          </div>

          <div className={styles.summaryCard} style={{ borderLeftColor: '#10b981' }}>
            <div className={styles.summaryIcon} style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
              <CheckCircle size={24} />
            </div>
            <div className={styles.summaryContent}>
              <h3 className={styles.summaryNumber}>{summary.valid}</h3>
              <p className={styles.summaryLabel}>Valid</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.filterActive : ''}`}
          onClick={() => setFilter('all')}
        >
          All Documents
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'expired' ? styles.filterActive : ''}`}
          onClick={() => setFilter('expired')}
        >
          Expired
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'expiring_urgent' ? styles.filterActive : ''}`}
          onClick={() => setFilter('expiring_urgent')}
        >
          Urgent
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'expiring_soon' ? styles.filterActive : ''}`}
          onClick={() => setFilter('expiring_soon')}
        >
          Expiring Soon
        </button>
      </div>

      {/* Documents Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className={styles.emptyState}>
            <CheckCircle size={64} className={styles.emptyIcon} />
            <h3>No Documents Found</h3>
            <p>
              {filter === 'all' 
                ? 'No documents with expiry dates found.'
                : `No ${filter.replace('_', ' ')} documents found.`}
            </p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Status</th>
                <th>Seafarer</th>
                <th>Document</th>
                <th>Type</th>
                <th>Expiry Date</th>
                <th>Days Remaining</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                const statusInfo = getStatusInfo(doc.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <tr key={doc.document_id} className={styles.tableRow}>
                    <td>
                      <span 
                        className={styles.statusBadge}
                        style={{ 
                          backgroundColor: statusInfo.bgColor,
                          color: statusInfo.color
                        }}
                      >
                        <StatusIcon size={14} />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className={styles.seafarerName}>{doc.seafarer_name}</td>
                    <td className={styles.filename}>{doc.filename}</td>
                    <td>{doc.document_type}</td>
                    <td>
                      <div className={styles.dateCell}>
                        <Calendar size={14} />
                        {formatDate(doc.expiry_date)}
                      </div>
                    </td>
                    <td>
                      <span 
                        className={styles.daysText}
                        style={{ 
                          color: doc.days_until_expiry < 0 
                            ? '#ef4444' 
                            : doc.days_until_expiry <= 30 
                            ? '#f59e0b' 
                            : '#eab308'
                        }}
                      >
                        {getDaysText(doc.days_until_expiry)}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.actionButton}
                        onClick={() => {
                          // Navigate to seafarer's documents or show details
                          window.open(`/company/documents?user=${doc.user_id}`, '_blank');
                        }}
                        title="View seafarer documents"
                      >
                        <FileText size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ExpiryDashboard;

