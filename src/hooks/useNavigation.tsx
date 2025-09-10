import React from "react";

interface NavigationItem {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  badge?: number;
}

interface NavigationContextType {
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
  const [activeKey, setActiveKey] = React.useState("dashboard");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const value: NavigationContextType = {
    activeKey,
    setActiveKey,
    mobileOpen,
    setMobileOpen,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationProvider;