import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockAssignments, mockVessels } from '../data/mockData';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Filter,
  Search,
  SortAsc,
  SortDesc,
  MoreVertical,
  Ship,
  User,
  FileText,
  AlertTriangle
} from 'lucide-react';

const Assignments = () => {
  const { user } = useAuth();
  const [assignments] = useState(mockAssignments);
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'salary' | 'vessel'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  // Filter assignments based on selected tab
  const filteredAssignments = assignments.filter(assignment => {
    if (selectedTab === 'all') return true;
    return assignment.status === selectedTab;
  });

  // Filter by search query
  const searchFilteredAssignments = filteredAssignments.filter(assignment => {
    const query = searchQuery.toLowerCase();
    return (
      assignment.vessel.name.toLowerCase().includes(query) ||
      assignment.position.toLowerCase().includes(query) ||
      assignment.companyName.toLowerCase().includes(query)
    );
  });

  // Sort assignments
  const sortedAssignments = [...searchFilteredAssignments].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime();
        break;
      case 'salary':
        comparison = a.salary - b.salary;
        break;
      case 'vessel':
        comparison = a.vessel.name.localeCompare(b.vessel.name);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'accepted': return CheckCircle;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handleAcceptAssignment = (assignmentId: string) => {
    // In a real app, this would make an API call
    console.log('Accepting assignment:', assignmentId);
    alert('Assignment accepted! This would update the assignment status in a real application.');
  };

  const handleRejectAssignment = (assignmentId: string) => {
    // In a real app, this would make an API call
    console.log('Rejecting assignment:', assignmentId);
    alert('Assignment rejected! This would update the assignment status in a real application.');
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
          Assignment Management
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Manage your maritime assignments and opportunities
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
              <Briefcase size={20} color="#3b82f6" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {assignments.length}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Total Assignments</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="#f59e0b" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {assignments.filter(a => a.status === 'pending').length}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Pending</p>
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
                {assignments.filter(a => a.status === 'accepted').length}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Accepted</p>
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
                {assignments.filter(a => a.status === 'rejected').length}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#f9fafb'
              }}
            />
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'salary' | 'vessel')}
              style={{
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="date">Sort by Date</option>
              <option value="salary">Sort by Salary</option>
              <option value="vessel">Sort by Vessel</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
          {[
            { key: 'all', label: 'All', count: assignments.length },
            { key: 'pending', label: 'Pending', count: assignments.filter(a => a.status === 'pending').length },
            { key: 'accepted', label: 'Accepted', count: assignments.filter(a => a.status === 'accepted').length },
            { key: 'rejected', label: 'Rejected', count: assignments.filter(a => a.status === 'rejected').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              style={{
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: selectedTab === tab.key ? '#3b82f6' : '#f1f5f9',
                color: selectedTab === tab.key ? 'white' : '#64748b',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {tab.label}
              <span style={{
                backgroundColor: selectedTab === tab.key ? 'rgba(255,255,255,0.2)' : '#d1d5db',
                color: selectedTab === tab.key ? 'white' : '#6b7280',
                padding: '2px 6px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Assignment Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
        gap: '24px' 
      }}>
        {sortedAssignments.map((assignment) => {
          const StatusIcon = getStatusIcon(assignment.status);
          const daysUntilJoining = Math.ceil((new Date(assignment.joiningDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <div key={assignment.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              border: selectedAssignment === assignment.id ? '2px solid #3b82f6' : '1px solid #e2e8f0'
            }}>
              {/* Header */}
              <div style={{ padding: '20px 20px 16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0', color: '#1f2937' }}>
                      {assignment.vessel.name}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      {assignment.position.replace('_', ' ').toUpperCase()} • {assignment.department.toUpperCase()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      backgroundColor: `${getStatusColor(assignment.status)}20`,
                      borderRadius: '6px'
                    }}>
                      <StatusIcon size={14} color={getStatusColor(assignment.status)} />
                      <span style={{ fontSize: '12px', fontWeight: '500', color: getStatusColor(assignment.status) }}>
                        {assignment.status.toUpperCase()}
                      </span>
                    </div>
                    <button style={{
                      padding: '8px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      color: '#6b7280'
                    }}>
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Ship size={16} />
                    <span>{assignment.vessel.type.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} />
                    <span>{assignment.vessel.flag}</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: '500' }}>JOINING DATE</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#6b7280" />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                        {formatDate(assignment.joiningDate)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: '500' }}>SALARY</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <DollarSign size={14} color="#6b7280" />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                        {formatCurrency(assignment.salary, assignment.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color="#6b7280" />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {daysUntilJoining > 0 ? `${daysUntilJoining} days to join` : 'Joining overdue'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} color="#6b7280" />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {assignment.contractDuration} months
                    </span>
                  </div>
                </div>

                {/* Company */}
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '8px', 
                  marginBottom: '16px',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: '500' }}>COMPANY</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', margin: 0 }}>
                    {assignment.companyName}
                  </p>
                </div>

                {/* Required Documents */}
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0', fontWeight: '500' }}>REQUIRED DOCUMENTS</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {assignment.requiredDocuments.slice(0, 3).map((doc, index) => (
                      <span key={index} style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        {doc.title}
                      </span>
                    ))}
                    {assignment.requiredDocuments.length > 3 && (
                      <span style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        backgroundColor: '#f1f5f9',
                        color: '#64748b',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        +{assignment.requiredDocuments.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {assignment.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleAcceptAssignment(assignment.id)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#10b981',
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
                      <CheckCircle size={16} />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectAssignment(assignment.id)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#ef4444',
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
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                )}

                {assignment.status === 'accepted' && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#dcfce7',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={16} color="#10b981" />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#166534' }}>
                        Assignment Accepted
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#15803d', margin: '4px 0 0 0' }}>
                      Responded on {formatDate(assignment.respondedAt || '')}
                    </p>
                  </div>
                )}

                {assignment.status === 'rejected' && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#fecaca',
                    borderRadius: '8px',
                    border: '1px solid #fca5a5'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <XCircle size={16} color="#ef4444" />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#991b1b' }}>
                        Assignment Rejected
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#dc2626', margin: '4px 0 0 0' }}>
                      Responded on {formatDate(assignment.respondedAt || '')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {sortedAssignments.length === 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '48px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <Briefcase size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
            No assignments found
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            {searchQuery ? 'Try adjusting your search criteria' : 'No assignments match the selected filter'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Assignments;