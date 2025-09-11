import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { NavigationProvider } from "../hooks/useNavigation";
import Layout from "../components/layout/Layout";
import { PageTransition, ErrorBoundary } from "../components/ui";
import ProtectedRoute from "../components/ProtectedRoute";
import Login from "../pages/Login";
import DashboardRouter from "../components/DashboardRouter";
import Assignments from "../pages/Assignments";
import Tasks from "../pages/Tasks";
import Documents from "../pages/Documents";
import Training from "../pages/Training";
import Profile from "../pages/Profile";
import Notifications from "../pages/Notifications";
import TravelModule from "../components/TravelModule";
import { MessagesPage, SettingsPage } from "../pages/__stubs__";

export const AppRouter: React.FC = () => {
  console.log('🛣️ AppRouter rendering');
  console.log('🛣️ Current URL:', window.location.pathname);
  console.log('🛣️ Current hash:', window.location.hash);
  console.log('🛣️ Current search:', window.location.search);
  console.log('🛣️ AppRouter timestamp:', new Date().toISOString());
  
  // Add a simple test to see if the component is working
  console.log('🛣️ AppRouter - about to return JSX');
  
  return (
    <NavigationProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Root route redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout title="WaveSync">
              {(() => {
                console.log('🛣️ Dashboard route matched - rendering DashboardRouter');
                return <PageTransition><ErrorBoundary><DashboardRouter /></ErrorBoundary></PageTransition>;
              })()}
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/assignments" element={
          <ProtectedRoute>
            <Layout title="Assignments">
              <PageTransition><Assignments /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute>
            <Layout title="Tasks">
              <PageTransition><Tasks /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/documents" element={
          <ProtectedRoute>
            <Layout title="Documents">
              <PageTransition><Documents /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/training" element={
          <ProtectedRoute>
            <Layout title="Training">
              <PageTransition><Training /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout title="Profile">
              <PageTransition><Profile /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Layout title="Notifications">
              <PageTransition><Notifications /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <Layout title="Messages">
              <PageTransition><MessagesPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/travel" element={
          <ProtectedRoute>
            <Layout title="Travel">
              <PageTransition><TravelModule /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout title="Settings">
              <PageTransition><SettingsPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </NavigationProvider>
  );
};

export default AppRouter;