import React, { useState, useEffect } from 'react';
import { RocketLaunchIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface TrustBadge {
  text: string;
  color: string;
}

interface FloatingBadge {
  emoji: string;
  label: string;
  text: string;
}

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
  trustBadges: TrustBadge[];
  floatingBadges: {
    topRight: FloatingBadge;
    bottomLeft: FloatingBadge;
  };
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

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-3">
              {data.trustBadges?.map((badge, index) => {
                const colorClasses = {
                  green: 'bg-green-50 text-green-700',
                  blue: 'bg-blue-50 text-blue-700',
                  purple: 'bg-purple-50 text-purple-700',
                  red: 'bg-red-50 text-red-700',
                  yellow: 'bg-yellow-50 text-yellow-700',
                };
                const colorClass = colorClasses[badge.color as keyof typeof colorClasses] || 'bg-gray-50 text-gray-700';

                return (
                  <span key={index} className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${colorClass} rounded-full text-sm font-medium`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {badge.text}
                  </span>
                );
              })}
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
            {data.floatingBadges?.topRight && (
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl px-4 py-3 border border-gray-100 transform rotate-2 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{data.floatingBadges.topRight.emoji}</span>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">{data.floatingBadges.topRight.label}</div>
                    <div className="text-sm font-bold text-gray-900">{data.floatingBadges.topRight.text}</div>
                  </div>
                </div>
              </div>
            )}
            {data.floatingBadges?.bottomLeft && (
              <div className="absolute bottom-6 left-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-xl px-4 py-3 transform -rotate-2 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-2 text-white">
                  <span className="text-2xl">{data.floatingBadges.bottomLeft.emoji}</span>
                  <div>
                    <div className="text-xs text-blue-100 font-medium">{data.floatingBadges.bottomLeft.label}</div>
                    <div className="text-sm font-bold">{data.floatingBadges.bottomLeft.text}</div>
                  </div>
                </div>
              </div>
            )}
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
