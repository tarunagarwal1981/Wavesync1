import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Users,
  MoreVertical,
  Download,
  Eye,
  Edit,
  UserPlus,
  Loader
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../hooks/useToast';
import { Modal } from './ui';
import styles from './CrewDirectory.module.css';

// Types
interface CrewMember {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  rank?: string;
  experience_years?: number;
  availability_status: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

// Filter types
type StatusFilter = 'all' | 'available' | 'unavailable' | 'on_assignment';

export const CrewDirectory: React.FC = () => {
  const { profile, signUp } = useAuth();
  const { addToast } = useToast();
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    rank: '',
    experience_years: '',
    certificate_number: '',
    availability_status: 'available' as 'available' | 'unavailable' | 'on_assignment'
  });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    rank: 'Cadet',
    experience_years: '' as number | string,
    certificate_number: ''
  });

  // Fetch crew members from database
  const fetchCrewMembers = useCallback(async () => {
    if (!profile?.company_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      console.log('🔍 Fetching crew members for company_id:', profile.company_id);
      
      // First, let's also check if there are any seafarers without company_id (for debugging)
      const { data: allSeafarers } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, company_id')
        .eq('user_type', 'seafarer')
        .limit(10);
      
      console.log('🔍 All seafarers (first 10):', allSeafarers);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          seafarer_profile:seafarer_profiles!user_id(rank, experience_years, availability_status)
        `)
        .eq('user_type', 'seafarer')
        .eq('company_id', profile.company_id)
        .order('full_name');

      if (error) {
        console.error('❌ Error fetching crew members:', error);
        throw error;
      }

      console.log('✅ Fetched crew members:', data?.length || 0, data);

      // Transform the data to match our interface
      const transformedData = (data || []).map(member => ({
        id: member.id,
        full_name: member.full_name,
        email: member.email,
        phone: member.phone,
        rank: member.seafarer_profile?.rank || 'N/A',
        experience_years: member.seafarer_profile?.experience_years || 0,
        availability_status: member.seafarer_profile?.availability_status || 'unknown',
        company_id: member.company_id,
        created_at: member.created_at,
        updated_at: member.updated_at
      }));

      console.log('✅ Transformed crew members:', transformedData.length);
      setCrewMembers(transformedData);
    } catch (error) {
      console.error('Error fetching crew members:', error);
      addToast({
        type: 'error',
        title: 'Failed to fetch crew members',
        description: 'Please try again later.',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.company_id]);

  useEffect(() => {
    if (profile?.company_id) {
      fetchCrewMembers();
    }
  }, [profile?.company_id, fetchCrewMembers]);

  // Filter crew members based on search and status
  const filteredCrewMembers = useMemo(() => {
    return crewMembers.filter(member => {
      const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (member.rank && member.rank.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || member.availability_status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [crewMembers, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'available': 'var(--color-success)',
      'unavailable': 'var(--color-error)',
      'on_assignment': 'var(--color-warning)',
      'unknown': 'var(--color-text-secondary)'
    };
    return colors[status] || 'var(--color-text-secondary)';
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'available': 'Available',
      'unavailable': 'Unavailable',
      'on_assignment': 'On Assignment',
      'unknown': 'Unknown'
    };
    return statusMap[status] || status;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience_years' ? (value === '' ? '' : parseInt(value) || '') : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.company_id) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Company ID not found. Please log in again.',
        duration: 5000
      });
      return;
    }

    try {
      setSubmitting(true);

      // Check if user with this email already exists
      const { data: existingUsers } = await supabase
        .from('user_profiles')
        .select('id, email')
        .eq('email', formData.email.toLowerCase().trim())
        .limit(1);

      // If user exists, show clear error message
      if (existingUsers && existingUsers.length > 0) {
        throw new Error(`User already exists. A user with email ${formData.email} is already registered. Please use a different email address.`);
      }

      // Use signUp from auth context (doesn't require admin access)
      const { error: signUpError } = await signUp(
        formData.email.toLowerCase().trim(),
        formData.password,
        {
          full_name: formData.full_name.trim(),
          user_type: 'seafarer',
          phone: formData.phone?.trim() || undefined,
          company_id: profile.company_id
        }
      );

      if (signUpError) {
        // Handle specific error messages from Supabase
        let errorMessage = 'Failed to create crew member account';
        
        // Check for common "user already exists" error messages and codes
        const errorMsg = signUpError.message?.toLowerCase() || '';
        const errorCode = (signUpError as any).code || '';
        const statusCode = (signUpError as any).status;
        
        // Supabase returns "user_already_exists" in error code or message
        const isUserExistsError = 
          errorMsg.includes('already registered') || 
          errorMsg.includes('already exists') ||
          errorMsg.includes('user already registered') ||
          errorCode === 'user_already_exists' ||
          errorCode === '422' ||
          statusCode === 422;
        
        if (isUserExistsError) {
          errorMessage = `User already exists. A user with email ${formData.email} is already registered in the system. Please use a different email address.`;
        } else {
          errorMessage = signUpError.message || 'Failed to create crew member account. Please try again.';
        }
        
        throw new Error(errorMessage);
      }

      // Wait a moment for the user profile and seafarer profile to be created by signUp
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find the user profile we just created to update seafarer profile details
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', formData.email.toLowerCase().trim())
        .single();

      if (userProfile && !profileError) {
        // Update seafarer profile with the form details (signUp creates it with defaults)
        const experienceYears = typeof formData.experience_years === 'string' 
          ? (formData.experience_years === '' ? 0 : parseInt(formData.experience_years) || 0)
          : formData.experience_years || 0;
        
        console.log('📝 Updating seafarer profile:', {
          user_id: userProfile.id,
          rank: formData.rank,
          experience_years: experienceYears,
          certificate_number: formData.certificate_number
        });

        // Try to update first
        const { data: updateData, error: updateError } = await supabase
          .from('seafarer_profiles')
          .update({
            rank: formData.rank || 'Cadet',
            experience_years: experienceYears,
            certificate_number: formData.certificate_number || null
          })
          .eq('user_id', userProfile.id)
          .select();

        // If update returns no rows (profile doesn't exist), create it
        if (updateError && updateError.code === 'PGRST116') {
          console.log('📝 Seafarer profile not found, creating new one...');
          
          const { error: createError } = await supabase
            .from('seafarer_profiles')
            .insert({
              user_id: userProfile.id,
              rank: formData.rank || 'Cadet',
              experience_years: experienceYears,
              certificate_number: formData.certificate_number || null,
              availability_status: 'available'
            });

          if (createError) {
            console.error('❌ Error creating seafarer profile:', createError);
            throw new Error(`Failed to create seafarer profile: ${createError.message}`);
          } else {
            console.log('✅ Seafarer profile created successfully');
          }
        } else if (updateError) {
          console.error('❌ Error updating seafarer profile:', updateError);
          throw new Error(`Failed to update seafarer profile: ${updateError.message}`);
        } else if (updateData && updateData.length > 0) {
          console.log('✅ Seafarer profile updated successfully:', updateData[0]);
        } else {
          // Update returned no rows, try creating instead
          console.log('⚠️ Update returned no rows, creating new profile...');
          const { error: createError } = await supabase
            .from('seafarer_profiles')
            .insert({
              user_id: userProfile.id,
              rank: formData.rank || 'Cadet',
              experience_years: experienceYears,
              certificate_number: formData.certificate_number || null,
              availability_status: 'available'
            });

          if (createError) {
            console.error('❌ Error creating seafarer profile:', createError);
          } else {
            console.log('✅ Seafarer profile created successfully');
          }
        }
      }

      addToast({
        type: 'success',
        title: 'Crew member added successfully',
        description: `Account created for ${formData.full_name}. They may need to confirm their email before logging in.`,
        duration: 8000
      });

      // Reset form and close modal
      resetForm();
      
      // Refresh crew list after a short delay to ensure data is saved
      setTimeout(() => {
        fetchCrewMembers();
      }, 500);
    } catch (error: any) {
      console.error('Error creating crew member:', error);
      addToast({
        type: 'error',
        title: 'Failed to add crew member',
        description: error.message || 'Please try again later.',
        duration: 5000
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewMember = (member: CrewMember) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  const handleEditMember = async (member: CrewMember) => {
    setSelectedMember(member);
    
    // Fetch certificate_number from seafarer_profile
    let certificateNumber = '';
    try {
      const { data: seafarerProfile } = await supabase
        .from('seafarer_profiles')
        .select('certificate_number')
        .eq('user_id', member.id)
        .single();
      
      if (seafarerProfile) {
        certificateNumber = seafarerProfile.certificate_number || '';
      }
    } catch (error) {
      console.error('Error fetching certificate number:', error);
    }
    
    setEditFormData({
      full_name: member.full_name || '',
      email: member.email || '',
      phone: member.phone || '',
      rank: member.rank || 'Cadet',
      experience_years: member.experience_years?.toString() || '0',
      certificate_number: certificateNumber,
      availability_status: (member.availability_status as 'available' | 'unavailable' | 'on_assignment') || 'available'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    try {
      setSubmitting(true);

      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          full_name: editFormData.full_name.trim(),
          phone: editFormData.phone?.trim() || null
        })
        .eq('id', selectedMember.id);

      if (profileError) throw profileError;

      // Update seafarer profile
      const experienceYears = typeof editFormData.experience_years === 'string' 
        ? (editFormData.experience_years === '' ? 0 : parseInt(editFormData.experience_years) || 0)
        : editFormData.experience_years || 0;

      const { error: seafarerError } = await supabase
        .from('seafarer_profiles')
        .update({
          rank: editFormData.rank || 'Cadet',
          experience_years: experienceYears,
          certificate_number: editFormData.certificate_number || null,
          availability_status: editFormData.availability_status
        })
        .eq('user_id', selectedMember.id);

      if (seafarerError && seafarerError.code !== 'PGRST116') {
        // If profile doesn't exist, create it
        if (seafarerError.code === 'PGRST116') {
          const { error: createError } = await supabase
            .from('seafarer_profiles')
            .insert({
              user_id: selectedMember.id,
              rank: editFormData.rank || 'Cadet',
              experience_years: experienceYears,
              certificate_number: editFormData.certificate_number || null,
              availability_status: editFormData.availability_status
            });

          if (createError) throw createError;
        } else {
          throw seafarerError;
        }
      }

      addToast({
        type: 'success',
        title: 'Member updated successfully',
        description: `${editFormData.full_name}'s information has been updated.`,
        duration: 5000
      });

      setShowEditModal(false);
      setSelectedMember(null);
      
      // Refresh crew list
      setTimeout(() => {
        fetchCrewMembers();
      }, 500);
    } catch (error: any) {
      console.error('Error updating member:', error);
      addToast({
        type: 'error',
        title: 'Failed to update member',
        description: error.message || 'Please try again later.',
        duration: 5000
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      phone: '',
      rank: 'Cadet',
      experience_years: '',
      certificate_number: ''
    });
    setShowAddModal(false);
  };

  const ranks = [
    'Cadet',
    'OS Seaman',
    'AB Seaman',
    'Bosun',
    'Third Officer',
    'Second Officer',
    'Chief Officer',
    'Master',
    'Engine Cadet',
    'Wiper',
    'Oiler',
    'Electrician',
    'Fourth Engineer',
    'Third Engineer',
    'Second Engineer',
    'Chief Engineer',
    'Cook',
    'Chief Cook',
    'Steward',
    'Radio Officer',
    'Pumpman',
    'Other'
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader className={styles.loader} />
        <p>Loading crew directory...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <Users className={styles.titleIcon} />
            <div>
              <h1 className={styles.title}>Crew Directory</h1>
              <p className={styles.subtitle}>
                Manage your company's seafaring personnel ({filteredCrewMembers.length} members)
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.exportButton}>
              <Download className={styles.buttonIcon} />
              Export
            </button>
            <button 
              className={styles.addButton}
              onClick={() => setShowAddModal(true)}
            >
              <UserPlus className={styles.buttonIcon} />
              Add Crew Member
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
            placeholder="Search by name, email, or rank..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <Filter className={styles.filterIcon} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
            <option value="on_assignment">On Assignment</option>
          </select>
        </div>
      </div>

      {/* Crew List */}
      <div className={styles.crewList}>
        {filteredCrewMembers.length === 0 ? (
          <div className={styles.emptyState}>
            <Users className={styles.emptyIcon} />
            <h3>No crew members found</h3>
            <p>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No seafarers have been added to your company yet'
              }
            </p>
          </div>
        ) : (
          <div className={styles.crewGrid}>
            {filteredCrewMembers.map((member) => (
              <div key={member.id} className={styles.crewCard}>
                <div className={styles.crewHeader}>
                  <div className={styles.crewInfo}>
                    <h3 className={styles.crewName}>{member.full_name}</h3>
                    <p className={styles.crewRank}>{member.rank}</p>
                  </div>
                  <div className={styles.crewActions}>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleViewMember(member)}
                      title="View Details"
                    >
                      <Eye className={styles.actionIcon} />
                    </button>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleEditMember(member)}
                      title="Edit Member"
                    >
                      <Edit className={styles.actionIcon} />
                    </button>
                    <button 
                      className={styles.actionButton}
                      title="More Options"
                    >
                      <MoreVertical className={styles.actionIcon} />
                    </button>
                  </div>
                </div>
                
                <div className={styles.crewDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Email:</span>
                    <span className={styles.detailValue}>{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Phone:</span>
                      <span className={styles.detailValue}>{member.phone}</span>
                    </div>
                  )}
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Experience:</span>
                    <span className={styles.detailValue}>{member.experience_years} years</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Status:</span>
                    <span 
                      className={styles.statusBadge}
                      style={{ color: getStatusColor(member.availability_status) }}
                    >
                      {getStatusText(member.availability_status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Crew Member Modal */}
      <Modal
        open={showAddModal}
        onClose={resetForm}
        title="Add Crew Member"
        width={600}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="full_name" style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                Full Name *
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                placeholder="Enter full name"
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="email" style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter email address"
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="password" style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter password"
                minLength={6}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="phone" style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="rank" style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                Rank
              </label>
              <select
                id="rank"
                name="rank"
                value={formData.rank}
                onChange={handleInputChange}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                {ranks.map(rank => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="experience_years" style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                Experience (Years)
              </label>
              <input
                type="number"
                id="experience_years"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleInputChange}
                min="0"
                max="50"
                placeholder="Years of experience"
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="certificate_number" style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                Certificate Number
              </label>
              <input
                type="text"
                id="certificate_number"
                name="certificate_number"
                value={formData.certificate_number}
                onChange={handleInputChange}
                placeholder="Enter certificate number"
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={resetForm}
              disabled={submitting}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                backgroundColor: 'white',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#3b82f6',
                color: 'white',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                opacity: submitting ? 0.6 : 1
              }}
            >
              {submitting ? 'Adding...' : 'Add Crew Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Member Modal */}
      <Modal
        open={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedMember(null);
        }}
        title="Crew Member Details"
        width={600}
      >
        {selectedMember && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Full Name</label>
                <p style={{ marginTop: '4px', fontSize: '16px' }}>{selectedMember.full_name}</p>
              </div>
              <div>
                <label style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Email</label>
                <p style={{ marginTop: '4px', fontSize: '16px' }}>{selectedMember.email}</p>
              </div>
              {selectedMember.phone && (
                <div>
                  <label style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Phone</label>
                  <p style={{ marginTop: '4px', fontSize: '16px' }}>{selectedMember.phone}</p>
                </div>
              )}
              <div>
                <label style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Rank</label>
                <p style={{ marginTop: '4px', fontSize: '16px' }}>{selectedMember.rank || 'N/A'}</p>
              </div>
              <div>
                <label style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Experience</label>
                <p style={{ marginTop: '4px', fontSize: '16px' }}>{selectedMember.experience_years || 0} years</p>
              </div>
              <div>
                <label style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Status</label>
                <p style={{ marginTop: '4px', fontSize: '16px' }}>
                  <span style={{ color: getStatusColor(selectedMember.availability_status) }}>
                    {getStatusText(selectedMember.availability_status)}
                  </span>
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  handleEditMember(selectedMember);
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                Edit Member
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMember(null);
        }}
        title="Edit Crew Member"
        width={600}
      >
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="edit_full_name" style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                Full Name *
              </label>
              <input
                type="text"
                id="edit_full_name"
                value={editFormData.full_name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, full_name: e.target.value }))}
                required
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="edit_email" style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                Email
              </label>
              <input
                type="email"
                id="edit_email"
                value={editFormData.email}
                disabled
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  fontSize: '14px',
                  backgroundColor: '#f5f5f5',
                  color: '#666'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="edit_phone" style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                Phone
              </label>
              <input
                type="tel"
                id="edit_phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="edit_rank" style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                Rank
              </label>
              <select
                id="edit_rank"
                value={editFormData.rank}
                onChange={(e) => setEditFormData(prev => ({ ...prev, rank: e.target.value }))}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                {ranks.map(rank => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="edit_experience_years" style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                Experience (Years)
              </label>
              <input
                type="number"
                id="edit_experience_years"
                value={editFormData.experience_years}
                onChange={(e) => setEditFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                min="0"
                max="50"
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="edit_availability_status" style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                Availability Status
              </label>
              <select
                id="edit_availability_status"
                value={editFormData.availability_status}
                onChange={(e) => setEditFormData(prev => ({ ...prev, availability_status: e.target.value as 'available' | 'unavailable' | 'on_assignment' }))}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="on_assignment">On Assignment</option>
              </select>
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="edit_certificate_number" style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                Certificate Number
              </label>
              <input
                type="text"
                id="edit_certificate_number"
                value={editFormData.certificate_number}
                onChange={(e) => setEditFormData(prev => ({ ...prev, certificate_number: e.target.value }))}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setSelectedMember(null);
              }}
              disabled={submitting}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                backgroundColor: 'white',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#3b82f6',
                color: 'white',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                opacity: submitting ? 0.6 : 1
              }}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CrewDirectory;