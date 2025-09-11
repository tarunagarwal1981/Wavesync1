import React from 'react';

export const TestPage: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      background: '#f0f8ff',
      border: '2px solid #007bff',
      borderRadius: '8px',
      margin: '20px'
    }}>
      <h1 style={{ color: '#007bff' }}>🎉 Test Page Working!</h1>
      <p>If you can see this, the routing is working correctly.</p>
      <p>Demo login should redirect to the dashboard.</p>
    </div>
  );
};

export default TestPage;
