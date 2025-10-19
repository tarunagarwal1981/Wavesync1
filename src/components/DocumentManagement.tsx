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
  User
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
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<DocumentFormData>({
    user_id: '',
    document_type: '',
    description: '',
    expiry_date: '',
    file: null
  });

  // Auto-set user_id for seafarers
  useEffect(() => {
    if (profile?.user_type === 'seafarer' && profile?.id) {
      setFormData(prev => ({ ...prev, user_id: profile.id }));
    }
  }, [profile?.id, profile?.user_type]);

  useEffect(() => {
    fetchUsers();
  }, [profile?.company_id]);

  useEffect(() => {
    if (users.length > 0 || profile?.user_type === 'seafarer') {
      fetchDocuments();
    }
  }, [users, profile?.id]);

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

      if (profile.user_type === 'seafarer') {
        // Seafarers can only see their own documents
        query = query.eq('user_id', profile.id);
      } else {
        // Company users can see documents for all seafarers in their company
        const seafarerIds = users.map(u => u.id);
        if (seafarerIds.length > 0) {
          query = query.in('user_id', seafarerIds);
        } else {
          // No seafarers found, return empty array
          setDocuments([]);
          return;
        }
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
    if (!profile?.company_id) return;

    try {
      // For company users: show all seafarers in their company
      // For seafarers: show only themselves
      let query = supabase
        .from('user_profiles')
        .select('id, full_name, email, user_type')
        .eq('company_id', profile.company_id);

      if (profile.user_type === 'seafarer') {
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

  const handleStatusChange = async (documentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          status: newStatus,
          verified_at: newStatus === 'approved' ? new Date().toISOString() : null,
          verified_by: newStatus === 'approved' ? profile?.id : null
        })
        .eq('id', documentId);

      if (error) throw error;

      addToast({
        type: 'success',
        title: `Document ${newStatus} successfully`,
        duration: 5000
      });

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
        {filteredDocuments.length === 0 ? (
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
          <div className={styles.documentsGrid}>
            {filteredDocuments.map((document) => (
              <div key={document.id} className={styles.documentCard}>
                <div className={styles.documentHeader}>
                  <div className={styles.documentInfo}>
                    <h3 className={styles.documentName}>{document.filename}</h3>
                    <p className={styles.documentType}>
                      {DOCUMENT_TYPES.find(t => t.value === document.document_type)?.label || document.document_type}
                    </p>
                    <p className={styles.documentUser}>
                      <User className={styles.userIcon} />
                      {document.user?.full_name}
                    </p>
                  </div>
                  <div className={styles.documentActions}>
                    <button 
                      className={styles.actionButton}
                      onClick={() => window.open(document.file_url, '_blank')}
                      title="View Document"
                    >
                      <Eye className={styles.actionIcon} />
                    </button>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleEdit(document)}
                      title="Edit Document"
                    >
                      <Edit className={styles.actionIcon} />
                    </button>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleDelete(document.id)}
                      title="Delete Document"
                    >
                      <Trash2 className={styles.actionIcon} />
                    </button>
                  </div>
                </div>
                
                <div className={styles.documentDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Status:</span>
                    <div className={styles.statusContainer}>
                      {getStatusIcon(document.status)}
                      <span 
                        className={styles.statusBadge}
                        style={{ color: getStatusColor(document.status) }}
                      >
                        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  {document.expiry_date && (() => {
                    const expiryInfo = getExpiryStatusInfo(document.expiry_date);
                    const expiryText = getExpiryText(document.expiry_date);
                    
                    return (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Expiry:</span>
                        <div className={styles.expiryBadgeContainer}>
                          <span 
                            className={styles.expiryBadge}
                            style={{ 
                              backgroundColor: expiryInfo.bgColor,
                              color: expiryInfo.color,
                              borderColor: expiryInfo.color
                            }}
                          >
                            <Calendar className={styles.calendarIcon} size={14} />
                            {new Date(document.expiry_date).toLocaleDateString()}
                          </span>
                          <span 
                            className={styles.expiryStatusBadge}
                            style={{ 
                              backgroundColor: expiryInfo.bgColor,
                              color: expiryInfo.color
                            }}
                          >
                            {expiryInfo.icon} {expiryText}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Uploaded:</span>
                    <span className={styles.detailValue}>
                      {new Date(document.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {document.description && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Description:</span>
                      <span className={styles.detailValue}>{document.description}</span>
                    </div>
                  )}
                </div>

                {/* Status Actions */}
                {document.status === 'pending' && (
                  <div className={styles.statusActions}>
                    <button 
                      className={styles.approveButton}
                      onClick={() => handleStatusChange(document.id, 'approved')}
                    >
                      <CheckCircle className={styles.buttonIcon} />
                      Approve
                    </button>
                    <button 
                      className={styles.rejectButton}
                      onClick={() => handleStatusChange(document.id, 'rejected')}
                    >
                      <XCircle className={styles.buttonIcon} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentManagement;
