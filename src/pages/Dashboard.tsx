import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockAssignments, mockDocuments, mockTasks, mockTraining, mockNotifications } from '../data/mockData';
import { 
  Briefcase, 
  FileText, 
  CheckSquare, 
  GraduationCap, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';

const Dashboard = () => {
  const { user, isDemoMode } = useAuth();
  
  // Calculate dashboard statistics
  const pendingAssignments = mockAssignments.filter(a => a.status === 'pending').length;
  const activeAssignments = mockAssignments.filter(a => a.status === 'accepted').length;
  const totalDocuments = mockDocuments.length;
  const expiringDocuments = mockDocuments.filter(d => {
    const expiryDate = new Date(d.expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow;
  }).length;
  const completedTraining = mockTraining.filter(t => t.status === 'completed').length;
  const pendingTasks = mockTasks.filter(t => t.status === 'todo').length;
  const inProgressTasks = mockTasks.filter(t => t.status === 'in_progress').length;
  const completedTasks = mockTasks.filter(t => t.status === 'completed').length;
  const unreadNotifications = mockNotifications.filter(n => !n.read).length;
  
  // Recent activity (last 5 items)
  const recentActivity = [
    ...mockAssignments.slice(0, 2).map(a => ({
      id: a.id,
      type: 'assignment',
      title: `New assignment: ${a.vessel.name} - ${a.position}`,
      time: '2 hours ago',
      icon: Briefcase,
      color: '#3b82f6'
    })),
    ...mockTasks.slice(0, 2).map(t => ({
      id: t.id,
      type: 'task',
      title: t.title,
      time: '4 hours ago',
      icon: CheckSquare,
      color: '#10b981'
    })),
    ...mockDocuments.slice(0, 1).map(d => ({
      id: d.id,
      type: 'document',
      title: `Document uploaded: ${d.title}`,
      time: '1 day ago',
      icon: FileText,
      color: '#f59e0b'
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
  
  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          marginBottom: '24px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <TrendingUp size={16} />
          <span>Demo Mode Active - Welcome to WaveSync Maritime Platform</span>
        </div>
      )}

      {/* Welcome Section */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
          Welcome back, {user?.firstName}!
        </h1>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>
          {user?.rank?.replace('_', ' ').toUpperCase()} - Here's your maritime dashboard overview
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#dbeafe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={20} color="#3b82f6" />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#3b82f6', fontSize: '14px', fontWeight: '600' }}>Pending Assignments</h3>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>{pendingAssignments}</p>
            </div>
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>New opportunities available</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#dcfce7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="#10b981" />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#10b981', fontSize: '14px', fontWeight: '600' }}>Active Contracts</h3>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>{activeAssignments}</p>
            </div>
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Currently onboard</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} color="#f59e0b" />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#f59e0b', fontSize: '14px', fontWeight: '600' }}>Documents</h3>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>{totalDocuments}</p>
            </div>
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            {expiringDocuments > 0 ? `${expiringDocuments} expiring soon` : 'All up to date'}
          </p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#e9d5ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={20} color="#8b5cf6" />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#8b5cf6', fontSize: '14px', fontWeight: '600' }}>Training</h3>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>{completedTraining}</p>
            </div>
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Certificates completed</p>
        </div>
      </div>

      {/* Task Progress Overview */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Clock size={16} color="#6b7280" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Pending Tasks</span>
          </div>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f59e0b' }}>{pendingTasks}</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckSquare size={16} color="#6b7280" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>In Progress</span>
          </div>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#3b82f6' }}>{inProgressTasks}</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckSquare size={16} color="#6b7280" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Completed</span>
          </div>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#10b981' }}>{completedTasks}</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle size={16} color="#6b7280" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Notifications</span>
          </div>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#ef4444' }}>{unreadNotifications}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '20px', fontWeight: '600' }}>Recent Activity</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentActivity.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  backgroundColor: `${activity.color}20`, 
                  borderRadius: '6px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <IconComponent size={16} color={activity.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                    {activity.title}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                    {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '24px' }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '20px', fontWeight: '600' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Briefcase size={16} />
            View Assignments
          </button>
          <button style={{
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FileText size={16} />
            Upload Document
          </button>
          <button style={{
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckSquare size={16} />
            Check Tasks
          </button>
          <button style={{
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <GraduationCap size={16} />
            View Training
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;