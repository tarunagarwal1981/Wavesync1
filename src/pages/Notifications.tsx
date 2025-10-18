import { useAuth } from '../contexts/SupabaseAuthContext';

const Notifications = () => {
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
          Demo Mode: Notifications - {user?.firstName} {user?.lastName}
        </div>
      )}
      
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>
        Notifications
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#3b82f6', marginBottom: '8px' }}>Unread</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>5</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>New notifications</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#10b981', marginBottom: '8px' }}>Read</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>23</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>This week</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#f59e0b', marginBottom: '8px' }}>Important</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>2</p>
          <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>High priority</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#8b5cf6', marginBottom: '8px' }}>System</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>8</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Updates</p>
        </div>
      </div>
      
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '20px' }}>Recent Notifications</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>Assignment Update</h4>
            <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Your assignment status has been updated to "Active"</p>
            <span style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Assignment</span>
          </div>
          
          <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>Document Expiry Warning</h4>
            <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Your medical certificate expires in 30 days</p>
            <span style={{ backgroundColor: '#f59e0b', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Warning</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;