import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import styles from './MyAssignments.module.css';

interface Assignment {
  id: string;
  vessel_id: string;
  position: string;
  rank: string;
  start_date: string;
  end_date: string | null;
  status: string;
  response_status: string;
  response_date: string | null;
  response_notes: string | null;
  salary: number | null;
  currency: string;
  created_at: string;
  vessel_name?: string;
  vessel_type?: string;
  company_name?: string;
}

const MyAssignments: React.FC = () => {
  const { profile } = useAuth();
  const { addToast } = useToast();
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [responding, setResponding] = useState(false);

  // Fetch assignments
  const fetchAssignments = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          vessel:vessels(name, vessel_type),
          company:companies(name)
        `)
        .eq('seafarer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map(item => ({
        ...item,
        vessel_name: item.vessel?.name || 'Unknown Vessel',
        vessel_type: item.vessel?.vessel_type || 'N/A',
        company_name: item.company?.name || 'Unknown Company'
      })) || [];

      setAssignments(transformedData);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load assignments',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [profile?.id]);

  // Handle accept assignment
  const handleAccept = async (assignment: Assignment) => {
    try {
      setResponding(true);

      // Call the database function
      const { error } = await supabase.rpc('respond_to_assignment', {
        p_assignment_id: assignment.id,
        p_response_type: 'accepted',
        p_notes: null
      });

      if (error) throw error;

      addToast({
        title: 'Assignment Accepted',
        description: `You have accepted the assignment for ${assignment.vessel_name}`,
        type: 'success'
      });

      // Refresh assignments
      fetchAssignments();
    } catch (error: any) {
      console.error('Error accepting assignment:', error);
      addToast({
        title: 'Error',
        description: error.message || 'Failed to accept assignment',
        type: 'error'
      });
    } finally {
      setResponding(false);
    }
  };

  // Handle reject assignment (open modal)
  const handleRejectClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setRejectReason('');
    setShowRejectModal(true);
  };

  // Submit rejection
  const handleRejectSubmit = async () => {
    if (!selectedAssignment) return;

    if (!rejectReason.trim()) {
      addToast({
        title: 'Reason Required',
        description: 'Please provide a reason for rejection',
        type: 'error'
      });
      return;
    }

    try {
      setResponding(true);

      // Call the database function
      const { error } = await supabase.rpc('respond_to_assignment', {
        p_assignment_id: selectedAssignment.id,
        p_response_type: 'rejected',
        p_notes: rejectReason
      });

      if (error) throw error;

      addToast({
        title: 'Assignment Rejected',
        description: 'The company has been notified of your decision',
        type: 'info'
      });

      // Close modal and refresh
      setShowRejectModal(false);
      setSelectedAssignment(null);
      setRejectReason('');
      fetchAssignments();
    } catch (error: any) {
      console.error('Error rejecting assignment:', error);
      addToast({
        title: 'Error',
        description: error.message || 'Failed to reject assignment',
        type: 'error'
      });
    } finally {
      setResponding(false);
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    if (filter === 'pending') return assignment.response_status === 'pending';
    if (filter === 'accepted') return assignment.response_status === 'accepted';
    if (filter === 'rejected') return assignment.response_status === 'rejected';
    return true;
  });

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return styles.badgePending;
      case 'active': return styles.badgeActive;
      case 'completed': return styles.badgeCompleted;
      case 'cancelled': return styles.badgeCancelled;
      default: return styles.badgeDefault;
    }
  };

  // Get response status badge color
  const getResponseStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return styles.responsePending;
      case 'accepted': return styles.responseAccepted;
      case 'rejected': return styles.responseRejected;
      default: return styles.responseDefault;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Count assignments by response status
  const pendingCount = assignments.filter(a => a.response_status === 'pending').length;
  const acceptedCount = assignments.filter(a => a.response_status === 'accepted').length;
  const rejectedCount = assignments.filter(a => a.response_status === 'rejected').length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Assignments</h1>
          <p className={styles.subtitle}>View and respond to your vessel assignments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏳</div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{pendingCount}</h3>
            <p className={styles.statLabel}>Pending Response</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{acceptedCount}</h3>
            <p className={styles.statLabel}>Accepted</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>❌</div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{rejectedCount}</h3>
            <p className={styles.statLabel}>Rejected</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.filterActive : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({assignments.length})
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'pending' ? styles.filterActive : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({pendingCount})
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'accepted' ? styles.filterActive : ''}`}
          onClick={() => setFilter('accepted')}
        >
          Accepted ({acceptedCount})
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'rejected' ? styles.filterActive : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading assignments...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📋</div>
          <h3>No Assignments Found</h3>
          <p>
            {filter === 'all' 
              ? 'You have no assignments yet'
              : `No ${filter} assignments`}
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredAssignments.map((assignment) => (
            <div key={assignment.id} className={styles.card}>
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>{assignment.vessel_name}</h3>
                  <p className={styles.cardSubtitle}>{assignment.position}</p>
                </div>
                <div className={styles.badges}>
                  <span className={`${styles.badge} ${getStatusColor(assignment.status)}`}>
                    {assignment.status}
                  </span>
                  <span className={`${styles.responseBadge} ${getResponseStatusColor(assignment.response_status)}`}>
                    {assignment.response_status}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className={styles.cardContent}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Rank:</span>
                  <span className={styles.detailValue}>{assignment.rank}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Vessel Type:</span>
                  <span className={styles.detailValue}>{assignment.vessel_type}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Start Date:</span>
                  <span className={styles.detailValue}>{formatDate(assignment.start_date)}</span>
                </div>
                {assignment.end_date && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>End Date:</span>
                    <span className={styles.detailValue}>{formatDate(assignment.end_date)}</span>
                  </div>
                )}
                {assignment.salary && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Salary:</span>
                    <span className={styles.detailValue}>
                      {assignment.currency} {assignment.salary.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Company:</span>
                  <span className={styles.detailValue}>{assignment.company_name}</span>
                </div>

                {/* Response Info */}
                {assignment.response_status !== 'pending' && (
                  <div className={styles.responseInfo}>
                    <p className={styles.responseDate}>
                      Responded on {assignment.response_date ? formatDate(assignment.response_date) : 'N/A'}
                    </p>
                    {assignment.response_notes && (
                      <p className={styles.responseNotes}>
                        <strong>Notes:</strong> {assignment.response_notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons (only for pending) */}
              {assignment.response_status === 'pending' && (
                <div className={styles.cardActions}>
                  <button
                    className={styles.acceptButton}
                    onClick={() => handleAccept(assignment)}
                    disabled={responding}
                  >
                    ✓ Accept
                  </button>
                  <button
                    className={styles.rejectButton}
                    onClick={() => handleRejectClick(assignment)}
                    disabled={responding}
                  >
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedAssignment && (
        <div className={styles.modal} onClick={() => setShowRejectModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Reject Assignment</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowRejectModal(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                You are about to reject the assignment for <strong>{selectedAssignment.vessel_name}</strong> as <strong>{selectedAssignment.position}</strong>.
              </p>
              <label className={styles.label}>
                Reason for rejection <span className={styles.required}>*</span>
              </label>
              <textarea
                className={styles.textarea}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this assignment..."
                rows={4}
                required
              />
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowRejectModal(false)}
                disabled={responding}
              >
                Cancel
              </button>
              <button
                className={styles.submitRejectButton}
                onClick={handleRejectSubmit}
                disabled={responding || !rejectReason.trim()}
              >
                {responding ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAssignments;
