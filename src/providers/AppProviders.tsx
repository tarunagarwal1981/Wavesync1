import React from "react";
import { ErrorBoundary } from "../components/ui";
import { ToastProvider } from "../hooks/useToast";
import { ToastContainer } from "../components/ui";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../contexts/AuthContext";

const AppContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, removeToast } = useToast();
  const { isAuthenticated } = useAuth();

  return (
    <>
      {children}
      {/* Only show toast container when authenticated */}
      {isAuthenticated && (
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      )}
    </>
  );
};

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent>{children}</AppContent>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default AppProviders;