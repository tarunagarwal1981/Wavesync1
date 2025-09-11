import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockAssignments, mockDocuments, mockTasks, mockTraining } from '../data/mockData';
import { Users, Building2, Briefcase, BarChart3, AlertTriangle, Shield, Settings, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const { user, isDemoMode } = useAuth();
  
  console.log('AdminDashboard rendering for:', user?.firstName);
  
  // Calculate admin-specific statistics
  const totalUsers = 1245; // Mock data
  const totalCompanies = 68; // Mock data
  const activeAssignments = mockAssignments.filter(a => a.status === 'active').length;
  const systemStatus = 'Operational'; // Mock data
  
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={20} />
          <span><strong>Demo Mode:</strong> You are viewing the Admin Dashboard with sample data</span>
        </div>
      )}
      
      {/* Welcome Section */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1f2937' }}>
          System Administration
        </h1>
        <p style={{ color: '#6b7280', margin: '0 0 8px 0' }}>
          Welcome, {user?.firstName} {user?.lastName} • System Administrator
        </p>
        <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
          Full system access • Last login: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </p>
      </div>
      
      {/* Statistics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #3b82f6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0' }}>Total Users</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>{totalUsers.toLocaleString()}</p>
            </div>
            <Users size={32} color="#3b82f6" />
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #f59e0b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0' }}>Companies</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>{totalCompanies}</p>
            </div>
            <Building2 size={32} color="#f59e0b" />
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #10b981'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0' }}>Active Assignments</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>{activeAssignments}</p>
            </div>
            <Briefcase size={32} color="#10b981" />
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #8b5cf6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0' }}>System Status</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#10b981' }}>{systemStatus}</p>
            </div>
            <Shield size={32} color="#8b5cf6" />
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 16px 0', color: '#1f2937' }}>Admin Actions</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px' 
        }}>
          <button style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            padding: '16px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s'
          }}>
            <Users size={20} color="#3b82f6" />
            <span>User Management</span>
          </button>
          
          <button style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            padding: '16px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s'
          }}>
            <Building2 size={20} color="#f59e0b" />
            <span>Company Management</span>
          </button>
          
          <button style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            padding: '16px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s'
          }}>
            <BarChart3 size={20} color="#10b981" />
            <span>Analytics</span>
          </button>
          
          <button style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            padding: '16px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s'
          }}>
            <Settings size={20} color="#8b5cf6" />
            <span>System Settings</span>
          </button>
        </div>
      </div>
      
      {/* System Overview */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 16px 0', color: '#1f2937' }}>System Overview</h2>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Activity size={20} color="#10b981" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>System Health</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>Database</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#10b981' }}>Healthy</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>API Services</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#10b981' }}>Operational</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>File Storage</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#10b981' }}>Available</p>
              </div>
            </div>
          </div>
          
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <BarChart3 size={20} color="#3b82f6" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>Recent Activity</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>New Users Today</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>23</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>Active Sessions</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>156</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
