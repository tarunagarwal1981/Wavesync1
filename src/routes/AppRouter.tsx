import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { NavigationProvider } from "../hooks/useNavigation";
import Layout from "../components/layout/Layout";
import { PageTransition, ErrorBoundary } from "../components/ui";
import { SupabaseProtectedRoute } from "../components/SupabaseProtectedRoute";
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
import CompanyManagement from "../components/CompanyManagement";
import UserManagement from "../components/UserManagement";
import VesselManagement from "../components/VesselManagement";
import AssignmentManagement from "../components/AssignmentManagement";

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
          <SupabaseProtectedRoute>
            <Layout title="WaveSync">
              {(() => {
                console.log('🛣️ Dashboard route matched - rendering DashboardRouter');
                return <PageTransition><ErrorBoundary><DashboardRouter /></ErrorBoundary></PageTransition>;
              })()}
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/assignments" element={
          <SupabaseProtectedRoute>
            <Layout title="Assignments">
              <PageTransition><Assignments /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/tasks" element={
          <SupabaseProtectedRoute>
            <Layout title="Tasks">
              <PageTransition><Tasks /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/documents" element={
          <SupabaseProtectedRoute>
            <Layout title="Documents">
              <PageTransition><Documents /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/training" element={
          <SupabaseProtectedRoute>
            <Layout title="Training">
              <PageTransition><Training /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/profile" element={
          <SupabaseProtectedRoute>
            <Layout title="Profile">
              <PageTransition><Profile /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/notifications" element={
          <SupabaseProtectedRoute>
            <Layout title="Notifications">
              <PageTransition><Notifications /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/messages" element={
          <SupabaseProtectedRoute>
            <Layout title="Messages">
              <PageTransition><MessagesPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/travel" element={
          <SupabaseProtectedRoute>
            <Layout title="Travel">
              <PageTransition><TravelModule /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/settings" element={
          <SupabaseProtectedRoute>
            <Layout title="Settings">
              <PageTransition><SettingsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        
        {/* Seafarer specific routes */}
        <Route path="/vessel" element={
          <SupabaseProtectedRoute>
            <Layout title="Vessel Information">
              <PageTransition><VesselInfoPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/ports" element={
          <SupabaseProtectedRoute>
            <Layout title="Port Information">
              <PageTransition><PortInfoPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/emergency" element={
          <SupabaseProtectedRoute>
            <Layout title="Emergency Contact">
              <PageTransition><EmergencyContactPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/support" element={
          <SupabaseProtectedRoute>
            <Layout title="Help & Support">
              <PageTransition><HelpSupportPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        
        {/* Company User specific routes */}
        <Route path="/crew" element={
          <SupabaseProtectedRoute>
            <Layout title="Crew Directory">
              <PageTransition><CrewDirectoryPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/ai-assignments" element={
          <SupabaseProtectedRoute>
            <Layout title="AI Assignments">
              <PageTransition><AIAssignmentPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/fleet" element={
          <SupabaseProtectedRoute>
            <Layout title="Fleet Management">
              <PageTransition><FleetManagementPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/analytics" element={
          <SupabaseProtectedRoute>
            <Layout title="Analytics & Reports">
              <PageTransition><AnalyticsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/budget" element={
          <SupabaseProtectedRoute>
            <Layout title="Budget & Expenses">
              <PageTransition><BudgetPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/schedule" element={
          <SupabaseProtectedRoute>
            <Layout title="Scheduling">
              <PageTransition><SchedulingPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/communications" element={
          <SupabaseProtectedRoute>
            <Layout title="Communications">
              <PageTransition><CommunicationsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/company/settings" element={
          <SupabaseProtectedRoute>
            <Layout title="Company Settings">
              <PageTransition><CompanySettingsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/compliance" element={
          <SupabaseProtectedRoute>
            <Layout title="Compliance">
              <PageTransition><CompliancePage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/users" element={
          <SupabaseProtectedRoute>
            <Layout title="User Management">
              <PageTransition><UserManagementPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        
        {/* Admin specific routes */}
        <Route path="/admin" element={
          <SupabaseProtectedRoute>
            <Layout title="Admin Dashboard">
              <PageTransition><DashboardRouter /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <SupabaseProtectedRoute>
            <Layout title="System Analytics">
              <PageTransition><AdminAnalyticsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/admin/performance" element={
          <SupabaseProtectedRoute>
            <Layout title="Performance Monitor">
              <PageTransition><PerformanceMonitorPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/admin/alerts" element={
          <SupabaseProtectedRoute>
            <Layout title="System Alerts">
              <PageTransition><SystemAlertsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <SupabaseProtectedRoute>
            <Layout title="User Management">
              <PageTransition><UserManagement /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/admin/companies" element={
          <SupabaseProtectedRoute>
            <Layout title="Company Management">
              <PageTransition><CompanyManagement /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/admin/vessels" element={
          <SupabaseProtectedRoute>
            <Layout title="Vessel Management">
              <PageTransition><VesselManagement /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        {/* Company area routes */}
        <Route path="/assignments" element={
          <SupabaseProtectedRoute>
            <Layout title="Assignment Management">
              <PageTransition><AssignmentManagement /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/admin/permissions" element={
          <SupabaseProtectedRoute>
            <Layout title="Permissions & Roles">
              <PageTransition><PermissionsRolesPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/admin/user-analytics" element={
          <SupabaseProtectedRoute>
            <Layout title="User Analytics">
              <PageTransition><UserAnalyticsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <SupabaseProtectedRoute>
            <Layout title="System Settings">
              <PageTransition><SystemSettingsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/admin/config" element={
          <SupabaseProtectedRoute>
            <Layout title="Configuration">
              <PageTransition><ConfigurationPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/admin/audit" element={
          <SupabaseProtectedRoute>
            <Layout title="Audit Logs">
              <PageTransition><AuditLogsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/admin/security" element={
          <SupabaseProtectedRoute>
            <Layout title="Security Settings">
              <PageTransition><SecuritySettingsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <SupabaseProtectedRoute>
            <Layout title="Reports & Exports">
              <PageTransition><ReportsExportsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/admin/support" element={
          <SupabaseProtectedRoute>
            <Layout title="Support Tickets">
              <PageTransition><SupportTicketsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/admin/docs" element={
          <SupabaseProtectedRoute>
            <Layout title="Documentation">
              <PageTransition><DocumentationPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/admin/updates" element={
          <SupabaseProtectedRoute>
            <Layout title="System Updates">
              <PageTransition><SystemUpdatesPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </NavigationProvider>
  );
};

export default AppRouter;