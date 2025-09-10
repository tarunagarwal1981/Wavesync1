import React from "react";
import { NavItemDef, NAV_ITEMS } from "../utils/nav";

interface NavigationContextValue {
  items: NavItemDef[];
  activeKey?: string;
  setActiveKey: (key?: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const NavigationContext = React.createContext<NavigationContextValue | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeKey, setActiveKey] = React.useState<string | undefined>(undefined);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const value = React.useMemo(() => ({ items: NAV_ITEMS, activeKey, setActiveKey, mobileOpen, setMobileOpen }), [activeKey, mobileOpen]);
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};

export function useNavigation(): NavigationContextValue {
  const ctx = React.useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}

