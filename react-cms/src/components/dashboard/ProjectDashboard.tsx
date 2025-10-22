import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import githubApi from '../../services/github-api';
import TokenStorage from '../../utils/tokenStorage';
import { DecentralizedMigrationBanner } from '../common/DecentralizedMigrationBanner';

interface AlmostaCMSProject {
  repo: {
    name: string;
    fullName: string;
    description: string;
    url: string;
    private: boolean;
    updatedAt: string;
    createdAt: string;
    owner: string;
  };
  config: {
    version: string;
    generator: string;
    projectType: string;
    created: string;
    lastModified: string;
    config: {
      template: string;
      customDomain?: string | null;
      theme?: string;
    };
    metadata?: {
      title?: string;
      description?: string;
    };
  };
  pages: {
    url?: string;
    status?: string;
    customDomain?: string | null;
    enabled?: boolean;
  } | null;
}

export default function ProjectDashboard() {
  const [projects, setProjects] = useState<AlmostaCMSProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    setError(null);

    try {
      // Get user info
      const userInfo = TokenStorage.getUserInfo();
      if (userInfo) {
        setUser(userInfo);
      } else {
        const userResult = await githubApi.getAuthenticatedUser();
        if (userResult.success && 'data' in userResult) {
          setUser(userResult.data);
        }
      }

      // Scan for AlmostaCMS projects
      const result = await githubApi.listAlmostaCMSProjects();

      if (!result.success) {
        setError(result.error || 'Failed to load projects');
        return;
      }

      if ('data' in result) {
        setProjects(result.data);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading projects');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenProject(project: AlmostaCMSProject) {
    // Store selected project in localStorage
    localStorage.setItem('selected_repo', project.repo.name);
    localStorage.setItem('selected_owner', project.repo.owner);

    // Navigate to admin panel
    navigate('/admin');
  }

  function handleCreateNew() {
    // Navigate to setup flow
    navigate('/setup');
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function getProjectTypeLabel(type: string) {
    // Convert kebab-case to Title Case
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function getProjectTypeIcon(type: string) {
    const icons: Record<string, string> = {
      'personal-website': '👤',
      'portfolio': '💼',
      'blog': '📝',
      'business': '🏢',
    };
    return icons[type] || '🌐';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Scanning your repositories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
          <div className="text-red-600 text-center mb-4">
            <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Error Loading Projects</h2>
            <p className="text-gray-600">{error}</p>
          </div>
          <button
            onClick={loadProjects}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {user?.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.name || user.login}
                  className="h-12 w-12 rounded-full mr-4"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.name || 'Your Projects'}
                </h1>
                <p className="text-sm text-gray-600">
                  {user?.login && `@${user.login}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                TokenStorage.clearToken();
                navigate('/');
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Migration Banner */}
        <DecentralizedMigrationBanner />

        {/* Projects Header */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            AlmostaCMS Projects
          </h2>
          <p className="text-gray-600">
            {projects.length === 0
              ? 'No projects found. Create your first project to get started!'
              : `You have ${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Create New Project Card */}
          <button
            onClick={handleCreateNew}
            className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 hover:bg-blue-50 transition-colors text-center group"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
              ➕
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Create New Project
            </h3>
            <p className="text-sm text-gray-600">
              Start a new website from a template
            </p>
          </button>

          {/* Existing Projects */}
          {projects.map((project) => (
            <div
              key={project.repo.fullName}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
              onClick={() => handleOpenProject(project)}
            >
              {/* Project Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">
                    {getProjectTypeIcon(project.config.projectType)}
                  </span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    {getProjectTypeLabel(project.config.projectType)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold truncate">
                  {project.config.metadata?.title || project.repo.name}
                </h3>
              </div>

              {/* Project Body */}
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
                  {project.config.metadata?.description || project.repo.description || 'No description'}
                </p>

                {/* Project Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    {project.repo.name}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Updated {formatDate(project.config.lastModified)}
                  </div>
                </div>

                {/* GitHub Pages Status */}
                {project.pages && project.pages.url && (
                  <div className="mb-4">
                    <a
                      href={project.pages.customDomain
                        ? `https://${project.pages.customDomain}`
                        : project.pages.url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {project.pages.customDomain || 'View Live Site'}
                    </a>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenProject(project);
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Open Project
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Projects Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first AlmostaCMS project to get started
            </p>
            <button
              onClick={handleCreateNew}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
