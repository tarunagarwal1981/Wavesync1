import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import TravelDocuments from './TravelDocuments';
import styles from './MyTravel.module.css';

interface TravelRequest {
  id: string;
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
  created_at: string;
  assignment_title?: string;
}

interface FlightBooking {
  id: string;
  airline: string;
  flight_number: string;
  departure_date: string;
  arrival_date: string;
  departure_airport: string;
  arrival_airport: string;
  seat_number: string | null;
  class: string;
  booking_reference: string | null;
  status: string;
}

const MyTravel: React.FC = () => {
  const { profile } = useAuth();
  const { addToast } = useToast();
  
  const [travelRequests, setTravelRequests] = useState<TravelRequest[]>([]);
  const [selectedTravel, setSelectedTravel] = useState<TravelRequest | null>(null);
  const [flightBookings, setFlightBookings] = useState<FlightBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Fetch travel requests for the logged-in seafarer
  const fetchTravelRequests = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('travel_requests')
        .select(`
          *,
          assignments(title)
        `)
        .eq('seafarer_id', profile.id)
        .order('travel_date', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map(item => ({
        ...item,
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

  // Fetch flight bookings for a specific travel request
  const fetchFlightBookings = async (travelRequestId: string) => {
    try {
      setLoadingFlights(true);
      
      const { data, error } = await supabase
        .from('flight_bookings')
        .select('*')
        .eq('travel_request_id', travelRequestId)
        .order('departure_date', { ascending: true });

      if (error) throw error;

      setFlightBookings(data || []);
    } catch (error) {
      console.error('Error fetching flight bookings:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load flight details',
        type: 'error'
      });
    } finally {
      setLoadingFlights(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchTravelRequests();
    }
  }, [profile?.id]);

  const handleViewDetails = (travel: TravelRequest) => {
    setSelectedTravel(travel);
    fetchFlightBookings(travel.id);
  };

  const handleCloseDetails = () => {
    setSelectedTravel(null);
    setFlightBookings([]);
  };

  // Filter travel requests
  const filteredRequests = travelRequests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesType = filterType === 'all' || request.travel_type === filterType;
    return matchesStatus && matchesType;
  });

  // Separate upcoming and past travels
  const upcomingTravels = filteredRequests.filter(t => new Date(t.travel_date) >= new Date());
  const pastTravels = filteredRequests.filter(t => new Date(t.travel_date) < new Date());

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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilTravel = (travelDate: string) => {
    const today = new Date();
    const travel = new Date(travelDate);
    const diffTime = travel.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>My Travel</h2>
          <p className={styles.subtitle}>View your upcoming and past travel arrangements</p>
        </div>
      </div>

      <div className={styles.filtersCard}>
        <div className={styles.filters}>
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
          <p>Loading your travel itinerary...</p>
        </div>
      ) : (
        <>
          {/* Upcoming Travel Section */}
          {upcomingTravels.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>✈️ Upcoming Travel</h3>
              <div className={styles.grid}>
                {upcomingTravels.map((travel) => {
                  const daysUntil = getDaysUntilTravel(travel.travel_date);
                  return (
                    <div key={travel.id} className={styles.card}>
                      <div className={styles.cardHeader}>
                        <div>
                          <h4 className={styles.cardTitle}>
                            {travel.travel_type.replace('_', ' ').toUpperCase()}
                          </h4>
                          {travel.assignment_title && (
                            <p className={styles.cardSubtitle}>{travel.assignment_title}</p>
                          )}
                        </div>
                        <div className={styles.cardBadges}>
                          <span className={`${styles.badge} ${getStatusColor(travel.status)}`}>
                            {travel.status}
                          </span>
                          {travel.priority !== 'normal' && (
                            <span className={`${styles.badge} ${getPriorityColor(travel.priority)}`}>
                              {travel.priority}
                            </span>
                          )}
                        </div>
                      </div>

                      {daysUntil <= 7 && daysUntil >= 0 && (
                        <div className={styles.urgentBanner}>
                          {daysUntil === 0 ? '🚨 Travel is TODAY!' : 
                           daysUntil === 1 ? '⚠️ Travel is TOMORROW!' :
                           `⏰ ${daysUntil} days until travel`}
                        </div>
                      )}

                      <div className={styles.travelRoute}>
                        <div className={styles.location}>
                          <span className={styles.locationIcon}>🛫</span>
                          <div>
                            <p className={styles.locationCity}>{travel.origin_city}</p>
                            <p className={styles.locationCountry}>{travel.origin_country}</p>
                          </div>
                        </div>
                        <div className={styles.routeArrow}>→</div>
                        <div className={styles.location}>
                          <span className={styles.locationIcon}>🛬</span>
                          <div>
                            <p className={styles.locationCity}>{travel.destination_city}</p>
                            <p className={styles.locationCountry}>{travel.destination_country}</p>
                          </div>
                        </div>
                      </div>

                      <div className={styles.cardDetails}>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Departure:</span>
                          <span className={styles.detailValue}>{formatDate(travel.travel_date)}</span>
                        </div>
                        {travel.return_date && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Return:</span>
                            <span className={styles.detailValue}>{formatDate(travel.return_date)}</span>
                          </div>
                        )}
                      </div>

                      {travel.special_requirements && (
                        <div className={styles.requirements}>
                          <p className={styles.requirementsLabel}>Special Requirements:</p>
                          <p className={styles.requirementsText}>{travel.special_requirements}</p>
                        </div>
                      )}

                      <button
                        onClick={() => handleViewDetails(travel)}
                        className={styles.viewButton}
                      >
                        View Details
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Travel Section */}
          {pastTravels.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>📋 Past Travel</h3>
              <div className={styles.grid}>
                {pastTravels.map((travel) => (
                  <div key={travel.id} className={`${styles.card} ${styles.pastCard}`}>
                    <div className={styles.cardHeader}>
                      <div>
                        <h4 className={styles.cardTitle}>
                          {travel.travel_type.replace('_', ' ').toUpperCase()}
                        </h4>
                        {travel.assignment_title && (
                          <p className={styles.cardSubtitle}>{travel.assignment_title}</p>
                        )}
                      </div>
                      <span className={`${styles.badge} ${getStatusColor(travel.status)}`}>
                        {travel.status}
                      </span>
                    </div>

                    <div className={styles.travelRoute}>
                      <div className={styles.location}>
                        <span className={styles.locationIcon}>🛫</span>
                        <div>
                          <p className={styles.locationCity}>{travel.origin_city}</p>
                          <p className={styles.locationCountry}>{travel.origin_country}</p>
                        </div>
                      </div>
                      <div className={styles.routeArrow}>→</div>
                      <div className={styles.location}>
                        <span className={styles.locationIcon}>🛬</span>
                        <div>
                          <p className={styles.locationCity}>{travel.destination_city}</p>
                          <p className={styles.locationCountry}>{travel.destination_country}</p>
                        </div>
                      </div>
                    </div>

                    <div className={styles.cardDetails}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Departure:</span>
                        <span className={styles.detailValue}>{formatDate(travel.travel_date)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewDetails(travel)}
                      className={styles.viewButton}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredRequests.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>✈️</div>
              <h3>No Travel Arrangements Found</h3>
              <p>You don't have any travel arrangements yet</p>
            </div>
          )}
        </>
      )}

      {/* Travel Details Modal */}
      {selectedTravel && (
        <div className={styles.modal} onClick={handleCloseDetails}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Travel Details</h3>
              <button onClick={handleCloseDetails} className={styles.closeButton}>✕</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalSection}>
                <h4>Travel Information</h4>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Type:</span>
                    <span className={styles.infoValue}>
                      {selectedTravel.travel_type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Status:</span>
                    <span className={`${styles.badge} ${getStatusColor(selectedTravel.status)}`}>
                      {selectedTravel.status}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Travel Date:</span>
                    <span className={styles.infoValue}>{formatDate(selectedTravel.travel_date)}</span>
                  </div>
                  {selectedTravel.return_date && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Return Date:</span>
                      <span className={styles.infoValue}>{formatDate(selectedTravel.return_date)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Flight Details */}
              {loadingFlights ? (
                <div className={styles.modalSection}>
                  <h4>Flight Details</h4>
                  <div className={styles.loadingSmall}>
                    <div className={styles.spinnerSmall}></div>
                    <p>Loading flight details...</p>
                  </div>
                </div>
              ) : flightBookings.length > 0 ? (
                <div className={styles.modalSection}>
                  <h4>Flight Details</h4>
                  {flightBookings.map((flight) => (
                    <div key={flight.id} className={styles.flightCard}>
                      <div className={styles.flightHeader}>
                        <span className={styles.airline}>{flight.airline} {flight.flight_number}</span>
                        {flight.booking_reference && (
                          <span className={styles.bookingRef}>Ref: {flight.booking_reference}</span>
                        )}
                      </div>
                      <div className={styles.flightRoute}>
                        <div>
                          <p className={styles.airport}>{flight.departure_airport}</p>
                          <p className={styles.datetime}>{formatDateTime(flight.departure_date)}</p>
                        </div>
                        <span className={styles.flightArrow}>✈️</span>
                        <div>
                          <p className={styles.airport}>{flight.arrival_airport}</p>
                          <p className={styles.datetime}>{formatDateTime(flight.arrival_date)}</p>
                        </div>
                      </div>
                      <div className={styles.flightDetails}>
                        <span>Class: {flight.class}</span>
                        {flight.seat_number && <span>Seat: {flight.seat_number}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.modalSection}>
                  <h4>Flight Details</h4>
                  <p className={styles.noData}>No flight bookings yet</p>
                </div>
              )}

              {/* Travel Documents */}
              <div className={styles.modalSection}>
                <TravelDocuments
                  travelRequestId={selectedTravel.id}
                  seafarerId={profile?.id || ''}
                  isReadOnly={true}
                />
              </div>

              {selectedTravel.notes && (
                <div className={styles.modalSection}>
                  <h4>Notes</h4>
                  <p className={styles.notesText}>{selectedTravel.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTravel;
