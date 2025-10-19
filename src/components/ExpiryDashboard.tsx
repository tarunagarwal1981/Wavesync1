import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../hooks/useToast';
import { AlertTriangle, CheckCircle, Clock, XCircle, Calendar, FileText, Plus, RefreshCw } from 'lucide-react';
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
  task_id?: string;
  task_status?: string;
  task_title?: string;
}

interface TaskFormData {
  title: string;
  description: string;
  category: string;
  priority: string;
  due_date: string;
}

const ExpiryDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { addToast } = useToast();
  const [summary, setSummary] = useState<ExpirySummary | null>(null);
  const [documents, setDocuments] = useState<ExpiringDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ExpiringDocument | null>(null);
  const [taskFormData, setTaskFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    category: 'document_upload',
    priority: 'high',
    due_date: ''
  });
  const [creatingTask, setCreatingTask] = useState(false);

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
      
      // Fetch associated tasks for each document
      if (data && data.length > 0) {
        const documentsWithTasks = await Promise.all(
          data.map(async (doc: ExpiringDocument) => {
            // Find tasks related to this document/seafarer
            const { data: tasks } = await supabase
              .from('tasks')
              .select('id, title, status')
              .eq('assigned_to', doc.user_id)
              .eq('company_id', profile.company_id)
              .or(`description.ilike.%${doc.filename}%,title.ilike.%${doc.document_type}%`)
              .order('created_at', { ascending: false })
              .limit(1);
            
            return {
              ...doc,
              task_id: tasks && tasks.length > 0 ? tasks[0].id : undefined,
              task_status: tasks && tasks.length > 0 ? tasks[0].status : undefined,
              task_title: tasks && tasks.length > 0 ? tasks[0].title : undefined
            };
          })
        );
        setDocuments(documentsWithTasks);
      } else {
        setDocuments(data || []);
      }
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

  const getTaskStatusInfo = (taskStatus?: string) => {
    if (!taskStatus) return null;
    
    switch (taskStatus) {
      case 'completed':
        return {
          label: 'Task Completed',
          color: '#10b981',
          bgColor: '#d1fae5',
          icon: '✅'
        };
      case 'in_progress':
        return {
          label: 'Task In Progress',
          color: '#3b82f6',
          bgColor: '#dbeafe',
          icon: '🔄'
        };
      case 'pending':
        return {
          label: 'Task Assigned',
          color: '#f59e0b',
          bgColor: '#fef3c7',
          icon: '📋'
        };
      default:
        return {
          label: 'Task Created',
          color: '#6b7280',
          bgColor: '#f3f4f6',
          icon: '📄'
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

  const handleCreateTask = (document: ExpiringDocument) => {
    setSelectedDocument(document);
    
    // Pre-fill the task form with document information
    const daysUntil = document.days_until_expiry;
    let priority: string;
    let dueDate: Date;
    
    if (daysUntil < 0) {
      // Expired - urgent priority, due ASAP
      priority = 'urgent';
      dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    } else if (daysUntil <= 30) {
      // Expiring urgent - high priority
      priority = 'urgent';
      dueDate = new Date(document.expiry_date);
    } else if (daysUntil <= 90) {
      // Expiring soon - medium priority
      priority = 'high';
      dueDate = new Date(document.expiry_date);
    } else {
      // Valid but creating task anyway
      priority = 'medium';
      dueDate = new Date(new Date(document.expiry_date).getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days before expiry
    }

    const statusText = daysUntil < 0 
      ? `expired ${Math.abs(daysUntil)} days ago` 
      : `expires in ${daysUntil} days`;

    setTaskFormData({
      title: `Renew ${document.document_type}`,
      description: `Please renew your ${document.document_type} document (${document.filename}). This document ${statusText}.\n\nCurrent expiry date: ${new Date(document.expiry_date).toLocaleDateString()}`,
      category: 'document_upload',
      priority: priority,
      due_date: dueDate.toISOString().split('T')[0]
    });
    
    setShowTaskModal(true);
  };

  const handleTaskFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaskFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDocument || !profile?.company_id) return;

    try {
      setCreatingTask(true);

      const { error } = await supabase
        .from('tasks')
        .insert({
          title: taskFormData.title,
          description: taskFormData.description,
          category: taskFormData.category,
          priority: taskFormData.priority,
          status: 'pending',
          assigned_to: selectedDocument.user_id,
          assigned_by: profile.id,
          company_id: profile.company_id,
          due_date: taskFormData.due_date,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'Task created successfully',
        description: `Renewal task assigned to ${selectedDocument.seafarer_name}`,
        duration: 5000
      });

      // Close modal and reset
      setShowTaskModal(false);
      setSelectedDocument(null);
      setTaskFormData({
        title: '',
        description: '',
        category: 'document_upload',
        priority: 'high',
        due_date: ''
      });

      // Refresh the documents list to show updated task status
      fetchExpiringDocuments();

    } catch (error) {
      console.error('Error creating task:', error);
      addToast({
        type: 'error',
        title: 'Failed to create task',
        description: 'Please try again',
        duration: 5000
      });
    } finally {
      setCreatingTask(false);
    }
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setSelectedDocument(null);
    setTaskFormData({
      title: '',
      description: '',
      category: 'document_upload',
      priority: 'high',
      due_date: ''
    });
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
        <button 
          className={styles.refreshButton}
          onClick={() => {
            fetchExpirySummary();
            fetchExpiringDocuments();
          }}
          title="Refresh data"
        >
          <RefreshCw size={20} />
          Refresh
        </button>
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
                <th>Task Status</th>
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
                      {(() => {
                        const taskInfo = getTaskStatusInfo(doc.task_status);
                        if (taskInfo) {
                          return (
                            <span 
                              className={styles.taskStatusBadge}
                              style={{ 
                                backgroundColor: taskInfo.bgColor,
                                color: taskInfo.color
                              }}
                              title={doc.task_title || 'View task'}
                            >
                              {taskInfo.icon} {taskInfo.label}
                            </span>
                          );
                        }
                        return (
                          <span className={styles.noTaskBadge}>
                            No Task
                          </span>
                        );
                      })()}
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        {doc.task_id ? (
                          <button
                            className={`${styles.actionButton} ${styles.viewTaskButton}`}
                            onClick={() => window.open(`/task-management?task=${doc.task_id}`, '_blank')}
                            title={doc.task_status === 'completed' ? 'Task completed' : 'View existing task'}
                          >
                            {doc.task_status === 'completed' ? <CheckCircle size={16} /> : <FileText size={16} />}
                          </button>
                        ) : (
                          <button
                            className={styles.actionButton}
                            onClick={() => handleCreateTask(doc)}
                            title="Create renewal task"
                          >
                            <Plus size={16} />
                          </button>
                        )}
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
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Task Creation Modal */}
      {showTaskModal && selectedDocument && (
        <div className={styles.modalOverlay} onClick={handleCloseTaskModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create Renewal Task</h2>
              <button className={styles.closeButton} onClick={handleCloseTaskModal}>
                ×
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.documentInfo}>
                <h3>Document Information</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Seafarer:</span>
                    <span className={styles.infoValue}>{selectedDocument.seafarer_name}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Document:</span>
                    <span className={styles.infoValue}>{selectedDocument.filename}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Type:</span>
                    <span className={styles.infoValue}>{selectedDocument.document_type}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Expiry Date:</span>
                    <span className={styles.infoValue}>
                      {new Date(selectedDocument.expiry_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Status:</span>
                    <span className={styles.infoValue}>
                      {getDaysText(selectedDocument.days_until_expiry)}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitTask} className={styles.taskForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="title">Task Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={taskFormData.title}
                    onChange={handleTaskFormChange}
                    required
                    placeholder="e.g., Renew STCW Certificate"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={taskFormData.description}
                    onChange={handleTaskFormChange}
                    required
                    rows={4}
                    placeholder="Provide detailed instructions for the seafarer..."
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={taskFormData.category}
                      onChange={handleTaskFormChange}
                      required
                    >
                      <option value="document_upload">Document Upload</option>
                      <option value="training">Training</option>
                      <option value="medical">Medical</option>
                      <option value="compliance">Compliance</option>
                      <option value="onboarding">Onboarding</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="priority">Priority</label>
                    <select
                      id="priority"
                      name="priority"
                      value={taskFormData.priority}
                      onChange={handleTaskFormChange}
                      required
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="due_date">Due Date *</label>
                    <input
                      type="date"
                      id="due_date"
                      name="due_date"
                      value={taskFormData.due_date}
                      onChange={handleTaskFormChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleCloseTaskModal}
                    disabled={creatingTask}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={creatingTask}
                  >
                    {creatingTask ? 'Creating Task...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiryDashboard;

