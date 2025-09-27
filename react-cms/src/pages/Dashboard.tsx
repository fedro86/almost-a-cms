import React from 'react';
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

      {/* Content Files Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Edit Content Sections
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