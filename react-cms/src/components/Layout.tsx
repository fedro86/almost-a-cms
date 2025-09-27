import React from 'react';
import { Cog6ToothIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
  onGenerateHtml?: () => void;
  isGenerating?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, onGenerateHtml, isGenerating }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Cog6ToothIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Almost-a-CMS</h1>
                <p className="text-sm text-gray-500">React Edition</p>
              </div>
            </div>

            {onGenerateHtml && (
              <button
                onClick={onGenerateHtml}
                disabled={isGenerating}
                className="btn-primary flex items-center space-x-2"
              >
                <DocumentTextIcon className="h-5 w-5" />
                <span>{isGenerating ? 'Generating...' : 'Generate HTML'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>Built with React + Tailwind CSS • Mobile-first responsive design</p>
          </div>
        </div>
      </footer>
    </div>
  );
};