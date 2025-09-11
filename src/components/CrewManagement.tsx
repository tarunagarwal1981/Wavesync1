import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Eye, 
  Edit, 
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Users,
  Ship,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserPlus,
  FileText,
  Settings
} from 'lucide-react';
import styles from './CrewManagement.module.css';

// Types
interface CrewMember {
  id: string;
  name: string;
  rank: string;
  department: string;
  vessel: string;
  status: 'onboard' | 'onshore' | 'pending_relief';
  reliefDue: string;
  contractEnd: string;
  nationality: string;
  phone: string;
  email: string;
  experience: number;
  certifications: string[];
  lastPort: string;
  nextPort: string;
  emergencyContact: string;
  medicalExpiry: string;
  passportExpiry: string;
  visaExpiry: string;
  performance: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';
  notes: string;
}

// Mock data for 2000+ crew members
const generateMockCrewData = (): CrewMember[] => {
  const ranks = ['Captain', 'Chief Officer', 'Second Officer', 'Third Officer', 'Chief Engineer', 'Second Engineer', 'Third Engineer', 'Fourth Engineer', 'Bosun', 'Able Seaman', 'Ordinary Seaman', 'Cook', 'Steward', 'Electrician', 'Welder', 'Pumpman', 'Deck Cadet', 'Engine Cadet'];
  const departments = ['Deck', 'Engine', 'Catering', 'Electronics'];
  const vessels = ['MV Ocean Explorer', 'MV Sea Breeze', 'MV Atlantic Star', 'MV Pacific Wave', 'MV Indian Ocean', 'MV Mediterranean', 'MV Caribbean', 'MV Baltic Sea', 'MV North Sea', 'MV Red Sea'];
  const nationalities = ['Indian', 'Filipino', 'Ukrainian', 'Romanian', 'Polish', 'Croatian', 'Serbian', 'Bulgarian', 'Russian', 'Turkish'];
  const ports = ['Singapore', 'Rotterdam', 'Hamburg', 'Antwerp', 'Dubai', 'Shanghai', 'Los Angeles', 'New York', 'Buenos Aires', 'Cape Town'];
  const certifications = ['STCW Basic Safety', 'Advanced Fire Fighting', 'Medical First Aid', 'GMDSS', 'ECDIS', 'Radar', 'ARPA', 'Bridge Resource Management'];
  
  const crew: CrewMember[] = [];
  
  for (let i = 1; i <= 2150; i++) {
    const statuses: ('onboard' | 'onshore' | 'pending_relief')[] = ['onboard', 'onshore', 'pending_relief'];
    const performances: ('excellent' | 'good' | 'satisfactory' | 'needs_improvement')[] = ['excellent', 'good', 'satisfactory', 'needs_improvement'];
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const performance = performances[Math.floor(Math.random() * performances.length)];
    
    const reliefDueDate = new Date();
    reliefDueDate.setDate(reliefDueDate.getDate() + Math.floor(Math.random() * 180) - 30);
    
    const contractEndDate = new Date();
    contractEndDate.setDate(contractEndDate.getDate() + Math.floor(Math.random() * 365) + 30);
    
    const medicalExpiryDate = new Date();
    medicalExpiryDate.setDate(medicalExpiryDate.getDate() + Math.floor(Math.random() * 365));
    
    const passportExpiryDate = new Date();
    passportExpiryDate.setDate(passportExpiryDate.getDate() + Math.floor(Math.random() * 1095) + 365);
    
    const visaExpiryDate = new Date();
    visaExpiryDate.setDate(visaExpiryDate.getDate() + Math.floor(Math.random() * 180) + 30);
    
    crew.push({
      id: `crew-${i.toString().padStart(4, '0')}`,
      name: `Crew Member ${i}`,
      rank: ranks[Math.floor(Math.random() * ranks.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      vessel: vessels[Math.floor(Math.random() * vessels.length)],
      status,
      reliefDue: reliefDueDate.toISOString().split('T')[0],
      contractEnd: contractEndDate.toISOString().split('T')[0],
      nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
      phone: `+${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      email: `crew${i}@maritime.com`,
      experience: Math.floor(Math.random() * 20) + 1,
      certifications: certifications.slice(0, Math.floor(Math.random() * 4) + 2),
      lastPort: ports[Math.floor(Math.random() * ports.length)],
      nextPort: ports[Math.floor(Math.random() * ports.length)],
      emergencyContact: `+${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      medicalExpiry: medicalExpiryDate.toISOString().split('T')[0],
      passportExpiry: passportExpiryDate.toISOString().split('T')[0],
      visaExpiry: visaExpiryDate.toISOString().split('T')[0],
      performance,
      notes: `Notes for crew member ${i}`
    });
  }
  
  return crew;
};

const CrewManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedVessel, setSelectedVessel] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedPerformance, setSelectedPerformance] = useState<string>('all');
  const [reliefDueFilter, setReliefDueFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  
  const mockCrewData = useMemo(() => generateMockCrewData(), []);
  
  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = mockCrewData.filter(crew => {
      const matchesSearch = crew.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           crew.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           crew.vessel.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || crew.status === selectedStatus;
      const matchesVessel = selectedVessel === 'all' || crew.vessel === selectedVessel;
      const matchesDepartment = selectedDepartment === 'all' || crew.department === selectedDepartment;
      const matchesPerformance = selectedPerformance === 'all' || crew.performance === selectedPerformance;
      
      let matchesReliefDue = true;
      if (reliefDueFilter !== 'all') {
        const reliefDate = new Date(crew.reliefDue);
        const now = new Date();
        const daysUntilRelief = Math.ceil((reliefDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (reliefDueFilter) {
          case 'overdue':
            matchesReliefDue = daysUntilRelief < 0;
            break;
          case '1month':
            matchesReliefDue = daysUntilRelief >= 0 && daysUntilRelief <= 30;
            break;
          case '2months':
            matchesReliefDue = daysUntilRelief > 30 && daysUntilRelief <= 60;
            break;
          case '3months':
            matchesReliefDue = daysUntilRelief > 60 && daysUntilRelief <= 90;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesVessel && matchesDepartment && 
             matchesPerformance && matchesReliefDue;
    });
    
    // Sort data
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof CrewMember];
      let bValue: any = b[sortBy as keyof CrewMember];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return filtered;
  }, [mockCrewData, searchTerm, selectedStatus, selectedVessel, selectedDepartment, selectedPerformance, reliefDueFilter, sortBy, sortOrder]);
  
  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);
  
  // Statistics
  const stats = useMemo(() => {
    const total = mockCrewData.length;
    const onboard = mockCrewData.filter(c => c.status === 'onboard').length;
    const onshore = mockCrewData.filter(c => c.status === 'onshore').length;
    const pendingRelief = mockCrewData.filter(c => c.status === 'pending_relief').length;
    
    const overdueRelief = mockCrewData.filter(c => {
      const reliefDate = new Date(c.reliefDue);
      const now = new Date();
      return reliefDate < now;
    }).length;
    
    return { total, onboard, onshore, pendingRelief, overdueRelief };
  }, [mockCrewData]);
  
  const toggleRowExpansion = (crewId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(crewId)) {
      newExpanded.delete(crewId);
    } else {
      newExpanded.add(crewId);
    }
    setExpandedRows(newExpanded);
  };
  
  const toggleCrewSelection = (crewId: string) => {
    const newSelected = [...selectedCrew];
    const index = newSelected.indexOf(crewId);
    if (index > -1) {
      newSelected.splice(index, 1);
    } else {
      newSelected.push(crewId);
    }
    setSelectedCrew(newSelected);
  };
  
  const selectAllCrew = () => {
    if (selectedCrew.length === currentData.length) {
      setSelectedCrew([]);
    } else {
      setSelectedCrew(currentData.map(crew => crew.id));
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'onboard':
        return <CheckCircle className={styles.statusIcon} style={{ color: '#10b981' }} />;
      case 'onshore':
        return <XCircle className={styles.statusIcon} style={{ color: '#6b7280' }} />;
      case 'pending_relief':
        return <AlertCircle className={styles.statusIcon} style={{ color: '#f59e0b' }} />;
      default:
        return null;
    }
  };
  
  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return '#10b981';
      case 'good':
        return '#3b82f6';
      case 'satisfactory':
        return '#f59e0b';
      case 'needs_improvement':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };
  
  const uniqueVessels = [...new Set(mockCrewData.map(c => c.vessel))];
  const uniqueDepartments = [...new Set(mockCrewData.map(c => c.department))];
  
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Crew Management</h1>
          <p className={styles.subtitle}>Manage {stats.total.toLocaleString()} crew members across your fleet</p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.primaryButton}>
            <UserPlus size={20} />
            Add Crew Member
          </button>
          <button className={styles.secondaryButton}>
            <Download size={20} />
            Export Data
          </button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Total Crew</h3>
            <p className={styles.statNumber}>{stats.total.toLocaleString()}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#10b981' }}>
            <Ship size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Onboard</h3>
            <p className={styles.statNumber}>{stats.onboard.toLocaleString()}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#6b7280' }}>
            <MapPin size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Onshore</h3>
            <p className={styles.statNumber}>{stats.onshore.toLocaleString()}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Pending Relief</h3>
            <p className={styles.statNumber}>{stats.pendingRelief.toLocaleString()}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#ef4444' }}>
            <AlertCircle size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Overdue Relief</h3>
            <p className={styles.statNumber}>{stats.overdueRelief.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search crew members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filtersGrid}>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="onboard">Onboard</option>
            <option value="onshore">Onshore</option>
            <option value="pending_relief">Pending Relief</option>
          </select>
          
          <select
            value={selectedVessel}
            onChange={(e) => setSelectedVessel(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Vessels</option>
            {uniqueVessels.map(vessel => (
              <option key={vessel} value={vessel}>{vessel}</option>
            ))}
          </select>
          
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Departments</option>
            {uniqueDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          
          <select
            value={reliefDueFilter}
            onChange={(e) => setReliefDueFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Relief Dates</option>
            <option value="overdue">Overdue</option>
            <option value="1month">Within 1 Month</option>
            <option value="2months">Within 2 Months</option>
            <option value="3months">Within 3 Months</option>
          </select>
          
          <select
            value={selectedPerformance}
            onChange={(e) => setSelectedPerformance(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Performance</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="satisfactory">Satisfactory</option>
            <option value="needs_improvement">Needs Improvement</option>
          </select>
        </div>
      </div>
      
      {/* Results Summary */}
      <div className={styles.resultsSummary}>
        <p className={styles.resultsText}>
          Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length.toLocaleString()} crew members
          {selectedCrew.length > 0 && ` (${selectedCrew.length} selected)`}
        </p>
        
        <div className={styles.viewControls}>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className={styles.pageSizeSelect}
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
            <option value={200}>200 per page</option>
          </select>
        </div>
      </div>
      
      {/* Data Table */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th className={styles.checkboxColumn}>
                <input
                  type="checkbox"
                  checked={selectedCrew.length === currentData.length && currentData.length > 0}
                  onChange={selectAllCrew}
                  className={styles.checkbox}
                />
              </th>
              <th className={styles.expandColumn}></th>
              <th 
                className={styles.sortableHeader}
                onClick={() => {
                  if (sortBy === 'name') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('name');
                    setSortOrder('asc');
                  }
                }}
              >
                Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className={styles.sortableHeader}
                onClick={() => {
                  if (sortBy === 'rank') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('rank');
                    setSortOrder('asc');
                  }
                }}
              >
                Rank {sortBy === 'rank' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className={styles.sortableHeader}
                onClick={() => {
                  if (sortBy === 'vessel') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('vessel');
                    setSortOrder('asc');
                  }
                }}
              >
                Vessel {sortBy === 'vessel' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className={styles.sortableHeader}
                onClick={() => {
                  if (sortBy === 'status') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('status');
                    setSortOrder('asc');
                  }
                }}
              >
                Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className={styles.sortableHeader}
                onClick={() => {
                  if (sortBy === 'reliefDue') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('reliefDue');
                    setSortOrder('asc');
                  }
                }}
              >
                Relief Due {sortBy === 'reliefDue' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className={styles.sortableHeader}
                onClick={() => {
                  if (sortBy === 'performance') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('performance');
                    setSortOrder('asc');
                  }
                }}
              >
                Performance {sortBy === 'performance' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className={styles.actionsColumn}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((crew) => (
              <React.Fragment key={crew.id}>
                <tr className={styles.dataRow}>
                  <td className={styles.checkboxColumn}>
                    <input
                      type="checkbox"
                      checked={selectedCrew.includes(crew.id)}
                      onChange={() => toggleCrewSelection(crew.id)}
                      className={styles.checkbox}
                    />
                  </td>
                  <td className={styles.expandColumn}>
                    <button
                      onClick={() => toggleRowExpansion(crew.id)}
                      className={styles.expandButton}
                    >
                      {expandedRows.has(crew.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </td>
                  <td className={styles.nameColumn}>
                    <div className={styles.nameCell}>
                      <div className={styles.avatar}>
                        {crew.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <div className={styles.name}>{crew.name}</div>
                        <div className={styles.id}>{crew.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.rankColumn}>
                    <span className={styles.rank}>{crew.rank}</span>
                    <span className={styles.department}>{crew.department}</span>
                  </td>
                  <td className={styles.vesselColumn}>
                    <div className={styles.vesselCell}>
                      <Ship size={16} className={styles.vesselIcon} />
                      <span>{crew.vessel}</span>
                    </div>
                  </td>
                  <td className={styles.statusColumn}>
                    <div className={styles.statusCell}>
                      {getStatusIcon(crew.status)}
                      <span className={styles.statusText}>{crew.status.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className={styles.reliefColumn}>
                    <div className={styles.reliefCell}>
                      <Calendar size={16} className={styles.calendarIcon} />
                      <span>{new Date(crew.reliefDue).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className={styles.performanceColumn}>
                    <div className={styles.performanceCell}>
                      <div 
                        className={styles.performanceDot}
                        style={{ backgroundColor: getPerformanceColor(crew.performance) }}
                      ></div>
                      <span className={styles.performanceText}>
                        {crew.performance.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className={styles.actionsColumn}>
                    <div className={styles.actionsCell}>
                      <button className={styles.actionButton} title="View Details">
                        <Eye size={16} />
                      </button>
                      <button className={styles.actionButton} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className={styles.actionButton} title="More Options">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                
                {/* Expanded Row */}
                {expandedRows.has(crew.id) && (
                  <tr className={styles.expandedRow}>
                    <td colSpan={9} className={styles.expandedContent}>
                      <div className={styles.expandedDetails}>
                        <div className={styles.detailsGrid}>
                          <div className={styles.detailSection}>
                            <h4 className={styles.detailTitle}>Contact Information</h4>
                            <div className={styles.detailItem}>
                              <Phone size={16} />
                              <span>{crew.phone}</span>
                            </div>
                            <div className={styles.detailItem}>
                              <Mail size={16} />
                              <span>{crew.email}</span>
                            </div>
                            <div className={styles.detailItem}>
                              <MapPin size={16} />
                              <span>{crew.nationality}</span>
                            </div>
                          </div>
                          
                          <div className={styles.detailSection}>
                            <h4 className={styles.detailTitle}>Contract Details</h4>
                            <div className={styles.detailItem}>
                              <Calendar size={16} />
                              <span>Contract End: {new Date(crew.contractEnd).toLocaleDateString()}</span>
                            </div>
                            <div className={styles.detailItem}>
                              <Clock size={16} />
                              <span>Experience: {crew.experience} years</span>
                            </div>
                          </div>
                          
                          <div className={styles.detailSection}>
                            <h4 className={styles.detailTitle}>Document Expiry</h4>
                            <div className={styles.detailItem}>
                              <FileText size={16} />
                              <span>Medical: {new Date(crew.medicalExpiry).toLocaleDateString()}</span>
                            </div>
                            <div className={styles.detailItem}>
                              <FileText size={16} />
                              <span>Passport: {new Date(crew.passportExpiry).toLocaleDateString()}</span>
                            </div>
                            <div className={styles.detailItem}>
                              <FileText size={16} />
                              <span>Visa: {new Date(crew.visaExpiry).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className={styles.detailSection}>
                            <h4 className={styles.detailTitle}>Certifications</h4>
                            <div className={styles.certifications}>
                              {crew.certifications.map((cert, index) => (
                                <span key={index} className={styles.certification}>
                                  {cert}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className={styles.expandedActions}>
                          <button className={styles.detailActionButton}>
                            <Edit size={16} />
                            Edit Details
                          </button>
                          <button className={styles.detailActionButton}>
                            <FileText size={16} />
                            View Documents
                          </button>
                          <button className={styles.detailActionButton}>
                            <Settings size={16} />
                            Manage Certifications
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          <span>
            Page {currentPage} of {totalPages}
          </span>
        </div>
        
        <div className={styles.paginationControls}>
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            if (pageNum > totalPages) return null;
            
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`${styles.paginationButton} ${currentPage === pageNum ? styles.active : ''}`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
          >
            Next
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
          >
            Last
          </button>
        </div>
      </div>
      
      {/* Bulk Actions */}
      {selectedCrew.length > 0 && (
        <div className={styles.bulkActions}>
          <div className={styles.bulkActionsContent}>
            <span className={styles.bulkActionsText}>
              {selectedCrew.length} crew members selected
            </span>
            <div className={styles.bulkActionsButtons}>
              <button className={styles.bulkActionButton}>
                <Download size={16} />
                Export Selected
              </button>
              <button className={styles.bulkActionButton}>
                <FileText size={16} />
                Generate Reports
              </button>
              <button className={styles.bulkActionButton}>
                <Settings size={16} />
                Bulk Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrewManagement;
