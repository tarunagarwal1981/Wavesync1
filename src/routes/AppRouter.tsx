import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { NavigationProvider } from "../hooks/useNavigation";
import Layout from "../components/layout/Layout";
import { PageTransition, ErrorBoundary, Loading } from "../components/ui";
import { SupabaseProtectedRoute } from "../components/SupabaseProtectedRoute";

// Eager load only Login and critical components
import Login from "../pages/Login";

// Lazy load all other components for code splitting
const DashboardRouter = lazy(() => import("../components/DashboardRouter"));
const MyAssignments = lazy(() => import("../components/MyAssignments"));
const Tasks = lazy(() => import("../pages/Tasks"));
const Training = lazy(() => import("../pages/Training"));
const Profile = lazy(() => import("../pages/Profile"));
const Notifications = lazy(() => import("../pages/Notifications"));
const CrewDirectory = lazy(() => import("../components/CrewDirectory"));
const CompanyManagement = lazy(() => import("../components/CompanyManagement"));
const UserManagement = lazy(() => import("../components/UserManagement"));
const VesselManagement = lazy(() => import("../components/VesselManagement"));
const AssignmentManagement = lazy(() => import("../components/AssignmentManagement"));
const DocumentManagement = lazy(() => import("../components/DocumentManagement"));
const TravelManagement = lazy(() => import("../components/TravelManagement"));
const MyTravel = lazy(() => import("../components/MyTravel"));
const TaskManagement = lazy(() => import("../components/TaskManagement"));
const ExpiryDashboard = lazy(() => import("../components/ExpiryDashboard"));
const AnalyticsDashboard = lazy(() => import("../components/AnalyticsDashboard"));
const MessagingPage = lazy(() => import("../components/MessagingPage"));
const AIAgentSettings = lazy(() => import("../components/admin/AIAgentSettings"));
const AIAssignmentQueue = lazy(() => import("../components/company/AIAssignmentQueue"));
const AIPerformanceDashboard = lazy(() => import("../components/company/AIPerformanceDashboard"));
const AIAssignmentPage = lazy(() => import("../pages/AIAssignmentPage"));
const TestPage = lazy(() => import("../pages/TestPage"));

// Lazy load stub pages
const SettingsPage = lazy(() => import("../pages/__stubs__").then(m => ({ default: m.SettingsPage })));
const VesselInfoPage = lazy(() => import("../pages/__stubs__").then(m => ({ default: m.VesselInfoPage })));
const PortInfoPage = lazy(() => import("../pages/__stubs__").then(m => ({ default: m.PortInfoPage })));
const EmergencyContactPage = lazy(() => import("../pages/__stubs__").then(m => ({ default: m.EmergencyContactPage })));
const HelpSupportPage = lazy(() => import("../pages/__stubs__").then(m => ({ default: m.HelpSupportPage })));

const BudgetPage = lazy(() => import("../pages/__stubs_company__").then(m => ({ default: m.BudgetPage })));
const SchedulingPage = lazy(() => import("../pages/__stubs_company__").then(m => ({ default: m.SchedulingPage })));
const CommunicationsPage = lazy(() => import("../pages/__stubs_company__").then(m => ({ default: m.CommunicationsPage })));
const CompanySettingsPage = lazy(() => import("../pages/__stubs_company__").then(m => ({ default: m.CompanySettingsPage })));
const CompliancePage = lazy(() => import("../pages/__stubs_company__").then(m => ({ default: m.CompliancePage })));
const UserManagementPage = lazy(() => import("../pages/__stubs_company__").then(m => ({ default: m.UserManagementPage })));

const AdminAnalyticsPage = lazy(() => import("../pages/__stubs_admin__").then(m => ({ default: m.AdminAnalyticsPage })));
const PerformanceMonitorPage = lazy(() => import("../pages/__stubs_admin__").then(m => ({ default: m.PerformanceMonitorPage })));
const SystemAlertsPage = lazy(() => import("../pages/__stubs_admin__").then(m => ({ default: m.SystemAlertsPage })));
const PermissionsRolesPage = lazy(() => import("../pages/__stubs_admin__").then(m => ({ default: m.PermissionsRolesPage })));
const UserAnalyticsPage = lazy(() => import("../pages/__stubs_admin__").then(m => ({ default: m.UserAnalyticsPage })));
const SystemSettingsPage = lazy(() => import("../pages/__stubs_admin__").then(m => ({ default: m.SystemSettingsPage })));
const ConfigurationPage = lazy(() => import("../pages/__stubs_admin__").then(m => ({ default: m.ConfigurationPage })));
const AuditLogsPage = lazy(() => import("../pages/__stubs_admin__").then(m => ({ default: m.AuditLogsPage })));
const SecuritySettingsPage = lazy(() => import("../pages/__stubs_admin__").then(m => ({ default: m.SecuritySettingsPage })));
const ReportsExportsPage = lazy(() => import("../pages/__stubs_admin__").then(m => ({ default: m.ReportsExportsPage })));
const SupportTicketsPage = lazy(() => import("../pages/__stubs_admin__").then(m => ({ default: m.SupportTicketsPage })));
const DocumentationPage = lazy(() => import("../pages/__stubs_admin__").then(m => ({ default: m.DocumentationPage })));
const SystemUpdatesPage = lazy(() => import("../pages/__stubs_admin__").then(m => ({ default: m.SystemUpdatesPage })));

// Helper component to wrap routes with Suspense
const SuspenseRoute: React.FC<{ children: React.ReactNode; loadingText?: string }> = ({ 
  children, 
  loadingText = "Loading..." 
}) => (
  <Suspense fallback={<Loading fullScreen text={loadingText} />}>
    {children}
  </Suspense>
);

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
        <Route path="/test" element={
          <SuspenseRoute loadingText="Loading test page...">
            <TestPage />
          </SuspenseRoute>
        } />
        
        {/* Root route redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <SuspenseRoute loadingText="Loading dashboard...">
          <SupabaseProtectedRoute>
            <Layout title="WaveSync">
              {(() => {
                console.log('🛣️ Dashboard route matched - rendering DashboardRouter');
                return <PageTransition><ErrorBoundary><DashboardRouter /></ErrorBoundary></PageTransition>;
              })()}
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/my-assignments" element={
          <SuspenseRoute loadingText="Loading assignments...">
          <SupabaseProtectedRoute>
            <Layout title="My Assignments">
              <PageTransition><MyAssignments /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/tasks" element={
          <SuspenseRoute loadingText="Loading tasks...">
          <SupabaseProtectedRoute>
            <Layout title="Tasks">
              <PageTransition><Tasks /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/my-documents" element={
          <SuspenseRoute loadingText="Loading documents...">
          <SupabaseProtectedRoute>
            <Layout title="My Documents">
              <PageTransition><DocumentManagement /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        {/* Seafarer Travel */}
        <Route path="/my-travel" element={
          <SuspenseRoute loadingText="Loading travel...">
          <SupabaseProtectedRoute>
            <Layout title="My Travel">
              <PageTransition><MyTravel /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        {/* Company Document Management */}
        <Route path="/company/documents" element={
          <SuspenseRoute loadingText="Loading documents...">
          <SupabaseProtectedRoute>
            <Layout title="Document Management">
              <PageTransition><DocumentManagement /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/training" element={
          <SuspenseRoute loadingText="Loading training...">
          <SupabaseProtectedRoute>
            <Layout title="Training">
              <PageTransition><Training /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/profile" element={
          <SuspenseRoute loadingText="Loading profile...">
          <SupabaseProtectedRoute>
            <Layout title="Profile">
              <PageTransition><Profile /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/notifications" element={
          <SuspenseRoute loadingText="Loading notifications...">
          <SupabaseProtectedRoute>
            <Layout title="Notifications">
              <PageTransition><Notifications /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/messages" element={
          <SuspenseRoute loadingText="Loading messages...">
          <SupabaseProtectedRoute>
            <Layout title="Messages">
              <PageTransition><MessagingPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/settings" element={
          <SuspenseRoute loadingText="Loading settings...">
          <SupabaseProtectedRoute>
            <Layout title="Settings">
              <PageTransition><SettingsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        
        {/* Seafarer specific routes */}
        <Route path="/vessel" element={
          <SuspenseRoute>
          <SupabaseProtectedRoute>
            <Layout title="Vessel Information">
              <PageTransition><VesselInfoPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/ports" element={
          <SuspenseRoute>
          <SupabaseProtectedRoute>
            <Layout title="Port Information">
              <PageTransition><PortInfoPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/emergency" element={
          <SuspenseRoute>
          <SupabaseProtectedRoute>
            <Layout title="Emergency Contact">
              <PageTransition><EmergencyContactPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/support" element={
          <SuspenseRoute>
          <SupabaseProtectedRoute>
            <Layout title="Help & Support">
              <PageTransition><HelpSupportPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        
        {/* Company User specific routes */}
        <Route path="/crew" element={
          <SupabaseProtectedRoute>
            <Layout title="Crew Directory">
              <PageTransition><CrewDirectory /></PageTransition>
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
              <PageTransition><VesselManagement /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        {/* Travel Management */}
        <Route path="/travel" element={
          <SupabaseProtectedRoute>
            <Layout title="Travel Management">
              <PageTransition><TravelManagement /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        {/* Task Management */}
        <Route path="/task-management" element={
          <SupabaseProtectedRoute>
            <Layout title="Task Management">
              <PageTransition><TaskManagement /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        {/* Document Expiry & Compliance Dashboard */}
        <Route path="/expiry-dashboard" element={
          <SupabaseProtectedRoute>
            <Layout title="Document Expiry & Compliance">
              <PageTransition><ExpiryDashboard /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/analytics" element={
          <SupabaseProtectedRoute>
            <Layout title="Analytics & Reports">
              <PageTransition><AnalyticsDashboard /></PageTransition>
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
        
        {/* AI Agent Routes */}
        <Route path="/admin/ai-settings" element={
          <SupabaseProtectedRoute>
            <Layout title="AI Agent Settings">
              <PageTransition><AIAgentSettings /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/ai-assignments" element={
          <SupabaseProtectedRoute>
            <Layout title="AI Assignments">
              <PageTransition><AIAssignmentQueue /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
        } />
        <Route path="/ai-performance" element={
          <SupabaseProtectedRoute>
            <Layout title="AI Performance">
              <PageTransition><AIPerformanceDashboard /></PageTransition>
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