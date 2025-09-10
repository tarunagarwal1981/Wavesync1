import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './routes/AppRouter';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProviders>
        <Router>
          <AppRouter />
        </Router>
      </AppProviders>
    </AuthProvider>
  );
};

export default App;
