import React from 'react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Choose Your Template
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Select which website template you want to edit.
        </p>
      </div>

      {/* Template Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Landing Page Card */}
        <Link to="/admin/landing-page">
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-8 text-white hover:shadow-2xl transition-all transform hover:scale-[1.02] cursor-pointer min-h-[300px] flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
              <h3 className="text-2xl font-bold">Landing Page</h3>
            </div>

            <p className="text-white text-opacity-90 mb-6 flex-grow">
              Create a marketing website for your product or service with Hero, Features, Pricing, Testimonials, and more.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-white text-opacity-90 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>8 editable sections</span>
              </div>
              <div className="flex items-center gap-2 text-white text-opacity-90 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Perfect for products & services</span>
              </div>
              <div className="flex items-center gap-2 text-white text-opacity-90 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Visual editors with live preview</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white border-opacity-20">
              <span className="text-sm text-white text-opacity-80">Click to edit</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Personal Website Card */}
        <Link to="/admin/personal-website">
          <div className="bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-xl p-8 text-white hover:shadow-2xl transition-all transform hover:scale-[1.02] cursor-pointer min-h-[300px] flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <h3 className="text-2xl font-bold">Personal Website</h3>
            </div>

            <p className="text-white text-opacity-90 mb-6 flex-grow">
              Create a portfolio website with About, Resume, Projects, Blog, and Contact sections - perfect for developers and creatives.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-white text-opacity-90 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>7 content sections</span>
              </div>
              <div className="flex items-center gap-2 text-white text-opacity-90 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Perfect for portfolios & resumes</span>
              </div>
              <div className="flex items-center gap-2 text-white text-opacity-90 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Blog & project showcase</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white border-opacity-20">
              <span className="text-sm text-white text-opacity-80">Click to edit</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Info Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-5xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ℹ️ About Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Landing Page:</strong> Best for promoting products, services, or apps</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Personal Website:</strong> Best for portfolios, resumes, and personal branding</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Each template has its own visual editor with real-time preview</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>All changes are automatically saved and deployed to GitHub Pages</span>
          </div>
        </div>
      </div>
    </div>
  );
};
