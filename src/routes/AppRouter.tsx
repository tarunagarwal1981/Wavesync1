import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { NavigationProvider } from "../hooks/useNavigation";
import Layout from "../components/layout/Layout";
import { PageTransition, Loading } from "../components/ui";
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
const AnnouncementsPage = lazy(() => import("../pages/__stubs__").then(m => ({ default: m.AnnouncementsPage })));
const AnnouncementDetailPage = lazy(() => import("../pages/AnnouncementDetailPage"));

const BudgetPage = lazy(() => import("../pages/__stubs_company__").then(m => ({ default: m.BudgetPage })));
const SchedulingPage = lazy(() => import("../pages/__stubs_company__").then(m => ({ default: m.SchedulingPage })));
const CommunicationsPage = lazy(() => import("../pages/__stubs_company__").then(m => ({ default: m.CommunicationsPage })));
const CompanySettingsPage = lazy(() => import("../pages/__stubs_company__").then(m => ({ default: m.CompanySettingsPage })));
const CompliancePage = lazy(() => import("../pages/__stubs_company__").then(m => ({ default: m.CompliancePage })));
const UserManagementPage = lazy(() => import("../pages/__stubs_company__").then(m => ({ default: m.UserManagementPage })));
const CompanyAnnouncementsPage = lazy(() => import("../pages/__stubs_company__").then(m => ({ default: m.AnnouncementsPage })));
const CreateAnnouncementPage = lazy(() => import("../pages/__stubs_company__").then(m => ({ default: m.CreateAnnouncementPage })));

const AllUsersPage = lazy(() => import("../pages/__stubs_admin__").then(m => ({ default: m.AllUsersPage })));
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
const AdminAnnouncementsPage = lazy(() => import("../pages/__stubs_admin__").then(m => ({ default: m.AnnouncementsPage })));
const AdminCreateAnnouncementPage = lazy(() => import("../pages/__stubs_admin__").then(m => ({ default: m.CreateAnnouncementPage })));

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
              <PageTransition><DashboardRouter /></PageTransition>
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
        <Route path="/announcements" element={
          <SuspenseRoute loadingText="Loading announcements...">
          <SupabaseProtectedRoute>
            <Layout title="Announcements">
              <PageTransition><AnnouncementsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/announcements/:id" element={
          <SuspenseRoute loadingText="Loading announcement...">
          <SupabaseProtectedRoute>
            <Layout title="Announcement Details">
              <PageTransition><AnnouncementDetailPage /></PageTransition>
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
          <SuspenseRoute loadingText="Loading crew directory...">
          <SupabaseProtectedRoute>
            <Layout title="Crew Directory">
              <PageTransition><CrewDirectory /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/ai-assignments" element={
          <SuspenseRoute loadingText="Loading AI assignments...">
          <SupabaseProtectedRoute>
            <Layout title="AI Assignments">
              <PageTransition><AIAssignmentPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/fleet" element={
          <SuspenseRoute loadingText="Loading fleet management...">
          <SupabaseProtectedRoute>
            <Layout title="Fleet Management">
              <PageTransition><VesselManagement /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        {/* Travel Management */}
        <Route path="/travel" element={
          <SuspenseRoute loadingText="Loading travel management...">
          <SupabaseProtectedRoute>
            <Layout title="Travel Management">
              <PageTransition><TravelManagement /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        {/* Task Management */}
        <Route path="/task-management" element={
          <SuspenseRoute loadingText="Loading task management...">
          <SupabaseProtectedRoute>
            <Layout title="Task Management">
              <PageTransition><TaskManagement /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        {/* Document Expiry & Compliance Dashboard */}
        <Route path="/expiry-dashboard" element={
          <SuspenseRoute loadingText="Loading expiry dashboard...">
          <SupabaseProtectedRoute>
            <Layout title="Document Expiry & Compliance">
              <PageTransition><ExpiryDashboard /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/analytics" element={
          <SuspenseRoute loadingText="Loading analytics...">
          <SupabaseProtectedRoute>
            <Layout title="Analytics & Reports">
              <PageTransition><AnalyticsDashboard /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/budget" element={
          <SuspenseRoute loadingText="Loading budget...">
          <SupabaseProtectedRoute>
            <Layout title="Budget & Expenses">
              <PageTransition><BudgetPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/schedule" element={
          <SuspenseRoute loadingText="Loading scheduling...">
          <SupabaseProtectedRoute>
            <Layout title="Scheduling">
              <PageTransition><SchedulingPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/communications" element={
          <SuspenseRoute loadingText="Loading communications...">
          <SupabaseProtectedRoute>
            <Layout title="Communications">
              <PageTransition><CommunicationsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/company/settings" element={
          <SuspenseRoute loadingText="Loading company settings...">
          <SupabaseProtectedRoute>
            <Layout title="Company Settings">
              <PageTransition><CompanySettingsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/compliance" element={
          <SuspenseRoute loadingText="Loading compliance...">
          <SupabaseProtectedRoute>
            <Layout title="Compliance">
              <PageTransition><CompliancePage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/users" element={
          <SuspenseRoute loadingText="Loading user management...">
          <SupabaseProtectedRoute>
            <Layout title="User Management">
              <PageTransition><UserManagementPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/announcements/create" element={
          <SuspenseRoute loadingText="Loading create announcement...">
          <SupabaseProtectedRoute>
            <Layout title="Create Announcement">
              <PageTransition><CreateAnnouncementPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        
        {/* Admin specific routes */}
        <Route path="/admin" element={
          <SuspenseRoute loadingText="Loading admin dashboard...">
          <SupabaseProtectedRoute>
            <Layout title="Admin Dashboard">
              <PageTransition><DashboardRouter /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/admin/analytics" element={
          <SuspenseRoute loadingText="Loading analytics...">
          <SupabaseProtectedRoute>
            <Layout title="System Analytics">
              <PageTransition><AdminAnalyticsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/admin/performance" element={
          <SuspenseRoute loadingText="Loading performance monitor...">
          <SupabaseProtectedRoute>
            <Layout title="Performance Monitor">
              <PageTransition><PerformanceMonitorPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/admin/alerts" element={
          <SuspenseRoute loadingText="Loading alerts...">
          <SupabaseProtectedRoute>
            <Layout title="System Alerts">
              <PageTransition><SystemAlertsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/admin/users" element={
          <SuspenseRoute loadingText="Loading users...">
          <SupabaseProtectedRoute>
            <Layout title="User Management">
              <PageTransition><AllUsersPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/admin/companies" element={
          <SuspenseRoute loadingText="Loading company management...">
          <SupabaseProtectedRoute>
            <Layout title="Company Management">
              <PageTransition><CompanyManagement /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/admin/vessels" element={
          <SuspenseRoute loadingText="Loading vessel management...">
          <SupabaseProtectedRoute>
            <Layout title="Vessel Management">
              <PageTransition><VesselManagement /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/admin/assignments" element={
          <SuspenseRoute loadingText="Loading assignment management...">
          <SupabaseProtectedRoute>
            <Layout title="Assignment Management">
              <PageTransition><AssignmentManagement /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        {/* Company area routes */}
        <Route path="/assignments" element={
          <SuspenseRoute loadingText="Loading assignment management...">
          <SupabaseProtectedRoute>
            <Layout title="Assignment Management">
              <PageTransition><AssignmentManagement /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/admin/permissions" element={
          <SuspenseRoute loadingText="Loading permissions...">
          <SupabaseProtectedRoute>
            <Layout title="Permissions & Roles">
              <PageTransition><PermissionsRolesPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/admin/user-analytics" element={
          <SuspenseRoute loadingText="Loading user analytics...">
          <SupabaseProtectedRoute>
            <Layout title="User Analytics">
              <PageTransition><UserAnalyticsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/admin/settings" element={
          <SuspenseRoute loadingText="Loading system settings...">
          <SupabaseProtectedRoute>
            <Layout title="System Settings">
              <PageTransition><SystemSettingsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/admin/config" element={
          <SuspenseRoute loadingText="Loading configuration...">
          <SupabaseProtectedRoute>
            <Layout title="Configuration">
              <PageTransition><ConfigurationPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/admin/audit" element={
          <SuspenseRoute loadingText="Loading audit logs...">
          <SupabaseProtectedRoute>
            <Layout title="Audit Logs">
              <PageTransition><AuditLogsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/admin/security" element={
          <SuspenseRoute loadingText="Loading security settings...">
          <SupabaseProtectedRoute>
            <Layout title="Security Settings">
              <PageTransition><SecuritySettingsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/admin/reports" element={
          <SuspenseRoute loadingText="Loading reports...">
          <SupabaseProtectedRoute>
            <Layout title="Reports & Exports">
              <PageTransition><ReportsExportsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/admin/support" element={
          <SuspenseRoute loadingText="Loading support tickets...">
          <SupabaseProtectedRoute>
            <Layout title="Support Tickets">
              <PageTransition><SupportTicketsPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/admin/docs" element={
          <SuspenseRoute loadingText="Loading documentation...">
          <SupabaseProtectedRoute>
            <Layout title="Documentation">
              <PageTransition><DocumentationPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/admin/updates" element={
          <SuspenseRoute loadingText="Loading system updates...">
          <SupabaseProtectedRoute>
            <Layout title="System Updates">
              <PageTransition><SystemUpdatesPage /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        
        {/* AI Agent Routes */}
        <Route path="/admin/ai-settings" element={
          <SuspenseRoute loadingText="Loading AI settings...">
          <SupabaseProtectedRoute>
            <Layout title="AI Agent Settings">
              <PageTransition><AIAgentSettings /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/ai-assignments" element={
          <SuspenseRoute loadingText="Loading AI assignments...">
          <SupabaseProtectedRoute>
            <Layout title="AI Assignments">
              <PageTransition><AIAssignmentQueue /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        <Route path="/ai-performance" element={
          <SuspenseRoute loadingText="Loading AI performance...">
          <SupabaseProtectedRoute>
            <Layout title="AI Performance">
              <PageTransition><AIPerformanceDashboard /></PageTransition>
            </Layout>
          </SupabaseProtectedRoute>
          </SuspenseRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </NavigationProvider>
  );
};

export default AppRouter;