import React, { useState, useMemo } from 'react';

interface SocialPlatform {
  name: string;
  displayName: string;
  icon: string;
  urlPattern: string;
  color: string;
}

interface SocialMediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlatform: (platform: { platform: string; icon: string; url: string }) => void;
}

// Predefined social media platforms with their icons and URL patterns
const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    name: 'github',
    displayName: 'GitHub',
    icon: 'logo-github',
    urlPattern: 'https://github.com/',
    color: 'bg-gray-800 hover:bg-gray-900',
  },
  {
    name: 'twitter',
    displayName: 'Twitter / X',
    icon: 'logo-twitter',
    urlPattern: 'https://twitter.com/',
    color: 'bg-white hover:bg-gray-50 border-2 border-gray-300',
  },
  {
    name: 'linkedin',
    displayName: 'LinkedIn',
    icon: 'logo-linkedin',
    urlPattern: 'https://linkedin.com/in/',
    color: 'bg-blue-700 hover:bg-blue-800',
  },
  {
    name: 'facebook',
    displayName: 'Facebook',
    icon: 'logo-facebook',
    urlPattern: 'https://facebook.com/',
    color: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    name: 'instagram',
    displayName: 'Instagram',
    icon: 'logo-instagram',
    urlPattern: 'https://instagram.com/',
    color: 'bg-pink-600 hover:bg-pink-700',
  },
  {
    name: 'youtube',
    displayName: 'YouTube',
    icon: 'logo-youtube',
    urlPattern: 'https://youtube.com/@',
    color: 'bg-red-600 hover:bg-red-700',
  },
  {
    name: 'discord',
    displayName: 'Discord',
    icon: 'logo-discord',
    urlPattern: 'https://discord.gg/',
    color: 'bg-indigo-600 hover:bg-indigo-700',
  },
  {
    name: 'slack',
    displayName: 'Slack',
    icon: 'logo-slack',
    urlPattern: 'https://slack.com/',
    color: 'bg-purple-600 hover:bg-purple-700',
  },
  {
    name: 'reddit',
    displayName: 'Reddit',
    icon: 'logo-reddit',
    urlPattern: 'https://reddit.com/r/',
    color: 'bg-orange-600 hover:bg-orange-700',
  },
  {
    name: 'medium',
    displayName: 'Medium',
    icon: 'logo-medium',
    urlPattern: 'https://medium.com/@',
    color: 'bg-gray-900 hover:bg-black',
  },
  {
    name: 'twitch',
    displayName: 'Twitch',
    icon: 'logo-twitch',
    urlPattern: 'https://twitch.tv/',
    color: 'bg-purple-700 hover:bg-purple-800',
  },
  {
    name: 'tiktok',
    displayName: 'TikTok',
    icon: 'logo-tiktok',
    urlPattern: 'https://tiktok.com/@',
    color: 'bg-gray-900 hover:bg-black',
  },
  {
    name: 'mastodon',
    displayName: 'Mastodon',
    icon: 'logo-mastodon',
    urlPattern: 'https://mastodon.social/@',
    color: 'bg-violet-600 hover:bg-violet-700',
  },
  {
    name: 'dribbble',
    displayName: 'Dribbble',
    icon: 'logo-dribbble',
    urlPattern: 'https://dribbble.com/',
    color: 'bg-pink-500 hover:bg-pink-600',
  },
  {
    name: 'behance',
    displayName: 'Behance',
    icon: 'logo-behance',
    urlPattern: 'https://behance.net/',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    name: 'stackoverflow',
    displayName: 'Stack Overflow',
    icon: 'logo-stackoverflow',
    urlPattern: 'https://stackoverflow.com/users/',
    color: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    name: 'codepen',
    displayName: 'CodePen',
    icon: 'logo-codepen',
    urlPattern: 'https://codepen.io/',
    color: 'bg-gray-900 hover:bg-black',
  },
  {
    name: 'website',
    displayName: 'Website',
    icon: 'globe-alt',
    urlPattern: 'https://',
    color: 'bg-gray-600 hover:bg-gray-700',
  },
  {
    name: 'email',
    displayName: 'Email',
    icon: 'envelope',
    urlPattern: 'mailto:',
    color: 'bg-teal-600 hover:bg-teal-700',
  },
];

export const SocialMediaPicker: React.FC<SocialMediaPickerProps> = ({
  isOpen,
  onClose,
  onSelectPlatform,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter platforms based on search
  const filteredPlatforms = useMemo(() => {
    if (!searchQuery.trim()) return SOCIAL_PLATFORMS;

    const query = searchQuery.toLowerCase();
    return SOCIAL_PLATFORMS.filter((platform) =>
      platform.displayName.toLowerCase().includes(query) ||
      platform.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelectPlatform = (platform: SocialPlatform) => {
    onSelectPlatform({
      platform: platform.displayName,
      icon: platform.icon,
      url: platform.urlPattern,
    });
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Social Platform</h2>
            <p className="text-sm text-gray-600 mt-1">Choose a platform to add to your footer</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search platforms..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Platform Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredPlatforms.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 text-lg">No platforms found</p>
              <p className="text-gray-500 text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPlatforms.map((platform) => (
                <button
                  key={platform.name}
                  onClick={() => handleSelectPlatform(platform)}
                  className="group p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-200 text-center"
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${platform.color} flex items-center justify-center ${platform.name === 'twitter' ? 'text-black' : 'text-white'} transition-all duration-200 group-hover:scale-110 shadow-lg`}>
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      {/* GitHub */}
                      {platform.name === 'github' && (
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      )}
                      {/* Twitter/X */}
                      {platform.name === 'twitter' && (
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      )}
                      {/* LinkedIn */}
                      {platform.name === 'linkedin' && (
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      )}
                      {/* Facebook */}
                      {platform.name === 'facebook' && (
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      )}
                      {/* Instagram */}
                      {platform.name === 'instagram' && (
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                      )}
                      {/* YouTube */}
                      {platform.name === 'youtube' && (
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      )}
                      {/* Discord */}
                      {platform.name === 'discord' && (
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      )}
                      {/* Default icon for others */}
                      {!['github', 'twitter', 'linkedin', 'facebook', 'instagram', 'youtube', 'discord'].includes(platform.name) && (
                        <>
                          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                          <text x="12" y="16" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="bold">
                            {platform.displayName.charAt(0)}
                          </text>
                        </>
                      )}
                    </svg>
                  </div>
                  <div className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors text-base">
                    {platform.displayName}
                  </div>
                  <div className="text-xs text-gray-500 font-mono truncate px-2">
                    {platform.icon}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Icons use Ionicons naming (logo-platform)</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
