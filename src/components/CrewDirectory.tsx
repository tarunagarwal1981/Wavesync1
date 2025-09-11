import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  Ship, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MapPin,
  Phone,
  Mail,
  MoreVertical,
  Download,
  Eye,
  Edit,
  UserPlus
} from 'lucide-react';
import styles from './CrewDirectory.module.css';

// Types
interface CrewMember {
  id: string;
  name: string;
  position: string;
  rank: string;
  vessel: string;
  status: 'onboard' | 'onshore' | 'pending_relief';
  contractEndDate: string;
  nextReliefDate?: string;
  nationality: string;
  phone: string;
  email: string;
  experience: number; // years
  certifications: string[];
  emergencyContact: string;
  photo?: string;
}

// Dummy data
const dummyCrewData: CrewMember[] = [
  {
    id: '1',
    name: 'Captain James Mitchell',
    position: 'Master',
    rank: 'Captain',
    vessel: 'MV Ocean Explorer',
    status: 'onboard',
    contractEndDate: '2024-06-15',
    nextReliefDate: '2024-05-20',
    nationality: 'British',
    phone: '+44 7700 900123',
    email: 'j.mitchell@maritime.com',
    experience: 15,
    certifications: ['Master Unlimited', 'GMDSS', 'ECDIS'],
    emergencyContact: 'Sarah Mitchell (+44 7700 900124)'
  },
  {
    id: '2',
    name: 'Chief Engineer Maria Rodriguez',
    position: 'Chief Engineer',
    rank: 'Chief Engineer',
    vessel: 'MV Ocean Explorer',
    status: 'onboard',
    contractEndDate: '2024-07-20',
    nextReliefDate: '2024-06-25',
    nationality: 'Spanish',
    phone: '+34 600 123456',
    email: 'm.rodriguez@maritime.com',
    experience: 12,
    certifications: ['Chief Engineer Unlimited', 'High Voltage'],
    emergencyContact: 'Carlos Rodriguez (+34 600 123457)'
  },
  {
    id: '3',
    name: 'First Officer Ahmed Hassan',
    position: 'First Officer',
    rank: 'First Officer',
    vessel: 'MV Pacific Star',
    status: 'pending_relief',
    contractEndDate: '2024-04-30',
    nextReliefDate: '2024-04-25',
    nationality: 'Egyptian',
    phone: '+20 100 1234567',
    email: 'a.hassan@maritime.com',
    experience: 8,
    certifications: ['Officer of the Watch', 'ECDIS'],
    emergencyContact: 'Fatima Hassan (+20 100 1234568)'
  },
  {
    id: '4',
    name: 'Second Engineer John Smith',
    position: 'Second Engineer',
    rank: 'Second Engineer',
    vessel: 'MV Pacific Star',
    status: 'onboard',
    contractEndDate: '2024-08-10',
    nextReliefDate: '2024-07-15',
    nationality: 'American',
    phone: '+1 555 1234567',
    email: 'j.smith@maritime.com',
    experience: 10,
    certifications: ['Second Engineer', 'Refrigeration'],
    emergencyContact: 'Lisa Smith (+1 555 1234568)'
  },
  {
    id: '5',
    name: 'Bosun Chen Wei',
    position: 'Bosun',
    rank: 'Bosun',
    vessel: 'MV Atlantic Voyager',
    status: 'onshore',
    contractEndDate: '2024-03-15',
    nextReliefDate: '2024-04-01',
    nationality: 'Chinese',
    phone: '+86 138 0013 8000',
    email: 'c.wei@maritime.com',
    experience: 6,
    certifications: ['Bosun Certificate', 'Crane Operator'],
    emergencyContact: 'Li Wei (+86 138 0013 8001)'
  },
  {
    id: '6',
    name: 'Cook Anna Kowalski',
    position: 'Cook',
    rank: 'Cook',
    vessel: 'MV Atlantic Voyager',
    status: 'onboard',
    contractEndDate: '2024-09-05',
    nextReliefDate: '2024-08-10',
    nationality: 'Polish',
    phone: '+48 500 123456',
    email: 'a.kowalski@maritime.com',
    experience: 4,
    certifications: ['Catering Certificate', 'Food Safety'],
    emergencyContact: 'Piotr Kowalski (+48 500 123457)'
  },
  {
    id: '7',
    name: 'Third Officer David Kim',
    position: 'Third Officer',
    rank: 'Third Officer',
    vessel: 'MV Indian Ocean',
    status: 'onboard',
    contractEndDate: '2024-05-25',
    nextReliefDate: '2024-05-01',
    nationality: 'Korean',
    phone: '+82 10 1234 5678',
    email: 'd.kim@maritime.com',
    experience: 3,
    certifications: ['Officer of the Watch', 'GMDSS'],
    emergencyContact: 'Min Kim (+82 10 1234 5679)'
  },
  {
    id: '8',
    name: 'Electrician Roberto Silva',
    position: 'Electrician',
    rank: 'Electrician',
    vessel: 'MV Indian Ocean',
    status: 'pending_relief',
    contractEndDate: '2024-04-15',
    nextReliefDate: '2024-04-10',
    nationality: 'Brazilian',
    phone: '+55 11 99999 8888',
    email: 'r.silva@maritime.com',
    experience: 7,
    certifications: ['Marine Electrician', 'High Voltage'],
    emergencyContact: 'Carmen Silva (+55 11 99999 8889)'
  },
  {
    id: '9',
    name: 'Able Seaman Michael Johnson',
    position: 'Able Seaman',
    rank: 'Able Seaman',
    vessel: 'MV Caribbean Queen',
    status: 'onboard',
    contractEndDate: '2024-06-30',
    nextReliefDate: '2024-06-05',
    nationality: 'Canadian',
    phone: '+1 416 555 0123',
    email: 'm.johnson@maritime.com',
    experience: 5,
    certifications: ['Able Seaman Certificate', 'Lifeboat'],
    emergencyContact: 'Jennifer Johnson (+1 416 555 0124)'
  },
  {
    id: '10',
    name: 'Chief Cook Elena Petrov',
    position: 'Chief Cook',
    rank: 'Chief Cook',
    vessel: 'MV Caribbean Queen',
    status: 'onshore',
    contractEndDate: '2024-02-28',
    nextReliefDate: '2024-03-15',
    nationality: 'Russian',
    phone: '+7 495 123 4567',
    email: 'e.petrov@maritime.com',
    experience: 9,
    certifications: ['Chief Cook Certificate', 'Food Safety'],
    emergencyContact: 'Vladimir Petrov (+7 495 123 4568)'
  }
];

// Filter types
type StatusFilter = 'all' | 'onboard' | 'onshore' | 'pending_relief';
type ReliefFilter = 'all' | 'due_1month' | 'due_2months' | 'due_3months';

export const CrewDirectoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [reliefFilter, setReliefFilter] = useState<ReliefFilter>('all');
  const [selectedVessel, setSelectedVessel] = useState<string>('all');

  // Get unique vessels
  const vessels = useMemo(() => {
    const uniqueVessels = [...new Set(dummyCrewData.map(crew => crew.vessel))];
    return uniqueVessels;
  }, []);

  // Filter crew data
  const filteredCrew = useMemo(() => {
    return dummyCrewData.filter(crew => {
      // Search filter
      const matchesSearch = crew.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           crew.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           crew.vessel.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || crew.status === statusFilter;

      // Relief filter
      let matchesRelief = true;
      if (reliefFilter !== 'all' && crew.nextReliefDate) {
        const reliefDate = new Date(crew.nextReliefDate);
        const today = new Date();
        const diffTime = reliefDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (reliefFilter) {
          case 'due_1month':
            matchesRelief = diffDays <= 30 && diffDays >= 0;
            break;
          case 'due_2months':
            matchesRelief = diffDays <= 60 && diffDays >= 0;
            break;
          case 'due_3months':
            matchesRelief = diffDays <= 90 && diffDays >= 0;
            break;
        }
      }

      // Vessel filter
      const matchesVessel = selectedVessel === 'all' || crew.vessel === selectedVessel;

      return matchesSearch && matchesStatus && matchesRelief && matchesVessel;
    });
  }, [searchTerm, statusFilter, reliefFilter, selectedVessel]);

  // Get status counts
  const statusCounts = useMemo(() => {
    return {
      total: dummyCrewData.length,
      onboard: dummyCrewData.filter(crew => crew.status === 'onboard').length,
      onshore: dummyCrewData.filter(crew => crew.status === 'onshore').length,
      pendingRelief: dummyCrewData.filter(crew => crew.status === 'pending_relief').length
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'onboard': return <Ship className={styles.statusIcon} />;
      case 'onshore': return <MapPin className={styles.statusIcon} />;
      case 'pending_relief': return <Clock className={styles.statusIcon} />;
      default: return <Users className={styles.statusIcon} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'onboard': return styles.statusOnboard;
      case 'onshore': return styles.statusOnshore;
      case 'pending_relief': return styles.statusPendingRelief;
      default: return styles.statusDefault;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilRelief = (reliefDate: string) => {
    const relief = new Date(reliefDate);
    const today = new Date();
    const diffTime = relief.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Crew Directory</h1>
            <p className={styles.subtitle}>Manage and monitor your crew members</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.actionButton}>
              <UserPlus size={20} />
              Add Crew Member
            </button>
            <button className={styles.actionButton}>
              <Download size={20} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{statusCounts.total}</div>
            <div className={styles.statLabel}>Total Crew</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.onboardIcon}`}>
            <Ship size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{statusCounts.onboard}</div>
            <div className={styles.statLabel}>Onboard</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.onshoreIcon}`}>
            <MapPin size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{statusCounts.onshore}</div>
            <div className={styles.statLabel}>Onshore</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.pendingIcon}`}>
            <Clock size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{statusCounts.pendingRelief}</div>
            <div className={styles.statLabel}>Pending Relief</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersSection}>
        <div className={styles.filtersRow}>
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search crew members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filterGroup}>
            <Filter size={16} className={styles.filterIcon} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="onboard">Onboard</option>
              <option value="onshore">Onshore</option>
              <option value="pending_relief">Pending Relief</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <Calendar size={16} className={styles.filterIcon} />
            <select
              value={reliefFilter}
              onChange={(e) => setReliefFilter(e.target.value as ReliefFilter)}
              className={styles.filterSelect}
            >
              <option value="all">All Relief Dates</option>
              <option value="due_1month">Due in 1 Month</option>
              <option value="due_2months">Due in 2 Months</option>
              <option value="due_3months">Due in 3 Months</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <Ship size={16} className={styles.filterIcon} />
            <select
              value={selectedVessel}
              onChange={(e) => setSelectedVessel(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Vessels</option>
              {vessels.map(vessel => (
                <option key={vessel} value={vessel}>{vessel}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className={styles.resultsInfo}>
        <span className={styles.resultsCount}>
          Showing {filteredCrew.length} of {dummyCrewData.length} crew members
        </span>
      </div>

      {/* Crew Grid */}
      <div className={styles.crewGrid}>
        {filteredCrew.map(crew => (
          <div key={crew.id} className={styles.crewCard}>
            <div className={styles.crewHeader}>
              <div className={styles.crewAvatar}>
                <span className={styles.avatarText}>
                  {crew.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className={styles.crewInfo}>
                <h3 className={styles.crewName}>{crew.name}</h3>
                <p className={styles.crewPosition}>{crew.position}</p>
                <div className={`${styles.statusBadge} ${getStatusColor(crew.status)}`}>
                  {getStatusIcon(crew.status)}
                  <span className={styles.statusText}>
                    {crew.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              <button className={styles.moreButton}>
                <MoreVertical size={16} />
              </button>
            </div>

            <div className={styles.crewDetails}>
              <div className={styles.detailRow}>
                <Ship size={16} className={styles.detailIcon} />
                <span className={styles.detailLabel}>Vessel:</span>
                <span className={styles.detailValue}>{crew.vessel}</span>
              </div>
              <div className={styles.detailRow}>
                <Calendar size={16} className={styles.detailIcon} />
                <span className={styles.detailLabel}>Contract End:</span>
                <span className={styles.detailValue}>{formatDate(crew.contractEndDate)}</span>
              </div>
              {crew.nextReliefDate && (
                <div className={styles.detailRow}>
                  <Clock size={16} className={styles.detailIcon} />
                  <span className={styles.detailLabel}>Next Relief:</span>
                  <span className={`${styles.detailValue} ${styles.reliefDate}`}>
                    {formatDate(crew.nextReliefDate)}
                    <span className={styles.daysUntil}>
                      ({getDaysUntilRelief(crew.nextReliefDate)} days)
                    </span>
                  </span>
                </div>
              )}
              <div className={styles.detailRow}>
                <Users size={16} className={styles.detailIcon} />
                <span className={styles.detailLabel}>Experience:</span>
                <span className={styles.detailValue}>{crew.experience} years</span>
              </div>
            </div>

            <div className={styles.crewActions}>
              <button className={styles.actionBtn}>
                <Eye size={16} />
                View
              </button>
              <button className={styles.actionBtn}>
                <Edit size={16} />
                Edit
              </button>
              <button className={styles.actionBtn}>
                <Phone size={16} />
                Contact
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCrew.length === 0 && (
        <div className={styles.emptyState}>
          <Users size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No crew members found</h3>
          <p className={styles.emptyDescription}>
            Try adjusting your search criteria or filters
          </p>
        </div>
      )}
    </div>
  );
};
