import React from 'react';
import { HeroSection } from './sections/HeroSection';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />

      {/* Other sections will be added here */}
    </div>
  );
};
