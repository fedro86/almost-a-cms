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

export interface Step {
  number: number
  icon: string
  title: string
  description: string
}

export interface HowItWorksData {
  sectionTitle: string
  sectionSubtitle: string
  steps: Step[]
}

export interface ShowcaseSite {
  id: string
  name: string
  creator: string
  url: string
  screenshot: string
  template: string
  featured: boolean
}

export interface ShowcaseData {
  sectionTitle: string
  sectionSubtitle: string
  sites: ShowcaseSite[]
}

export interface GitHubStats {
  stars: number
  forks: number
  contributors: number
  lastUpdated: string
}

export interface CallToAction {
  icon: string
  text: string
  url: string
}

export interface OpenSourceData {
  sectionTitle: string
  sectionSubtitle: string
  githubUrl: string
  stats: GitHubStats
  callsToAction: CallToAction[]
}

export interface DonationOption {
  id: string
  emoji: string
  text: string
  amount: number
  url: string
}

export interface FundedFeature {
  id: string
  title: string
  description: string
  fundedAmount: number
  goalAmount: number
  contributors: number
  status: string
  priority: string
  url: string
}

export interface SupportData {
  sectionTitle: string
  sectionSubtitle: string
  donations: {
    title: string
    subtitle: string
    options: DonationOption[]
    monthlySupport: {
      emoji: string
      text: string
      amount: number
      url: string
    }
  }
  featureFunding: {
    title: string
    subtitle: string
    platformUrl: string
    topFeatures: FundedFeature[]
    viewAllUrl: string
  }
}

export interface Question {
  id: string
  question: string
  answer: string
}

export interface FAQData {
  sectionTitle: string
  sectionSubtitle: string
  questions: Question[]
}

export interface CTAData {
  headline: string
  subheadline: string
  buttonText: string
  buttonUrl: string
}
