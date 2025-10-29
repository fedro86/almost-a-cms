import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AuthCallback } from './components/auth/AuthCallback';
import { DeviceFlowLogin } from './components/auth/DeviceFlowLogin';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardWrapper } from './pages/DashboardWrapper';
import { FirstTimeSetup } from './components/setup/FirstTimeSetup';
import ProjectDashboard from './components/dashboard/ProjectDashboard';

/**
 * Main Application Component
 * Admin panel for AlmostaCMS templates
 */
function App() {
  // Get base path from Vite config (injected at build time)
  // For embedded mode: /admin/
  // For dev mode: /
  const basename = import.meta.env.BASE_URL;

  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/device-flow" element={<DeviceFlowLogin />} />

          {/* Protected Routes - Project Selection */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Content Editor (Main Dashboard) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardWrapper />
              </ProtectedRoute>
            }
          />

          {/* Setup */}
          <Route
            path="/setup"
            element={
              <ProtectedRoute>
                <FirstTimeSetup />
              </ProtectedRoute>
            }
          />

          {/* Legacy routes */}
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="/create" element={<Navigate to="/setup" replace />} />

          {/* Default route - redirect to dashboard (for embedded mode) or projects (for standalone) */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
