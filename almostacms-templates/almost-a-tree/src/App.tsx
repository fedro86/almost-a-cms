import { useEffect } from 'react';
import { useData } from './hooks/useData';
import { Profile } from './components/Profile';
import { LinkButton } from './components/LinkButton';
import { SocialIcons } from './components/SocialIcons';
import type {
  Profile as ProfileType,
  LinksData,
  SocialData,
  Theme,
  Settings,
} from './types';

function App() {
  const { data: profile } = useData<ProfileType>('profile.json');
  const { data: linksData } = useData<LinksData>('links.json');
  const { data: socialData } = useData<SocialData>('social.json');
  const { data: theme } = useData<Theme>('theme.json');
  const { data: settings } = useData<Settings>('settings.json');

  // Apply theme to document
  useEffect(() => {
    if (theme) {
      // Apply light background
      document.body.style.background = theme.colors.background || '#f5f5f4';
      document.body.style.fontFamily = theme.fonts.body;
    }

    // Apply SEO settings
    if (settings) {
      document.title = settings.siteTitle;

      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', settings.seo.description);
      }
    }
  }, [theme, settings]);

  // Loading state
  if (!profile || !linksData || !socialData || !theme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-gray-900 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center">
      {/* White card container */}
      <div
        className="bg-white rounded-2xl shadow-lg p-10 w-full animate-fade-in"
        style={{
          maxWidth: theme.layout.maxWidth || '480px',
        }}
      >
        {/* Profile section */}
        <Profile profile={profile} />

        {/* Links section */}
        <div className="space-y-3 my-6">
          {linksData.links
            .filter((link) => link.featured !== false)
            .map((link, index) => (
              <LinkButton key={link.id} link={link} index={index} />
            ))}
        </div>

        {/* Social icons */}
        <SocialIcons platforms={socialData.platforms} />

        {/* Footer */}
        {settings?.footer.showPoweredBy && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              {settings.footer.customText || (
                <>
                  Built with{' '}
                  <a
                    href="https://github.com/almostacms/almost-a-cms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-gray-900 underline transition-colors"
                  >
                    AlmostaCMS
                  </a>
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Add fade-in animation */}
      <style>
        {`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
        `}
      </style>
    </div>
  );
}

export default App;
