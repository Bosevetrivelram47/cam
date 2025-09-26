// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Import your page components
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import MachineDetailsPage from './pages/MachineDetailsPage'; // NEW IMPORT
import MachineDiscoveryDashboard from './pages/MachineDiscoveryDashboard'; // <-- NEW IMPORT

// Import the NavBar component
import NavBar from './components/NavBar';

// Import your main CSS file (where Tailwind directives are)
import './index.css';
import MachineManagementPage from './pages/MachineManagementPage';
import MachineFormPage from './pages/MachineFormPage';

function App() {
  // This state will control whether the user sees the login page or the dashboard.
  // In a real application, you'd check for a token (e.g., in localStorage) here
  // const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('authToken') ? true : false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Start as unauthenticated for demonstration
  const navigate = useNavigate(); // Hook for programmatic navigation

  // --- Mock Authentication Logic for Demonstration ---
  // In a real app, LoginPage's successful login would update a global auth state.
  // Here, we simulate it.
  useEffect(() => {
    // If the URL is '/dashboard' after a mock login, simulate being authenticated.
    // This is a *temporary* hack for this specific demo.
    // In a real app, `onLoginSuccess` would update `isAuthenticated` directly.
    if (window.location.pathname === '/dashboard' && !isAuthenticated) {
      setIsAuthenticated(true);
    }
  }, [isAuthenticated]); // Only re-run if isAuthenticated changes

  // This function will be passed to LoginPage
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    // In a real app, navigate to dashboard AFTER setting token
    navigate('/dashboard');
  };

  // This function will be passed to NavBar
  const handleLogout = () => {
    setIsAuthenticated(false);
    // In a real app, clear JWT token from localStorage/cookies
    navigate('/'); // Redirect to login page
  };

  return (
    // flex-col ensures NavBar is at top, and main content below it
    <div className="min-h-screen flex flex-col">
      {isAuthenticated ? (
        // If authenticated, show NavBar and main content with routes
        <>
          <NavBar onLogout={handleLogout} /> {/* Pass the logout handler */}
          <main className="flex-grow p-4"> {/* flex-grow makes content take available space */}
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/machine/:id" element={<MachineDetailsPage />} />
              <Route path="/machines-manage" element={<MachineManagementPage />} /> {/* NEW: Machine List */}
              <Route path="/machines-manage/new" element={<MachineFormPage />} />   {/* NEW: Add Machine Form */}
              <Route path="/machines-manage/:id/edit" element={<MachineFormPage />} /> {/* NEW: Edit Machine Form */}
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/machine/:id" element={<MachineDetailsPage />} />
              <Route path="/discovery-dashboard" element={<MachineDiscoveryDashboard />} /> {/* <-- NEW ROUTE */}
             {/* Redirect any unknown path to dashboard if authenticated */}
              <Route path="*" element={<DashboardPage />} />
            </Routes>
          </main>
        </>
      ) : (
        // If not authenticated, always show the LoginPage
        <Routes>
          {/* Any path leads to login page if not authenticated */}
          <Route path="*" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        </Routes>
      )}
    </div>
  );
}

export default App;