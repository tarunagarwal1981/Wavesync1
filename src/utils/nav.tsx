import React from "react";
import {
  LayoutDashboard, ClipboardList, CheckSquare, FileText, GraduationCap,
  User, MessageSquare, Plane, Settings
} from "lucide-react";

export type NavKey =
  | "dashboard"
  | "assignments"
  | "tasks"
  | "documents"
  | "training"
  | "profile"
  | "messages"
  | "travel"
  | "settings";

export interface NavItemDef {
  key: NavKey;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

export const NAV_ITEMS: NavItemDef[] = [
  { key: "dashboard", label: "Dashboard", href: "/", icon: <LayoutDashboard size={18} /> },
  { key: "assignments", label: "Assignments", href: "/assignments", icon: <ClipboardList size={18} /> },
  { key: "tasks", label: "Tasks", href: "/tasks", icon: <CheckSquare size={18} /> },
  { key: "documents", label: "Documents", href: "/documents", icon: <FileText size={18} /> },
  { key: "training", label: "Training", href: "/training", icon: <GraduationCap size={18} /> },
  { key: "profile", label: "Profile", href: "/profile", icon: <User size={18} /> },
  { key: "messages", label: "Messages", href: "/messages", icon: <MessageSquare size={18} /> },
  { key: "travel", label: "Travel", href: "/travel", icon: <Plane size={18} /> },
  { key: "settings", label: "Settings", href: "/settings", icon: <Settings size={18} /> },
];

export function findNavByHref(pathname: string): NavItemDef | undefined {
  return NAV_ITEMS.find(i => i.href === pathname);
}

