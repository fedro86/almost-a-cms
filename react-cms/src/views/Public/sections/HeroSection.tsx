import React, { useState, useEffect } from 'react';
import { RocketLaunchIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface HeroData {
  headline: string;
  subheadline: string;
  ctaPrimary: {
    text: string;
    url: string;
    icon: string;
  };
  ctaSecondary: {
    text: string;
    url: string;
    icon: string;
  };
  heroImage: string;
  backgroundStyle: string;
}

export const HeroSection: React.FC = () => {
  const [data, setData] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load hero data from JSON
    fetch('/data/hero.json')
      .then((res) => res.json())
      .then((heroData) => {
        setData(heroData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load hero data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const getBackgroundClass = () => {
    if (data.backgroundStyle === 'gradient') {
      return 'bg-gradient-to-br from-blue-50 via-white to-purple-50';
    }
    return 'bg-white';
  };

  return (
    <section className={`relative min-h-screen flex items-center ${getBackgroundClass()}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                {data.headline}
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed">
                {data.subheadline}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={data.ctaPrimary.url}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <RocketLaunchIcon className="w-6 h-6 mr-2" />
                {data.ctaPrimary.text}
              </a>
              <a
                href={data.ctaSecondary.url}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white hover:bg-gray-50 rounded-lg border-2 border-blue-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {data.ctaSecondary.text}
                <ArrowDownIcon className="w-6 h-6 ml-2" />
              </a>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Open source</span>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={data.heroImage}
                alt="AlmostaCMS Preview"
                className="w-full h-auto"
                onError={(e) => {
                  // Fallback to placeholder if image doesn't exist
                  e.currentTarget.src = 'https://via.placeholder.com/800x600/3B82F6/FFFFFF?text=AlmostaCMS';
                }}
              />
              {/* Decorative elements */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-20 blur-2xl -z-10"></div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200">
              <div className="text-sm font-semibold text-gray-700">✨ Free & Open Source</div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200">
              <div className="text-sm font-semibold text-gray-700">⚡ Deploy in 60 seconds</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ArrowDownIcon className="w-6 h-6 text-gray-400" />
      </div>
    </section>
  );
};
