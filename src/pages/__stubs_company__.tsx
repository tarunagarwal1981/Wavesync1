// Company User stub pages
import React from 'react';
import CrewManagement from '../components/CrewManagement';

export const CrewDirectoryPage = CrewManagement;

export const FleetManagementPage: React.FC = () => {
  const fleetData = [
    {
      id: '1',
      name: 'MV Ocean Explorer',
      type: 'Container Ship',
      imo: 'IMO 9123456',
      flag: 'Liberia',
      status: 'At Sea',
      location: 'Pacific Ocean',
      nextPort: 'Los Angeles',
      eta: '2024-04-15',
      crew: 24,
      capacity: '8500 TEU',
      yearBuilt: 2018
    },
    {
      id: '2',
      name: 'MV Pacific Star',
      type: 'Bulk Carrier',
      imo: 'IMO 9123457',
      flag: 'Panama',
      status: 'In Port',
      location: 'Singapore',
      nextPort: 'Melbourne',
      eta: '2024-04-20',
      crew: 22,
      capacity: '180,000 DWT',
      yearBuilt: 2016
    },
    {
      id: '3',
      name: 'MV Atlantic Voyager',
      type: 'Tanker',
      imo: 'IMO 9123458',
      flag: 'Marshall Islands',
      status: 'At Sea',
      location: 'Atlantic Ocean',
      nextPort: 'Rotterdam',
      eta: '2024-04-18',
      crew: 26,
      capacity: '300,000 DWT',
      yearBuilt: 2019
    },
    {
      id: '4',
      name: 'MV Indian Ocean',
      type: 'Container Ship',
      imo: 'IMO 9123459',
      flag: 'Liberia',
      status: 'In Port',
      location: 'Dubai',
      nextPort: 'Hamburg',
      eta: '2024-04-25',
      crew: 25,
      capacity: '12000 TEU',
      yearBuilt: 2020
    },
    {
      id: '5',
      name: 'MV Caribbean Queen',
      type: 'Cruise Ship',
      imo: 'IMO 9123460',
      flag: 'Bahamas',
      status: 'At Sea',
      location: 'Caribbean Sea',
      nextPort: 'Miami',
      eta: '2024-04-12',
      crew: 1200,
      capacity: '4000 Passengers',
      yearBuilt: 2017
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        Fleet Management
      </h1>
      
      {/* Fleet Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#3b82f6', marginBottom: '8px' }}>5</div>
          <div style={{ color: '#6b7280', fontWeight: '500' }}>Total Vessels</div>
        </div>
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#22c55e', marginBottom: '8px' }}>3</div>
          <div style={{ color: '#6b7280', fontWeight: '500' }}>At Sea</div>
        </div>
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#f59e0b', marginBottom: '8px' }}>2</div>
          <div style={{ color: '#6b7280', fontWeight: '500' }}>In Port</div>
        </div>
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#8b5cf6', marginBottom: '8px' }}>1,297</div>
          <div style={{ color: '#6b7280', fontWeight: '500' }}>Total Crew</div>
        </div>
      </div>

      {/* Fleet List */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>Vessel Overview</h2>
        </div>
        <div style={{ padding: '0' }}>
          {fleetData.map((vessel, index) => (
            <div key={vessel.id} style={{
              padding: '20px 24px',
              borderBottom: index < fleetData.length - 1 ? '1px solid #f3f4f6' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '700',
                fontSize: '16px'
              }}>
                {vessel.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    {vessel.name}
                  </h3>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background: vessel.status === 'At Sea' ? '#dbeafe' : '#f0fdf4',
                    color: vessel.status === 'At Sea' ? '#1e40af' : '#166534'
                  }}>
                    {vessel.status}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', fontSize: '14px', color: '#6b7280' }}>
                  <div><strong>Type:</strong> {vessel.type}</div>
                  <div><strong>IMO:</strong> {vessel.imo}</div>
                  <div><strong>Flag:</strong> {vessel.flag}</div>
                  <div><strong>Location:</strong> {vessel.location}</div>
                  <div><strong>Next Port:</strong> {vessel.nextPort}</div>
                  <div><strong>ETA:</strong> {vessel.eta}</div>
                  <div><strong>Crew:</strong> {vessel.crew}</div>
                  <div><strong>Capacity:</strong> {vessel.capacity}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  padding: '8px 12px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  cursor: 'pointer'
                }}>
                  View Details
                </button>
                <button style={{
                  padding: '8px 12px',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'white',
                  cursor: 'pointer'
                }}>
                  Track
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AnalyticsPage: React.FC = () => {
  const analyticsData = {
    fleetPerformance: {
      totalVoyages: 156,
      onTimeArrivals: 142,
      averageDelay: '2.3 days',
      fuelEfficiency: '94.2%'
    },
    crewMetrics: {
      totalCrew: 1297,
      retentionRate: '87.3%',
      averageExperience: '8.2 years',
      certifications: '98.5%'
    },
    operationalStats: {
      totalDistance: '2.4M nm',
      cargoHandled: '45.2M tons',
      portCalls: 324,
      maintenanceHours: 2840
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        Analytics & Reports
      </h1>
      
      {/* Key Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Fleet Performance
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Total Voyages:</span>
              <span style={{ fontWeight: '600', color: '#111827' }}>{analyticsData.fleetPerformance.totalVoyages}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>On-Time Arrivals:</span>
              <span style={{ fontWeight: '600', color: '#22c55e' }}>{analyticsData.fleetPerformance.onTimeArrivals}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Average Delay:</span>
              <span style={{ fontWeight: '600', color: '#f59e0b' }}>{analyticsData.fleetPerformance.averageDelay}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Fuel Efficiency:</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>{analyticsData.fleetPerformance.fuelEfficiency}</span>
            </div>
          </div>
        </div>

        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Crew Metrics
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Total Crew:</span>
              <span style={{ fontWeight: '600', color: '#111827' }}>{analyticsData.crewMetrics.totalCrew}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Retention Rate:</span>
              <span style={{ fontWeight: '600', color: '#22c55e' }}>{analyticsData.crewMetrics.retentionRate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Avg Experience:</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>{analyticsData.crewMetrics.averageExperience}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Certifications:</span>
              <span style={{ fontWeight: '600', color: '#8b5cf6' }}>{analyticsData.crewMetrics.certifications}</span>
            </div>
          </div>
        </div>

        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Operational Stats
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Total Distance:</span>
              <span style={{ fontWeight: '600', color: '#111827' }}>{analyticsData.operationalStats.totalDistance}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Cargo Handled:</span>
              <span style={{ fontWeight: '600', color: '#22c55e' }}>{analyticsData.operationalStats.cargoHandled}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Port Calls:</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>{analyticsData.operationalStats.portCalls}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Maintenance Hours:</span>
              <span style={{ fontWeight: '600', color: '#f59e0b' }}>{analyticsData.operationalStats.maintenanceHours}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
          Performance Trends
        </h3>
        <div style={{
          height: '300px',
          background: '#f9fafb',
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: '16px'
        }}>
          📊 Interactive Charts Coming Soon
        </div>
      </div>

      {/* Reports Section */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
          Generate Reports
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <button style={{
            padding: '16px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Monthly Report</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Fleet performance summary</div>
          </button>
          <button style={{
            padding: '16px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Crew Report</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Crew metrics and certifications</div>
          </button>
          <button style={{
            padding: '16px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Financial Report</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Cost analysis and budgets</div>
          </button>
          <button style={{
            padding: '16px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Compliance Report</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Regulatory compliance status</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export const BudgetPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        Budget & Expenses
      </h1>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280' }}>Budget & Expenses page coming soon...</p>
      </div>
    </div>
  );
};

export const SchedulingPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        Scheduling
      </h1>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280' }}>Scheduling page coming soon...</p>
      </div>
    </div>
  );
};

export const CommunicationsPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        Communications
      </h1>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280' }}>Communications page coming soon...</p>
      </div>
    </div>
  );
};

export const CompanySettingsPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        Company Settings
      </h1>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280' }}>Company Settings page coming soon...</p>
      </div>
    </div>
  );
};

export const CompliancePage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        Compliance
      </h1>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280' }}>Compliance page coming soon...</p>
      </div>
    </div>
  );
};

export const UserManagementPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
        User Management
      </h1>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280' }}>User Management page coming soon...</p>
      </div>
    </div>
  );
};
