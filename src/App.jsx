import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DinerMenuView from './DinerMenuView.jsx';
import LoginPage from './LoginPage.jsx';
import Dashboard from './Dashboard.jsx';
import MenuManagement from './MenuManagement.jsx'; // Import MenuManagement
import LiveOrders from './LiveOrders.jsx'; // Import LiveOrders
import QrCodeManager from './QrCodeManager.jsx'; // Import QrCodeManager
import { AuthProvider, useAuth } from './AuthContext';
import SuperAdminDashboard from './SuperAdminDashboard.jsx'; // Import SuperAdminDashboard

function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser, authReady, isAdmin } = useAuth();

  if (!authReady) {
    return <div>Initializing authentication for protected route...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />; // Redirect non-admins from admin-only routes
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
          <Route
            path="/live-orders"
            element={
              <ProtectedRoute>
                <LiveOrders />
              </ProtectedRoute>
            }
          />
          <Route path="/menu/:restaurantId/:tableId" element={<DinerMenuView />} />
          <Route
            path="/qr-code-manager"
            element={
              <ProtectedRoute>
                <QrCodeManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard"
            element={
              <ProtectedRoute adminOnly={true}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<DinerMenuView />} /> {/* Keep for now, will clarify its purpose */}
          {/* Add other routes here as needed */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
