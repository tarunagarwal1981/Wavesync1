import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { NavigationProvider } from "../hooks/useNavigation";
import Layout from "../components/layout/Layout";
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
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout title="WaveSync" navItems={navItems} />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="documents" element={<Documents />} />
            <Route path="training" element={<Training />} />
            <Route path="profile" element={<Profile />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="travel" element={<TravelPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </NavigationProvider>
  );
};

export default AppRouter;