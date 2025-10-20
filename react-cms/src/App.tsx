import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LandingPage } from './views/Public/LandingPage';
import { AuthCallback } from './components/auth/AuthCallback';
import { DeviceFlowLogin } from './components/auth/DeviceFlowLogin';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardWrapper } from './pages/DashboardWrapper';
import { FirstTimeSetup } from './components/setup/FirstTimeSetup';
import { LandingPageEditor } from './views/Admin/LandingPageEditor';
import { LandingHeroForm } from './views/Admin/forms/LandingHeroForm';
import { LandingFeaturesForm } from './views/Admin/forms/LandingFeaturesForm';
import { LandingHowItWorksForm } from './views/Admin/forms/LandingHowItWorksForm';
import { LandingShowcaseForm } from './views/Admin/forms/LandingShowcaseForm';
import { LandingOpenSourceForm } from './views/Admin/forms/LandingOpenSourceForm';
import { LandingSupportForm } from './views/Admin/forms/LandingSupportForm';
import { LandingFAQForm } from './views/Admin/forms/LandingFAQForm';
import { LandingFooterForm } from './views/Admin/forms/LandingFooterForm';
import ProjectDashboard from './components/dashboard/ProjectDashboard';
import { PersonalWebsiteEditor } from './views/Admin/PersonalWebsiteEditor';

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

          {/* Legacy route - redirect to /projects */}
          <Route
            path="/dashboard"
            element={<Navigate to="/projects" replace />}
          />

          <Route
            path="/setup"
            element={
              <ProtectedRoute>
                <FirstTimeSetup />
              </ProtectedRoute>
            }
          />

          {/* Admin - Landing Page Editor */}
          <Route
            path="/admin/landing-page"
            element={
              <ProtectedRoute>
                <LandingPageEditor />
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

          <Route
            path="/admin/edit/hero"
            element={
              <ProtectedRoute>
                <LandingHeroForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/edit/features"
            element={
              <ProtectedRoute>
                <LandingFeaturesForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/edit/how-it-works"
            element={
              <ProtectedRoute>
                <LandingHowItWorksForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/edit/showcase"
            element={
              <ProtectedRoute>
                <LandingShowcaseForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/edit/open-source"
            element={
              <ProtectedRoute>
                <LandingOpenSourceForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/edit/support"
            element={
              <ProtectedRoute>
                <LandingSupportForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/edit/faq"
            element={
              <ProtectedRoute>
                <LandingFAQForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/edit/footer"
            element={
              <ProtectedRoute>
                <LandingFooterForm />
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