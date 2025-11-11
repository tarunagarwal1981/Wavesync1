import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Plus,
  Calendar,
  User,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../hooks/useToast';
import { getExpiryStatusInfo, getExpiryText } from '../utils/expiryHelpers';
import styles from './DocumentManagement.module.css';

// Types
interface Document {
  id: string;
  user_id: string;
  filename: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  document_type: string;
  description?: string;
  status: string;
  expiry_date?: string;
  uploaded_at: string;
  verified_at?: string;
  verified_by?: string;
  user?: {
    full_name: string;
    email: string;
  };
}

interface DocumentFormData {
  user_id: string;
  document_type: string;
  description: string;
  expiry_date: string;
  file: File | null;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  user_type: string;
}

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

// Document types and categories
const DOCUMENT_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'seaman_book', label: 'Seaman Book' },
  { value: 'medical_certificate', label: 'Medical Certificate' },
  { value: 'stcw_certificate', label: 'STCW Certificate' },
  { value: 'visa', label: 'Visa' },
  { value: 'vaccination_certificate', label: 'Vaccination Certificate' },
  { value: 'training_certificate', label: 'Training Certificate' },
  { value: 'eng1_medical', label: 'ENG1 Medical' },
  { value: 'eng11_medical', label: 'ENG11 Medical' },
  { value: 'coc_certificate', label: 'COC Certificate' },
  { value: 'cop_certificate', label: 'COP Certificate' },
  { value: 'gmdss_certificate', label: 'GMDSS Certificate' },
  { value: 'radar_certificate', label: 'Radar Certificate' },
  { value: 'arpa_certificate', label: 'ARPA Certificate' },
  { value: 'other', label: 'Other' }
];

const DocumentManagement: React.FC = () => {
  const { profile } = useAuth();
  const { addToast } = useToast();
  const userType = profile?.user_type as string | undefined;
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [uploading, setUploading] = useState(false);
  const [approvalModal, setApprovalModal] = useState<{
    show: boolean;
    document: Document | null;
    action: 'approve' | 'reject' | null;
  }>({ show: false, document: null, action: null });
  const [approvalComments, setApprovalComments] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'expiring'>('expiring'); // Default to expiring
  const [expirySummary, setExpirySummary] = useState<ExpirySummary | null>(null);
  const [expiringDocuments, setExpiringDocuments] = useState<ExpiringDocument[]>([]);
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

  const [formData, setFormData] = useState<DocumentFormData>({
    user_id: '',
    document_type: '',
    description: '',
    expiry_date: '',
    file: null
  });

  // Auto-set user_id for seafarers
  useEffect(() => {
    if (userType === 'seafarer' && profile?.id) {
      setFormData(prev => ({ ...prev, user_id: profile.id }));
    }
  }, [profile?.id, userType]);

  useEffect(() => {
    fetchUsers();
  }, [profile?.company_id]);

  // Seafarers: fetch documents immediately when profile becomes available
  useEffect(() => {
    if (userType === 'seafarer' && profile?.id) {
      fetchDocuments();
    }
  }, [profile?.id, userType]);

  // Company/Company user: wait until users list has finished loading
  useEffect(() => {
    const isCompanyUser = String(userType) === 'company' || String(userType) === 'company_user';
    if (isCompanyUser && profile?.company_id && usersLoaded) {
      fetchDocuments();
      if (viewMode === 'expiring') {
        fetchExpirySummary();
        fetchExpiringDocuments();
      }
    }
  }, [profile?.company_id, userType, usersLoaded, viewMode]);

  // Fetch expiring documents when filter changes (for expiring view)
  useEffect(() => {
    const isCompanyUser = String(userType) === 'company' || String(userType) === 'company_user';
    if (isCompanyUser && profile?.company_id && viewMode === 'expiring' && usersLoaded) {
      fetchExpiringDocuments();
    }
  }, [statusFilter, viewMode]);

  const fetchDocuments = async () => {
    if (!profile?.company_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Build the query based on user type
      let query = supabase
        .from('documents')
        .select(`
          *,
          user:user_profiles!user_id(full_name, email)
        `);

      if (userType === 'seafarer') {
        // Seafarers can only see their own documents
        query = query.eq('user_id', profile.id);
      } else if (String(userType) === 'company' || String(userType) === 'company_user') {
        // Company users can see documents for all seafarers in their company
        const seafarerIds = users.map(u => u.id);
        if (seafarerIds.length > 0) {
          query = query.in('user_id', seafarerIds);
        } else {
          // No seafarers found, return empty array but ensure loading is set to false
          setDocuments([]);
          setLoading(false);
          return;
        }
      } else {
        // Unexpected user type - return empty and log warning
        console.warn(`Unexpected user_type in fetchDocuments: ${profile.user_type}`);
        setDocuments([]);
        setLoading(false);
        return;
      }
      const { data, error } = await query.order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      addToast({
        type: 'error',
        title: 'Failed to fetch documents',
        description: 'Please try again later.',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    // Reset usersLoaded when starting a new fetch cycle
    setUsersLoaded(false);

    if (!profile?.company_id) {
      setLoading(false);
      setUsers([]);
      setUsersLoaded(true);
      return;
    }

    try {
      // For company users: show all seafarers in their company
      // For seafarers: show only themselves
      let query = supabase
        .from('user_profiles')
        .select('id, full_name, email, user_type')
        .eq('company_id', profile.company_id);

      if (userType === 'seafarer') {
        // Seafarers can only see their own documents
        query = query.eq('id', profile.id);
      } else {
        // Company users can see all seafarers in their company
        query = query.eq('user_type', 'seafarer');
      }

      const { data, error } = await query;

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      // For company users, still try to fetch documents (will be empty)
      if (String(userType) === 'company' || String(userType) === 'company_user') {
        setLoading(false);
      }
    } finally {
      setUsersLoaded(true);
    }
  };

  const fetchExpirySummary = async () => {
    if (!profile?.company_id) return;

    try {
      const { data, error } = await supabase
        .rpc('get_company_expiry_summary', {
          p_company_id: profile.company_id
        });

      if (error) throw error;
      setExpirySummary(data);
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
      const expiryStatusFilter = statusFilter === 'all' ? null : statusFilter;
      
      const { data, error } = await supabase
        .rpc('get_expiring_documents_for_company', {
          p_company_id: profile.company_id,
          p_status: expiryStatusFilter
        });

      if (error) throw error;
      
      // Fetch associated tasks for each document
      if (data && data.length > 0) {
        const documentsWithTasks = await Promise.all(
          data.map(async (doc: ExpiringDocument) => {
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
        setExpiringDocuments(documentsWithTasks);
      } else {
        setExpiringDocuments(data || []);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        addToast({
          type: 'error',
          title: 'File too large',
          description: 'Please select a file smaller than 10MB.',
          duration: 5000
        });
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        addToast({
          type: 'error',
          title: 'Invalid file type',
          description: 'Please select a PDF, image, or Word document.',
          duration: 5000
        });
        return;
      }

      setFormData(prev => ({ ...prev, file }));
    }
  };

  const uploadFile = async (file: File, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.company_id) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Unable to determine company. Please contact support.',
        duration: 5000
      });
      return;
    }

    if (!formData.file) {
      addToast({
        type: 'error',
        title: 'No file selected',
        description: 'Please select a file to upload.',
        duration: 5000
      });
      return;
    }

    try {
      setUploading(true);

      if (editingDocument) {
        // Update existing document
        const { error } = await supabase
          .from('documents')
          .update({
            document_type: formData.document_type,
            description: formData.description || null,
            expiry_date: formData.expiry_date || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingDocument.id);

        if (error) throw error;

        addToast({
          type: 'success',
          title: 'Document updated successfully',
          duration: 5000
        });
      } else {
        // Upload new document
        const fileUrl = await uploadFile(formData.file, formData.user_id);

        const { error } = await supabase
          .from('documents')
          .insert({
            user_id: formData.user_id,
            filename: formData.file.name,
            file_url: fileUrl,
            file_type: formData.file.type,
            file_size: formData.file.size,
            document_type: formData.document_type,
            description: formData.description || null,
            expiry_date: formData.expiry_date || null,
            status: 'pending'
          });

        if (error) throw error;

        addToast({
          type: 'success',
          title: 'Document uploaded successfully',
          description: 'The document is pending verification.',
          duration: 8000
        });
      }

      resetForm();
      fetchDocuments();
    } catch (error) {
      console.error('Error saving document:', error);
      addToast({
        type: 'error',
        title: editingDocument ? 'Failed to update document' : 'Failed to upload document',
        description: 'Please try again later.',
        duration: 5000
      });
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setFormData({
      user_id: document.user_id,
      document_type: document.document_type,
      description: document.description || '',
      expiry_date: document.expiry_date || '',
      file: null
    });
    setShowUploadForm(true);
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'Document deleted successfully',
        duration: 5000
      });

      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      addToast({
        type: 'error',
        title: 'Failed to delete document',
        description: 'Please try again later.',
        duration: 5000
      });
    }
  };

  const handleApprovalClick = (document: Document, action: 'approve' | 'reject') => {
    setApprovalModal({ show: true, document, action });
    setApprovalComments('');
  };

  const handleApprovalSubmit = async () => {
    if (!approvalModal.document || !approvalModal.action) return;

    // Require comments for rejection
    if (approvalModal.action === 'reject' && !approvalComments.trim()) {
      addToast({
        type: 'error',
        title: 'Comments Required',
        description: 'Please provide a reason for rejection',
        duration: 5000
      });
      return;
    }

    try {
      const newStatus = approvalModal.action === 'approve' ? 'approved' : 'rejected';
      
      // Update document status
      const { error } = await supabase
        .from('documents')
        .update({
          status: newStatus,
          verified_at: new Date().toISOString(),
          verified_by: profile?.id,
          description: approvalComments 
            ? `${approvalModal.document.description || ''}\n\n--- ${approvalModal.action === 'approve' ? 'Approval' : 'Rejection'} Note ---\n${approvalComments}`
            : approvalModal.document.description
        })
        .eq('id', approvalModal.document.id);

      if (error) throw error;

      // Send notification to seafarer
      if (approvalModal.document.user_id) {
        const notificationTitle = approvalModal.action === 'approve' 
          ? 'Document Approved ✅'
          : 'Document Rejected ❌';
        
        const notificationMessage = approvalModal.action === 'approve'
          ? `Your document "${approvalModal.document.filename}" has been approved by the company.${approvalComments ? `\n\nNote: ${approvalComments}` : ''}`
          : `Your document "${approvalModal.document.filename}" has been rejected and needs to be re-uploaded.\n\nReason: ${approvalComments}`;

        await supabase
          .from('notifications')
          .insert({
            user_id: approvalModal.document.user_id,
            title: notificationTitle,
            message: notificationMessage,
            type: approvalModal.action === 'approve' ? 'success' : 'error',
            read: false,
            created_at: new Date().toISOString()
          });
      }

      addToast({
        type: 'success',
        title: `Document ${newStatus} successfully`,
        description: `Seafarer has been notified`,
        duration: 5000
      });

      setApprovalModal({ show: false, document: null, action: null });
      setApprovalComments('');
      fetchDocuments();
    } catch (error) {
      console.error('Error updating document status:', error);
      addToast({
        type: 'error',
        title: 'Failed to update document status',
        description: 'Please try again later.',
        duration: 5000
      });
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      document_type: '',
      description: '',
      expiry_date: '',
      file: null
    });
    setEditingDocument(null);
    setShowUploadForm(false);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'var(--color-warning)',
      'approved': 'var(--color-success)',
      'rejected': 'var(--color-error)',
      'expired': 'var(--color-error)'
    };
    return colors[status] || 'var(--color-text-secondary)';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className={styles.statusIcon} />;
      case 'approved':
        return <CheckCircle className={styles.statusIcon} />;
      case 'rejected':
        return <XCircle className={styles.statusIcon} />;
      case 'expired':
        return <AlertTriangle className={styles.statusIcon} />;
      default:
        return <FileText className={styles.statusIcon} />;
    }
  };

  // Expiry status helpers
  const getExpiryStatusDisplayInfo = (status: string) => {
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

  // Task creation functions
  const handleCreateTask = (document: ExpiringDocument) => {
    setSelectedDocument(document);
    
    const daysUntil = document.days_until_expiry;
    let priority: string;
    let dueDate: Date;
    
    if (daysUntil < 0) {
      priority = 'urgent';
      dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else if (daysUntil <= 30) {
      priority = 'urgent';
      dueDate = new Date(document.expiry_date);
    } else if (daysUntil <= 90) {
      priority = 'high';
      dueDate = new Date(document.expiry_date);
    } else {
      priority = 'medium';
      dueDate = new Date(new Date(document.expiry_date).getTime() - 30 * 24 * 60 * 60 * 1000);
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

      setShowTaskModal(false);
      setSelectedDocument(null);
      setTaskFormData({
        title: '',
        description: '',
        category: 'document_upload',
        priority: 'high',
        due_date: ''
      });

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

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.user?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesType = typeFilter === 'all' || doc.document_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading documents...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <FileText className={styles.titleIcon} />
            <div>
              <h1 className={styles.title}>
                {profile?.user_type === 'seafarer' ? 'My Documents' : 'Document Management'}
              </h1>
              <p className={styles.subtitle}>
                {profile?.user_type === 'seafarer' 
                  ? `Manage your personal documents and certificates (${filteredDocuments.length} documents)`
                  : `Manage crew documents and certificates (${filteredDocuments.length} documents)`
                }
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            {(userType === 'company' || userType === 'company_user') && viewMode === 'expiring' && (
              <button 
                className={styles.refreshButton}
                onClick={() => {
                  fetchExpirySummary();
                  fetchExpiringDocuments();
                }}
                title="Refresh data"
              >
                <RefreshCw size={18} className={styles.buttonIcon} />
                Refresh
              </button>
            )}
            <button 
              className={styles.uploadButton}
              onClick={() => setShowUploadForm(true)}
            >
              <Plus className={styles.buttonIcon} />
              Upload Document
            </button>
          </div>
        </div>
      </div>

      {/* View Toggle - Only for company users */}
      {(userType === 'company' || userType === 'company_user') && (
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewToggleButton} ${viewMode === 'all' ? styles.viewToggleActive : ''}`}
            onClick={() => setViewMode('all')}
          >
            All Documents
          </button>
          <button
            className={`${styles.viewToggleButton} ${viewMode === 'expiring' ? styles.viewToggleActive : ''}`}
            onClick={() => {
              setViewMode('expiring');
              fetchExpirySummary();
              fetchExpiringDocuments();
            }}
          >
            Expiring Only
          </button>
        </div>
      )}

      {/* Summary Cards - Only for company users and expiring view */}
      {(userType === 'company' || userType === 'company_user') && viewMode === 'expiring' && expirySummary && (
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard} style={{ borderLeftColor: '#ef4444' }}>
            <div className={styles.summaryIcon} style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
              <XCircle size={24} />
            </div>
            <div className={styles.summaryContent}>
              <h3 className={styles.summaryNumber}>{expirySummary.expired}</h3>
              <p className={styles.summaryLabel}>Expired</p>
            </div>
          </div>

          <div className={styles.summaryCard} style={{ borderLeftColor: '#f59e0b' }}>
            <div className={styles.summaryIcon} style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
              <AlertTriangle size={24} />
            </div>
            <div className={styles.summaryContent}>
              <h3 className={styles.summaryNumber}>{expirySummary.expiring_urgent}</h3>
              <p className={styles.summaryLabel}>Urgent (30 days)</p>
            </div>
          </div>

          <div className={styles.summaryCard} style={{ borderLeftColor: '#eab308' }}>
            <div className={styles.summaryIcon} style={{ backgroundColor: '#fef9c3', color: '#eab308' }}>
              <Clock size={24} />
            </div>
            <div className={styles.summaryContent}>
              <h3 className={styles.summaryNumber}>{expirySummary.expiring_soon}</h3>
              <p className={styles.summaryLabel}>Expiring Soon (90 days)</p>
            </div>
          </div>

          <div className={styles.summaryCard} style={{ borderLeftColor: '#10b981' }}>
            <div className={styles.summaryIcon} style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
              <CheckCircle size={24} />
            </div>
            <div className={styles.summaryContent}>
              <h3 className={styles.summaryNumber}>{expirySummary.valid}</h3>
              <p className={styles.summaryLabel}>Valid</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by filename, user, or document type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        {viewMode === 'all' ? (
          <>
            <div className={styles.filterGroup}>
              <Filter className={styles.filterIcon} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Types</option>
                {DOCUMENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div className={styles.filterGroup}>
            <Filter className={styles.filterIcon} />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                fetchExpiringDocuments();
              }}
              className={styles.filterSelect}
            >
              <option value="all">All Documents</option>
              <option value="expired">Expired</option>
              <option value="expiring_urgent">Urgent</option>
              <option value="expiring_soon">Expiring Soon</option>
            </select>
          </div>
        )}
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editingDocument ? 'Edit Document' : 'Upload New Document'}</h2>
              <button className={styles.closeButton} onClick={resetForm}>
                <XCircle className={styles.closeIcon} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                {profile?.user_type === 'company' && (
                  <div className={styles.formGroup}>
                    <label htmlFor="user_id">Seafarer *</label>
                    <select
                      id="user_id"
                      name="user_id"
                      value={formData.user_id}
                      onChange={handleInputChange}
                      required
                      disabled={!!editingDocument}
                    >
                      <option value="">Select a seafarer</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {profile?.user_type === 'seafarer' && (
                  <div className={styles.formGroup}>
                    <label>Seafarer</label>
                    <div className={styles.readonlyField}>
                      {profile?.full_name} (You)
                    </div>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label htmlFor="document_type">Document Type *</label>
                  <select
                    id="document_type"
                    name="document_type"
                    value={formData.document_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select document type</option>
                    {DOCUMENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="expiry_date">Expiry Date</label>
                  <input
                    type="date"
                    id="expiry_date"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Optional description..."
                  />
                </div>

                {!editingDocument && (
                  <div className={styles.formGroup}>
                    <label htmlFor="file">File *</label>
                    <div className={styles.fileUpload}>
                      <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        required
                      />
                      <div className={styles.fileUploadArea}>
                        <Upload className={styles.uploadIcon} />
                        <p>Click to select a file or drag and drop</p>
                        <p className={styles.fileInfo}>
                          PDF, Images, Word documents up to 10MB
                        </p>
                      </div>
                    </div>
                    {formData.file && (
                      <div className={styles.selectedFile}>
                        <FileText className={styles.fileIcon} />
                        <span>{formData.file.name}</span>
                        <span className={styles.fileSize}>
                          ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={resetForm}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : (editingDocument ? 'Update Document' : 'Upload Document')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className={styles.documentsList}>
        {(viewMode === 'expiring' && (userType === 'company' || userType === 'company_user')) ? (
          // Table View for Expiring Documents
          <div className={styles.tableContainer}>
            {loading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading documents...</p>
              </div>
            ) : expiringDocuments.length === 0 ? (
              <div className={styles.emptyState}>
                <CheckCircle size={64} className={styles.emptyIcon} />
                <h3>No Documents Found</h3>
                <p>
                  {statusFilter === 'all' 
                    ? 'No documents with expiry dates found.'
                    : `No ${statusFilter.replace('_', ' ')} documents found.`}
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
                  {expiringDocuments.map((doc) => {
                    const statusInfo = getExpiryStatusDisplayInfo(doc.status);
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
                            {React.createElement(StatusIcon, { size: 14 })}
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
                              onClick={() => window.open(`/company/documents?user=${doc.user_id}`, '_blank')}
                              title="View seafarer documents"
                            >
                              <FileText size={16} />
                            </button>
                            <button
                              className={styles.actionButton}
                              onClick={() => window.open(`/company/documents?doc=${doc.document_id}`, '_blank')}
                              title="View document"
                            >
                              <Eye size={16} />
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
        ) : (
          // Table View for All Documents
          <div className={styles.tableContainer}>
            {loading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading documents...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className={styles.emptyState}>
                <FileText className={styles.emptyIcon} />
                <h3>No documents found</h3>
                <p>
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No documents have been uploaded yet'
                  }
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
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((document) => {
                    const expiryInfo = document.expiry_date ? getExpiryStatusInfo(document.expiry_date) : null;
                    const expiryText = document.expiry_date ? getExpiryText(document.expiry_date) : null;
                    
                    return (
                      <tr key={document.id} className={styles.tableRow}>
                        <td>
                          <span 
                            className={styles.statusBadge}
                            style={{ color: getStatusColor(document.status) }}
                          >
                            {getStatusIcon(document.status)}
                            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                          </span>
                        </td>
                        <td className={styles.seafarerName}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={16} />
                            {document.user?.full_name || 'Unknown'}
                          </div>
                        </td>
                        <td className={styles.filename}>{document.filename}</td>
                        <td>
                          {DOCUMENT_TYPES.find(t => t.value === document.document_type)?.label || document.document_type}
                        </td>
                        <td>
                          {document.expiry_date ? (
                            <div className={styles.dateCell}>
                              <Calendar size={14} />
                              <div>
                                <div>{new Date(document.expiry_date).toLocaleDateString()}</div>
                                {expiryText && (
                                  <span 
                                    className={styles.daysText}
                                    style={{ 
                                      color: expiryInfo?.color || '#6b7280',
                                      fontSize: '11px'
                                    }}
                                  >
                                    {expiryText}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#9ca3af' }}>N/A</span>
                          )}
                        </td>
                        <td>
                          <div className={styles.dateCell}>
                            {new Date(document.uploaded_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button
                              className={styles.actionButton}
                              onClick={() => window.open(document.file_url, '_blank')}
                              title="View Document"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className={styles.actionButton}
                              onClick={() => handleEdit(document)}
                              title="Edit Document"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className={styles.actionButton}
                              onClick={() => handleDelete(document.id)}
                              title="Delete Document"
                            >
                              <Trash2 size={16} />
                            </button>
                            {document.status === 'pending' && (
                              <>
                                <button
                                  className={styles.actionButton}
                                  onClick={() => handleApprovalClick(document, 'approve')}
                                  title="Approve"
                                  style={{ color: '#10b981' }}
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  className={styles.actionButton}
                                  onClick={() => handleApprovalClick(document, 'reject')}
                                  title="Reject"
                                  style={{ color: '#ef4444' }}
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
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

      {/* Approval/Rejection Modal */}
      {approvalModal.show && approvalModal.document && approvalModal.action && (
        <div className={styles.modalOverlay} onClick={() => setApprovalModal({ show: false, document: null, action: null })}>
          <div className={styles.approvalModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.approvalModalHeader}>
              <h3>
                {approvalModal.action === 'approve' ? '✅ Approve Document' : '❌ Reject Document'}
              </h3>
              <button
                className={styles.closeModalButton}
                onClick={() => setApprovalModal({ show: false, document: null, action: null })}
              >
                ✕
              </button>
            </div>

            <div className={styles.approvalModalBody}>
              <div className={styles.documentPreview}>
                <p><strong>Document:</strong> {approvalModal.document.filename}</p>
                <p><strong>Type:</strong> {approvalModal.document.document_type}</p>
                <p><strong>Uploaded by:</strong> {approvalModal.document.user?.full_name}</p>
                {approvalModal.document.expiry_date && (
                  <p><strong>Expiry Date:</strong> {new Date(approvalModal.document.expiry_date).toLocaleDateString()}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="approvalComments">
                  {approvalModal.action === 'approve' ? 'Comments (optional)' : 'Reason for Rejection *'}
                </label>
                <textarea
                  id="approvalComments"
                  className={styles.approvalTextarea}
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  placeholder={
                    approvalModal.action === 'approve'
                      ? 'Add any notes or instructions...'
                      : 'Please specify why this document is being rejected...'
                  }
                  rows={4}
                  required={approvalModal.action === 'reject'}
                />
              </div>

              {approvalModal.action === 'reject' && (
                <div className={styles.warningMessage}>
                  ⚠️ The seafarer will be notified and will need to re-upload the document.
                </div>
              )}
            </div>

            <div className={styles.approvalModalFooter}>
              <button
                className={styles.cancelModalButton}
                onClick={() => setApprovalModal({ show: false, document: null, action: null })}
              >
                Cancel
              </button>
              <button
                className={approvalModal.action === 'approve' ? styles.confirmApproveButton : styles.confirmRejectButton}
                onClick={handleApprovalSubmit}
              >
                {approvalModal.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;
