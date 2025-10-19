import { useAuth } from '../contexts/SupabaseAuthContext';

const Assignments = () => {
  const { profile } = useAuth();
  
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{
        backgroundColor: '#3b82f6',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        Welcome: {profile?.full_name} - {profile?.user_type}
      </div>
      
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>
        Assignments
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#3b82f6', marginBottom: '8px' }}>Pending</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>3</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Awaiting approval</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#10b981', marginBottom: '8px' }}>Active</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>1</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Currently onboard</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#f59e0b', marginBottom: '8px' }}>Completed</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>12</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>This year</p>
        </div>
      </div>
      
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '20px' }}>Recent Assignments</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>Chief Officer - MV Ocean Pioneer</h4>
            <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Status: Active • Start: Jan 15, 2024</p>
            <span style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Active</span>
          </div>
          
          <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>Second Officer - MV Atlantic Star</h4>
            <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Status: Pending • Start: Mar 1, 2024</p>
            <span style={{ backgroundColor: '#f59e0b', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assignments;