export interface Profile {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  verified?: boolean;
}

export interface Link {
  id: string;
  title: string;
  description?: string;
  url: string;
  icon: string;
  color?: string;
  featured?: boolean;
}

export interface LinksData {
  links: Link[];
}

export interface SocialPlatform {
  name: string;
  url: string;
  icon: string;
}

export interface SocialData {
  platforms: SocialPlatform[];
}

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  gradients: {
    background: string;
    card: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  borderRadius: string;
  animations: {
    enabled: boolean;
    duration: string;
  };
  layout: {
    maxWidth: string;
    cardSpacing: string;
    containerPadding: string;
  };
}

export interface Settings {
  siteTitle: string;
  seo: {
    description: string;
    keywords: string;
    ogImage: string;
  };
  analytics: {
    enabled: boolean;
    googleAnalyticsId: string;
  };
  footer: {
    showPoweredBy: boolean;
    customText: string;
  };
}
