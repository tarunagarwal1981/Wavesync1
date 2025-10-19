import { useAuth } from '../contexts/SupabaseAuthContext';

const Profile = () => {
  const { user, profile } = useAuth();
  
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {profile && (
        <div style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          Profile - {profile?.full_name}
        </div>
      )}
      
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>
        Profile
      </h1>
      
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '20px' }}>Personal Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Full Name</label>
            <input 
              type="text" 
              value={profile?.full_name || ''} 
              readOnly
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                backgroundColor: '#f9fafb'
              }} 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>User Type</label>
            <input 
              type="text" 
              value={profile?.user_type || ''} 
              readOnly
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                backgroundColor: '#f9fafb'
              }} 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
            <input 
              type="email" 
              value={user?.email || profile?.email || ''} 
              readOnly
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                backgroundColor: '#f9fafb'
              }} 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Phone</label>
            <input 
              type="tel" 
              value={profile?.phone || ''} 
              readOnly
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                backgroundColor: '#f9fafb'
              }} 
            />
          </div>
        </div>
      </div>
      
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '20px' }}>Account Settings</h2>
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
            Change Password
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
            Update Profile
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
            Privacy Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;