import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../hooks/useToast';
import styles from './TravelDocuments.module.css';

interface TravelDocument {
  id: string;
  travel_request_id: string;
  seafarer_id: string;
  document_type: string;
  document_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  created_at: string;
  uploader_name?: string;
}

interface TravelDocumentsProps {
  travelRequestId: string;
  seafarerId: string;
  isReadOnly?: boolean;
}

const TravelDocuments: React.FC<TravelDocumentsProps> = ({ 
  travelRequestId, 
  seafarerId,
  isReadOnly = false 
}) => {
  const { profile } = useAuth();
  const { addToast } = useToast();
  
  const [documents, setDocuments] = useState<TravelDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('e_ticket');
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Fetch documents for this travel request
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('travel_documents')
        .select(`
          *,
          uploader:uploaded_by (full_name)
        `)
        .eq('travel_request_id', travelRequestId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map(doc => ({
        ...doc,
        uploader_name: doc.uploader?.full_name || 'Unknown'
      })) || [];

      setDocuments(transformedData);
    } catch (error) {
      console.error('Error fetching travel documents:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load travel documents',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (travelRequestId) {
      fetchDocuments();
    }
  }, [travelRequestId]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        addToast({
          title: 'File Too Large',
          description: 'File size must be less than 10MB',
          type: 'error'
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  // Upload document
  const handleUpload = async () => {
    if (!selectedFile || !profile?.id) return;

    try {
      setUploading(true);

      // Generate unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${travelRequestId}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('travel-documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Insert document record
      const { error: dbError } = await supabase
        .from('travel_documents')
        .insert({
          travel_request_id: travelRequestId,
          seafarer_id: seafarerId,
          document_type: documentType,
          document_name: selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          file_type: selectedFile.type,
          uploaded_by: profile.id
        });

      if (dbError) throw dbError;

      addToast({
        title: 'Success',
        description: 'Document uploaded successfully',
        type: 'success'
      });

      // Reset form and refresh
      setSelectedFile(null);
      setShowUploadForm(false);
      setDocumentType('e_ticket');
      fetchDocuments();

    } catch (error: any) {
      console.error('Error uploading document:', error);
      addToast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload document',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  // Download document
  const handleDownload = async (doc: TravelDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('travel-documents')
        .download(doc.file_path);

      if (error) throw error;

      // Create download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.document_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addToast({
        title: 'Downloaded',
        description: `${doc.document_name} downloaded successfully`,
        type: 'success'
      });
    } catch (error: any) {
      console.error('Error downloading document:', error);
      addToast({
        title: 'Download Failed',
        description: error.message || 'Failed to download document',
        type: 'error'
      });
    }
  };

  // Delete document
  const handleDelete = async (doc: TravelDocument) => {
    if (!confirm(`Are you sure you want to delete ${doc.document_name}?`)) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('travel-documents')
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('travel_documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      addToast({
        title: 'Deleted',
        description: 'Document deleted successfully',
        type: 'success'
      });

      fetchDocuments();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      addToast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete document',
        type: 'error'
      });
    }
  };

  // Get document icon
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'e_ticket': return '✈️';
      case 'boarding_pass': return '🎫';
      case 'hotel_confirmation': return '🏨';
      case 'visa': return '🛂';
      case 'insurance': return '🛡️';
      case 'itinerary': return '📋';
      case 'receipt': return '🧾';
      default: return '📄';
    }
  };

  // Format document type for display
  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>📎 Travel Documents ({documents.length})</h3>
          <p className={styles.subtitle}>
            {isReadOnly ? 'View and download travel documents' : 'Upload and manage travel documents'}
          </p>
        </div>
        {!isReadOnly && (
          <button
            className={styles.uploadButton}
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            {showUploadForm ? '✕ Cancel' : '+ Upload Document'}
          </button>
        )}
      </div>

      {/* Upload Form */}
      {showUploadForm && !isReadOnly && (
        <div className={styles.uploadForm}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className={styles.select}
            >
              <option value="e_ticket">E-Ticket</option>
              <option value="boarding_pass">Boarding Pass</option>
              <option value="hotel_confirmation">Hotel Confirmation</option>
              <option value="visa">Visa</option>
              <option value="insurance">Insurance</option>
              <option value="itinerary">Itinerary</option>
              <option value="receipt">Receipt</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Select File</label>
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className={styles.fileInput}
            />
            {selectedFile && (
              <p className={styles.fileInfo}>
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>

          <button
            className={styles.submitButton}
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      )}

      {/* Documents List */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📄</div>
          <h4>No Documents Yet</h4>
          <p>
            {isReadOnly 
              ? 'No travel documents have been uploaded yet'
              : 'Click "Upload Document" to add travel documents'}
          </p>
        </div>
      ) : (
        <div className={styles.documentsList}>
          {documents.map((doc) => (
            <div key={doc.id} className={styles.documentCard}>
              <div className={styles.documentIcon}>
                {getDocumentIcon(doc.document_type)}
              </div>
              <div className={styles.documentInfo}>
                <h4 className={styles.documentName}>{doc.document_name}</h4>
                <div className={styles.documentMeta}>
                  <span className={styles.documentType}>
                    {formatDocumentType(doc.document_type)}
                  </span>
                  <span className={styles.documentSize}>
                    {formatFileSize(doc.file_size)}
                  </span>
                </div>
                <p className={styles.documentUploader}>
                  Uploaded by {doc.uploader_name} on {formatDate(doc.created_at)}
                </p>
              </div>
              <div className={styles.documentActions}>
                <button
                  className={styles.downloadButton}
                  onClick={() => handleDownload(doc)}
                  title="Download"
                >
                  ⬇
                </button>
                {!isReadOnly && (
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(doc)}
                    title="Delete"
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TravelDocuments;
