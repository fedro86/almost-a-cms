import React, { useState, useEffect } from 'react';
import { StarIcon, CodeBracketIcon, BookOpenIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface CallToAction {
  icon: string;
  text: string;
  url: string;
}

interface OpenSourceData {
  sectionTitle: string;
  sectionSubtitle: string;
  githubUrl: string;
  stats: {
    stars: number;
    forks: number;
    contributors: number;
    lastUpdated: string;
  };
  callsToAction: CallToAction[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'star': StarIcon,
  'code-bracket': CodeBracketIcon,
  'book-open': BookOpenIcon,
  'light-bulb': LightBulbIcon,
};

export const OpenSourceSection: React.FC = () => {
  const [data, setData] = useState<OpenSourceData | null>(null);

  useEffect(() => {
    fetch('/data/openSource.json')
      .then((res) => res.json())
      .then(setData)
      .catch((error) => console.error('Failed to load open source data:', error));
  }, []);

  if (!data) return null;

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            {data.sectionTitle}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {data.sectionSubtitle}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">
              ⭐ {data.stats.stars.toLocaleString()}
            </div>
            <div className="text-gray-400">GitHub Stars</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">
              🔱 {data.stats.forks.toLocaleString()}
            </div>
            <div className="text-gray-400">Forks</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">
              👥 {data.stats.contributors.toLocaleString()}
            </div>
            <div className="text-gray-400">Contributors</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">
              📄 MIT
            </div>
            <div className="text-gray-400">License</div>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.callsToAction.map((cta, index) => {
            const Icon = iconMap[cta.icon] || StarIcon;

            return (
              <a
                key={index}
                href={cta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 bg-gray-800 hover:bg-gray-700 rounded-xl border-2 border-gray-700 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center w-14 h-14 mb-4 bg-gray-700 group-hover:bg-blue-500 rounded-lg transition-colors">
                    <Icon className="w-7 h-7 text-blue-400 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                    {cta.text}
                  </span>
                </div>
              </a>
            );
          })}
        </div>

        {/* GitHub Button */}
        <div className="mt-12 text-center">
          <a
            href={data.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-gray-900 bg-white hover:bg-gray-100 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
};
