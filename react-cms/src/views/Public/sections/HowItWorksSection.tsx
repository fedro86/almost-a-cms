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
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
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

        {/* Steps */}
        <div className="relative">
          {/* Connection Line (hidden on mobile) */}
          <div className="hidden lg:block absolute top-24 left-1/4 right-1/4 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {data.steps.map((step, index) => {
              const Icon = iconMap[step.icon] || UserCircleIcon;

              return (
                <div
                  key={step.number}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Step Number Badge */}
                  <div className="relative z-10 flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg">
                    <span className="text-3xl font-bold text-white">
                      {step.number}
                    </span>
                  </div>

                  {/* Icon Circle */}
                  <div className="flex items-center justify-center w-16 h-16 mb-6 bg-white rounded-full shadow-md border-4 border-blue-100">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed max-w-sm">
                    {step.description}
                  </p>

                  {/* Decorative arrow (between steps) */}
                  {index < data.steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 -right-6 text-blue-400">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="/create"
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Start Building Now
            <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};
