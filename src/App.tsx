import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { AuthProvider } from './contexts/AuthContext';
import { DemoProvider } from './contexts/DemoContext';
import AppRouter from './routes/AppRouter';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DemoProvider>
        <AppProviders>
          <Router>
            <AppRouter />
          </Router>
        </AppProviders>
      </DemoProvider>
    </AuthProvider>
  );
};

export default App;
