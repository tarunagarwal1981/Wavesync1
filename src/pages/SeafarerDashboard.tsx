import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const SeafarerDashboard = () => {
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
          Demo Mode: Seafarer Dashboard - {user?.firstName} {user?.lastName}
        </div>
      )}
      
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>
        Welcome back, {user?.firstName}!
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#3b82f6', marginBottom: '8px' }}>Pending Assignments</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>3</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>2 new this week</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#10b981', marginBottom: '8px' }}>Active Contract</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>1</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>MV Ocean Pioneer</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#f59e0b', marginBottom: '8px' }}>Documents</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>12</p>
          <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>2 expiring soon</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#8b5cf6', marginBottom: '8px' }}>Training</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>8</p>
          <p style={{ color: '#10b981', fontSize: '14px', marginTop: '8px' }}>All up to date</p>
        </div>
      </div>
      
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '20px' }}>Quick Actions</h2>
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
            View Assignments
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
            Upload Document
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
            Check Tasks
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeafarerDashboard;
