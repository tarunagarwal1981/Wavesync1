import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import TravelDocuments from './TravelDocuments';
import styles from './TravelManagement.module.css';

interface TravelRequest {
  id: string;
  seafarer_id: string;
  assignment_id: string | null;
  company_id: string;
  travel_type: 'sign_on' | 'sign_off' | 'leave' | 'medical' | 'emergency' | 'shore_leave';
  travel_date: string;
  return_date: string | null;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  status: 'pending' | 'approved' | 'booked' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes: string | null;
  special_requirements: string | null;
  estimated_cost: number | null;
  created_at: string;
  seafarer_name?: string;
  assignment_title?: string;
}

interface Seafarer {
  id: string;
  full_name: string;
  email: string;
}

interface Assignment {
  id: string;
  title: string;
  seafarer_id: string;
}

interface TravelFormData {
  seafarer_id: string;
  assignment_id: string;
  travel_type: string;
  travel_date: string;
  return_date: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  status: string;
  priority: string;
  notes: string;
  special_requirements: string;
  estimated_cost: string;
}

const TravelManagement: React.FC = () => {
  const { profile } = useAuth();
  const { addToast } = useToast();
  
  const [travelRequests, setTravelRequests] = useState<TravelRequest[]>([]);
  const [seafarers, setSeafarers] = useState<Seafarer[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedDocuments, setExpandedDocuments] = useState<string | null>(null);

  const [formData, setFormData] = useState<TravelFormData>({
    seafarer_id: '',
    assignment_id: '',
    travel_type: 'sign_on',
    travel_date: '',
    return_date: '',
    origin_city: '',
    origin_country: '',
    destination_city: '',
    destination_country: '',
    status: 'pending',
    priority: 'normal',
    notes: '',
    special_requirements: '',
    estimated_cost: ''
  });

  // Fetch travel requests
  const fetchTravelRequests = async () => {
    if (!profile?.company_id) return;

    try {
      setLoading(true);
      
      // Fetch travel requests with seafarer details
      const { data, error } = await supabase
        .from('travel_requests')
        .select(`
          *,
          user_profiles!travel_requests_seafarer_id_fkey(full_name),
          assignments(title)
        `)
        .eq('company_id', profile.company_id)
        .order('travel_date', { ascending: false });

      if (error) throw error;

      // Transform the data
      const transformedData = data?.map(item => ({
        ...item,
        seafarer_name: item.user_profiles?.full_name || 'Unknown',
        assignment_title: item.assignments?.title || null
      })) || [];

      setTravelRequests(transformedData);
    } catch (error) {
      console.error('Error fetching travel requests:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load travel requests',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch seafarers for the dropdown
  const fetchSeafarers = async () => {
    if (!profile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('company_id', profile.company_id)
        .eq('user_type', 'seafarer')
        .order('full_name');

      if (error) throw error;
      setSeafarers(data || []);
    } catch (error) {
      console.error('Error fetching seafarers:', error);
    }
  };

  // Fetch assignments for the dropdown
  const fetchAssignments = async () => {
    if (!profile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('id, title, seafarer_id')
        .eq('company_id', profile.company_id)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  useEffect(() => {
    if (profile?.company_id) {
      fetchTravelRequests();
      fetchSeafarers();
      fetchAssignments();
    }
  }, [profile?.company_id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      seafarer_id: '',
      assignment_id: '',
      travel_type: 'sign_on',
      travel_date: '',
      return_date: '',
      origin_city: '',
      origin_country: '',
      destination_city: '',
      destination_country: '',
      status: 'pending',
      priority: 'normal',
      notes: '',
      special_requirements: '',
      estimated_cost: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile?.company_id) {
      addToast({
        title: 'Error',
        description: 'Company information not found',
        type: 'error'
      });
      return;
    }

    try {
      const travelData = {
        seafarer_id: formData.seafarer_id,
        assignment_id: formData.assignment_id || null,
        company_id: profile.company_id,
        travel_type: formData.travel_type,
        travel_date: formData.travel_date,
        return_date: formData.return_date || null,
        origin_city: formData.origin_city,
        origin_country: formData.origin_country,
        destination_city: formData.destination_city,
        destination_country: formData.destination_country,
        status: formData.status,
        priority: formData.priority,
        notes: formData.notes || null,
        special_requirements: formData.special_requirements || null,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
        created_by: profile.id
      };

      if (editingId) {
        const { error } = await supabase
          .from('travel_requests')
          .update(travelData)
          .eq('id', editingId);

        if (error) throw error;

        addToast({
          title: 'Success',
          description: 'Travel request updated successfully',
          type: 'success'
        });
      } else {
        const { error } = await supabase
          .from('travel_requests')
          .insert(travelData);

        if (error) throw error;

        addToast({
          title: 'Success',
          description: 'Travel request created successfully',
          type: 'success'
        });
      }

      resetForm();
      fetchTravelRequests();
    } catch (error: any) {
      console.error('Error saving travel request:', error);
      addToast({
        title: 'Error',
        description: error.message || 'Failed to save travel request',
        type: 'error'
      });
    }
  };

  const handleEdit = (travelRequest: TravelRequest) => {
    setFormData({
      seafarer_id: travelRequest.seafarer_id,
      assignment_id: travelRequest.assignment_id || '',
      travel_type: travelRequest.travel_type,
      travel_date: travelRequest.travel_date,
      return_date: travelRequest.return_date || '',
      origin_city: travelRequest.origin_city,
      origin_country: travelRequest.origin_country,
      destination_city: travelRequest.destination_city,
      destination_country: travelRequest.destination_country,
      status: travelRequest.status,
      priority: travelRequest.priority,
      notes: travelRequest.notes || '',
      special_requirements: travelRequest.special_requirements || '',
      estimated_cost: travelRequest.estimated_cost?.toString() || ''
    });
    setEditingId(travelRequest.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this travel request?')) return;

    try {
      const { error } = await supabase
        .from('travel_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      addToast({
        title: 'Success',
        description: 'Travel request deleted successfully',
        type: 'success'
      });

      fetchTravelRequests();
    } catch (error: any) {
      console.error('Error deleting travel request:', error);
      addToast({
        title: 'Error',
        description: error.message || 'Failed to delete travel request',
        type: 'error'
      });
    }
  };

  // Filter travel requests
  const filteredRequests = travelRequests.filter(request => {
    const matchesSearch = request.seafarer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.origin_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.destination_city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesType = filterType === 'all' || request.travel_type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return styles.statusPending;
      case 'approved': return styles.statusApproved;
      case 'booked': return styles.statusBooked;
      case 'confirmed': return styles.statusConfirmed;
      case 'in_progress': return styles.statusInProgress;
      case 'completed': return styles.statusCompleted;
      case 'cancelled': return styles.statusCancelled;
      default: return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return styles.priorityUrgent;
      case 'high': return styles.priorityHigh;
      case 'normal': return styles.priorityNormal;
      case 'low': return styles.priorityLow;
      default: return '';
    }
  };

  // Filter assignments based on selected seafarer
  const filteredAssignments = formData.seafarer_id
    ? assignments.filter(a => a.seafarer_id === formData.seafarer_id)
    : assignments;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Travel Management</h2>
          <p className={styles.subtitle}>Manage seafarer travel requests and bookings</p>
        </div>
        <button 
          className={styles.createButton}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Create Travel Request'}
        </button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>
            {editingId ? 'Edit Travel Request' : 'Create New Travel Request'}
          </h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Seafarer *</label>
                <select
                  name="seafarer_id"
                  value={formData.seafarer_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Seafarer</option>
                  {seafarers.map(seafarer => (
                    <option key={seafarer.id} value={seafarer.id}>
                      {seafarer.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Related Assignment</label>
                <select
                  name="assignment_id"
                  value={formData.assignment_id}
                  onChange={handleInputChange}
                >
                  <option value="">No Assignment</option>
                  {filteredAssignments.map(assignment => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Travel Type *</label>
                <select
                  name="travel_type"
                  value={formData.travel_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="sign_on">Sign On</option>
                  <option value="sign_off">Sign Off</option>
                  <option value="leave">Leave</option>
                  <option value="medical">Medical</option>
                  <option value="emergency">Emergency</option>
                  <option value="shore_leave">Shore Leave</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="booked">Booked</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Travel Date *</label>
                <input
                  type="date"
                  name="travel_date"
                  value={formData.travel_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Return Date</label>
                <input
                  type="date"
                  name="return_date"
                  value={formData.return_date}
                  onChange={handleInputChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Origin City *</label>
                <input
                  type="text"
                  name="origin_city"
                  value={formData.origin_city}
                  onChange={handleInputChange}
                  placeholder="e.g., Mumbai"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Origin Country *</label>
                <input
                  type="text"
                  name="origin_country"
                  value={formData.origin_country}
                  onChange={handleInputChange}
                  placeholder="e.g., India"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Destination City *</label>
                <input
                  type="text"
                  name="destination_city"
                  value={formData.destination_city}
                  onChange={handleInputChange}
                  placeholder="e.g., Singapore"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Destination Country *</label>
                <input
                  type="text"
                  name="destination_country"
                  value={formData.destination_country}
                  onChange={handleInputChange}
                  placeholder="e.g., Singapore"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Priority *</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  required
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Estimated Cost (USD)</label>
                <input
                  type="number"
                  name="estimated_cost"
                  value={formData.estimated_cost}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes or instructions"
                  rows={3}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label>Special Requirements</label>
                <textarea
                  name="special_requirements"
                  value={formData.special_requirements}
                  onChange={handleInputChange}
                  placeholder="Dietary restrictions, accessibility needs, etc."
                  rows={2}
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="button" onClick={resetForm} className={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" className={styles.submitButton}>
                {editingId ? 'Update Travel Request' : 'Create Travel Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.filtersCard}>
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search by seafarer, origin, or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="booked">Booked</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Types</option>
            <option value="sign_on">Sign On</option>
            <option value="sign_off">Sign Off</option>
            <option value="leave">Leave</option>
            <option value="medical">Medical</option>
            <option value="emergency">Emergency</option>
            <option value="shore_leave">Shore Leave</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading travel requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>✈️</div>
          <h3>No Travel Requests Found</h3>
          <p>Create your first travel request to get started</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredRequests.map((request) => (
            <div key={request.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>{request.seafarer_name}</h3>
                  <p className={styles.cardSubtitle}>
                    {request.travel_type.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                <div className={styles.headerRight}>
                  <div className={styles.cardBadges}>
                    <span className={`${styles.badge} ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className={`${styles.badge} ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                  <div className={styles.assignmentActions}>
                    <button
                      onClick={() => handleEdit(request)}
                      className={`${styles.iconButton} edit`}
                      title="Edit travel request"
                      aria-label="Edit travel request"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2"/>
                        <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(request.id)}
                      className={`${styles.iconButton} delete`}
                      title="Delete travel request"
                      aria-label="Delete travel request"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2"/>
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>                </div>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.travelRoute}>
                  <div className={styles.location}>
                    <span className={styles.locationIcon}>🛫</span>
                    <div>
                      <p className={styles.locationCity}>{request.origin_city}</p>
                      <p className={styles.locationCountry}>{request.origin_country}</p>
                    </div>
                  </div>
                  <div className={styles.routeArrow}>→</div>
                  <div className={styles.location}>
                    <span className={styles.locationIcon}>🛬</span>
                    <div>
                      <p className={styles.locationCity}>{request.destination_city}</p>
                      <p className={styles.locationCountry}>{request.destination_country}</p>
                    </div>
                  </div>
                </div>

                <div className={styles.cardDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Travel Date:</span>
                    <span className={styles.detailValue}>
                      {new Date(request.travel_date).toLocaleDateString()}
                    </span>
                  </div>
                  {request.return_date && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Return Date:</span>
                      <span className={styles.detailValue}>
                        {new Date(request.return_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {request.assignment_title && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Assignment:</span>
                      <span className={styles.detailValue}>{request.assignment_title}</span>
                    </div>
                  )}
                  {request.estimated_cost && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Est. Cost:</span>
                      <span className={styles.detailValue}>
                        ${request.estimated_cost.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {request.notes && (
                  <div className={styles.notes}>
                    <p className={styles.notesLabel}>Notes:</p>
                    <p className={styles.notesText}>{request.notes}</p>
                  </div>
                )}
              </div>

              <div className={styles.cardActions}>
                <button
                  onClick={() => setExpandedDocuments(
                    expandedDocuments === request.id ? null : request.id
                  )}
                  className={styles.documentsButton}
                >
                  📎 {expandedDocuments === request.id ? 'Hide' : 'View'} Documents
                </button>
              </div>

              {/* Travel Documents Section */}
              {expandedDocuments === request.id && (
                <TravelDocuments
                  travelRequestId={request.id}
                  seafarerId={request.seafarer_id}
                  isReadOnly={false}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TravelManagement;
