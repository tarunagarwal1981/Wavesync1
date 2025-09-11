import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { user, isDemoMode } = useAuth();
  
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {isDemoMode && (
        <div style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          Demo Mode: Admin Dashboard - {user?.firstName} {user?.lastName}
        </div>
      )}
      
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>
        Admin Dashboard
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#3b82f6', marginBottom: '8px' }}>Total Users</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>1,245</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Active users</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#10b981', marginBottom: '8px' }}>Companies</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>68</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Registered companies</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#f59e0b', marginBottom: '8px' }}>Active Assignments</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>234</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Currently active</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#8b5cf6', marginBottom: '8px' }}>System Status</h3>
          <p style={{ fontSize: '16px', color: 'green', margin: 0 }}>Operational</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>All systems normal</p>
        </div>
      </div>
      
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '20px' }}>Admin Actions</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            Manage Users
          </button>
          <button style={{
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            System Reports
          </button>
          <button style={{
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;