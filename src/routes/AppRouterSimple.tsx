import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";

export const AppRouterSimple: React.FC = () => {
  console.log('🛣️ AppRouterSimple rendering');
  console.log('🛣️ Current URL:', window.location.pathname);
  console.log('🛣️ AppRouterSimple timestamp:', new Date().toISOString());
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/dashboard" element={
        <div style={{ padding: '20px', backgroundColor: 'lightgreen' }}>
          <h1>Simple Dashboard Test</h1>
          <p>If you see this, routing is working!</p>
        </div>
      } />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouterSimple;
