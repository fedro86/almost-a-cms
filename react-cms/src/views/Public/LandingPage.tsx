import React from 'react';
import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { HowItWorksSection } from './sections/HowItWorksSection';
import { ShowcaseSection } from './sections/ShowcaseSection';
import { OpenSourceSection } from './sections/OpenSourceSection';
import { SupportSection } from './sections/SupportSection';
import { FAQSection } from './sections/FAQSection';
import { FooterSection } from './sections/FooterSection';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ShowcaseSection />
      <OpenSourceSection />
      <SupportSection />
      <FAQSection />
      <FooterSection />
    </div>
  );
};
