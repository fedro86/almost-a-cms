# AlmostaCMS - Product Vision

**Tagline:** *"Beautiful websites, built with GitHub, edited with ease"*

**Date:** October 2025
**Status:** Planning Phase
**Core Concept:** A free, serverless website builder powered by GitHub - that builds itself!

---

## The Big Idea

**AlmostaCMS is a website builder that creates two types of sites:**

1. **Personal Websites** - Portfolios, resumes, personal brands
2. **Landing Pages** - Products, services, startups, projects

**The meta-twist:** `almostacms.com` itself is a landing page **built with AlmostaCMS**! 🎭

Users visit almostacms.com → Click "Create Website" → Choose template → Get a beautiful site with built-in CMS.

---

## User Journey

```
1. Visit www.almostacms.com (landing page built WITH AlmostaCMS!)
   ↓
2. Click "Create Your Website"
   ↓
3. Login with GitHub (OAuth)
   ↓
4. Choose template:
   • Personal Website (portfolio/resume)
   • Landing Page (product/service)
   ↓
5. Choose name (e.g., "my-awesome-site")
   ↓
6. ✨ Magic happens (30 seconds)
   ↓
7. Website created at: username.github.io/my-awesome-site
   ↓
8. Edit anytime at: username.github.io/my-awesome-site/admin
```

---

## Template Types

### Template 1: Personal Website

**Sections:**
- Hero (name, title, photo)
- About (bio, skills, interests)
- Resume (experience, education, certifications)
- Portfolio (projects, case studies, galleries)
- Blog (articles, posts)
- Contact (form, social links, email)

**Perfect for:**
- Developers, designers, creatives
- Job seekers, freelancers
- Students, bootcamp grads
- Professionals building personal brand

---

### Template 2: Landing Page

**Sections:**
- Hero (headline, subheadline, CTA)
- Features (3-column grid with icons)
- How It Works (step-by-step)
- Pricing (tiers, comparison table)
- Testimonials (social proof)
- FAQ (accordion)
- CTA Footer (sign up, get started)

**Perfect for:**
- SaaS products, web apps
- Indie projects, side hustles
- Startups, MVPs
- Services, consultancies
- Event pages, campaigns

---

## The AlmostaCMS Platform

### Three Components

#### 1. **almostacms.com** (The Landing Page)

**Purpose:** Marketing site + website creation tool

**Built with:** AlmostaCMS itself (using the Landing Page template!)

**Sections:**
- Hero: "Beautiful websites, built with GitHub, edited with ease"
- Features: Free hosting, no database, visual CMS, version control
- How It Works: 3-step process (login → choose → edit)
- Pricing: Free forever (with optional premium)
- Showcase: Gallery of sites built with AlmostaCMS
- CTA: "Create Your Website Free"

**The Admin View:** `almostacms.com/admin`
- We edit our own landing page!
- Dogfooding at its finest
- Live demo for users to see

---

#### 2. **Template Repositories** (What Users Get)

Two starter templates:

**A) `almostacms/personal-website-template`**
- React app with personal website sections
- Built-in CMS at `/admin`
- JSON data storage
- GitHub Pages deployment

**B) `almostacms/landing-page-template`**
- React app with landing page sections
- Built-in CMS at `/admin`
- JSON data storage
- GitHub Pages deployment

**Common Features (Both Templates):**
```
user-site/
├── src/
│   ├── views/
│   │   ├── Public/          # What visitors see
│   │   └── Admin/           # CMS dashboard (owner only)
│   ├── components/          # Reusable components
│   ├── hooks/               # useAuth, useContent
│   └── services/            # github-api
│
├── data/                    # Content (JSON files)
├── public/assets/           # Images, files
├── .github/workflows/       # Auto-deployment
└── package.json
```

---

#### 3. **OAuth Proxy Server** (Shared Backend)

**Purpose:** Secure GitHub authentication for all sites

**Why:** React apps can't store OAuth secrets securely

**Tech:** Node.js + Express (minimal, ~50 lines)

**Hosted:** Render/Railway free tier

---

## Technical Architecture

### How It Works

```
User visits their site
    ↓
React app loads
    ↓
Reads JSON from /data folder
    ↓
Renders content dynamically
    ↓
Public view displayed
```

**When user clicks "Edit" or visits /admin:**

```
Redirects to GitHub OAuth
    ↓
Token exchange via proxy server
    ↓
Token stored in browser
    ↓
CMS dashboard unlocked
    ↓
User edits content in forms
    ↓
Saves → GitHub API commits JSON
    ↓
Webhook triggers GitHub Actions
    ↓
React app rebuilds
    ↓
Changes live in 30-60 seconds
```

---

## Content Management

### Data Structure (Personal Website Example)

**`data/hero.json`**
```json
{
  "name": "Federico Conticello",
  "title": "Innovation Engineer",
  "avatar": "./assets/images/avatar.png",
  "tagline": "Building the future, one line at a time"
}
```

**`data/about.json`**
```json
{
  "bio": "I'm a passionate engineer...",
  "skills": ["React", "Python", "AI/ML"],
  "interests": ["Open Source", "Robotics"]
}
```

**`data/projects.json`**
```json
{
  "projects": [
    {
      "title": "AlmostaCMS",
      "description": "Free website builder...",
      "image": "./assets/images/almostacms.png",
      "url": "https://almostacms.com",
      "tags": ["React", "GitHub API"]
    }
  ]
}
```

### Data Structure (Landing Page Example)

**`data/hero.json`**
```json
{
  "headline": "Beautiful websites, built with GitHub",
  "subheadline": "Create and edit your website in minutes, host it for free forever",
  "cta": {
    "primary": "Create Your Website",
    "secondary": "See Examples"
  },
  "heroImage": "./assets/images/hero-screenshot.png"
}
```

**`data/features.json`**
```json
{
  "features": [
    {
      "icon": "rocket",
      "title": "Lightning Fast Setup",
      "description": "From zero to live website in 60 seconds"
    },
    {
      "icon": "dollar",
      "title": "Completely Free",
      "description": "Free hosting, no hidden costs, no credit card"
    },
    {
      "icon": "edit",
      "title": "Visual Editor",
      "description": "Edit content with beautiful forms, no coding needed"
    }
  ]
}
```

---

## The CMS Interface

### Admin Dashboard (`/admin`)

**Sections:**
- **Content Editor:** Visual forms for each section
- **Media Library:** Upload/manage images
- **Settings:** Site configuration, custom domain
- **Preview:** See changes before publishing
- **Publish:** Commit changes to GitHub

**Authentication:**
- Only the repo owner can access `/admin`
- GitHub OAuth login required
- Token expires after session

---

## Deployment Pipeline

### GitHub Actions Workflow

```yaml
name: Deploy Website

on:
  push:
    branches: [main]
    paths:
      - 'data/**'
      - 'src/**'
      - 'public/**'

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: 'build/'
      - uses: actions/deploy-pages@v4
```

**Build Time:** ~30-60 seconds
**Deployment:** Automatic on every save

---

## Why AlmostaCMS is Revolutionary

### Problems We Solve

| Traditional CMS | AlmostaCMS |
|----------------|------------|
| ❌ Hosting costs ($10-30/mo) | ✅ Free forever (GitHub Pages) |
| ❌ Database required | ✅ JSON files (simple, portable) |
| ❌ Server maintenance | ✅ Serverless (no maintenance) |
| ❌ Vendor lock-in | ✅ You own the repo |
| ❌ Complex setup | ✅ One-click creation |
| ❌ Security updates | ✅ No backend to hack |
| ❌ Backup management | ✅ Git = automatic backups |
| ❌ Old tech (PHP) | ✅ Modern (React, TypeScript) |

---

## Business Model

### Free Tier (Forever)

**Included:**
- ✅ Unlimited websites
- ✅ Both templates (Personal + Landing)
- ✅ Full CMS features
- ✅ GitHub Pages hosting
- ✅ Community support

**Limitations:**
- GitHub Pages branding on subdomain
- Basic templates only
- Community support (GitHub Discussions)

### Premium Tier (Future)

**Price:** $5-10/month

**Features:**
- Premium templates (10+ designs)
- Custom domain setup wizard
- Advanced analytics
- Priority email support
- Remove "Powered by AlmostaCMS"
- Export to other platforms

---

## Development Roadmap

### Phase 1: Foundation (Current)
- [x] React CMS proof of concept
- [x] GitHub API integration
- [x] OAuth authentication
- [ ] Personal website template with public view
- [ ] Landing page template
- [ ] almostacms.com landing page (built with AlmostaCMS!)

### Phase 2: Creation Flow
- [ ] One-click website creation
- [ ] Template selection UI
- [ ] Repository creation automation
- [ ] GitHub Pages auto-configuration
- [ ] Onboarding wizard

### Phase 3: Enhancement
- [ ] Multiple design themes
- [ ] Image optimization
- [ ] SEO tools
- [ ] Form submissions (contact forms)
- [ ] Analytics integration
- [ ] Custom domain wizard

### Phase 4: Growth
- [ ] Template marketplace
- [ ] Plugin system
- [ ] Mobile app (editing on the go)
- [ ] Team collaboration features
- [ ] White-label option for agencies

---

## Target Users

### Primary Audience

1. **Developers/Engineers**
   - Portfolio to showcase projects
   - Value modern tech stack
   - Already use GitHub
   - Want free hosting

2. **Indie Makers/Founders**
   - Launch landing pages quickly
   - Test MVPs cheaply
   - Iterate fast
   - Bootstrap mentality

3. **Students/Learners**
   - First professional website
   - Limited budget (free!)
   - Learning web dev
   - Need simple setup

4. **Freelancers/Consultants**
   - Professional online presence
   - Regular content updates
   - Cost-conscious
   - Need reliability

---

## Marketing Strategy

### The Dogfooding Advantage

**almostacms.com is the demo!**
- Visitors see a real site built with AlmostaCMS
- Click "Edit This Page" → See the CMS in action
- Live proof of concept
- Ultimate credibility

### Content Marketing

**Platforms:**
- Dev.to, Hashnode (developer audience)
- Product Hunt (launch)
- Hacker News (Show HN)
- Reddit (r/webdev, r/SideProject)
- Twitter/X (indie maker community)

**Content:**
- "I Built a CMS That Builds Itself"
- "Free Alternative to WordPress/Wix"
- "From Idea to Landing Page in 60 Seconds"
- "Why GitHub Pages > Traditional Hosting"

### Community

- GitHub Discussions for support
- Showcase gallery (sites built with AlmostaCMS)
- Template contributions (open source)
- Discord for real-time help

---

## Technical Stack

### Frontend (Templates)
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Public/admin routing
- **Vite** - Build tool

### Backend (OAuth Proxy)
- **Node.js + Express** - Minimal server
- **CORS** - Secure origin control
- **Environment variables** - Secret management

### Services
- **GitHub API** - Data storage, authentication
- **GitHub Pages** - Free hosting
- **GitHub Actions** - CI/CD pipeline

### Development
- **Poetry** - Python dependency management (for legacy generator)
- **npm** - JavaScript package management
- **Git** - Version control

---

## Success Metrics

### Key Metrics

**Adoption:**
- Websites created per week
- Active users (edited in last 30 days)
- GitHub stars on template repos

**Engagement:**
- Average edits per user
- Session duration in CMS
- Return visit rate

**Technical:**
- Deployment success rate (target: >99%)
- Average build time (target: <60s)
- API error rate (target: <1%)

**Growth:**
- Organic traffic to almostacms.com
- Social media mentions
- Blog/media features
- Community contributions

---

## Competitive Analysis

### vs. Traditional Platforms

| Feature | AlmostaCMS | WordPress.com | Wix | Carrd |
|---------|------------|---------------|-----|-------|
| **Cost** | Free | $4-45/mo | $16-45/mo | $9-49/yr |
| **Setup Time** | 1 min | 15 min | 10 min | 5 min |
| **Coding Required** | No | No | No | No |
| **Own Your Data** | Yes (GitHub) | Partial | No | No |
| **Custom Code** | Yes | Limited | No | Limited |
| **Version Control** | Yes (Git) | No | No | No |
| **Built-in CMS** | Yes | Yes | Yes | No |
| **Modern Stack** | Yes (React) | No (PHP) | Proprietary | Unknown |

**Our Edge:** Only platform that combines zero cost, full ownership, modern tech, and version control.

---

## Open Source Strategy

### What's Open Source?

✅ **Template repositories** (MIT License)
- `personal-website-template`
- `landing-page-template`

✅ **CMS components** (MIT License)
- Forms, editors, UI components
- GitHub API wrapper
- Hooks and utilities

✅ **Documentation** (CC BY 4.0)
- Setup guides
- API documentation
- Best practices

### What's Proprietary?

🔒 **almostacms.com site** (brand/marketing)
🔒 **OAuth proxy server** (security)
🔒 **Premium templates** (revenue)
🔒 **Advanced features** (analytics, etc.)

---

## The Self-Building Philosophy

**AlmostaCMS is built with AlmostaCMS.**

This means:
1. We use our own product daily (dogfooding)
2. We find bugs/issues before users do
3. We understand user pain points intimately
4. We continuously improve the experience
5. Our landing page IS the demo

**This creates a virtuous cycle:**
```
Improve AlmostaCMS
    ↓
Update almostacms.com
    ↓
Better showcase
    ↓
More users
    ↓
More feedback
    ↓
Improve AlmostaCMS ♻️
```

---

## Next Steps

### This Week
1. [x] Document product vision ✅
2. [ ] Design personal website template structure
3. [ ] Design landing page template structure
4. [ ] Create `docs/ARCHITECTURE.md` with technical details
5. [ ] Sketch almostacms.com design

### This Month
1. [ ] Build personal website template with public view
2. [ ] Build landing page template
3. [ ] Create almostacms.com using landing page template
4. [ ] Implement repository creation flow
5. [ ] Test end-to-end user journey

### Next 3 Months
1. [ ] Launch beta version
2. [ ] Gather early adopter feedback
3. [ ] Create showcase gallery
4. [ ] Write documentation
5. [ ] Plan Product Hunt launch

---

## Vision Statement

> **"Make beautiful, professional websites accessible to everyone - for free, forever."**

**AlmostaCMS democratizes web publishing** by:
- Eliminating cost barriers (free hosting)
- Removing technical barriers (no coding)
- Ensuring data ownership (your GitHub repo)
- Providing modern technology (React, not WordPress)
- Enabling rapid iteration (version control)

**The future is open, free, and user-owned. AlmostaCMS makes it real.** 🚀

---

*Built with love by developers, for everyone.*
