import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LandingPage } from './views/Public/LandingPage';
import { AuthCallback } from './components/auth/AuthCallback';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardWrapper } from './pages/DashboardWrapper';
import { FirstTimeSetup } from './components/setup/FirstTimeSetup';

/**
 * Main Application Component
 * Handles routing and authentication flow
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected Routes - Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardWrapper />
              </ProtectedRoute>
            }
          />

          {/* Legacy route - redirect to /admin */}
          <Route
            path="/dashboard"
            element={<Navigate to="/admin" replace />}
          />

          <Route
            path="/setup"
            element={
              <ProtectedRoute>
                <FirstTimeSetup />
              </ProtectedRoute>
            }
          />

          {/* Placeholder routes for landing page links */}
          <Route path="/create" element={<Navigate to="/setup" replace />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;