import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { NavigationProvider } from "../hooks/useNavigation";
import Layout from "../components/layout/Layout";
import { PageTransition, ErrorBoundary } from "../components/ui";
import { NAV_ITEMS } from "../utils/nav";
import ProtectedRoute from "../components/ProtectedRoute";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Assignments from "../pages/Assignments";
import Tasks from "../pages/Tasks";
import Documents from "../pages/Documents";
import Training from "../pages/Training";
import Profile from "../pages/Profile";
import { MessagesPage, TravelPage, SettingsPage } from "../pages/__stubs__";

const navItems = NAV_ITEMS;

export const AppRouter: React.FC = () => {
  return (
    <NavigationProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Root route redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout title="WaveSync" navItems={navItems} />}>
            <Route path="dashboard" element={<PageTransition><ErrorBoundary><Dashboard /></ErrorBoundary></PageTransition>} />
            <Route path="assignments" element={<PageTransition><Assignments /></PageTransition>} />
            <Route path="tasks" element={<PageTransition><Tasks /></PageTransition>} />
            <Route path="documents" element={<PageTransition><Documents /></PageTransition>} />
            <Route path="training" element={<PageTransition><Training /></PageTransition>} />
            <Route path="profile" element={<PageTransition><Profile /></PageTransition>} />
            <Route path="messages" element={<PageTransition><MessagesPage /></PageTransition>} />
            <Route path="travel" element={<PageTransition><TravelPage /></PageTransition>} />
            <Route path="settings" element={<PageTransition><SettingsPage /></PageTransition>} />
          </Route>
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </NavigationProvider>
  );
};

export default AppRouter;