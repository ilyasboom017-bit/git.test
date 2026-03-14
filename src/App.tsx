import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Bookings } from './pages/Bookings';
import { Rooms } from './pages/Rooms';
import { Customers } from './pages/Customers';
import { Calendar } from './pages/Calendar';
import { Housekeeping } from './pages/Housekeeping';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { AppProvider } from './context/AppContext';
import { LoginScreen } from './components/LoginScreen';

// Simple router
const AppContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <Dashboard />;
      case '/bookings':
        return <Bookings />;
      case '/rooms':
        return <Rooms />;
      case '/customers':
        return <Customers />;
      case '/calendar':
        return <Calendar />;
      case '/housekeeping':
        return <Housekeeping />;
      case '/reports':
        return <Reports />;
      case '/settings':
        return <Settings />;
      // Fallback for other routes to Dashboard for now
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-text-muted animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-text-base mb-2">Coming Soon</h2>
            <p>This module is currently under development.</p>
          </div>
        );
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
