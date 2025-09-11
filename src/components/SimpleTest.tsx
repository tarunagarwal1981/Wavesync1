import React from 'react';

export const SimpleTest: React.FC = () => {
  console.log('🧪 SimpleTest component rendering');
  
  return (
    <div style={{ 
      padding: '50px', 
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ fontSize: '48px', margin: 0 }}>🎉 Hello World!</h1>
      <p style={{ fontSize: '24px', margin: '20px 0' }}>Simple test component is working!</p>
      <p style={{ fontSize: '16px', opacity: 0.8 }}>If you can see this, routing is working correctly.</p>
    </div>
  );
};

export default SimpleTest;
