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
import { 
  MessagesPage, 
  SettingsPage, 
  VesselInfoPage, 
  PortInfoPage, 
  EmergencyContactPage, 
  HelpSupportPage 
} from "../pages/__stubs__";
import { 
  CrewDirectoryPage, 
  FleetManagementPage, 
  AnalyticsPage, 
  BudgetPage, 
  SchedulingPage, 
  CommunicationsPage, 
  CompanySettingsPage, 
  CompliancePage, 
  UserManagementPage 
} from "../pages/__stubs_company__";
import { 
  AdminAnalyticsPage, 
  PerformanceMonitorPage, 
  SystemAlertsPage, 
  AllUsersPage, 
  CompanyManagementPage, 
  PermissionsRolesPage, 
  UserAnalyticsPage, 
  SystemSettingsPage, 
  ConfigurationPage, 
  AuditLogsPage, 
  SecuritySettingsPage, 
  ReportsExportsPage, 
  SupportTicketsPage, 
  DocumentationPage, 
  SystemUpdatesPage 
} from "../pages/__stubs_admin__";
import AIAssignmentPage from "../pages/AIAssignmentPage";

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
        
        {/* Seafarer specific routes */}
        <Route path="/vessel" element={
          <ProtectedRoute>
            <Layout title="Vessel Information">
              <PageTransition><VesselInfoPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/ports" element={
          <ProtectedRoute>
            <Layout title="Port Information">
              <PageTransition><PortInfoPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/emergency" element={
          <ProtectedRoute>
            <Layout title="Emergency Contact">
              <PageTransition><EmergencyContactPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/support" element={
          <ProtectedRoute>
            <Layout title="Help & Support">
              <PageTransition><HelpSupportPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Company User specific routes */}
        <Route path="/crew" element={
          <ProtectedRoute>
            <Layout title="Crew Directory">
              <PageTransition><CrewDirectoryPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/ai-assignments" element={
          <ProtectedRoute>
            <Layout title="AI Assignments">
              <PageTransition><AIAssignmentPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/fleet" element={
          <ProtectedRoute>
            <Layout title="Fleet Management">
              <PageTransition><FleetManagementPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Layout title="Analytics & Reports">
              <PageTransition><AnalyticsPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/budget" element={
          <ProtectedRoute>
            <Layout title="Budget & Expenses">
              <PageTransition><BudgetPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/schedule" element={
          <ProtectedRoute>
            <Layout title="Scheduling">
              <PageTransition><SchedulingPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/communications" element={
          <ProtectedRoute>
            <Layout title="Communications">
              <PageTransition><CommunicationsPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/company/settings" element={
          <ProtectedRoute>
            <Layout title="Company Settings">
              <PageTransition><CompanySettingsPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/compliance" element={
          <ProtectedRoute>
            <Layout title="Compliance">
              <PageTransition><CompliancePage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            <Layout title="User Management">
              <PageTransition><UserManagementPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Admin specific routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <Layout title="Admin Dashboard">
              <PageTransition><DashboardRouter /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute>
            <Layout title="System Analytics">
              <PageTransition><AdminAnalyticsPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/performance" element={
          <ProtectedRoute>
            <Layout title="Performance Monitor">
              <PageTransition><PerformanceMonitorPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/alerts" element={
          <ProtectedRoute>
            <Layout title="System Alerts">
              <PageTransition><SystemAlertsPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute>
            <Layout title="All Users">
              <PageTransition><AllUsersPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/companies" element={
          <ProtectedRoute>
            <Layout title="Company Management">
              <PageTransition><CompanyManagementPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/permissions" element={
          <ProtectedRoute>
            <Layout title="Permissions & Roles">
              <PageTransition><PermissionsRolesPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/user-analytics" element={
          <ProtectedRoute>
            <Layout title="User Analytics">
              <PageTransition><UserAnalyticsPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute>
            <Layout title="System Settings">
              <PageTransition><SystemSettingsPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/config" element={
          <ProtectedRoute>
            <Layout title="Configuration">
              <PageTransition><ConfigurationPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/audit" element={
          <ProtectedRoute>
            <Layout title="Audit Logs">
              <PageTransition><AuditLogsPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/security" element={
          <ProtectedRoute>
            <Layout title="Security Settings">
              <PageTransition><SecuritySettingsPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute>
            <Layout title="Reports & Exports">
              <PageTransition><ReportsExportsPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/support" element={
          <ProtectedRoute>
            <Layout title="Support Tickets">
              <PageTransition><SupportTicketsPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/docs" element={
          <ProtectedRoute>
            <Layout title="Documentation">
              <PageTransition><DocumentationPage /></PageTransition>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/updates" element={
          <ProtectedRoute>
            <Layout title="System Updates">
              <PageTransition><SystemUpdatesPage /></PageTransition>
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