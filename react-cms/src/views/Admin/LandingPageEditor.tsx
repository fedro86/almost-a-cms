import React from 'react';
import { Link } from 'react-router-dom';
import {
  RocketLaunchIcon,
  SparklesIcon,
  BookOpenIcon,
  PhotoIcon,
  CodeBracketIcon,
  HeartIcon,
  QuestionMarkCircleIcon,
  Bars3BottomLeftIcon,
} from '@heroicons/react/24/outline';

interface Section {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  editUrl: string;
  dataFile: string;
}

const sections: Section[] = [
  {
    id: 'hero',
    name: 'Hero Section',
    description: 'Main headline, CTAs, and hero image',
    icon: RocketLaunchIcon,
    editUrl: '/admin/edit/hero',
    dataFile: 'hero.json',
  },
  {
    id: 'features',
    name: 'Features',
    description: '6 key features with icons and descriptions',
    icon: SparklesIcon,
    editUrl: '/admin/edit/features',
    dataFile: 'features.json',
  },
  {
    id: 'how-it-works',
    name: 'How It Works',
    description: '3-step process flow',
    icon: BookOpenIcon,
    editUrl: '/admin/edit/how-it-works',
    dataFile: 'howItWorks.json',
  },
  {
    id: 'showcase',
    name: 'Showcase',
    description: 'Sites built with AlmostaCMS',
    icon: PhotoIcon,
    editUrl: '/admin/edit/showcase',
    dataFile: 'showcase.json',
  },
  {
    id: 'open-source',
    name: 'Open Source',
    description: 'GitHub stats and contribution CTAs',
    icon: CodeBracketIcon,
    editUrl: '/admin/edit/open-source',
    dataFile: 'openSource.json',
  },
  {
    id: 'support',
    name: 'Support Development',
    description: 'Donations and feature funding',
    icon: HeartIcon,
    editUrl: '/admin/edit/support',
    dataFile: 'support.json',
  },
  {
    id: 'faq',
    name: 'FAQ',
    description: 'Frequently asked questions',
    icon: QuestionMarkCircleIcon,
    editUrl: '/admin/edit/faq',
    dataFile: 'faq.json',
  },
  {
    id: 'footer',
    name: 'Footer',
    description: 'Footer links, social, and copyright',
    icon: Bars3BottomLeftIcon,
    editUrl: '/admin/edit/footer',
    dataFile: 'footer.json',
  },
];

export const LandingPageEditor: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Landing Page
              </h1>
              <p className="text-gray-600 mt-2">
                Customize your almostacms.com content
              </p>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Preview Site
            </a>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Editing Landing Page Content
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Click on any section below to edit its content. Changes will be saved to your GitHub repository and deployed automatically.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <Link
                key={section.id}
                to={section.editUrl}
                className="group block bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 p-6 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-14 h-14 mb-4 bg-blue-100 group-hover:bg-blue-500 rounded-lg transition-colors duration-300">
                  <Icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {section.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {section.description}
                </p>

                {/* Data File Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {section.dataFile}
                  </span>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              💡 Quick Tip
            </h3>
            <p className="text-sm text-gray-600">
              All changes are saved directly to your GitHub repository. You can see your edit history in the commit log.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🚀 Auto Deploy
            </h3>
            <p className="text-sm text-gray-600">
              GitHub Actions automatically rebuilds your site when you save changes. Updates are live in ~30 seconds.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🔒 Version Control
            </h3>
            <p className="text-sm text-gray-600">
              Every edit creates a Git commit. You can always roll back to previous versions if needed.
            </p>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <Link
            to="/admin"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
