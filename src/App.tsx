import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { AuthProvider } from './contexts/AuthContext';
import { DemoProvider } from './contexts/DemoContext';
import { AppProvider } from './contexts/AppContext';
import AppRouter from './routes/AppRouter';
import { ToastContainer } from './components/ui';
// import InteractiveFeatures from './components/InteractiveFeatures'; // Removed - causing rendering issues
import { useApp } from './contexts/AppContext';
import { useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  console.log('AppContent rendering');
  console.log('AppContent timestamp:', new Date().toISOString());
  const { state, clearMessages } = useApp();
  const { isAuthenticated } = useAuth();
  console.log('AppContent - isAuthenticated:', isAuthenticated, 'state:', state);
  
  const [toasts, setToasts] = React.useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
  }>>([]);

  // Handle success/error messages as toasts
  React.useEffect(() => {
    if (state.ui.success) {
      const newToast = {
        id: `success_${Date.now()}`,
        type: 'success' as const,
        title: 'Success',
        message: state.ui.success,
        duration: 4000,
      };
      setToasts(prev => [...prev, newToast]);
      clearMessages();
    }
    
    if (state.ui.error) {
      const newToast = {
        id: `error_${Date.now()}`,
        type: 'error' as const,
        title: 'Error',
        message: state.ui.error,
        duration: 6000,
      };
      setToasts(prev => [...prev, newToast]);
      clearMessages();
    }
  }, [state.ui.success, state.ui.error, clearMessages]);

  const handleToastClose = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  console.log('AppContent - rendering AppRouter and conditional components');
  console.log('AppContent - about to render AppRouter');
  return (
    <>
      {console.log('AppContent - rendering AppRouter now')}
        <AppRouter key={isAuthenticated ? 'authenticated' : 'unauthenticated'} />
      {/* Only show toast notifications when authenticated */}
      {isAuthenticated && (
        <ToastContainer toasts={toasts} onRemove={handleToastClose} />
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DemoProvider>
        <AppProvider>
          <AppProviders>
            <Router>
              <AppContent />
            </Router>
          </AppProviders>
        </AppProvider>
      </DemoProvider>
    </AuthProvider>
  );
};

export default App;
