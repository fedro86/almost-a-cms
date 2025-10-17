# Landing Page Template Specification

**Purpose:** Define the structure, sections, and data schema for the AlmostaCMS landing page template

**Date:** October 2025

---

## Page Structure

The landing page consists of **8 main sections:**

### 1. Hero Section
**Purpose:** Grab attention, communicate value proposition

**Elements:**
- Headline (main value proposition)
- Subheadline (supporting text)
- Primary CTA button ("Create Your Website")
- Secondary CTA button ("See Examples")
- Hero image/screenshot
- Optional: Background pattern/gradient

**Example:**
```
Headline: "Beautiful websites, built with GitHub"
Subheadline: "Create and edit your website in minutes, host it for free forever"
CTA Primary: "Create Your Website Free →"
CTA Secondary: "See How It Works ↓"
Hero Image: Screenshot of a beautiful portfolio
```

---

### 2. Features Section
**Purpose:** Show key benefits

**Elements:**
- Section title ("Why AlmostaCMS?")
- 3-6 feature cards, each with:
  - Icon
  - Title
  - Description

**Example Features:**
1. **Free Forever** - No hosting costs, no hidden fees
2. **Visual Editor** - Edit content with beautiful forms
3. **Own Your Data** - Everything lives in your GitHub repo
4. **Modern Stack** - Built with React, not WordPress
5. **Version Control** - Git-powered, automatic backups
6. **Open Source** - MIT licensed, community-driven

---

### 3. How It Works Section
**Purpose:** Show the simple 3-step process

**Elements:**
- Section title ("Get Started in 60 Seconds")
- 3 steps, each with:
  - Step number (1, 2, 3)
  - Icon or illustration
  - Title
  - Description

**Example Steps:**
1. **Login with GitHub** - Secure OAuth authentication
2. **Choose Template** - Personal website or landing page
3. **Start Editing** - Your site is live with built-in CMS

---

### 4. Showcase Section
**Purpose:** Social proof - show real sites built with AlmostaCMS

**Elements:**
- Section title ("Built with AlmostaCMS")
- Grid of site previews (3-6 sites)
- Each preview shows:
  - Screenshot thumbnail
  - Site name
  - Creator name
  - Link to live site

---

### 5. Open Source Section
**Purpose:** Show it's free, open source, and community-driven

**Elements:**
- Section title ("Free & Open Source Forever")
- Subheadline ("MIT Licensed, community-driven development")
- GitHub stats (stars, forks, contributors)
- Link to GitHub repository
- Call to contribute

**Example:**
```
🌟 Star us on GitHub
🔧 Contribute code
📖 Improve documentation
💡 Request features
```

---

### 6. Support Development Section ⭐ NEW
**Purpose:** Show ways to support the project (donations + feature funding)

**Elements:**
- Section title ("Support AlmostaCMS")
- Subheadline ("Help us build the features you want")

**Two columns:**

**Left Column - Donations:**
- "Buy Me a Coffee" ☕ ($5)
- "Buy Me a Beer" 🍺 ($10)
- "Sponsor Monthly" ❤️ ($5/month)
- Link to GitHub Sponsors / Ko-fi

**Right Column - Feature Funding:**
- "Fund Features You Want" 🎯
- List of top 3 requested features with:
  - Feature name
  - Progress bar ($ funded / $ goal)
  - Contributor count
  - "Contribute" button
- Link to full feature board

**Example:**
```
┌─────────────────────────────────────────┐
│  💝 One-Time Support                    │
│  ☕ $5  |  🍺 $10  |  ❤️ $5/month        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🎯 Fund Features You Want              │
│                                         │
│  Custom Domain Wizard                   │
│  ████████░░ 80% funded ($400/$500)      │
│  23 contributors                        │
│                                         │
│  Advanced Analytics                     │
│  ████░░░░░░ 40% funded ($200/$500)      │
│  12 contributors                        │
│                                         │
│  [View All Feature Requests →]          │
└─────────────────────────────────────────┘
```

---

### 7. FAQ Section
**Purpose:** Answer common questions, reduce friction

**Elements:**
- Section title ("Frequently Asked Questions")
- 5-8 Q&A pairs (accordion style)

**Example Questions:**
- Is it really free?
- Do I need to know how to code?
- Can I use my own domain?
- What if I want to switch to another platform?
- How do I update my content?
- Is my data secure?
- How does feature funding work?

---

### 8. CTA Footer Section
**Purpose:** Final conversion push

**Elements:**
- Headline ("Ready to create your website?")
- Subheadline (reinforcement)
- Large CTA button
- Social proof (e.g., "Join 1,000+ happy users")
- Footer links (About, Docs, GitHub, Twitter)

---

## Data Schema

All content stored in JSON files in `data/` folder:

### `data/hero.json`
```json
{
  "headline": "Beautiful websites, built with GitHub",
  "subheadline": "Create and edit your website in minutes, host it for free forever",
  "ctaPrimary": {
    "text": "Create Your Website Free",
    "url": "/create",
    "icon": "rocket"
  },
  "ctaSecondary": {
    "text": "See How It Works",
    "url": "#how-it-works",
    "icon": "arrow-down"
  },
  "heroImage": "./assets/images/hero-screenshot.png",
  "backgroundStyle": "gradient"
}
```

### `data/features.json`
```json
{
  "sectionTitle": "Why AlmostaCMS?",
  "sectionSubtitle": "Everything you need to create a professional website",
  "features": [
    {
      "id": "free",
      "icon": "currency-dollar",
      "title": "Free Forever",
      "description": "No hosting costs, no hidden fees. GitHub Pages hosting included."
    },
    {
      "id": "visual-editor",
      "icon": "pencil",
      "title": "Visual Editor",
      "description": "Edit your content with beautiful forms. No coding required."
    },
    {
      "id": "own-data",
      "icon": "lock-closed",
      "title": "You Own Your Data",
      "description": "Everything lives in your GitHub repository. Export anytime."
    },
    {
      "id": "modern",
      "icon": "sparkles",
      "title": "Modern Stack",
      "description": "Built with React and TypeScript, not outdated PHP."
    },
    {
      "id": "version-control",
      "icon": "clock",
      "title": "Version Control",
      "description": "Git-powered. See every change, rollback anytime."
    },
    {
      "id": "open-source",
      "icon": "code-bracket",
      "title": "Open Source",
      "description": "MIT licensed. Transparent, community-driven development."
    }
  ]
}
```

### `data/howItWorks.json`
```json
{
  "sectionTitle": "Get Started in 60 Seconds",
  "sectionSubtitle": "Three simple steps to your new website",
  "steps": [
    {
      "number": 1,
      "icon": "user-circle",
      "title": "Login with GitHub",
      "description": "Secure OAuth authentication. No passwords to remember.",
      "illustration": "./assets/images/step-1.svg"
    },
    {
      "number": 2,
      "icon": "template",
      "title": "Choose Your Template",
      "description": "Personal website or landing page. More templates coming soon.",
      "illustration": "./assets/images/step-2.svg"
    },
    {
      "number": 3,
      "icon": "pencil-square",
      "title": "Start Editing",
      "description": "Your site is live! Edit anytime with the built-in CMS.",
      "illustration": "./assets/images/step-3.svg"
    }
  ]
}
```

### `data/showcase.json`
```json
{
  "sectionTitle": "Built with AlmostaCMS",
  "sectionSubtitle": "Real websites created by our users",
  "sites": [
    {
      "id": "almostacms",
      "name": "AlmostaCMS",
      "creator": "AlmostaCMS Team",
      "url": "https://almostacms.com",
      "screenshot": "./assets/images/showcase/almostacms.png",
      "template": "landing-page",
      "featured": true
    },
    {
      "id": "federico-portfolio",
      "name": "Federico Conticello",
      "creator": "Federico Conticello",
      "url": "https://federicoconticello.com/my-portfolio-test",
      "screenshot": "./assets/images/showcase/federico.png",
      "template": "personal-website",
      "featured": true
    }
  ]
}
```

### `data/openSource.json`
```json
{
  "sectionTitle": "Free & Open Source Forever",
  "sectionSubtitle": "MIT Licensed, community-driven development",
  "githubUrl": "https://github.com/almostacms/almostacms",
  "stats": {
    "stars": 1234,
    "forks": 89,
    "contributors": 23,
    "lastUpdated": "2025-10-17"
  },
  "callsToAction": [
    {
      "icon": "star",
      "text": "Star us on GitHub",
      "url": "https://github.com/almostacms/almostacms"
    },
    {
      "icon": "code-bracket",
      "text": "Contribute code",
      "url": "https://github.com/almostacms/almostacms/contribute"
    },
    {
      "icon": "book-open",
      "text": "Improve documentation",
      "url": "https://github.com/almostacms/almostacms/docs"
    },
    {
      "icon": "light-bulb",
      "text": "Request features",
      "url": "https://github.com/almostacms/almostacms/issues/new"
    }
  ]
}
```

### `data/support.json` ⭐ NEW
```json
{
  "sectionTitle": "Support AlmostaCMS",
  "sectionSubtitle": "Help us build the features you want",
  "donations": {
    "title": "One-Time Support",
    "subtitle": "Buy me a coffee to keep the project going",
    "options": [
      {
        "id": "coffee",
        "emoji": "☕",
        "text": "Buy Me a Coffee",
        "amount": 5,
        "url": "https://ko-fi.com/almostacms"
      },
      {
        "id": "beer",
        "emoji": "🍺",
        "text": "Buy Me a Beer",
        "amount": 10,
        "url": "https://ko-fi.com/almostacms"
      },
      {
        "id": "meal",
        "emoji": "🍕",
        "text": "Buy Me a Meal",
        "amount": 20,
        "url": "https://ko-fi.com/almostacms"
      }
    ],
    "monthlySupport": {
      "emoji": "❤️",
      "text": "Sponsor Monthly",
      "amount": 5,
      "url": "https://github.com/sponsors/almostacms"
    }
  },
  "featureFunding": {
    "title": "Fund Features You Want",
    "subtitle": "Vote with your wallet - features get built when funded",
    "platformUrl": "https://polar.sh/almostacms",
    "topFeatures": [
      {
        "id": "custom-domain-wizard",
        "title": "Custom Domain Wizard",
        "description": "Step-by-step guide to connect your own domain",
        "fundedAmount": 400,
        "goalAmount": 500,
        "contributors": 23,
        "status": "in-progress",
        "priority": "high",
        "url": "https://polar.sh/almostacms/issues/1"
      },
      {
        "id": "advanced-analytics",
        "title": "Advanced Analytics",
        "description": "Page views, visitors, referrers, and more",
        "fundedAmount": 200,
        "goalAmount": 500,
        "contributors": 12,
        "status": "funded-30",
        "priority": "medium",
        "url": "https://polar.sh/almostacms/issues/2"
      },
      {
        "id": "contact-form",
        "title": "Contact Form Integration",
        "description": "Receive submissions via email (no backend needed)",
        "fundedAmount": 150,
        "goalAmount": 300,
        "contributors": 18,
        "status": "funded-50",
        "priority": "high",
        "url": "https://polar.sh/almostacms/issues/3"
      }
    ],
    "viewAllUrl": "https://polar.sh/almostacms/issues"
  },
  "transparency": {
    "text": "All funds go directly to development. Track spending on Open Collective.",
    "url": "https://opencollective.com/almostacms"
  }
}
```

### `data/faq.json`
```json
{
  "sectionTitle": "Frequently Asked Questions",
  "sectionSubtitle": "Everything you need to know about AlmostaCMS",
  "questions": [
    {
      "id": "really-free",
      "question": "Is it really free?",
      "answer": "Yes! AlmostaCMS is completely free and open source (MIT License). We use GitHub Pages for hosting, which is free for public repositories. There are no hidden costs, no credit card required. The project is supported by optional donations and feature funding from the community."
    },
    {
      "id": "need-coding",
      "question": "Do I need to know how to code?",
      "answer": "No! AlmostaCMS has a visual editor for all content. You edit your website through beautiful forms, just like any other CMS. The only time you'd touch code is if you want to customize the design (which is optional)."
    },
    {
      "id": "custom-domain",
      "question": "Can I use my own domain name?",
      "answer": "Yes! GitHub Pages supports custom domains. You can connect your own domain (e.g., www.yourname.com) to your AlmostaCMS site. We're working on a setup wizard to make this even easier (check the feature funding section to support it!)."
    },
    {
      "id": "switch-platforms",
      "question": "What if I want to switch to another platform?",
      "answer": "No lock-in! Your website lives in your own GitHub repository. You can download all your content anytime, or connect it to any other platform. You truly own your data."
    },
    {
      "id": "update-content",
      "question": "How do I update my content?",
      "answer": "Just visit yoursite.com/admin, login with GitHub, and edit your content through our visual forms. Changes are saved to your GitHub repository and your site rebuilds automatically in about 30 seconds."
    },
    {
      "id": "data-secure",
      "question": "Is my data secure?",
      "answer": "Very secure! Your content is stored in your GitHub repository with enterprise-grade security. We use GitHub OAuth for authentication - we never see your password. You control all the permissions."
    },
    {
      "id": "feature-funding",
      "question": "How does feature funding work?",
      "answer": "You can contribute to specific features you want built. When a feature reaches its funding goal, I prioritize building it. You can see progress updates and the feature gets released to everyone (it's open source!). Think of it as Kickstarter for features."
    },
    {
      "id": "github-required",
      "question": "Do I need a GitHub account?",
      "answer": "Yes, you need a free GitHub account. Don't have one? It takes 30 seconds to create at github.com. GitHub is used by over 100 million developers worldwide and is completely free for personal use."
    },
    {
      "id": "support",
      "question": "What kind of support do you offer?",
      "answer": "Community support is available through our GitHub Discussions and comprehensive documentation. We also have video tutorials and a knowledge base. Feature funders get updates on their requested features."
    },
    {
      "id": "open-source",
      "question": "Is AlmostaCMS really open source?",
      "answer": "Absolutely! MIT License. You can view all the code, contribute improvements, fork it for your own use, or even use it commercially. The entire project is transparent and community-driven."
    }
  ]
}
```

### `data/footer.json`
```json
{
  "headline": "Ready to create your website?",
  "subheadline": "Join hundreds of creators building with AlmostaCMS",
  "cta": {
    "text": "Create Your Website Free",
    "url": "/create",
    "icon": "rocket"
  },
  "socialProof": "100% free & open source",
  "links": {
    "product": [
      { "text": "Features", "url": "#features" },
      { "text": "How It Works", "url": "#how-it-works" },
      { "text": "Showcase", "url": "#showcase" },
      { "text": "Templates", "url": "/templates" }
    ],
    "resources": [
      { "text": "Documentation", "url": "/docs" },
      { "text": "GitHub", "url": "https://github.com/almostacms" },
      { "text": "Blog", "url": "/blog" },
      { "text": "FAQ", "url": "#faq" }
    ],
    "community": [
      { "text": "Support Development", "url": "#support" },
      { "text": "Feature Requests", "url": "https://polar.sh/almostacms" },
      { "text": "Discussions", "url": "https://github.com/almostacms/discussions" },
      { "text": "Contributing", "url": "https://github.com/almostacms/contributing" }
    ]
  },
  "social": [
    { "platform": "github", "url": "https://github.com/almostacms", "icon": "logo-github" },
    { "platform": "twitter", "url": "https://twitter.com/almostacms", "icon": "logo-twitter" },
    { "platform": "discord", "url": "https://discord.gg/almostacms", "icon": "logo-discord" }
  ],
  "copyright": "© 2025 AlmostaCMS. Built with AlmostaCMS.",
  "license": "MIT License - Free & Open Source",
  "builtWith": {
    "show": true,
    "text": "Built with AlmostaCMS",
    "url": "https://almostacms.com"
  }
}
```

---

## Component Structure

### Public View Components

```
src/views/Public/
├── LandingPage.tsx           # Main container
├── sections/
│   ├── HeroSection.tsx       # Hero with headline, CTA
│   ├── FeaturesSection.tsx   # Features grid
│   ├── HowItWorksSection.tsx # 3-step process
│   ├── ShowcaseSection.tsx   # Sites gallery
│   ├── OpenSourceSection.tsx # GitHub stats, contribute
│   ├── SupportSection.tsx    # ⭐ Donations + feature funding
│   ├── FAQSection.tsx        # Accordion Q&A
│   └── FooterSection.tsx     # CTA + footer links
└── components/
    ├── FeatureCard.tsx       # Single feature
    ├── StepCard.tsx          # Single step
    ├── ShowcaseCard.tsx      # Site preview card
    ├── DonationButton.tsx    # ⭐ Donation option
    ├── FeatureFundingCard.tsx # ⭐ Feature with progress
    └── FAQItem.tsx           # Single Q&A accordion
```

### Admin View Components

```
src/views/Admin/
├── Dashboard.tsx             # Admin home
├── ContentEditor.tsx         # Section selector
├── SupportSettings.tsx       # ⭐ Configure donation links
└── forms/
    ├── HeroForm.tsx          # Edit hero section
    ├── FeaturesForm.tsx      # Edit features
    ├── HowItWorksForm.tsx    # Edit steps
    ├── ShowcaseForm.tsx      # Edit showcase
    ├── OpenSourceForm.tsx    # Edit open source section
    ├── SupportForm.tsx       # ⭐ Edit support section
    ├── FAQForm.tsx           # Edit FAQ
    └── FooterForm.tsx        # Edit footer
```

---

## Admin Panel - Support Configuration ⭐

### In the Admin Dashboard

New section: **"Support Development"**

**Location:** `yoursite.com/admin/support`

**Features:**

1. **Configure Donation Links**
   - Set Ko-fi/GitHub Sponsors URL
   - Enable/disable donation buttons
   - Customize donation amounts

2. **Feature Funding Integration**
   - Connect to Polar.sh / IssueHunt
   - Display top funded features
   - Track funding progress
   - Show contributor counts

3. **Transparency Dashboard**
   - Show total donations received
   - List funded features
   - Display spending (if using Open Collective)

**Form Fields:**
```json
{
  "donationsEnabled": true,
  "kofiUrl": "https://ko-fi.com/yourname",
  "githubSponsorsUrl": "https://github.com/sponsors/yourname",
  "featureFundingEnabled": true,
  "featureFundingPlatform": "polar.sh",
  "featureFundingUrl": "https://polar.sh/yourname",
  "transparencyEnabled": true,
  "openCollectiveUrl": "https://opencollective.com/yourname"
}
```

---

## Routing Structure

```
/ (public)
  ├── /                       → LandingPage (public view)
  ├── /showcase               → Full showcase gallery
  ├── /docs                   → Documentation
  ├── /support                → ⭐ Support page (donations + features)
  └── /create                 → Website creation flow

/admin (authenticated)
  ├── /admin                  → Dashboard
  ├── /admin/edit/hero        → Edit hero section
  ├── /admin/edit/features    → Edit features
  ├── /admin/edit/how-it-works → Edit steps
  ├── /admin/edit/showcase    → Edit showcase
  ├── /admin/edit/open-source → Edit open source section
  ├── /admin/edit/support     → ⭐ Edit support section
  ├── /admin/edit/faq         → Edit FAQ
  └── /admin/settings         → Site settings
```

---

## Design System

### Colors

**Primary Palette:**
- Primary: `#3B82F6` (Blue) - CTAs, links
- Secondary: `#10B981` (Green) - Success, positive
- Accent: `#8B5CF6` (Purple) - Highlights
- Warning: `#F59E0B` (Amber) - Feature funding progress

**Neutrals:**
- Gray 50-900 (Tailwind default)
- White: `#FFFFFF`
- Black: `#000000`

### Typography

**Fonts:**
- Headings: `Inter`, sans-serif (bold, 600-800)
- Body: `Inter`, sans-serif (regular, 400-500)
- Code: `Fira Code`, monospace

**Sizes:**
- H1: `text-5xl` (48px) - Hero headline
- H2: `text-4xl` (36px) - Section titles
- H3: `text-2xl` (24px) - Card titles
- Body: `text-lg` (18px) - Descriptions
- Small: `text-sm` (14px) - Captions

### Spacing

- Section padding: `py-20` (80px top/bottom)
- Container max-width: `max-w-7xl`
- Card spacing: `gap-8` (32px)

---

## Platform Integration

### Recommended Services

**For Donations:**
- ✅ **Ko-fi** - Simple, no fees on donations
- ✅ **GitHub Sponsors** - Monthly subscriptions, integrated
- ✅ **Buy Me a Coffee** - Popular, friendly

**For Feature Funding:**
- ✅ **Polar.sh** - Built for open source, GitHub integration
- ✅ **IssueHunt** - Bounties tied to GitHub issues
- 🔄 **Custom solution** - Build your own (future)

**For Transparency:**
- ✅ **Open Collective** - Shows all income/expenses
- ✅ **GitHub Sponsors Dashboard** - Public funding page

---

## Monetization Philosophy

### Core Principles

1. **Always Free** - Core product is 100% free forever
2. **Open Source** - MIT License, all code visible
3. **No Ads** - Never interrupt the user experience
4. **Optional Support** - Donations are appreciated, not required
5. **Feature Funding** - Users vote with their wallet
6. **Transparent** - Show where money goes
7. **Community First** - Users guide development

### What Gets Built

**Priority:**
1. ⭐ Fully funded features (goal reached)
2. 🔥 High votes + partial funding
3. 💡 Creator's priority (announced in advance)
4. 🐛 Bug fixes (always free, always priority)

**Commitment:**
- Once funded, feature WILL be built
- ETA provided when funding completes
- Regular progress updates
- Released to everyone (open source!)

---

## Next Steps

1. ✅ Document landing page structure
2. ✅ Define data schema with support section
3. [ ] Create the JSON data files
4. [ ] Build public view components
5. [ ] Build admin CMS forms
6. [ ] Integrate donation/funding APIs
7. [ ] Set up routing
8. [ ] Test complete flow
9. [ ] Deploy to almostacms.com

---

**Let's build this together!** 🚀💝
