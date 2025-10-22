import type { Link } from '../types';
import { getIcon } from '../utils/icons';

interface LinkButtonProps {
  link: Link;
  index: number;
}

export function LinkButton({ link, index }: LinkButtonProps) {
  const Icon = getIcon(link.icon);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full mb-3 transform transition-all duration-200 hover:scale-[1.02]"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div
        className="flex items-center justify-center gap-3 rounded-lg px-6 py-4 shadow-sm hover:shadow-md transition-all duration-200"
        style={{
          backgroundColor: link.color || '#334155',
        }}
      >
        {/* Icon */}
        {Icon && <Icon className="w-5 h-5 text-white flex-shrink-0" />}

        {/* Title */}
        <span className="text-white font-medium text-base">
          {link.title}
        </span>
      </div>
    </a>
  );
}
