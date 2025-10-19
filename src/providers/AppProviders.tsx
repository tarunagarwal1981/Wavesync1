import React from "react";
import { ErrorBoundary } from "../components/ui";
import { ToastProvider } from "../hooks/useToast";
import { ToastContainer } from "../components/ui";
import { useToast } from "../hooks/useToast";
import { SupabaseAuthProvider, useAuth } from "../contexts/SupabaseAuthContext";
import ProfileCompletionCheck from "../components/ProfileCompletionCheck";

const AppContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, removeToast } = useToast();
  const { user } = useAuth();

  return (
    <>
      {children}
      {/* Only show toast container when authenticated */}
      {user && (
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      )}
    </>
  );
};

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <SupabaseAuthProvider>
        <ToastProvider>
          <ProfileCompletionCheck>
            <AppContent>{children}</AppContent>
          </ProfileCompletionCheck>
        </ToastProvider>
      </SupabaseAuthProvider>
    </ErrorBoundary>
  );
};

export default AppProviders;