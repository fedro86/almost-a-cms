/**
 * Dashboard Component
 * Auto-discovers and displays available sections from template configuration
 */

import React from 'react';
import { useSections, type LoadedSection } from '../hooks/useSections';

interface DashboardProps {
  onEditContent?: (filename: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onEditContent }) => {
  const { sections, loading, error } = useSections();

  // Get category color scheme
  const getCategoryColor = (category: string) => {
    const colors = {
      'link-in-bio': 'from-purple-500 via-pink-500 to-rose-500',
      'landing-page': 'from-blue-500 via-cyan-500 to-teal-500',
      'portfolio': 'from-orange-500 via-amber-500 to-yellow-500',
      'blog': 'from-green-500 via-emerald-500 to-teal-500',
      'shared': 'from-gray-500 via-slate-500 to-zinc-500'
    };
    return colors[category as keyof typeof colors] || colors.shared;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Configuration</h3>
        <p className="text-red-600 text-sm">{error}</p>
        <p className="text-red-600 text-sm mt-2">
          Make sure .almostacms.json exists in the template root directory.
        </p>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
        <h3 className="text-yellow-800 font-semibold mb-2">No Sections Found</h3>
        <p className="text-yellow-700 text-sm">
          No sections are configured in .almostacms.json or all sections are hidden.
        </p>
      </div>
    );
  }

  // Group sections by category
  const sectionsByCategory = sections.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, LoadedSection[]>);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Content Sections
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Edit your website sections below. Changes are automatically saved to GitHub.
        </p>
      </div>

      {/* Sections by Category */}
      {Object.entries(sectionsByCategory).map(([category, categorySections]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {category.replace('-', ' ')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categorySections.map((section) => (
              <button
                key={section.id}
                onClick={() => onEditContent?.(section.dataFile.replace('.json', ''))}
                className="text-left"
              >
                <div className={`bg-gradient-to-br ${getCategoryColor(section.category)} rounded-xl p-6 text-white hover:shadow-2xl transition-all transform hover:scale-[1.02] cursor-pointer`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{section.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold">{section.label}</h3>
                        {section.required && (
                          <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-white text-opacity-90 text-sm mb-4">
                    {section.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-white border-opacity-20">
                    <span className="text-xs text-white text-opacity-80">
                      {section.dataFile}
                    </span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Info Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ℹ️ About Your Website
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Edit sections using the visual editor or JSON editor</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>All changes are automatically saved and deployed to GitHub Pages</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Your website is hosted for free with zero infrastructure costs</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span className="font-medium">Found {sections.length} section{sections.length !== 1 ? 's' : ''} in this template</span>
          </div>
        </div>
      </div>
    </div>
  );
};
