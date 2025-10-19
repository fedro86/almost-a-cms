import React, { useState, useEffect } from 'react';
import { UserCircleIcon, DocumentTextIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

interface Step {
  number: number;
  icon: string;
  title: string;
  description: string;
  illustration: string;
}

interface HowItWorksData {
  sectionTitle: string;
  sectionSubtitle: string;
  steps: Step[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'user-circle': UserCircleIcon,
  'template': DocumentTextIcon,
  'pencil-square': PencilSquareIcon,
};

export const HowItWorksSection: React.FC = () => {
  const [data, setData] = useState<HowItWorksData | null>(null);

  useEffect(() => {
    fetch('/data/howItWorks.json')
      .then((res) => res.json())
      .then(setData)
      .catch((error) => console.error('Failed to load how it works:', error));
  }, []);

  if (!data) return null;

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
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

        {/* Steps Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connection arrows between cards (desktop only) */}
          {data.steps.map((_, index) => {
            if (index < data.steps.length - 1) {
              return (
                <div
                  key={`arrow-${index}`}
                  className="hidden md:block absolute top-1/3 text-blue-400 opacity-50"
                  style={{
                    left: `${(index + 1) * 33.33 - 8}%`,
                    transform: 'translateY(-50%)',
                  }}
                >
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              );
            }
            return null;
          })}

          {data.steps.map((step) => {
            const Icon = iconMap[step.icon] || UserCircleIcon;

            return (
              <div
                key={step.number}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                {/* Step Number Badge - Top Right Corner */}
                <div className="absolute -top-4 -right-4 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                  {step.number}
                </div>

                {/* Icon with gradient background */}
                <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl group-hover:from-blue-200 group-hover:to-purple-200 transition-colors duration-300">
                  <Icon className="w-10 h-10 text-blue-600 group-hover:text-purple-600 transition-colors duration-300" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Decorative gradient bar at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="/create"
            className="group inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
          >
            {/* Animated gradient overlay */}
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>

            <span className="relative flex items-center">
              Start Building Now
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};
