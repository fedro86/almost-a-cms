import React, { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/solid';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface DonationOption {
  id: string;
  emoji: string;
  text: string;
  amount: number;
  url: string;
}

interface MonthlySupport {
  emoji: string;
  text: string;
  amount: number;
  url: string;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  fundedAmount: number;
  goalAmount: number;
  contributors: number;
  status: string;
  priority: string;
  url: string;
}

interface SupportData {
  sectionTitle: string;
  sectionSubtitle: string;
  donations: {
    title: string;
    subtitle: string;
    options: DonationOption[];
    monthlySupport: MonthlySupport;
  };
  featureFunding: {
    title: string;
    subtitle: string;
    platformUrl: string;
    topFeatures: Feature[];
    viewAllUrl: string;
  };
  transparency: {
    text: string;
    url: string;
  };
}

export const SupportSection: React.FC = () => {
  const [data, setData] = useState<SupportData | null>(null);

  useEffect(() => {
    fetch('/data/support.json')
      .then((res) => res.json())
      .then(setData)
      .catch((error) => console.error('Failed to load support data:', error));
  }, []);

  if (!data) return null;

  const getProgressPercentage = (funded: number, goal: number) => {
    return Math.min((funded / goal) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <section id="support" className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Donations */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-pink-200">
              <div className="flex items-center gap-3 mb-6">
                <HeartIcon className="w-8 h-8 text-pink-500" />
                <h3 className="text-2xl font-bold text-gray-900">
                  {data.donations.title}
                </h3>
              </div>
              <p className="text-gray-600 mb-8">
                {data.donations.subtitle}
              </p>

              {/* One-time donations */}
              <div className="space-y-3 mb-6">
                {data.donations.options.map((option) => (
                  <a
                    key={option.id}
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 rounded-lg border-2 border-pink-200 hover:border-pink-400 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{option.emoji}</span>
                      <span className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                        {option.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-pink-600">
                        ${option.amount}
                      </span>
                      <ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-400 group-hover:text-pink-600 transition-colors" />
                    </div>
                  </a>
                ))}
              </div>

              {/* Monthly support */}
              <div className="pt-6 border-t-2 border-gray-200">
                <a
                  href={data.donations.monthlySupport.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-white text-center"
                >
                  <div className="text-4xl mb-2">{data.donations.monthlySupport.emoji}</div>
                  <div className="text-xl font-bold mb-1">
                    {data.donations.monthlySupport.text}
                  </div>
                  <div className="text-3xl font-extrabold">
                    ${data.donations.monthlySupport.amount}/mo
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Feature Funding */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🎯</span>
                <h3 className="text-2xl font-bold text-gray-900">
                  {data.featureFunding.title}
                </h3>
              </div>
              <p className="text-gray-600 mb-8">
                {data.featureFunding.subtitle}
              </p>

              {/* Top Features */}
              <div className="space-y-6 mb-6">
                {data.featureFunding.topFeatures.map((feature) => {
                  const percentage = getProgressPercentage(feature.fundedAmount, feature.goalAmount);
                  const progressColor = getProgressColor(percentage);

                  return (
                    <a
                      key={feature.id}
                      href={feature.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-6 bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {feature.title}
                        </h4>
                        {feature.priority === 'high' && (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                            High Priority
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        {feature.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            ${feature.fundedAmount.toLocaleString()} / ${feature.goalAmount.toLocaleString()}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${progressColor} transition-all duration-500 rounded-full`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {feature.contributors} {feature.contributors === 1 ? 'contributor' : 'contributors'}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* View All Button */}
              <a
                href={data.featureFunding.viewAllUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 text-center font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                View All Feature Requests →
              </a>
            </div>
          </div>
        </div>

        {/* Transparency Note */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-2">
            {data.transparency.text}
          </p>
          <a
            href={data.transparency.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            View Financial Transparency
            <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </section>
  );
};
