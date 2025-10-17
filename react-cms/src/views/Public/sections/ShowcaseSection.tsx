import React, { useState, useEffect } from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface Site {
  id: string;
  name: string;
  creator: string;
  url: string;
  screenshot: string;
  template: string;
  featured: boolean;
}

interface ShowcaseData {
  sectionTitle: string;
  sectionSubtitle: string;
  sites: Site[];
}

export const ShowcaseSection: React.FC = () => {
  const [data, setData] = useState<ShowcaseData | null>(null);

  useEffect(() => {
    fetch('/data/showcase.json')
      .then((res) => res.json())
      .then(setData)
      .catch((error) => console.error('Failed to load showcase:', error));
  }, []);

  if (!data) return null;

  const getTemplateBadgeColor = (template: string) => {
    return template === 'landing-page'
      ? 'bg-purple-100 text-purple-700'
      : 'bg-blue-100 text-blue-700';
  };

  return (
    <section id="showcase" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {data.sectionTitle}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {data.sectionSubtitle}
          </p>
        </div>

        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.sites.map((site) => (
            <a
              key={site.id}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-blue-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Screenshot */}
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                <img
                  src={site.screenshot}
                  alt={`${site.name} screenshot`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/800x600/3B82F6/FFFFFF?text=${encodeURIComponent(site.name)}`;
                  }}
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <span className="text-sm font-medium">Visit Site</span>
                    <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {site.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      by {site.creator}
                    </p>
                  </div>
                  {site.featured && (
                    <span className="flex-shrink-0 inline-block px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded">
                      ⭐ Featured
                    </span>
                  )}
                </div>

                {/* Template Badge */}
                <div className="flex items-center gap-2">
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getTemplateBadgeColor(site.template)}`}>
                    {site.template === 'landing-page' ? '🚀 Landing Page' : '📄 Personal Website'}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Empty State or Call to Action */}
        {data.sites.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">No sites in the showcase yet. Be the first!</p>
            <a
              href="/create"
              className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Create Your Site
            </a>
          </div>
        )}

        {/* View More */}
        {data.sites.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Want your site featured here?
            </p>
            <a
              href="https://github.com/fedro86/almost-a-cms/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 text-base font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Share Your Site
              <ArrowTopRightOnSquareIcon className="w-5 h-5 ml-2" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};
