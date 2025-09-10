import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { NavigationProvider } from "../hooks/useNavigation";
import Layout from "../components/layout/Layout";
import { NAV_ITEMS } from "../utils/nav";
import ProtectedRoute from "../pages/ProtectedRoute";
import Dashboard from "../pages/Dashboard";
import Assignments from "../pages/Assignments";
import Tasks from "../pages/Tasks";
import Documents from "../pages/Documents";
import Training from "../pages/Training";
import Profile from "../pages/Profile";
import { MessagesPage, TravelPage, SettingsPage } from "../pages/__stubs__";

const navItems = NAV_ITEMS;

export const AppRouter: React.FC = () => {
  const isAuthenticated = true; // TODO: wire to real auth

  return (
    <NavigationProvider>
      <Routes>
        <Route element={<Layout title="WaveSync" navItems={navItems} user={{ name: "Captain Nemo", role: "Admin" }} />}> 
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}> 
            <Route index element={<Dashboard />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </NavigationProvider>
  );
};

export default AppRouter;