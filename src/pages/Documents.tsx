import { useAuth } from '../contexts/AuthContext';

const Documents = () => {
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
          Demo Mode: Documents - {user?.firstName} {user?.lastName}
        </div>
      )}
      
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>
        Documents
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#3b82f6', marginBottom: '8px' }}>Valid</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>8</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>All up to date</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#f59e0b', marginBottom: '8px' }}>Expiring Soon</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>2</p>
          <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>Within 30 days</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '8px' }}>Expired</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>1</p>
          <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>Needs renewal</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#8b5cf6', marginBottom: '8px' }}>Pending</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>1</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Under review</p>
        </div>
      </div>
      
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '20px' }}>Document Categories</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#3b82f6' }}>STCW Certificates</h4>
            <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>5 documents</p>
            <span style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Valid</span>
          </div>
          
          <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#f59e0b' }}>Medical Certificates</h4>
            <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>3 documents</p>
            <span style={{ backgroundColor: '#f59e0b', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Expiring</span>
          </div>
          
          <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#8b5cf6' }}>Company Documents</h4>
            <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>4 documents</p>
            <span style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Valid</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;