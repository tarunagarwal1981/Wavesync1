import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/SupabaseAuthContext';
import styles from './AssignmentManagement.module.css';

interface Assignment {
  id: string;
  title?: string;
  seafarer_id: string;
  vessel_id: string;
  vessel_name?: string;
  vessel_type?: string;
  departure_port?: string;
  arrival_port?: string;
  start_date?: string;
  end_date?: string;
  tentative_start_date?: string;
  tentative_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  salary?: number;
  status: string;
  response_status?: string;
  response_date?: string;
  response_notes?: string;
  priority: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  seafarer?: {
    full_name: string;
    email: string;
    rank?: string;
  };
  vessel?: {
    name: string;
    vessel_type: string;
    company?: {
      name: string;
    };
  };
  created_by?: string;
  approved_by?: string;
}

interface Seafarer {
  id: string;
  full_name: string;
  email: string;
  rank?: string;
  availability_status: string;
  company_id?: string;
}

interface Vessel {
  id: string;
  name: string;
  vessel_type: string;
  company_id?: string;
  status: string;
}

interface AssignmentFormData {
  title: string;
  seafarer_id: string;
  vessel_id: string;
  departure_port: string;
  arrival_port: string;
  tentative_start_date: string;
  tentative_end_date: string;
  salary: number;
  priority: string;
  notes: string;
}

const AssignmentManagement: React.FC = () => {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [seafarers, setSeafarers] = useState<Seafarer[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    seafarer_id: '',
    vessel_id: '',
    departure_port: '',
    arrival_port: '',
    tentative_start_date: '',
    tentative_end_date: '',
    salary: 0,
    priority: 'normal',
    notes: ''
  });
  const { addToast } = useToast();

  useEffect(() => {
    fetchAssignments();
    fetchSeafarers();
    fetchVessels();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          seafarer:user_profiles!seafarer_id(full_name, email),
          vessel:vessels!vessel_id(name, vessel_type, company:companies(name))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch seafarer profiles for rank information
      const seafarerIds = (data || []).map(a => a.seafarer_id).filter(Boolean);
      let seafarerProfiles: Record<string, any> = {};
      
      if (seafarerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('seafarer_profiles')
          .select('user_id, rank')
          .in('user_id', seafarerIds);
        
        seafarerProfiles = (profiles || []).reduce((acc: Record<string, any>, profile: any) => {
          acc[profile.user_id] = profile;
          return acc;
        }, {});
      }
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(assignment => ({
        ...assignment,
        seafarer: {
          ...assignment.seafarer,
          rank: seafarerProfiles[assignment.seafarer_id]?.rank || 'N/A'
        }
      }));
      
      setAssignments(transformedData);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      addToast({
        type: 'error',
        title: 'Failed to fetch assignments',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSeafarers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          full_name,
          email,
          company_id,
          seafarer_profile:seafarer_profiles(rank, availability_status)
        `)
        .eq('user_type', 'seafarer')
        .order('full_name');

      if (error) throw error;
      
      // Transform to match our interface
      const transformedData = (data || []).map((seafarer: any) => ({
        id: seafarer.id,
        full_name: seafarer.full_name,
        email: seafarer.email,
        rank: Array.isArray(seafarer.seafarer_profile) && seafarer.seafarer_profile.length > 0 
          ? seafarer.seafarer_profile[0].rank 
          : seafarer.seafarer_profile?.rank,
        availability_status: Array.isArray(seafarer.seafarer_profile) && seafarer.seafarer_profile.length > 0
          ? seafarer.seafarer_profile[0].availability_status || 'available'
          : seafarer.seafarer_profile?.availability_status || 'available',
        company_id: seafarer.company_id
      }));
      
      setSeafarers(transformedData);
    } catch (error) {
      console.error('Error fetching seafarers:', error);
    }
  };

  const fetchVessels = async () => {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .select('id, name, vessel_type, company_id, status')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setVessels(data || []);
    } catch (error) {
      console.error('Error fetching vessels:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salary' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For company users, require company_id
    if (!profile?.company_id && profile?.user_type !== 'admin') {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Unable to determine company. Please contact support.',
        duration: 5000
      });
      return;
    }
    
    try {
      if (editingAssignment) {
        // Update existing assignment
        const { error } = await supabase
          .from('assignments')
          .update({
            title: formData.title,
            vessel_id: formData.vessel_id,
            departure_port: formData.departure_port,
            arrival_port: formData.arrival_port,
            tentative_start_date: formData.tentative_start_date || null,
            tentative_end_date: formData.tentative_end_date || null,
            salary: formData.salary || null,
            priority: formData.priority,
            notes: formData.notes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAssignment.id);

        if (error) throw error;

        addToast({
          type: 'success',
          title: 'Assignment updated successfully',
          duration: 5000
        });
      } else {
        // Create new assignment
        const { error } = await supabase
          .from('assignments')
          .insert({
            title: formData.title,
            company_id: profile?.company_id || null,
            seafarer_id: formData.seafarer_id,
            vessel_id: formData.vessel_id,
            departure_port: formData.departure_port,
            arrival_port: formData.arrival_port,
            tentative_start_date: formData.tentative_start_date || null,
            tentative_end_date: formData.tentative_end_date || null,
            salary: formData.salary || null,
            priority: formData.priority,
            notes: formData.notes || null,
            status: 'pending'
          });

        if (error) throw error;

        addToast({
          type: 'success',
          title: 'Assignment created successfully',
          description: 'The seafarer will be notified of their new assignment.',
          duration: 8000
        });
      }

      // Reset form and refresh data
      resetForm();
      fetchAssignments();
    } catch (error) {
      console.error('Error saving assignment:', error);
      addToast({
        type: 'error',
        title: editingAssignment ? 'Failed to update assignment' : 'Failed to create assignment',
        duration: 5000
      });
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title || '',
      seafarer_id: assignment.seafarer_id,
      vessel_id: assignment.vessel_id,
      departure_port: assignment.departure_port || '',
      arrival_port: assignment.arrival_port || '',
      tentative_start_date: assignment.tentative_start_date || '',
      tentative_end_date: assignment.tentative_end_date || '',
      salary: assignment.salary || 0,
      priority: assignment.priority,
      notes: assignment.notes || ''
    });
    setShowCreateForm(true);
  };

  const handleStatusChange = async (assignmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', assignmentId);

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'Assignment status updated',
        duration: 5000
      });

      fetchAssignments();
    } catch (error) {
      console.error('Error updating assignment status:', error);
      addToast({
        type: 'error',
        title: 'Failed to update assignment status',
        duration: 5000
      });
    }
  };

  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'Assignment deleted successfully',
        duration: 5000
      });

      fetchAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      addToast({
        type: 'error',
        title: 'Failed to delete assignment',
        duration: 5000
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      seafarer_id: '',
      vessel_id: '',
      departure_port: '',
      arrival_port: '',
      tentative_start_date: '',
      tentative_end_date: '',
      salary: 0,
      priority: 'normal',
      notes: ''
    });
    setEditingAssignment(null);
    setShowCreateForm(false);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'var(--color-warning)',
      'accepted': 'var(--color-success)',
      'declined': 'var(--color-error)',
      'active': 'var(--color-primary)',
      'completed': 'var(--color-success)',
      'cancelled': 'var(--text-secondary)'
    };
    return colors[status] || 'var(--text-secondary)';
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'low': 'var(--color-success)',
      'normal': 'var(--text-secondary)',
      'high': 'var(--color-warning)',
      'urgent': 'var(--color-error)'
    };
    return colors[priority] || 'var(--text-secondary)';
  };

  const getResponseStatusColor = (responseStatus: string) => {
    const colors: { [key: string]: string } = {
      'pending': '#f59e0b',
      'accepted': '#10b981',
      'rejected': '#ef4444'
    };
    return colors[responseStatus] || 'var(--text-secondary)';
  };

  const getAvailableSeafarers = () => {
    return seafarers.filter(seafarer => 
      seafarer.availability_status === 'available' || 
      seafarer.availability_status === 'on_contract'
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Assignment Management</h1>
        <button
          className={styles.createButton}
          onClick={() => setShowCreateForm(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Create Assignment
        </button>
      </div>

      {showCreateForm && (
        <div className={styles.formContainer}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2>{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</h2>
              <button className={styles.closeButton} onClick={resetForm}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="title">Assignment Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter assignment title"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="seafarer_id">Seafarer *</label>
                  <select
                    id="seafarer_id"
                    name="seafarer_id"
                    value={formData.seafarer_id}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingAssignment}
                  >
                    <option value="">Select a seafarer</option>
                    {getAvailableSeafarers().map(seafarer => (
                      <option key={seafarer.id} value={seafarer.id}>
                        {seafarer.full_name} ({seafarer.rank}) - {seafarer.availability_status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="vessel_id">Vessel *</label>
                  <select
                    id="vessel_id"
                    name="vessel_id"
                    value={formData.vessel_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a vessel</option>
                    {vessels.map(vessel => (
                      <option key={vessel.id} value={vessel.id}>
                        {vessel.name} ({vessel.vessel_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="departure_port">Departure Port *</label>
                  <input
                    type="text"
                    id="departure_port"
                    name="departure_port"
                    value={formData.departure_port}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter departure port"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="arrival_port">Arrival Port *</label>
                  <input
                    type="text"
                    id="arrival_port"
                    name="arrival_port"
                    value={formData.arrival_port}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter arrival port"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="tentative_start_date">Tentative Start Date</label>
                  <input
                    type="date"
                    id="tentative_start_date"
                    name="tentative_start_date"
                    value={formData.tentative_start_date}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="tentative_end_date">Tentative End Date</label>
                  <input
                    type="date"
                    id="tentative_end_date"
                    name="tentative_end_date"
                    value={formData.tentative_end_date}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="salary">Salary (USD)</label>
                  <input
                    type="number"
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="Enter salary"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter any additional notes or requirements"
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.assignmentsGrid}>
        {assignments.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>No Assignments Found</h3>
            <p>Get started by creating your first assignment.</p>
            <button
              className={styles.createButton}
              onClick={() => setShowCreateForm(true)}
            >
              Create Assignment
            </button>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment.id} className={styles.assignmentCard}>
              <div className={styles.assignmentHeader}>
                <div className={styles.assignmentInfo}>
                  <h3 className={styles.assignmentTitle}>
                    {assignment.seafarer?.full_name} → {assignment.vessel?.name}
                  </h3>
                  <p className={styles.assignmentRoute}>
                    {assignment.departure_port} → {assignment.arrival_port}
                  </p>
                  <div className={styles.assignmentStatus} style={{ color: getStatusColor(assignment.status) }}>
                    {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                  </div>
                  {assignment.response_status && (
                    <div className={styles.responseStatus} style={{ color: getResponseStatusColor(assignment.response_status) }}>
                      {assignment.response_status === 'pending' ? '⏳' : assignment.response_status === 'accepted' ? '✅' : '❌'} {assignment.response_status.charAt(0).toUpperCase() + assignment.response_status.slice(1)}
                    </div>
                  )}
                  <div className={styles.assignmentPriority} style={{ color: getPriorityColor(assignment.priority) }}>
                    {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)} Priority
                  </div>
                </div>
                <div className={styles.assignmentActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEdit(assignment)}
                    title="Edit assignment"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2"/>
                      <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(assignment.id)}
                    title="Delete assignment"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className={styles.assignmentDetails}>
                {assignment.seafarer?.rank && (
                  <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Rank: {assignment.seafarer.rank}</span>
                  </div>
                )}

                {assignment.vessel?.vessel_type && (
                  <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 21H21L19 7H5L3 21Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 9V13" stroke="currentColor" strokeWidth="2"/>
                      <path d="M15 9V13" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Type: {assignment.vessel.vessel_type}</span>
                  </div>
                )}

                {assignment.tentative_start_date && (
                  <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Start: {new Date(assignment.tentative_start_date).toLocaleDateString()}</span>
                  </div>
                )}

                {assignment.tentative_end_date && (
                  <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>End: {new Date(assignment.tentative_end_date).toLocaleDateString()}</span>
                  </div>
                )}

                {assignment.salary && (
                  <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 1V23M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Salary: ${assignment.salary.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {assignment.notes && (
                <div className={styles.assignmentNotes}>
                  <strong>Notes:</strong> {assignment.notes}
                </div>
              )}

              <div className={styles.assignmentFooter}>
                <div className={styles.statusActions}>
                  <select
                    value={assignment.status}
                    onChange={(e) => handleStatusChange(assignment.id, e.target.value)}
                    className={styles.statusSelect}
                    style={{ color: getStatusColor(assignment.status) }}
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="declined">Declined</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <span className={styles.createdDate}>
                  Created: {new Date(assignment.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssignmentManagement;
