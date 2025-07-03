import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DinerMenuView from './DinerMenuView.jsx';
import LoginPage from './LoginPage.jsx';
import Dashboard from './Dashboard.jsx';
import MenuManagement from './MenuManagement.jsx'; // Import MenuManagement
import { AuthProvider, useAuth } from './AuthContext';

function ProtectedRoute({ children }) {
  const { currentUser, loading, authReady } = useAuth(); // Destructure authReady

  // Wait until Firebase has determined the auth state
  if (!authReady) {
    return <div>Initializing authentication for protected route...</div>; // Or a loading spinner
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu-management"
            element={
              <ProtectedRoute>
                <MenuManagement />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<DinerMenuView />} />
          {/* Add other routes here as needed */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
