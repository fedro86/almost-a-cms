/**
 * Section Registry
 *
 * Master catalog of all available section types for AlmostaCMS templates.
 * Each section type defines its metadata, editor component, and schema.
 */

export interface SectionDefinition {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  editor: () => Promise<any>;
  schema?: any;
  example?: any;
}

export interface SectionCategory {
  name: string;
  description: string;
}

/**
 * Section Registry
 * All available section types that templates can use
 */
export const SECTION_REGISTRY: Record<string, SectionDefinition> = {
  // ═══════════════════════════════════════════════════════════
  // Link-in-Bio Sections
  // ═══════════════════════════════════════════════════════════

  profile: {
    id: 'profile',
    name: 'Profile',
    icon: '👤',
    category: 'link-in-bio',
    description: 'Personal information, avatar, and bio',
    editor: () => import('./editors/ProfileEditor'),
    example: {
      name: "Your Name",
      avatar: "./assets/images/avatar.svg",
      title: "Your Title",
      bio: "A short bio about yourself"
    }
  },

  links: {
    id: 'links',
    name: 'Links',
    icon: '🔗',
    category: 'link-in-bio',
    description: 'List of external link buttons',
    editor: () => import('./editors/LinksEditor'),
    example: {
      links: [
        {
          title: "My Website",
          url: "https://example.com",
          icon: "globe",
          featured: true
        }
      ]
    }
  },

  social: {
    id: 'social',
    name: 'Social Media',
    icon: '📱',
    category: 'link-in-bio',
    description: 'Social media icon links',
    editor: () => import('./editors/SocialEditor'),
    example: {
      platforms: [
        { platform: "github", url: "https://github.com/username" },
        { platform: "twitter", url: "https://twitter.com/username" },
        { platform: "linkedin", url: "https://linkedin.com/in/username" }
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════
  // Landing Page Sections
  // ═══════════════════════════════════════════════════════════

  hero: {
    id: 'hero',
    name: 'Hero',
    icon: '🚀',
    category: 'landing-page',
    description: 'Main headline with CTA buttons',
    editor: () => import('./editors/HeroEditor'),
    example: {
      headline: "Beautiful websites, built with GitHub",
      subheadline: "Create and edit your website in minutes",
      cta: {
        primary: { text: "Get Started Free", url: "/signup" },
        secondary: { text: "See Examples", url: "#examples" }
      },
      heroImage: "./assets/images/hero.png"
    }
  },

  features: {
    id: 'features',
    name: 'Features',
    icon: '⭐',
    category: 'landing-page',
    description: 'Feature grid with icons and descriptions',
    editor: () => import('./editors/FeaturesEditor'),
    example: {
      sectionTitle: "Why Choose Us?",
      sectionSubtitle: "Everything you need",
      features: [
        {
          id: "free",
          icon: "currency-dollar",
          title: "Free Forever",
          description: "No hosting costs, no hidden fees"
        }
      ]
    }
  },

  cta: {
    id: 'cta',
    name: 'Call to Action',
    icon: '📣',
    category: 'landing-page',
    description: 'Final conversion section',
    editor: () => import('./editors/CTAEditor'),
    example: {
      headline: "Ready to get started?",
      subheadline: "Join thousands of users today",
      cta: {
        text: "Create Your Website Free",
        url: "/signup"
      },
      socialProof: "100% free & open source"
    }
  },

  howItWorks: {
    id: 'howItWorks',
    name: 'How It Works',
    icon: '🔢',
    category: 'landing-page',
    description: 'Step-by-step process guide',
    editor: () => import('./editors/GenericEditor'),
    example: {
      sectionTitle: "Get Started in 60 Seconds",
      sectionSubtitle: "Three simple steps to your new website",
      steps: [
        {
          number: 1,
          icon: "👤",
          title: "Login with GitHub",
          description: "Secure OAuth authentication. No passwords to remember."
        }
      ]
    }
  },

  showcase: {
    id: 'showcase',
    name: 'Showcase',
    icon: '🎨',
    category: 'landing-page',
    description: 'Gallery of sites or projects',
    editor: () => import('./editors/GenericEditor'),
    example: {
      sectionTitle: "Built with AlmostaCMS",
      sectionSubtitle: "Real websites created by our users",
      sites: [
        {
          id: "example",
          name: "Example Site",
          creator: "User Name",
          url: "https://example.com",
          screenshot: "",
          template: "landing-page",
          featured: true
        }
      ]
    }
  },

  openSource: {
    id: 'openSource',
    name: 'Open Source',
    icon: '🔓',
    category: 'landing-page',
    description: 'GitHub stats and contribution info',
    editor: () => import('./editors/GenericEditor'),
    example: {
      sectionTitle: "Free & Open Source Forever",
      sectionSubtitle: "MIT Licensed, community-driven development",
      githubUrl: "https://github.com/almostacms/almostacms",
      stats: {
        stars: 0,
        forks: 0,
        contributors: 1,
        lastUpdated: "2025-10-28"
      },
      callsToAction: [
        {
          icon: "⭐",
          text: "Star on GitHub",
          url: "https://github.com/almostacms/almostacms"
        }
      ]
    }
  },

  support: {
    id: 'support',
    name: 'Support',
    icon: '💝',
    category: 'landing-page',
    description: 'Donations and feature funding',
    editor: () => import('./editors/GenericEditor'),
    example: {
      sectionTitle: "Support AlmostaCMS",
      sectionSubtitle: "Help us build the features you want",
      donations: {
        title: "One-Time Support",
        subtitle: "Buy me a coffee to keep the project going",
        options: [
          {
            id: "coffee",
            emoji: "☕",
            text: "Coffee",
            amount: 5,
            url: "#"
          }
        ],
        monthlySupport: {
          emoji: "❤️",
          text: "Sponsor Monthly",
          amount: 5,
          url: "#"
        }
      },
      featureFunding: {
        title: "Fund Features You Want",
        subtitle: "Vote with your wallet - features get built when funded",
        platformUrl: "#",
        topFeatures: [],
        viewAllUrl: "#"
      }
    }
  },

  faq: {
    id: 'faq',
    name: 'FAQ',
    icon: '❓',
    category: 'landing-page',
    description: 'Frequently asked questions accordion',
    editor: () => import('./editors/GenericEditor'),
    example: {
      sectionTitle: "Frequently Asked Questions",
      sectionSubtitle: "Everything you need to know",
      questions: [
        {
          id: "q1",
          question: "Is it really free?",
          answer: "Yes! Completely free and open source."
        }
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════
  // Shared/Universal Sections
  // ═══════════════════════════════════════════════════════════

  theme: {
    id: 'theme',
    name: 'Theme Settings',
    icon: '🎨',
    category: 'shared',
    description: 'Colors, fonts, and styling options',
    editor: () => import('./editors/ThemeEditor'),
    example: {
      primaryColor: "#3B82F6",
      backgroundColor: "#FFFFFF",
      textColor: "#1F2937",
      font: "Inter",
      borderRadius: "rounded-lg"
    }
  },

  footer: {
    id: 'footer',
    name: 'Footer',
    icon: '📄',
    category: 'shared',
    description: 'Footer with links and copyright',
    editor: () => import('./editors/FooterEditor'),
    example: {
      copyright: "© 2025 Your Name",
      links: [
        { text: "Privacy Policy", url: "/privacy" },
        { text: "Terms of Service", url: "/terms" }
      ],
      social: [
        { platform: "github", url: "https://github.com/..." }
      ]
    }
  },

  navbar: {
    id: 'navbar',
    name: 'Navigation Bar',
    icon: '🧭',
    category: 'shared',
    description: 'Top navigation menu',
    editor: () => import('./editors/NavbarEditor'),
    example: {
      logo: "./assets/images/logo.png",
      brandName: "Your Brand",
      links: [
        { text: "Home", url: "/" },
        { text: "About", url: "/about" },
        { text: "Contact", url: "/contact" }
      ]
    }
  },

  settings: {
    id: 'settings',
    name: 'Site Settings',
    icon: '⚙️',
    category: 'shared',
    description: 'General site configuration',
    editor: () => import('./editors/SettingsEditor'),
    example: {
      siteName: "My Website",
      siteDescription: "A beautiful website built with AlmostaCMS",
      favicon: "./assets/favicon.ico",
      language: "en",
      analytics: {
        enabled: false,
        googleAnalyticsId: ""
      }
    }
  }
};

/**
 * Section Categories
 * Organize sections by their primary use case
 */
export const SECTION_CATEGORIES: Record<string, SectionCategory> = {
  'link-in-bio': {
    name: 'Link-in-Bio',
    description: 'Sections for link-in-bio style templates (Linktree-like)'
  },
  'landing-page': {
    name: 'Landing Page',
    description: 'Sections for marketing landing pages and product pages'
  },
  'portfolio': {
    name: 'Portfolio',
    description: 'Sections for portfolio and showcase websites'
  },
  'blog': {
    name: 'Blog',
    description: 'Sections for blog and content-focused websites'
  },
  'shared': {
    name: 'Shared',
    description: 'Universal sections usable across all template types'
  }
};

/**
 * Get section definition by ID
 */
export function getSection(id: string): SectionDefinition | undefined {
  return SECTION_REGISTRY[id];
}

/**
 * Get all sections in a category
 */
export function getSectionsByCategory(category: string): SectionDefinition[] {
  return Object.values(SECTION_REGISTRY).filter(
    section => section.category === category
  );
}

/**
 * Get all available section IDs
 */
export function getAllSectionIds(): string[] {
  return Object.keys(SECTION_REGISTRY);
}

/**
 * Check if a section ID exists in the registry
 */
export function isSectionRegistered(id: string): boolean {
  return id in SECTION_REGISTRY;
}
