import React, { useState, useEffect } from 'react';
import { RocketLaunchIcon } from '@heroicons/react/24/outline';

interface Link {
  text: string;
  url: string;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface FooterData {
  headline: string;
  subheadline: string;
  cta: {
    text: string;
    url: string;
    icon: string;
  };
  socialProof: string;
  links: {
    product: Link[];
    resources: Link[];
    community: Link[];
  };
  social: SocialLink[];
  copyright: string;
  license: string;
  builtWith: {
    show: boolean;
    text: string;
    url: string;
  };
}

export const FooterSection: React.FC = () => {
  const [data, setData] = useState<FooterData | null>(null);

  useEffect(() => {
    fetch('/data/footer.json')
      .then((res) => res.json())
      .then(setData)
      .catch((error) => console.error('Failed to load footer:', error));
  }, []);

  if (!data) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* CTA Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {data.headline}
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            {data.subheadline}
          </p>
          <a
            href={data.cta.url}
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <RocketLaunchIcon className="w-6 h-6 mr-2" />
            {data.cta.text}
          </a>
          <p className="mt-4 text-sm text-gray-400">
            {data.socialProof}
          </p>
        </div>
      </div>

      {/* Links Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-xl font-bold">AlmostaCMS</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Beautiful websites, built with GitHub. Free, open source, and easy to use.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {data.social.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                  aria-label={social.platform}
                >
                  {social.platform === 'github' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  )}
                  {social.platform === 'twitter' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              {data.links.product.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              {data.links.resources.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    target={link.url.startsWith('http') ? '_blank' : undefined}
                    rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Community</h3>
            <ul className="space-y-3">
              {data.links.community.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    target={link.url.startsWith('http') ? '_blank' : undefined}
                    rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span>
                {data.copyright.replace('2025', String(currentYear))}
              </span>
              <span className="hidden sm:inline">•</span>
              <span>{data.license}</span>
            </div>
            {data.builtWith.show && (
              <a
                href={data.builtWith.url}
                className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2"
              >
                <span>⚡</span>
                <span>{data.builtWith.text}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
