import React, { useState, useMemo } from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';

interface IconBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string) => void;
  currentIcon?: string;
}

export const IconBrowser: React.FC<IconBrowserProps> = ({
  isOpen,
  onClose,
  onSelectIcon,
  currentIcon = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Get all available Heroicons
  const availableIcons = useMemo(() => {
    const icons = Object.keys(HeroIcons)
      .filter((name) => name.endsWith('Icon'))
      .map((name) => {
        // Convert from "RocketLaunchIcon" to "rocket-launch"
        const kebabName = name
          .replace('Icon', '')
          .replace(/([A-Z])/g, '-$1')
          .toLowerCase()
          .replace(/^-/, '');
        return {
          componentName: name,
          displayName: kebabName,
          Component: HeroIcons[name as keyof typeof HeroIcons] as React.ComponentType<{ className?: string }>,
        };
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    return icons;
  }, []);

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) return availableIcons;

    const query = searchQuery.toLowerCase();
    return availableIcons.filter((icon) =>
      icon.displayName.includes(query)
    );
  }, [searchQuery, availableIcons]);

  const handleSelect = (iconName: string) => {
    onSelectIcon(iconName);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Heroicons Browser</h3>
              <p className="text-sm text-gray-600 mt-1">
                {filteredIcons.length} icons available • Click to select
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search icons... (e.g., rocket, user, code)"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Icons Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredIcons.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 text-lg">No icons found matching "{searchQuery}"</p>
              <p className="text-gray-500 text-sm mt-2">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {filteredIcons.map((icon) => {
                const Icon = icon.Component;
                const isSelected = currentIcon === icon.displayName;

                return (
                  <button
                    key={icon.displayName}
                    onClick={() => handleSelect(icon.displayName)}
                    className={`group relative flex flex-col items-center p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                    }`}
                    title={icon.displayName}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}

                    {/* Icon */}
                    <div
                      className={`w-10 h-10 mb-2 transition-colors ${
                        isSelected ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'
                      }`}
                    >
                      <Icon className="w-full h-full" />
                    </div>

                    {/* Icon Name */}
                    <span
                      className={`text-xs text-center font-mono leading-tight transition-colors ${
                        isSelected ? 'text-blue-700 font-semibold' : 'text-gray-600 group-hover:text-blue-600'
                      }`}
                    >
                      {icon.displayName}
                    </span>

                    {/* Hover Tooltip */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {icon.displayName}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Icons from{' '}
              <a
                href="https://heroicons.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Heroicons
              </a>
              {' '}by Tailwind Labs
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-medium transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
