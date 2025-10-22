import type { SocialPlatform } from '../types';
import { getIcon } from '../utils/icons';

interface SocialIconsProps {
  platforms: SocialPlatform[];
}

export function SocialIcons({ platforms }: SocialIconsProps) {
  if (!platforms || platforms.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="flex justify-center items-center gap-3">
        {platforms.map((platform) => {
          const Icon = getIcon(platform.icon);
          return (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
              aria-label={platform.name}
            >
              {Icon && <Icon className="w-5 h-5 text-gray-700" />}
            </a>
          );
        })}
      </div>
    </div>
  );
}
