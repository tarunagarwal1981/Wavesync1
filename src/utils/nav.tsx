import React from "react";
import { 
  Home, 
  ClipboardList, 
  CheckSquare, 
  FileText, 
  GraduationCap, 
  User, 
  MessageSquare, 
  Plane, 
  Settings,
  Bell
} from "lucide-react";

export interface NavigationItem {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

export const NAV_ITEMS: NavigationItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    key: "assignments",
    label: "Assignments",
    href: "/assignments",
    icon: ClipboardList,
    badge: 3,
  },
  {
    key: "tasks",
    label: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    badge: 5,
  },
  {
    key: "documents",
    label: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    key: "training",
    label: "Training",
    href: "/training",
    icon: GraduationCap,
  },
  {
    key: "profile",
    label: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    key: "notifications",
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    badge: 2,
  },
  {
    key: "messages",
    label: "Messages",
    href: "/messages",
    icon: MessageSquare,
    badge: 2,
  },
  {
    key: "travel",
    label: "Travel",
    href: "/travel",
    icon: Plane,
  },
  {
    key: "settings",
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];