import React from "react";
import { 
  Home, 
  User,
  Briefcase, 
  CheckSquare, 
  FileText, 
  GraduationCap, 
  MessageSquare, 
  Plane, 
  Settings,
  Users,
  Ship,
  ClipboardList,
  BarChart3,
  FileCheck,
  Calendar,
  DollarSign,
  Clock,
  Shield,
  Database,
  Activity,
  AlertTriangle,
  Cog,
  Key,
  FileBarChart,
  HelpCircle,
  Phone,
  MapPin
} from "lucide-react";
import { UserRole } from "../types";

export interface NavigationItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  href: string;
  badge?: number | string;
  permissions: UserRole[];
  children?: NavigationItem[];
  description?: string;
  dataSection?: string; // For handling multiple items pointing to same route
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

// Seafarer Navigation Configuration
export const seafarerNavigation: NavigationSection[] = [
  {
    title: "Main Navigation",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        icon: Home,
        href: "/",
        permissions: [UserRole.SEAFARER],
        description: "Overview of assignments and tasks"
      },
      {
        id: "profile",
        title: "Profile",
        icon: User,
        href: "/profile",
        permissions: [UserRole.SEAFARER],
        description: "Personal information and documents"
      },
      {
        id: "assignments",
        title: "My Assignments",
        icon: Briefcase,
        href: "/assignments",
        badge: 2,
        permissions: [UserRole.SEAFARER],
        description: "Current and pending assignments"
      },
      {
        id: "tasks",
        title: "Tasks",
        icon: CheckSquare,
        href: "/tasks",
        badge: 4,
        permissions: [UserRole.SEAFARER],
        description: "Assigned tasks and checklists"
      },
      {
        id: "documents",
        title: "Documents",
        icon: FileText,
        href: "/documents",
        badge: 1,
        permissions: [UserRole.SEAFARER],
        description: "Personal documents and certificates"
      },
      {
        id: "training",
        title: "Training",
        icon: GraduationCap,
        href: "/training",
        badge: 2,
        permissions: [UserRole.SEAFARER],
        description: "Training courses and certifications"
      },
      {
        id: "messages",
        title: "Messages",
        icon: MessageSquare,
        href: "/messages",
        badge: 3,
        permissions: [UserRole.SEAFARER],
        description: "Communication with company"
      }
    ]
  },
  {
    title: "Travel & Logistics",
    items: [
      {
        id: "travel-plans",
        title: "Travel Plans",
        icon: Plane,
        href: "/travel",
        permissions: [UserRole.SEAFARER],
        description: "View travel arrangements",
        dataSection: "plans"
      },
      {
        id: "travel-documents",
        title: "Travel Documents",
        icon: FileCheck,
        href: "/travel",
        permissions: [UserRole.SEAFARER],
        description: "View and download travel documents",
        dataSection: "documents"
      },
      {
        id: "vessel-info",
        title: "Vessel Information",
        icon: Ship,
        href: "/vessel",
        permissions: [UserRole.SEAFARER],
        description: "Current vessel details"
      },
      {
        id: "port-info",
        title: "Port Information",
        icon: MapPin,
        href: "/ports",
        permissions: [UserRole.SEAFARER],
        description: "Port details and facilities"
      }
    ]
  },
  {
    title: "Support",
    items: [
      {
        id: "emergency-contact",
        title: "Emergency Contact",
        icon: Phone,
        href: "/emergency",
        permissions: [UserRole.SEAFARER],
        description: "Emergency contacts and procedures"
      },
      {
        id: "help-support",
        title: "Help & Support",
        icon: HelpCircle,
        href: "/support",
        permissions: [UserRole.SEAFARER],
        description: "Get help and support"
      },
      {
        id: "settings",
        title: "Settings",
        icon: Settings,
        href: "/settings",
        permissions: [UserRole.SEAFARER],
        description: "Account and app settings"
      }
    ]
  }
];

// Company User Navigation Configuration
export const companyNavigation: NavigationSection[] = [
  {
    title: "Crew Management",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        icon: Home,
        href: "/",
        permissions: [UserRole.COMPANY_USER],
        description: "Overview of crew and operations"
      },
      {
        id: "crew-directory",
        title: "Crew Directory",
        icon: Users,
        href: "/crew",
        badge: 12,
        permissions: [UserRole.COMPANY_USER],
        description: "Manage crew members"
      },
      {
        id: "fleet-management",
        title: "Fleet Management",
        icon: Ship,
        href: "/fleet",
        badge: 5,
        permissions: [UserRole.COMPANY_USER],
        description: "Manage vessel fleet"
      },
      {
        id: "assignment-management",
        title: "Assignment Management",
        icon: ClipboardList,
        href: "/assignments",
        badge: 8,
        permissions: [UserRole.COMPANY_USER],
        description: "Create and manage assignments"
      },
      {
        id: "task-oversight",
        title: "Task Oversight",
        icon: CheckSquare,
        href: "/tasks",
        badge: 15,
        permissions: [UserRole.COMPANY_USER],
        description: "Monitor crew tasks"
      },
      {
        id: "analytics-reports",
        title: "Analytics & Reports",
        icon: BarChart3,
        href: "/analytics",
        permissions: [UserRole.COMPANY_USER],
        description: "Performance analytics"
      }
    ]
  },
  {
    title: "Operations",
    items: [
      {
        id: "document-center",
        title: "Document Center",
        icon: FileText,
        href: "/documents",
        badge: 7,
        permissions: [UserRole.COMPANY_USER],
        description: "Manage crew documents"
      },
      {
        id: "training-programs",
        title: "Training Programs",
        icon: GraduationCap,
        href: "/training",
        badge: 3,
        permissions: [UserRole.COMPANY_USER],
        description: "Manage training programs"
      },
      {
        id: "travel-planning",
        title: "Travel Planning",
        icon: Plane,
        href: "/travel",
        badge: 4,
        permissions: [UserRole.COMPANY_USER],
        description: "Plan crew travel",
        dataSection: "planning"
      },
      {
        id: "travel-documents",
        title: "Travel Documents",
        icon: FileCheck,
        href: "/travel",
        badge: 6,
        permissions: [UserRole.COMPANY_USER],
        description: "Upload and manage travel documents",
        dataSection: "documents"
      },
      {
        id: "budget-expenses",
        title: "Budget & Expenses",
        icon: DollarSign,
        href: "/budget",
        badge: 2,
        permissions: [UserRole.COMPANY_USER],
        description: "Manage budgets and expenses"
      },
      {
        id: "scheduling",
        title: "Scheduling",
        icon: Calendar,
        href: "/schedule",
        badge: 9,
        permissions: [UserRole.COMPANY_USER],
        description: "Crew scheduling and planning"
      }
    ]
  },
  {
    title: "Administration",
    items: [
      {
        id: "communications",
        title: "Communications",
        icon: MessageSquare,
        href: "/communications",
        badge: 5,
        permissions: [UserRole.COMPANY_USER],
        description: "Company communications"
      },
      {
        id: "company-settings",
        title: "Company Settings",
        icon: Settings,
        href: "/company/settings",
        permissions: [UserRole.COMPANY_USER],
        description: "Company configuration"
      },
      {
        id: "compliance",
        title: "Compliance",
        icon: Shield,
        href: "/compliance",
        badge: 1,
        permissions: [UserRole.COMPANY_USER],
        description: "Regulatory compliance"
      },
      {
        id: "user-management",
        title: "User Management",
        icon: Users,
        href: "/users",
        badge: 3,
        permissions: [UserRole.COMPANY_USER],
        description: "Manage company users"
      }
    ]
  }
];

// Admin Navigation Configuration
export const adminNavigation: NavigationSection[] = [
  {
    title: "System Overview",
    items: [
      {
        id: "admin-dashboard",
        title: "Admin Dashboard",
        icon: Home,
        href: "/admin",
        permissions: [UserRole.ADMIN],
        description: "System overview and metrics"
      },
      {
        id: "system-analytics",
        title: "System Analytics",
        icon: BarChart3,
        href: "/admin/analytics",
        permissions: [UserRole.ADMIN],
        description: "System performance analytics"
      },
      {
        id: "performance-monitor",
        title: "Performance Monitor",
        icon: Activity,
        href: "/admin/performance",
        permissions: [UserRole.ADMIN],
        description: "Monitor system performance"
      },
      {
        id: "system-alerts",
        title: "System Alerts",
        icon: AlertTriangle,
        href: "/admin/alerts",
        badge: 7,
        permissions: [UserRole.ADMIN],
        description: "System alerts and notifications"
      }
    ]
  },
  {
    title: "User Management",
    items: [
      {
        id: "all-users",
        title: "All Users",
        icon: Users,
        href: "/admin/users",
        badge: 156,
        permissions: [UserRole.ADMIN],
        description: "Manage all platform users"
      },
      {
        id: "company-management",
        title: "Company Management",
        icon: Ship,
        href: "/admin/companies",
        badge: 8,
        permissions: [UserRole.ADMIN],
        description: "Manage companies and organizations"
      },
      {
        id: "permissions-roles",
        title: "Permissions & Roles",
        icon: Key,
        href: "/admin/permissions",
        permissions: [UserRole.ADMIN],
        description: "Manage user permissions and roles"
      },
      {
        id: "user-analytics",
        title: "User Analytics",
        icon: Database,
        href: "/admin/user-analytics",
        permissions: [UserRole.ADMIN],
        description: "User behavior analytics"
      }
    ]
  },
  {
    title: "System Configuration",
    items: [
      {
        id: "system-settings",
        title: "System Settings",
        icon: Settings,
        href: "/admin/settings",
        permissions: [UserRole.ADMIN],
        description: "Global system settings"
      },
      {
        id: "configuration",
        title: "Configuration",
        icon: Cog,
        href: "/admin/config",
        permissions: [UserRole.ADMIN],
        description: "System configuration"
      },
      {
        id: "audit-logs",
        title: "Audit Logs",
        icon: FileBarChart,
        href: "/admin/audit",
        permissions: [UserRole.ADMIN],
        description: "System audit logs"
      },
      {
        id: "security-settings",
        title: "Security Settings",
        icon: Shield,
        href: "/admin/security",
        permissions: [UserRole.ADMIN],
        description: "Security configuration"
      },
      {
        id: "reports-exports",
        title: "Reports & Exports",
        icon: FileBarChart,
        href: "/admin/reports",
        permissions: [UserRole.ADMIN],
        description: "Generate system reports"
      }
    ]
  },
  {
    title: "Support",
    items: [
      {
        id: "support-tickets",
        title: "Support Tickets",
        icon: HelpCircle,
        href: "/admin/support",
        badge: 12,
        permissions: [UserRole.ADMIN],
        description: "Manage support tickets"
      },
      {
        id: "documentation",
        title: "Documentation",
        icon: FileText,
        href: "/admin/docs",
        permissions: [UserRole.ADMIN],
        description: "System documentation"
      },
      {
        id: "system-updates",
        title: "System Updates",
        icon: Clock,
        href: "/admin/updates",
        permissions: [UserRole.ADMIN],
        description: "Manage system updates"
      }
    ]
  }
];

// Helper function to get navigation based on user role
export const getNavigationForRole = (role: UserRole): NavigationSection[] => {
  switch (role) {
    case UserRole.SEAFARER:
      return seafarerNavigation;
    case UserRole.COMPANY_USER:
      return companyNavigation;
    case UserRole.ADMIN:
    case UserRole.SUPER_ADMIN:
      return adminNavigation;
    default:
      return seafarerNavigation;
  }
};

// Helper function to get all navigation items flattened
export const getAllNavigationItems = (role: UserRole): NavigationItem[] => {
  const sections = getNavigationForRole(role);
  return sections.flatMap(section => section.items);
};

// Helper function to check if user has permission for navigation item
export const hasNavigationPermission = (item: NavigationItem, userRole: UserRole): boolean => {
  return item.permissions.includes(userRole);
};
