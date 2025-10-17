import React from 'react';
import { NavBar } from './sections/NavBar';
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
      <NavBar />
      <div className="pt-16"> {/* Add padding-top to account for fixed navbar */}
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ShowcaseSection />
        <OpenSourceSection />
        <SupportSection />
        <FAQSection />
        <FooterSection />
      </div>
    </div>
  );
};
