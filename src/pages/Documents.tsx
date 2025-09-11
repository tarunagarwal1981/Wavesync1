import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockDocuments } from '../data/mockData';
import { 
  FileText, 
  Upload, 
  Eye, 
  Download, 
  Trash2, 
  Filter,
  Search,
  SortAsc,
  SortDesc,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  File,
  Image,
  FileSpreadsheet,
  FilePdf,
  Plus,
  Grid,
  List,
  MoreVertical
} from 'lucide-react';

const Documents = () => {
  const { user } = useAuth();
  const [documents] = useState(mockDocuments);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'expiry' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get unique categories
  const categories = ['all', ...new Set(documents.map(doc => doc.category))];

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'date':
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        break;
      case 'expiry':
        comparison = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return FilePdf;
    if (mimeType.includes('image')) return Image;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileSpreadsheet;
    return FileText;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return '#10b981';
      case 'expired': return '#ef4444';
      case 'expiring': return '#f59e0b';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return CheckCircle;
      case 'expired': return XCircle;
      case 'expiring': return AlertTriangle;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadProgress(0);
          alert('Document uploaded successfully!');
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDeleteDocument = (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      console.log('Deleting document:', documentId);
      alert('Document deleted! This would remove the document in a real application.');
    }
  };

  const handleDownloadDocument = (documentId: string) => {
    console.log('Downloading document:', documentId);
    alert('Document download started! This would download the file in a real application.');
  };

  const handlePreviewDocument = (documentId: string) => {
    console.log('Previewing document:', documentId);
    alert('Document preview opened! This would open the file preview in a real application.');
  };

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
          Document Management
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Manage your maritime documents and certificates
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
              <FileText size={20} color="#3b82f6" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {documents.length}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Total Documents</p>
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
                {documents.filter(d => d.status === 'valid').length}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Valid</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color="#f59e0b" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {documents.filter(d => {
                  const daysUntilExpiry = getDaysUntilExpiry(d.expiryDate);
                  return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                }).length}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Expiring Soon</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#fecaca', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={20} color="#ef4444" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {documents.filter(d => {
                  const daysUntilExpiry = getDaysUntilExpiry(d.expiryDate);
                  return daysUntilExpiry <= 0;
                }).length}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Expired</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '24px', 
        borderRadius: '12px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
        marginBottom: '24px',
        border: '2px dashed #d1d5db'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Upload size={48} color="#6b7280" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
            Upload New Document
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 20px 0' }}>
            Drag and drop files here or click to browse
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto',
              opacity: isUploading ? 0.6 : 1
            }}
          >
            <Plus size={16} />
            Choose Files
          </button>

          {isUploading && (
            <div style={{ marginTop: '20px' }}>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e2e8f0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  backgroundColor: '#3b82f6',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '8px 0 0 0' }}>
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Documents Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '24px' 
      }}>
        {sortedDocuments.map((document) => {
          const FileIcon = getFileIcon(document.mimeType);
          const StatusIcon = getStatusIcon(document.status);
          const daysUntilExpiry = getDaysUntilExpiry(document.expiryDate);
          
          return (
            <div key={document.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              border: selectedDocument === document.id ? '2px solid #3b82f6' : '1px solid #e2e8f0'
            }}>
              {/* Header */}
              <div style={{ padding: '20px 20px 16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      backgroundColor: '#f1f5f9', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <FileIcon size={20} color="#6b7280" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0', color: '#1f2937' }}>
                        {document.title}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                        {document.category}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      backgroundColor: `${getStatusColor(document.status)}20`,
                      borderRadius: '6px'
                    }}>
                      <StatusIcon size={14} color={getStatusColor(document.status)} />
                      <span style={{ fontSize: '12px', fontWeight: '500', color: getStatusColor(document.status) }}>
                        {document.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0', fontWeight: '500' }}>DESCRIPTION</p>
                  <p style={{ fontSize: '14px', color: '#1f2937', margin: 0, lineHeight: '1.4' }}>
                    {document.description}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: '500' }}>ISSUE DATE</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#6b7280" />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                        {formatDate(document.issueDate)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: '500' }}>EXPIRY DATE</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#6b7280" />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                        {formatDate(document.expiryDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handlePreviewDocument(document.id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#f1f5f9',
                      color: '#64748b',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                  <button
                    onClick={() => handleDownloadDocument(document.id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Download size={14} />
                    Download
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(document.id)}
                    style={{
                      padding: '10px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {sortedDocuments.length === 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '48px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <FileText size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
            No documents found
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            {searchQuery ? 'Try adjusting your search criteria' : 'No documents match the selected filter'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Documents;