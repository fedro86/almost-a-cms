import React from 'react';
import {
  UserIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  RectangleStackIcon,
  PencilSquareIcon,
  Bars3Icon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { ContentFile } from '../types';

interface ContentCardProps {
  file: ContentFile;
  onClick: () => void;
}

const iconMap = {
  about: UserIcon,
  resume: BriefcaseIcon,
  contact: ChatBubbleLeftRightIcon,
  portfolio: RectangleStackIcon,
  blog: PencilSquareIcon,
  navbar: Bars3Icon,
  sidebar: Bars3Icon,
};

export const ContentCard: React.FC<ContentCardProps> = ({ file, onClick }) => {
  const IconComponent = iconMap[file.name as keyof typeof iconMap] || UserIcon;

  return (
    <div
      className="card hover:shadow-md transition-all duration-200 cursor-pointer group hover:border-primary-200"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="bg-primary-50 p-3 rounded-lg group-hover:bg-primary-100 transition-colors duration-200">
            <IconComponent className="h-6 w-6 text-primary-600" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors duration-200">
              {file.displayName}
            </h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {file.description}
            </p>
            <div className="mt-2 flex items-center text-xs text-gray-400">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {file.name}.json
              </span>
            </div>
          </div>
        </div>

        <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
      </div>
    </div>
  );
};