import type { Profile as ProfileType } from '../types';

interface ProfileProps {
  profile: ProfileType;
}

export function Profile({ profile }: ProfileProps) {
  return (
    <div className="text-center mb-8 animate-fade-in">
      {/* Avatar */}
      <div className="relative inline-block mb-4">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-24 h-24 rounded-full object-cover shadow-md"
        />
      </div>

      {/* Name */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {profile.name}
      </h1>

      {/* Title */}
      <p className="text-base text-gray-600">
        {profile.title}
      </p>
    </div>
  );
}
