import React from 'react';
import { Link } from 'react-router-dom';
import { ContentCard } from '../components/ContentCard';
import { ContentFile } from '../types';

interface DashboardProps {
  onEditContent: (filename: string) => void;
}

const contentFiles: ContentFile[] = [
  {
    name: 'about',
    displayName: 'About Me',
    icon: 'user',
    description: 'Personal information, services, testimonials and client logos'
  },
  {
    name: 'resume',
    displayName: 'Resume',
    icon: 'briefcase',
    description: 'Work experience, education, and professional timeline'
  },
  {
    name: 'portfolio',
    displayName: 'Portfolio',
    icon: 'stack',
    description: 'Projects showcase, galleries, and case studies'
  },
  {
    name: 'blog',
    displayName: 'Blog',
    icon: 'pencil',
    description: 'Blog posts, articles, and content management'
  },
  {
    name: 'contact',
    displayName: 'Contact',
    icon: 'chat',
    description: 'Contact information, social links, and form settings'
  },
  {
    name: 'navbar',
    displayName: 'Navigation',
    icon: 'bars',
    description: 'Main navigation menu items and structure'
  },
  {
    name: 'sidebar',
    displayName: 'Sidebar',
    icon: 'bars',
    description: 'Sidebar content, profile information, and quick links'
  }
];

export const Dashboard: React.FC<DashboardProps> = ({ onEditContent }) => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Content Management Dashboard
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Edit your portfolio content by clicking on any section below.
          Changes will automatically regenerate your static HTML.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Sections</p>
              <p className="text-2xl font-bold">{contentFiles.length}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 p-3 rounded-lg">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">JSON Files</p>
              <p className="text-2xl font-bold">{contentFiles.length}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 p-3 rounded-lg">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Ready to Deploy</p>
              <p className="text-2xl font-bold">✓</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 p-3 rounded-lg">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Landing Page Editor - Special Card */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Landing Page
        </h2>

        <Link to="/admin/landing-page">
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-8 text-white hover:shadow-2xl transition-all transform hover:scale-[1.02] cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                  <h3 className="text-2xl font-bold">Edit Landing Page</h3>
                  <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-semibold">
                    NEW
                  </span>
                </div>
                <p className="text-white text-opacity-90 mb-4">
                  Edit the almostacms.com landing page - 8 sections including Hero, Features, How It Works, Showcase, Open Source, Support, FAQ, and Footer
                </p>
                <div className="flex items-center gap-2 text-white text-opacity-80 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>8 editable sections</span>
                </div>
              </div>
              <div className="text-white text-opacity-60">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Content Files Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Personal Website Sections
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentFiles.map((file) => (
            <ContentCard
              key={file.name}
              file={file}
              onClick={() => onEditContent(file.name)}
            />
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          💡 Quick Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">•</span>
            <span>Click any section above to edit its JSON content</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">•</span>
            <span>Changes are automatically saved and HTML is regenerated</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">•</span>
            <span>JSON syntax is validated in real-time</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">•</span>
            <span>Mobile-friendly interface works on all devices</span>
          </div>
        </div>
      </div>
    </div>
  );
};