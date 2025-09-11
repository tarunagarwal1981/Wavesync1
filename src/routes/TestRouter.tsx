import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";

const TestRouter: React.FC = () => {
  console.log('🧪 TestRouter rendering - this should show up!');
  console.log('🧪 Current URL:', window.location.pathname);
  console.log('🧪 TestRouter timestamp:', new Date().toISOString());
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue' }}>
      <h1>🧪 Test Router Working!</h1>
      <p>If you see this, the router is working!</p>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard" element={
          <div style={{ padding: '20px', backgroundColor: 'lightgreen', marginTop: '20px' }}>
            <h2>✅ Dashboard Route Working!</h2>
            <p>Authentication and routing are working correctly!</p>
          </div>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default TestRouter;
