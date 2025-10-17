import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  PencilIcon,
  LockClosedIcon,
  SparklesIcon,
  ClockIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface FeaturesData {
  sectionTitle: string;
  sectionSubtitle: string;
  features: Feature[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'currency-dollar': CurrencyDollarIcon,
  'pencil': PencilIcon,
  'lock-closed': LockClosedIcon,
  'sparkles': SparklesIcon,
  'clock': ClockIcon,
  'code-bracket': CodeBracketIcon,
};

export const FeaturesSection: React.FC = () => {
  const [data, setData] = useState<FeaturesData | null>(null);

  useEffect(() => {
    fetch('/data/features.json')
      .then((res) => res.json())
      .then(setData)
      .catch((error) => console.error('Failed to load features:', error));
  }, []);

  if (!data) return null;

  return (
    <section id="features" className="py-20 bg-white">
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

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.features.map((feature) => {
            const Icon = iconMap[feature.icon] || CodeBracketIcon;

            return (
              <div
                key={feature.id}
                className="group p-8 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-14 h-14 mb-6 bg-blue-100 rounded-lg group-hover:bg-blue-500 transition-colors duration-300">
                  <Icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
