import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AuthCallback } from './components/auth/AuthCallback';
import { DeviceFlowLogin } from './components/auth/DeviceFlowLogin';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardWrapper } from './pages/DashboardWrapper';
import { FirstTimeSetup } from './components/setup/FirstTimeSetup';
import ProjectDashboard from './components/dashboard/ProjectDashboard';
import { PersonalWebsiteEditor } from './views/Admin/PersonalWebsiteEditor';

/**
 * Main Application Component
 * Admin panel for AlmostaCMS templates
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Default route - redirect to projects */}
          <Route path="/" element={<Navigate to="/projects" replace />} />

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

          {/* Protected Routes - Admin Dashboard */}
          <Route
            path="/admin"
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

          {/* Admin - Personal Website Editor */}
          <Route
            path="/admin/personal-website"
            element={
              <ProtectedRoute>
                <PersonalWebsiteEditor />
              </ProtectedRoute>
            }
          />

          {/* Legacy routes */}
          <Route path="/dashboard" element={<Navigate to="/projects" replace />} />
          <Route path="/create" element={<Navigate to="/setup" replace />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
