import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const CompanyDashboard = () => {
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
          Demo Mode: Company Dashboard - {user?.firstName} {user?.lastName}
        </div>
      )}
      
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>
        Company Dashboard
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#3b82f6', marginBottom: '8px' }}>Active Crew</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>45</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>12 officers, 33 crew</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#10b981', marginBottom: '8px' }}>Open Positions</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>12</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>3 urgent</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#f59e0b', marginBottom: '8px' }}>Vessels</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>8</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>7 active, 1 dry dock</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#8b5cf6', marginBottom: '8px' }}>Pending Approvals</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>6</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>2 contracts, 4 documents</p>
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
            Manage Crew
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
            Post Job
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
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
