import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  Ship, 
  Calendar, 
  Clock,
  MapPin,
  Phone,
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
  const { profile } = useAuth();
  const { addToast } = useToast();
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Fetch crew members from database
  useEffect(() => {
    fetchCrewMembers();
  }, [profile?.company_id]);

  const fetchCrewMembers = async () => {
    if (!profile?.company_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          seafarer_profile:seafarer_profiles!user_id(rank, experience_years, availability_status)
        `)
        .eq('user_type', 'seafarer')
        .eq('company_id', profile.company_id)
        .order('full_name');

      if (error) throw error;

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
  };

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
            <button className={styles.addButton}>
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
                    <button className={styles.actionButton}>
                      <Eye className={styles.actionIcon} />
                    </button>
                    <button className={styles.actionButton}>
                      <Edit className={styles.actionIcon} />
                    </button>
                    <button className={styles.actionButton}>
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
    </div>
  );
};

export default CrewDirectory;