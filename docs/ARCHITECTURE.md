# AlmostaCMS Architecture

**Last Updated:** 2025-10-20
**Architecture:** Fully Decentralized

## Vision

**AlmostaCMS** is a fully decentralized, open-source website builder that enables users to create beautiful portfolio and landing page sites deployed to GitHub Pages. Each generated site includes its own embedded admin panel, eliminating the need for centralized infrastructure and enabling infinite scalability at zero cost.

---

## Core Principles

1. **Decentralized by Design** - No centralized backend, users edit directly on their sites
2. **Zero Ongoing Costs** - Infrastructure costs remain $0 regardless of user count
3. **True Data Ownership** - Everything lives in user's GitHub repository
4. **Open Source First** - Core functionality is 100% free and open source (MIT License)
5. **Privacy Focused** - User tokens never touch our servers
6. **Simple & Fast** - Static sites with embedded React admin

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│ AlmostaCMS.com (Static Landing Page)           │
│ Purpose: Marketing + One-time Site Creation    │
│ Hosting: GitHub Pages / Cloudflare Pages       │
│ Cost: $0 (static site)                         │
└─────────────────────────────────────────────────┘
            ↓
     [GitHub Device Flow Auth]
     (No backend OAuth needed!)
            ↓
     [One-time Site Generation]
            ↓
┌─────────────────────────────────────────────────┐
│ User's GitHub Repository                        │
├─────────────────────────────────────────────────┤
│ /                                               │
│ ├── index.html         (Public site)           │
│ ├── about.html                                 │
│ │                                               │
│ ├── admin/             (Embedded CMS!)         │
│ │   ├── index.html    (React admin app)       │
│ │   ├── bundle.js     (GitHub API client)     │
│ │   └── assets/                                │
│ │                                               │
│ ├── data/              (Content JSON)          │
│ │   ├── about.json                             │
│ │   ├── resume.json                            │
│ │   └── portfolio.json                         │
│ │                                               │
│ └── .almostacms.json   (Site config)           │
│                                                 │
│ Deployed: username.github.io/my-site          │
│ Admin:    username.github.io/my-site/admin    │
└─────────────────────────────────────────────────┘
            ↓
     [User edits forever]
     (Never needs AlmostaCMS.com again!)
```

---

## Key Architectural Decisions

### ADR-001: Decentralized Admin Panel

**Decision:** Embed admin panel INTO each generated site at `/admin`

**Rationale:**
- ✅ Zero infrastructure costs (no matter how many users)
- ✅ Infinitely scalable (each user is independent)
- ✅ Better privacy (tokens stay in user's browser)
- ✅ Works offline (with service worker)
- ✅ User can fork/modify their admin
- ✅ No single point of failure

**vs Centralized Admin:**
```
❌ Centralized: almostacms.com/admin
   - Every edit → Your Cloudflare Worker → GitHub
   - 100 active users = ~240K requests/day
   - Exceeds free tier (100K/day)
   - Costs $50+/month at scale

✅ Decentralized: username.github.io/my-site/admin
   - User's browser → GitHub (direct)
   - Your costs: $0 forever
   - No scaling limits
```

### ADR-002: GitHub Device Flow Authentication

**Decision:** Use GitHub Device Flow instead of OAuth with backend

**Rationale:**
- ✅ **No backend needed** - Entire auth flow happens client-side
- ✅ **Zero costs** - No Cloudflare Worker for token exchange
- ✅ **No secrets** - No client secret to manage
- ✅ **Same security** - GitHub handles everything
- ✅ **Better privacy** - Token never touches your servers

**How Device Flow Works:**
```javascript
// 1. Request device code (client-side only)
const { device_code, user_code, verification_uri } =
  await fetch('https://github.com/login/device/code', {
    method: 'POST',
    body: JSON.stringify({
      client_id: PUBLIC_CLIENT_ID,
      scope: 'repo workflow'
    })
  });

// 2. User visits github.com/login/device and enters code
showUserCode(user_code); // e.g., "ABC-123"

// 3. Poll for token (every 5 seconds)
const token = await pollForToken(device_code);

// 4. Store in localStorage
localStorage.setItem('github_token', token);
```

**Trade-offs:**
- User must manually enter code (vs automatic redirect)
- Slightly more steps (acceptable for setup)
- Better for open source (no backend to maintain)

### ADR-003: Static Site Generation with Embedded Admin

**Decision:** Generate complete static sites with admin bundled in

**What Gets Generated:**
```
my-site/
├── index.html              (Public homepage)
├── about.html              (Public pages)
├── assets/                 (Images, CSS, fonts)
├── data/                   (JSON content files)
│   ├── about.json
│   ├── resume.json
│   └── portfolio.json
├── admin/                  (Embedded CMS - ~1MB)
│   ├── index.html          (Admin entry point)
│   ├── bundle.js           (React app + Octokit)
│   ├── assets/             (Admin assets)
│   └── config.js           (Auto-generated repo info)
└── .almostacms.json        (Site configuration)
```

**Admin Detection Logic:**
```javascript
// Admin automatically detects its repo location
const path = window.location.pathname;
// e.g., "/my-site/admin/"

const repoInfo = {
  owner: 'username',           // from path
  repo: 'my-site',            // from path
  deployPath: '/',            // from .almostacms.json
  adminPath: '/admin'         // from .almostacms.json
};

// All API calls use detected repo
await octokit.repos.getContent({
  owner: repoInfo.owner,
  repo: repoInfo.repo,
  path: 'data/about.json'
});
```

### ADR-004: Dual Deployment Paths

**Decision:** Support both root (/) and /docs deployment

**Use Case 1: Dedicated Website Repository**
```
my-portfolio/              (Standard GitHub Pages)
├── index.html             (deployed at /)
├── admin/
└── data/

GitHub Pages Source: main branch, / (root)
Access: username.github.io/my-portfolio
Admin:  username.github.io/my-portfolio/admin
```

**Use Case 2: Source Code + Docs Site**
```
almostacms/                (Project repo)
├── src/                   (React source code)
├── package.json           (Project files)
├── README.md
└── docs/                  (Website deployed here!)
    ├── index.html
    ├── admin/
    └── data/

GitHub Pages Source: main branch, /docs
Access: almostacms.com (or username.github.io/almostacms)
Admin:  almostacms.com/admin
```

**Configuration:**
```json
// .almostacms.json
{
  "version": "1.0.0",
  "generator": "almostacms",
  "deployPath": "/docs",      // or "/" for root
  "adminPath": "/docs/admin",  // relative to deployPath
  "githubPages": {
    "source": {
      "branch": "main",
      "path": "/docs"         // or "/" for root
    }
  }
}
```

### ADR-005: GitHub as Single Source of Truth

**Decision:** Use GitHub repositories as the only data storage

**Rationale:**
- ✅ Users own their data completely
- ✅ No database costs or management
- ✅ Built-in version control (git history)
- ✅ Built-in backup (GitHub's infrastructure)
- ✅ Native GitHub Pages deployment
- ✅ Can export/migrate easily (just clone repo)

**Data Flow:**
```
User edits in admin
     ↓
Admin calls GitHub API
     ↓
Update data/about.json in repo
     ↓
GitHub Actions triggers
     ↓
Regenerate static HTML
     ↓
Deploy to GitHub Pages
     ↓
Site updates automatically
```

### ADR-006: Template Repository Pattern

**Decision:** Use GitHub template repositories for site creation

**Templates:**
```
almostacms/personal-website-template
almostacms/landing-page-template
almostacms/saas-landing-template (premium)
almostacms/ecommerce-template (premium)
```

**Creation Process:**
```javascript
// User clicks "Create Site" on almostacms.com
await octokit.repos.createUsingTemplate({
  template_owner: 'almostacms',
  template_repo: 'personal-website-template',
  owner: user,
  name: 'my-awesome-site',
  private: false
});

// Inject admin bundle
await bundleAndInjectAdmin(user, 'my-awesome-site');

// Configure GitHub Pages
await octokit.repos.createPagesSite({
  owner: user,
  repo: 'my-awesome-site',
  source: { branch: 'main', path: '/' }
});
```

---

## System Components

### 1. AlmostaCMS.com (Landing Page)

**Purpose:** Marketing + One-time Site Creation

**Technology:**
- Static HTML/CSS/JS
- React for site generator UI
- Hosted on GitHub Pages (free)

**Functionality:**
- Promote the product
- "Create Your Site" button
- GitHub Device Flow authentication
- One-time site generation
- Never accessed again after site creation

**Cost:** $0 (static site)

### 2. Embedded Admin Panel

**Purpose:** Edit site content from `/admin`

**Technology:**
- React 18
- Octokit.js (GitHub API client)
- Tailwind CSS
- Vite (bundler)

**Features:**
- Visual content editors (forms)
- Real-time preview (optional)
- Image upload to assets/
- JSON validation
- Auto-save to GitHub
- Offline support (future: service worker)

**Bundle Size:** ~1MB (one-time download, cached)

**Authentication:**
- Token stored in localStorage
- Scoped to specific domain
- User can revoke at github.com/settings/applications

### 3. Static Site Templates

**Technology:**
- HTML5, CSS3, JavaScript
- Jinja2 templates (build time)
- GitHub Actions for builds
- Responsive, accessible, fast

**Templates Available:**
```
Free (Open Source):
- Personal Website (portfolio/resume)
- Basic Landing Page

Premium (Paid):
- SaaS Landing Page ($79)
- E-commerce Product Page ($49)
- Agency Portfolio ($49)
```

---

## Data Model

### .almostacms.json (Site Configuration)

```json
{
  "version": "1.0.0",
  "generator": "almostacms",
  "projectType": "personal-website",
  "created": "2024-01-20T12:00:00.000Z",
  "lastModified": "2024-01-20T12:00:00.000Z",

  "deployment": {
    "path": "/",              // or "/docs"
    "adminPath": "/admin",
    "githubPages": {
      "source": {
        "branch": "main",
        "path": "/"
      }
    }
  },

  "config": {
    "template": "vcard-portfolio",
    "templateVersion": "1.0.0",
    "customDomain": null,
    "theme": "default"
  },

  "metadata": {
    "title": "My Portfolio",
    "description": "Personal portfolio website",
    "author": "John Doe"
  },

  "features": {
    "payments": false,        // Premium feature
    "analytics": false,       // Premium feature
    "comments": false         // Future feature
  }
}
```

### Content Files (data/*.json)

**Example: data/about.json**
```json
{
  "name": "John Doe",
  "title": "Full Stack Developer",
  "bio": "I build amazing web applications...",
  "email": "john@example.com",
  "social": {
    "github": "johndoe",
    "twitter": "johndoe",
    "linkedin": "johndoe"
  },
  "services": [
    {
      "icon": "code",
      "name": "Web Development",
      "description": "Building modern web apps..."
    }
  ]
}
```

---

## User Journey

### First-Time Setup
```
1. Visit almostacms.com
   ↓
2. Click "Create Your Website"
   ↓
3. GitHub Device Flow Login:
   - Click "Login with GitHub"
   - Get code: "ABC-123"
   - Go to github.com/login/device
   - Enter code
   - Approve permissions (repo, workflow)
   ↓
4. Choose Template:
   - Personal Website (portfolio/resume)
   - Landing Page (product/service)
   ↓
5. Configure Site:
   - Repository name: "my-awesome-site"
   - Deployment path: "/" or "/docs"
   - GitHub Pages settings
   ↓
6. ✨ Site Generation (30 seconds)
   - Create repo from template
   - Bundle admin into /admin
   - Configure GitHub Pages
   - Initial deployment
   ↓
7. Success!
   - Site: username.github.io/my-awesome-site
   - Admin: username.github.io/my-awesome-site/admin
   ↓
8. Edit Forever
   - No need to return to almostacms.com
   - Edit directly at your-site/admin
```

### Editing Content
```
1. Visit your-site/admin
   ↓
2. Login (if needed)
   - Token stored in localStorage
   - Reuse existing token if valid
   ↓
3. Choose section to edit
   - About, Resume, Portfolio, etc.
   ↓
4. Edit in visual form
   - Real-time validation
   - Image upload support
   - Rich text editing
   ↓
5. Save (auto or manual)
   - Update data/*.json via GitHub API
   - Trigger GitHub Actions
   - Site rebuilds automatically
   ↓
6. View changes
   - Refresh public site
   - Changes live in ~30 seconds
```

---

## Security Model

### Authentication
- **GitHub Device Flow** - Industry standard OAuth
- **No backend** - Can't leak user tokens
- **Scoped permissions** - Only `repo` and `workflow`
- **User revocable** - At github.com/settings/applications

### Token Storage
- **localStorage** - Scoped to specific domain
- **Never transmitted** - Stays in user's browser
- **Auto-expiration** - Refresh after 8 hours (configurable)
- **Clear on logout** - Removed from storage

### Data Privacy
- **Zero tracking** - We don't see user data
- **No analytics** - Optional (user-controlled)
- **Open source** - Anyone can audit code

### GitHub API Limits
- **5,000 requests/hour** - Per user (plenty for editing)
- **Rate limit handling** - Graceful degradation
- **Caching** - Reduce unnecessary calls

---

## Cost Analysis

### Infrastructure Costs (Decentralized)

```
Component                   Cost
─────────────────────────────────────
AlmostaCMS.com (static):    $0 (GitHub Pages)
Domain (almostacms.com):    $12/year
User site generation:       $0 (GitHub API, free tier)
User site hosting:          $0 (GitHub Pages)
Admin panel hosting:        $0 (embedded in user's site)
OAuth backend:              $0 (Device Flow, no backend)
Database:                   $0 (GitHub repos)
CDN:                        $0 (GitHub Pages)
Monitoring:                 $0 (GitHub Stats API)

Total: $12/year (just domain)
```

**At Scale (10,000 users):**
```
Your costs:    $12/year (same!)
User costs:    $0 (GitHub Pages free)
```

### vs Centralized Architecture

```
Users:        10      100     1,000   10,000
──────────────────────────────────────────────
Centralized:  $0      $5/mo   $50/mo  $500/mo
Decentralized: $12/yr  $12/yr  $12/yr  $12/yr
```

**Savings:** ~$6,000/year at 10,000 users

---

## Technology Stack

### Frontend (Admin Panel)
```
- React 18 (UI framework)
- TypeScript (type safety)
- Tailwind CSS (styling)
- Vite (bundler)
- Octokit.js (GitHub API)
- React Router (routing)
- React Hook Form (forms)
```

### Static Site Generation
```
- Jinja2 (templating)
- Python 3.9+ (build scripts)
- HTML5/CSS3 (markup)
- Vanilla JS (interactivity)
- GitHub Actions (CI/CD)
```

### Infrastructure
```
- GitHub Pages (hosting)
- GitHub API (data storage)
- GitHub Actions (builds)
- Cloudflare DNS (optional)
```

---

## Scaling Strategy

### Performance
```
Problem: Large admin bundle size
Solution: Code splitting, lazy loading, caching

Problem: Slow GitHub API calls
Solution: Request caching, optimistic UI updates

Problem: Large image uploads
Solution: Client-side compression, WebP conversion
```

### Reliability
```
Problem: GitHub API outages
Solution: Offline mode with service worker (future)

Problem: User loses token
Solution: Re-auth flow, clear error messages

Problem: Concurrent edits (multiple tabs)
Solution: localStorage sync, conflict detection
```

### Feature Flags
```json
{
  "features": {
    "offlineMode": false,      // Future
    "realTimePreview": true,
    "imageOptimization": true,
    "multiSite": false,        // Future
    "plugins": false           // Future
  }
}
```

---

## Future Enhancements

### Phase 1 (Current)
- ✅ Basic site generation
- ✅ Embedded admin panel
- ✅ Device Flow auth
- ✅ 2 free templates

### Phase 2 (Next 3 months)
- 🔲 Premium templates
- 🔲 Payment integration module
- 🔲 Image optimization
- 🔲 Real-time preview

### Phase 3 (6-12 months)
- 🔲 Template marketplace
- 🔲 Plugin system
- 🔲 Multi-site management
- 🔲 Offline mode (PWA)

### Phase 4 (Year 2+)
- 🔲 Collaborative editing
- 🔲 A/B testing
- 🔲 Analytics integration
- 🔲 Custom integrations

---

## Advantages of This Architecture

✅ **Zero Costs** - No infrastructure costs ever
✅ **Infinite Scale** - 10 or 10 million users, same cost
✅ **Privacy First** - User data never touches our servers
✅ **Offline Capable** - Can work without internet (future)
✅ **True Ownership** - Users own code, data, and admin
✅ **No Vendor Lock-in** - Users can fork everything
✅ **Open Source** - Core is 100% MIT licensed
✅ **Simple** - No backend to maintain
✅ **Fast** - Direct browser → GitHub, no middleman
✅ **Reliable** - No single point of failure

---

## Trade-offs & Limitations

⚠️ **Considerations:**

1. **Initial Bundle Size** - Admin is ~1MB (acceptable, one-time)
2. **Auth UX** - Device Flow requires code entry (slightly more steps)
3. **GitHub Dependency** - Requires GitHub account (target audience has it)
4. **Rate Limits** - 5,000 requests/hour (plenty for editing)
5. **No Central Analytics** - Can't track usage (but privacy-friendly!)

**These are acceptable trade-offs for a sustainable, open-source project.**

---

**This architecture makes AlmostaCMS infinitely scalable, truly open source, and costs $0 to operate.** 🚀
