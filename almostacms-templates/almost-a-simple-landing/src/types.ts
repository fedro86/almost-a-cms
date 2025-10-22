export interface HeroData {
  headline: string
  subheadline: string
  ctaPrimary: {
    text: string
    url: string
  }
  ctaSecondary: {
    text: string
    url: string
  }
}

export interface Feature {
  id: string
  emoji: string
  title: string
  description: string
}

export interface FeaturesData {
  sectionTitle: string
  features: Feature[]
}

export interface CTAData {
  headline: string
  subheadline: string
  buttonText: string
  buttonUrl: string
}
