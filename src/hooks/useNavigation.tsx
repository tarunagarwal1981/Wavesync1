import React from "react";
import { NAV_ITEMS } from "../utils/nav";

interface NavigationItem {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  badge?: number;
}

interface NavigationContextType {
  items: NavigationItem[];
  activeKey: string;
  setActiveKey: (key: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const NavigationContext = React.createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = React.useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🧭 NavigationProvider rendering');
  console.log('🧭 NavigationProvider timestamp:', new Date().toISOString());
  const [activeKey, setActiveKey] = React.useState("dashboard");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const value: NavigationContextType = {
    items: NAV_ITEMS,
    activeKey,
    setActiveKey,
    mobileOpen,
    setMobileOpen,
  };

  console.log('🧭 NavigationProvider - about to return JSX');
  return (
    <NavigationContext.Provider value={value}>
      {(() => { console.log('🧭 NavigationProvider - rendering children'); return null; })()}
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationProvider;