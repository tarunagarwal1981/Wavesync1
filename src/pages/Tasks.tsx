import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Tasks = () => {
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
          Demo Mode: Tasks - {user?.firstName} {user?.lastName}
        </div>
      )}
      
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>
        Tasks
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#3b82f6', marginBottom: '8px' }}>To Do</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>5</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Pending tasks</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#10b981', marginBottom: '8px' }}>In Progress</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>3</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Active tasks</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#8b5cf6', marginBottom: '8px' }}>Completed</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>12</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>This month</p>
        </div>
      </div>
      
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '20px' }}>Recent Tasks</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>Complete Safety Training</h4>
            <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Due: Jan 30, 2024 • Priority: High</p>
            <span style={{ backgroundColor: '#f59e0b', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>In Progress</span>
          </div>
          
          <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>Update Medical Certificate</h4>
            <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Due: Feb 15, 2024 • Priority: Medium</p>
            <span style={{ backgroundColor: '#3b82f6', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>To Do</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;