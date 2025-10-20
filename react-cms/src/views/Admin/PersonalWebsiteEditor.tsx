import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserIcon,
  BriefcaseIcon,
  FolderIcon,
  PencilSquareIcon,
  EnvelopeIcon,
  Bars3Icon,
  Bars3BottomLeftIcon,
} from '@heroicons/react/24/outline';
import { Layout } from '../../components/Layout';
import { FormRouter } from '../../components/forms/FormRouter';
import { useApi } from '../../hooks/useApi';
import { ContentData } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useRepo } from '../../hooks/useRepo';

interface Section {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  dataFile: string;
}

const sections: Section[] = [
  {
    id: 'about',
    name: 'About Me',
    description: 'Personal information, services, testimonials, and client logos',
    icon: UserIcon,
    dataFile: 'about.json',
  },
  {
    id: 'resume',
    name: 'Resume',
    description: 'Work experience, education, and professional timeline',
    icon: BriefcaseIcon,
    dataFile: 'resume.json',
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Projects showcase, galleries, and case studies',
    icon: FolderIcon,
    dataFile: 'portfolio.json',
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'Blog posts, articles, and content management',
    icon: PencilSquareIcon,
    dataFile: 'blog.json',
  },
  {
    id: 'contact',
    name: 'Contact',
    description: 'Contact information, social links, and form settings',
    icon: EnvelopeIcon,
    dataFile: 'contact.json',
  },
  {
    id: 'navbar',
    name: 'Navigation',
    description: 'Main navigation menu items and structure',
    icon: Bars3Icon,
    dataFile: 'navbar.json',
  },
  {
    id: 'sidebar',
    name: 'Sidebar',
    description: 'Sidebar content, profile information, and quick links',
    icon: Bars3BottomLeftIcon,
    dataFile: 'sidebar.json',
  },
];

type ViewState = 'sections' | 'editing';

export function PersonalWebsiteEditor() {
  const navigate = useNavigate();
  const [state, setState] = useState<ViewState>('sections');
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [currentData, setCurrentData] = useState<ContentData | null>(null);
  const { loading, error, loadContent, saveContent, clearError } = useApi();
  const { user, logout } = useAuth();
  const { loading: repoLoading, hasActiveRepo } = useRepo();

  // Redirect to setup if no active repository
  useEffect(() => {
    if (!repoLoading && !hasActiveRepo) {
      navigate('/setup');
    }
  }, [repoLoading, hasActiveRepo, navigate]);

  const handleEditSection = async (sectionId: string) => {
    const data = await loadContent(sectionId);
    if (data) {
      setCurrentFile(sectionId);
      setCurrentData(data);
      setState('editing');
    }
  };

  const handleSaveContent = async (data: ContentData): Promise<boolean> => {
    if (!currentFile) return false;

    const success = await saveContent(currentFile, data);
    if (success) {
      setCurrentData(data);
      // Auto-return to sections after successful save
      setTimeout(() => {
        setState('sections');
        setCurrentFile(null);
        setCurrentData(null);
      }, 1000);
    }
    return success;
  };

  const handleCancelEdit = () => {
    setState('sections');
    setCurrentFile(null);
    setCurrentData(null);
    clearError();
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (state === 'editing' && currentFile && currentData) {
    return (
      <>
        {/* User Info Bar */}
        {user && (
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatarUrl}
                  alt={user.name || user.login}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.name || user.login}
                  </p>
                  <p className="text-xs text-gray-500">@{user.login}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        <Layout>
          {/* Error Toast */}
          {error && (
            <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md">
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={clearError}
                  className="ml-4 text-white hover:text-red-200 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div className="h-[calc(100vh-12rem)]">
            <FormRouter
              filename={currentFile}
              data={currentData}
              onSave={handleSaveContent}
              onCancel={handleCancelEdit}
              isLoading={loading}
            />
          </div>

          {/* Loading Overlay */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
              <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="text-gray-900">Saving changes...</span>
              </div>
            </div>
          )}
        </Layout>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <UserIcon className="h-8 w-8 text-cyan-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Personal Website Editor
                </h1>
              </div>
              <p className="text-gray-600">
                Edit your portfolio sections - changes are saved automatically
              </p>
            </div>
            <Link
              to="/admin"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Back to Templates
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-xl p-6 text-white mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">{sections.length}</div>
              <div className="text-sm text-white text-opacity-90">Total Sections</div>
            </div>
            <div>
              <div className="text-3xl font-bold">✓</div>
              <div className="text-sm text-white text-opacity-90">Auto-Save Enabled</div>
            </div>
            <div>
              <div className="text-3xl font-bold">JSON</div>
              <div className="text-sm text-white text-opacity-90">Data Format</div>
            </div>
          </div>
        </div>

        {/* Error Toast */}
        {error && (
          <div className="mb-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="ml-4 text-white hover:text-red-200 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleEditSection(section.id)}
              className="group bg-white rounded-lg shadow hover:shadow-xl transition-all border border-gray-200 hover:border-cyan-300 overflow-hidden text-left"
            >
              <div className="p-6">
                {/* Icon */}
                <div className="mb-4">
                  <div className="inline-flex p-3 bg-cyan-50 rounded-lg group-hover:bg-cyan-100 transition-colors">
                    <section.icon className="h-8 w-8 text-cyan-600" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors">
                  {section.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {section.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500 font-mono">
                    {section.dataFile}
                  </span>
                  <svg
                    className="h-5 w-5 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            💡 Quick Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Click any section above to edit its content</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Changes are saved automatically to GitHub</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Each section has a visual editor with preview</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Your site rebuilds automatically on save</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonalWebsiteEditor;
