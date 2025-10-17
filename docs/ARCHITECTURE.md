# Almost-a-CMS Architecture

## Vision

**Almost-a-CMS** is a multi-tenant SaaS platform that enables users to create, edit, and deploy beautiful portfolio websites to GitHub Pages without writing code. Users authenticate with GitHub, edit content through a modern web interface, and deploy their site with one click—all while maintaining full ownership of their code in their own GitHub repositories.

---

## Problem Statement

**Current Pain Points:**
- Setting up a portfolio website requires technical knowledge (HTML, CSS, Git, GitHub Pages)
- Most website builders lock users into proprietary platforms
- Editing static site content often requires editing HTML directly
- Deploying to GitHub Pages involves multiple manual steps
- Custom domain setup is confusing for non-technical users

**Our Solution:**
- Zero-setup portfolio creation (automated GitHub repo initialization)
- Content editing through intuitive web interface
- One-click deployment to GitHub Pages
- User maintains full ownership (everything lives in their GitHub repo)
- Free hosting via GitHub Pages
- Optional custom domain support with guided setup

---

## Key Architectural Decisions

### ADR-001: Serverless-First Architecture

**Decision:** Use fully serverless architecture with Cloudflare Pages + GitHub API

**Rationale:**
- Zero server maintenance costs (critical for free service)
- Infinite scalability without infrastructure management
- Edge computing for global performance
- GitHub API handles all data storage (repos as database)
- Aligns with "light as possible, free as possible" requirement

**Alternatives Considered:**
- Traditional Flask backend → Rejected (hosting costs, server management)
- AWS Lambda + API Gateway → Rejected (complexity, potential costs)
- Vercel Serverless Functions → Viable alternative, but Cloudflare offers better free tier

### ADR-002: GitHub as Single Source of Truth

**Decision:** Use GitHub repositories as the only data storage layer

**Rationale:**
- Users own their data completely
- No separate database needed (eliminates costs and complexity)
- Built-in version control and backup
- GitHub Pages deployment is native
- Leverages GitHub's reliability and infrastructure

**Trade-offs:**
- GitHub API rate limits (5,000 requests/hour per user - acceptable)
- Slightly higher latency than dedicated database (acceptable for use case)
- Requires GitHub account (acceptable - target audience already uses GitHub)

### ADR-003: Template Repository Pattern

**Decision:** Use a template repository that gets forked/copied to user accounts

**Rationale:**
- Consistent starting point for all users
- Easy to update template for all future users
- Users can customize beyond what CMS offers
- Follows GitHub's native patterns

**Implementation:**
- Maintain canonical template at `almostacms/vcard-portfolio-template`
- On first login, create repo in user's account from template
- Include all necessary files: HTML, CSS, JS, JSON data, GitHub Actions workflow

### ADR-004: OAuth Over API Keys

**Decision:** Use GitHub OAuth with PKCE flow for authentication

**Rationale:**
- Industry standard for web applications
- More secure than personal access tokens
- Fine-grained permission scopes
- Better user experience (standard "Login with GitHub" button)
- Token refresh capabilities

**Scopes Required:**
- `repo` - Create/update repositories
- `workflow` - Modify GitHub Actions workflows (for Pages deployment)

### ADR-005: Client-Side GitHub API Integration

**Decision:** Call GitHub API directly from React frontend using Octokit.js

**Rationale:**
- Eliminates need for backend API layer
- Reduces system complexity
- Lower latency (direct browser → GitHub)
- GitHub API is CORS-enabled
- Tokens stored securely in browser (httpOnly cookies or secure storage)

**Security Considerations:**
- OAuth tokens never exposed to application backend
- Short-lived access tokens with refresh capability
- Scope limitation (only repo access, not account-wide)

---

## System Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     almostacms.com                          │
│              (Cloudflare Pages - Static Host)               │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            React SPA (Vite + TypeScript)             │  │
│  │                                                      │  │
│  │  Components:                                         │  │
│  │  - Landing Page                                      │  │
│  │  - OAuth Callback Handler                           │  │
│  │  - Dashboard (Repo Selection/Creation)              │  │
│  │  - Content Editor (JSON editing UI)                 │  │
│  │  - Deploy Manager (One-click deploy)                │  │
│  │  - Domain Configuration (Custom domain setup)       │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS / REST API
                         │
            ┌────────────┴──────────────┐
            │                           │
            ▼                           ▼
┌──────────────────────┐    ┌──────────────────────────┐
│   GitHub OAuth API   │    │   GitHub REST API v3     │
│                      │    │   (via Octokit.js)       │
│ Endpoints:           │    │                          │
│ - /authorize         │    │ Endpoints:               │
│ - /access_token      │    │ - GET /user              │
│                      │    │ - GET /user/repos        │
└──────────┬───────────┘    │ - POST /repos            │
           │                │ - PUT /repos/.../contents│
           │                │ - POST /repos/.../pages  │
           │                │ - PUT /repos/.../pages   │
           │                └──────────┬───────────────┘
           │                           │
           └────────────┬──────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │      User's GitHub Account        │
        │                                   │
        │  ┌─────────────────────────────┐  │
        │  │  username/my-portfolio      │  │
        │  │                             │  │
        │  │  Structure:                 │  │
        │  │  ├── index.html             │  │
        │  │  ├── assets/                │  │
        │  │  │   ├── css/               │  │
        │  │  │   ├── js/                │  │
        │  │  │   └── images/            │  │
        │  │  ├── data/                  │  │
        │  │  │   ├── about.json         │  │
        │  │  │   ├── portfolio.json     │  │
        │  │  │   ├── resume.json        │  │
        │  │  │   ├── blog.json          │  │
        │  │  │   ├── contact.json       │  │
        │  │  │   ├── navbar.json        │  │
        │  │  │   └── sidebar.json       │  │
        │  │  ├── templates/             │  │
        │  │  │   └── template_index.html│  │
        │  │  ├── .github/               │  │
        │  │  │   └── workflows/         │  │
        │  │  │       └── deploy.yml     │  │
        │  │  └── README.md              │  │
        │  └─────────────────────────────┘  │
        └───────────────┬───────────────────┘
                        │
                        │ Git Push (via API commits)
                        │
                        ▼
            ┌───────────────────────┐
            │   GitHub Actions      │
            │   (Auto-triggered)    │
            │                       │
            │   Jobs:               │
            │   1. Checkout code    │
            │   2. Build site       │
            │   3. Deploy to Pages  │
            └───────────┬───────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   GitHub Pages        │
            │   (Free CDN Hosting)  │
            │                       │
            │   URLs:               │
            │   - username.github.  │
            │     io/my-portfolio   │
            │   - custom-domain.com │
            │     (if configured)   │
            └───────────────────────┘
```

### Data Flow Diagram

```
User Authentication Flow:
─────────────────────────

User → Click "Login with GitHub" → almostacms.com
  │
  ├─→ Redirect to github.com/login/oauth/authorize
  │     (with client_id, scope=repo+workflow, redirect_uri)
  │
  ├─→ User authorizes app on GitHub
  │
  ├─→ GitHub redirects to almostacms.com/auth/callback?code=XXX
  │
  ├─→ Exchange code for access_token
  │     POST github.com/login/oauth/access_token
  │
  └─→ Store token securely (sessionStorage/localStorage)
      User authenticated ✓


Content Edit & Deploy Flow:
───────────────────────────

User → Edit content in React UI
  │
  ├─→ JSON editor validates syntax
  │
  ├─→ User clicks "Save & Deploy"
  │
  ├─→ React app calls GitHub API:
  │     PUT /repos/:owner/:repo/contents/data/about.json
  │     (Commits new content with message)
  │
  ├─→ GitHub receives commit → Triggers Actions workflow
  │
  ├─→ Workflow runs:
  │     - Merges all JSON into template_index.html
  │     - Generates final index.html
  │     - Deploys to gh-pages branch
  │
  └─→ GitHub Pages serves updated site
      Live in ~30-60 seconds ✓


First-Time Setup Flow:
──────────────────────

New User → Logs in with GitHub
  │
  ├─→ Check if portfolio repo exists:
  │     GET /repos/:username/my-portfolio
  │
  ├─→ If NOT exists:
  │   │
  │   ├─→ Create repo from template:
  │   │     POST /repos/:template_owner/:template_repo/generate
  │   │     Body: { owner: username, name: "my-portfolio" }
  │   │
  │   ├─→ Enable GitHub Pages:
  │   │     POST /repos/:owner/:repo/pages
  │   │     Body: { source: { branch: "main", path: "/" } }
  │   │
  │   └─→ Add default workflow (already in template)
  │
  └─→ Redirect to dashboard with portfolio loaded
      Ready to edit ✓
```

---

## Technology Stack

### Frontend (almostacms.com)

**Core Framework:**
- **React 18** - Component-based UI
- **TypeScript** - Type safety and better DX
- **Vite** - Lightning-fast build tool and dev server

**Styling:**
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Consistent icon set
- **Responsive design** - Mobile-first approach

**State Management:**
- **React Context API** - Global auth state
- **Custom hooks** - Reusable logic (useAuth, useGitHub, useDeploy)

**GitHub Integration:**
- **Octokit.js (@octokit/rest)** - Official GitHub API client
- **OAuth libraries** - Authentication flow handling

**Additional Libraries:**
- **Monaco Editor / CodeMirror** - JSON editing with syntax highlighting
- **React Router** - Client-side routing
- **Axios** - HTTP client (optional, Octokit includes fetch)
- **React Query** - API state management (optional but recommended)

### Hosting & Infrastructure

**Frontend Hosting:**
- **Cloudflare Pages**
  - Unlimited bandwidth
  - Global CDN (edge caching)
  - Automatic HTTPS
  - Free tier: 500 builds/month
  - Git integration for auto-deploy

**DNS & Domain:**
- **Cloudflare DNS** - almostacms.com management
- **Custom domain support** - User-provided domains via Cloudflare instructions

**Optional Backend (if needed later):**
- **Cloudflare Workers** - Serverless edge functions
  - 100,000 requests/day free
  - Use cases: OAuth token exchange, analytics, rate limiting

### User's Infrastructure (Automatic)

**Repository:**
- **GitHub** - Free unlimited public repos
- **GitHub Actions** - 2,000 CI/CD minutes/month free
- **GitHub Pages** - Free static site hosting

**Deployment:**
- **GitHub Actions Workflow** - Auto-build and deploy
- **Jekyll / Plain HTML** - Static site generation

---

## Component Architecture

### Frontend Application Structure

```
react-cms/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginButton.tsx          # GitHub OAuth trigger
│   │   │   ├── AuthCallback.tsx         # OAuth redirect handler
│   │   │   └── ProtectedRoute.tsx       # Auth-gated routes
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx            # Main content hub
│   │   │   ├── RepoSelector.tsx         # Choose/create portfolio repo
│   │   │   ├── ContentCard.tsx          # Section cards (existing)
│   │   │   └── DeployButton.tsx         # One-click deploy
│   │   ├── editor/
│   │   │   ├── JsonEditor.tsx           # Content editing (existing)
│   │   │   ├── ValidationPanel.tsx      # JSON syntax validation
│   │   │   └── PreviewPane.tsx          # Live preview (optional)
│   │   ├── setup/
│   │   │   ├── FirstTimeSetup.tsx       # Onboarding wizard
│   │   │   ├── RepoCreator.tsx          # Template repo initialization
│   │   │   ├── DomainConfig.tsx         # Custom domain setup
│   │   │   └── DNSInstructions.tsx      # Cloudflare DNS guide
│   │   ├── common/
│   │   │   ├── Layout.tsx               # App shell (existing)
│   │   │   ├── Header.tsx               # Top navigation
│   │   │   ├── Footer.tsx               # Footer with links
│   │   │   ├── LoadingSpinner.tsx       # Loading states
│   │   │   └── ErrorBoundary.tsx        # Error handling
│   │   └── landing/
│   │       ├── Hero.tsx                 # Landing page hero
│   │       ├── Features.tsx             # Feature showcase
│   │       ├── HowItWorks.tsx           # Step-by-step guide
│   │       └── Pricing.tsx              # Free tier info
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                   # Authentication state/logic
│   │   ├── useGitHub.ts                 # GitHub API interactions
│   │   ├── useRepo.ts                   # Repository CRUD operations
│   │   ├── useDeploy.ts                 # Deployment orchestration
│   │   └── useLocalStorage.ts           # Persistent state
│   │
│   ├── services/
│   │   ├── github/
│   │   │   ├── auth.ts                  # OAuth flow logic
│   │   │   ├── api.ts                   # GitHub API wrapper
│   │   │   ├── repos.ts                 # Repository operations
│   │   │   ├── contents.ts              # File CRUD operations
│   │   │   └── pages.ts                 # GitHub Pages management
│   │   ├── storage/
│   │   │   └── tokenStorage.ts          # Secure token management
│   │   └── validation/
│   │       └── jsonValidator.ts         # JSON schema validation
│   │
│   ├── types/
│   │   ├── github.ts                    # GitHub API types
│   │   ├── content.ts                   # Content schema types
│   │   ├── auth.ts                      # Auth state types
│   │   └── index.ts                     # Shared type exports
│   │
│   ├── config/
│   │   ├── github.ts                    # OAuth client config
│   │   ├── constants.ts                 # App constants
│   │   └── routes.ts                    # Route definitions
│   │
│   ├── utils/
│   │   ├── base64.ts                    # Base64 encoding (for GitHub API)
│   │   ├── errors.ts                    # Error handling utilities
│   │   └── validators.ts                # Input validation
│   │
│   ├── App.tsx                          # Root component
│   ├── main.tsx                         # Entry point
│   └── index.css                        # Global styles
│
├── public/
│   ├── favicon.ico
│   └── assets/
│       └── images/                      # Marketing images
│
├── .env.example                         # Environment variables template
├── vite.config.ts                       # Vite configuration
├── tailwind.config.js                   # Tailwind configuration
├── tsconfig.json                        # TypeScript configuration
└── package.json                         # Dependencies
```

### Backend Structure (Deprecated - Keeping for Reference)

```
# Legacy Flask backend - Will be removed in v2.0
app.py                                   # Flask server (legacy)
index_html_generator.py                  # HTML generator (legacy)
templates/                               # Flask templates (legacy)
data/                                    # Local JSON storage (legacy)

# Migration note: All functionality moved to client-side GitHub API
```

---

## Core Workflows

### 1. User Onboarding Workflow

```javascript
// Step 1: Landing Page
User visits almostacms.com
  → Sees features, pricing (free), examples
  → Clicks "Get Started - Login with GitHub"

// Step 2: OAuth Authentication
redirectToGitHubOAuth({
  client_id: GITHUB_CLIENT_ID,
  redirect_uri: 'https://almostacms.com/auth/callback',
  scope: 'repo workflow',
  state: generateRandomState() // CSRF protection
});

// Step 3: OAuth Callback
async function handleOAuthCallback(code, state) {
  // Verify state (CSRF protection)
  if (state !== getStoredState()) throw new Error('Invalid state');

  // Exchange code for token
  const { access_token } = await exchangeCodeForToken(code);

  // Store token securely
  secureStorage.setToken(access_token);

  // Fetch user info
  const user = await octokit.users.getAuthenticated();

  // Check for existing portfolio repo
  const hasRepo = await checkForPortfolioRepo(user.login);

  if (!hasRepo) {
    // First-time user → Show setup wizard
    navigate('/setup/welcome');
  } else {
    // Returning user → Go to dashboard
    navigate('/dashboard');
  }
}

// Step 4: First-Time Setup (if new user)
async function setupPortfolioRepo(username) {
  // Option A: Create from template (recommended)
  const repo = await octokit.repos.createUsingTemplate({
    template_owner: 'almostacms',
    template_repo: 'vcard-portfolio-template',
    owner: username,
    name: 'my-portfolio',
    description: 'My personal portfolio created with AlmostaCMS',
    include_all_branches: false,
    private: false
  });

  // Enable GitHub Pages
  await octokit.repos.createPagesSite({
    owner: username,
    repo: 'my-portfolio',
    source: {
      branch: 'main',
      path: '/'
    }
  });

  // Wait for Pages to build (optional)
  await waitForPagesBuild(username, 'my-portfolio');

  return {
    repoUrl: repo.html_url,
    pagesUrl: `https://${username}.github.io/my-portfolio`
  };
}

// Step 5: Redirect to Dashboard
navigate('/dashboard');
```

### 2. Content Editing Workflow

```javascript
// Load Content
async function loadPortfolioContent(username, repo) {
  const sections = ['about', 'portfolio', 'resume', 'blog', 'contact', 'navbar', 'sidebar'];

  const content = await Promise.all(
    sections.map(async (section) => {
      const { data } = await octokit.repos.getContent({
        owner: username,
        repo: repo,
        path: `data/${section}.json`
      });

      // Decode base64 content
      const json = JSON.parse(atob(data.content));

      return {
        section,
        content: json,
        sha: data.sha // Needed for updates
      };
    })
  );

  return content;
}

// Edit Content
function EditContent() {
  const [content, setContent] = useState(initialContent);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (newContent) => {
    setContent(newContent);
    setIsDirty(true);
  };

  return (
    <JsonEditor
      value={content}
      onChange={handleChange}
      validator={validateJsonSchema}
    />
  );
}

// Save Content
async function saveContent(username, repo, section, content, sha) {
  // Validate JSON
  const validationError = validateJsonSchema(content);
  if (validationError) {
    throw new Error(`Invalid JSON: ${validationError}`);
  }

  // Commit to GitHub
  const response = await octokit.repos.createOrUpdateFileContents({
    owner: username,
    repo: repo,
    path: `data/${section}.json`,
    message: `Update ${section} content via AlmostaCMS`,
    content: btoa(JSON.stringify(content, null, 2)), // Base64 encode
    sha: sha // Required for updates
  });

  // Update local SHA for next save
  return response.data.content.sha;
}
```

### 3. One-Click Deploy Workflow

```javascript
async function deployToGitHubPages(username, repo, customDomain = null) {
  // Step 1: Verify all content is saved
  const unsavedChanges = checkUnsavedChanges();
  if (unsavedChanges.length > 0) {
    throw new Error('Please save all changes before deploying');
  }

  // Step 2: Trigger workflow (if using GitHub Actions)
  // Note: Actions auto-trigger on push, so this step may not be needed
  // But we can manually trigger for immediate rebuild
  await octokit.actions.createWorkflowDispatch({
    owner: username,
    repo: repo,
    workflow_id: 'deploy.yml',
    ref: 'main'
  });

  // Step 3: Configure custom domain (if provided)
  if (customDomain) {
    await octokit.repos.updateInformationAboutPagesSite({
      owner: username,
      repo: repo,
      cname: customDomain
    });

    // Return DNS instructions
    return {
      status: 'deploying',
      message: 'Deployment started! Configure your DNS:',
      dnsInstructions: {
        type: 'CNAME',
        name: customDomain,
        value: `${username}.github.io`,
        note: 'Add this record in your Cloudflare DNS settings'
      }
    };
  }

  // Step 4: Poll for deployment status
  const deployment = await waitForDeployment(username, repo);

  return {
    status: 'deployed',
    url: deployment.url,
    message: 'Your portfolio is live!'
  };
}

// Helper: Wait for GitHub Pages deployment
async function waitForDeployment(username, repo, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const { data: pages } = await octokit.repos.getPages({
      owner: username,
      repo: repo
    });

    if (pages.status === 'built') {
      return {
        url: pages.html_url,
        customDomain: pages.cname
      };
    }

    // Wait 2 seconds before next check
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Deployment timeout - check GitHub Actions logs');
}
```

### 4. Custom Domain Configuration Workflow

```javascript
// User Interface for Domain Configuration
function DomainConfiguration({ username, repo }) {
  const [domain, setDomain] = useState('');
  const [dnsConfigured, setDnsConfigured] = useState(false);

  const handleConfigureDomain = async () => {
    // Validate domain format
    if (!isValidDomain(domain)) {
      showError('Please enter a valid domain (e.g., johndoe.com)');
      return;
    }

    try {
      // Update GitHub Pages settings
      await octokit.repos.updateInformationAboutPagesSite({
        owner: username,
        repo: repo,
        cname: domain
      });

      // Show DNS instructions
      setDnsConfigured(true);

    } catch (error) {
      showError('Failed to configure domain: ' + error.message);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="yourdomain.com"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
      />
      <button onClick={handleConfigureDomain}>
        Configure Domain
      </button>

      {dnsConfigured && (
        <DNSInstructions
          domain={domain}
          githubUsername={username}
        />
      )}
    </div>
  );
}

// DNS Instructions Component
function DNSInstructions({ domain, githubUsername }) {
  return (
    <div className="dns-instructions">
      <h3>Configure your DNS at Cloudflare:</h3>
      <ol>
        <li>Log in to your Cloudflare account</li>
        <li>Select your domain: <code>{domain}</code></li>
        <li>Go to DNS settings</li>
        <li>Add a CNAME record:
          <ul>
            <li>Type: <code>CNAME</code></li>
            <li>Name: <code>@</code> (or subdomain if using one)</li>
            <li>Target: <code>{githubUsername}.github.io</code></li>
            <li>TTL: Auto</li>
            <li>Proxy status: Proxied (orange cloud)</li>
          </ul>
        </li>
        <li>Wait 5-10 minutes for DNS propagation</li>
        <li>Your site will be available at: <code>https://{domain}</code></li>
      </ol>

      <button onClick={() => checkDNSPropagation(domain)}>
        Check DNS Status
      </button>
    </div>
  );
}
```

---

## Security Architecture

### Authentication & Authorization

**OAuth Security:**
```javascript
// PKCE Flow (Proof Key for Code Exchange) - Optional but recommended
function initiateOAuthWithPKCE() {
  // Generate code verifier (random string)
  const codeVerifier = generateRandomString(128);

  // Generate code challenge (SHA256 hash)
  const codeChallenge = sha256(codeVerifier);

  // Store verifier in session storage
  sessionStorage.setItem('pkce_verifier', codeVerifier);

  // Redirect to GitHub with challenge
  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', GITHUB_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('scope', 'repo workflow');
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  window.location.href = authUrl.toString();
}

// Exchange code for token with verifier
async function exchangeCodeWithPKCE(code) {
  const codeVerifier = sessionStorage.getItem('pkce_verifier');

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET, // In Workers/backend only
      code: code,
      code_verifier: codeVerifier
    })
  });

  const { access_token } = await response.json();

  // Clear verifier
  sessionStorage.removeItem('pkce_verifier');

  return access_token;
}
```

**Token Storage:**
```javascript
// Secure token storage strategy
class TokenStorage {
  private static readonly TOKEN_KEY = 'github_access_token';
  private static readonly EXPIRY_KEY = 'token_expiry';

  // Store token with expiration
  static setToken(token: string, expiresIn: number = 28800) {
    // Use sessionStorage for temporary (recommended)
    // Or localStorage for persistent (less secure but better UX)
    const storage = sessionStorage; // Change to localStorage if needed

    storage.setItem(this.TOKEN_KEY, token);

    const expiryTime = Date.now() + (expiresIn * 1000);
    storage.setItem(this.EXPIRY_KEY, expiryTime.toString());
  }

  // Retrieve token if valid
  static getToken(): string | null {
    const storage = sessionStorage;

    const token = storage.getItem(this.TOKEN_KEY);
    const expiry = storage.getItem(this.EXPIRY_KEY);

    if (!token || !expiry) return null;

    // Check if expired
    if (Date.now() > parseInt(expiry)) {
      this.clearToken();
      return null;
    }

    return token;
  }

  // Clear token
  static clearToken(): void {
    const storage = sessionStorage;
    storage.removeItem(this.TOKEN_KEY);
    storage.removeItem(this.EXPIRY_KEY);
  }
}
```

**CSRF Protection:**
```javascript
// Generate and validate state parameter
function generateCSRFState(): string {
  const state = crypto.randomUUID();
  sessionStorage.setItem('oauth_state', state);
  return state;
}

function validateCSRFState(receivedState: string): boolean {
  const storedState = sessionStorage.getItem('oauth_state');
  sessionStorage.removeItem('oauth_state');

  return storedState === receivedState;
}
```

### API Security

**Rate Limiting:**
```javascript
// Respect GitHub API rate limits
class RateLimiter {
  async checkRateLimit() {
    const { data } = await octokit.rateLimit.get();

    return {
      limit: data.rate.limit,
      remaining: data.rate.remaining,
      reset: new Date(data.rate.reset * 1000)
    };
  }

  async waitIfNearLimit(threshold = 100) {
    const { remaining, reset } = await this.checkRateLimit();

    if (remaining < threshold) {
      const waitTime = reset.getTime() - Date.now();

      // Show user message
      console.warn(`API rate limit low. Waiting ${waitTime}ms`);

      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}
```

**Input Validation:**
```javascript
// Validate all user inputs
function validateRepoName(name: string): boolean {
  // GitHub repo name rules
  const regex = /^[a-zA-Z0-9._-]+$/;
  return regex.test(name) && name.length <= 100;
}

function validateDomain(domain: string): boolean {
  const regex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return regex.test(domain);
}

function validateJsonContent(content: any): ValidationResult {
  try {
    // Check if valid JSON
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;

    // Validate against schema (if exists)
    const schemaError = validateAgainstSchema(parsed);
    if (schemaError) {
      return { valid: false, error: schemaError };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
```

### Content Security Policy (CSP)

```html
<!-- In Cloudflare Pages headers -->
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; connect-src 'self' https://api.github.com https://github.com; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## GitHub API Integration

### Required Endpoints

**Authentication:**
```
GET  https://github.com/login/oauth/authorize
POST https://github.com/login/oauth/access_token
```

**User Information:**
```
GET /user                          # Get authenticated user
GET /users/:username               # Get specific user
```

**Repository Management:**
```
GET    /repos/:owner/:repo         # Get repository
GET    /users/:username/repos      # List user repositories
POST   /repos/:template_owner/:template_repo/generate  # Create from template
DELETE /repos/:owner/:repo         # Delete repository (caution!)
```

**File Operations:**
```
GET /repos/:owner/:repo/contents/:path       # Get file content
PUT /repos/:owner/:repo/contents/:path       # Create/update file
```

**GitHub Pages:**
```
GET  /repos/:owner/:repo/pages               # Get Pages info
POST /repos/:owner/:repo/pages               # Enable Pages
PUT  /repos/:owner/:repo/pages               # Update Pages settings
```

**GitHub Actions:**
```
GET  /repos/:owner/:repo/actions/workflows   # List workflows
POST /repos/:owner/:repo/actions/workflows/:workflow_id/dispatches  # Trigger workflow
GET  /repos/:owner/:repo/actions/runs        # Get workflow runs
```

### API Usage Patterns

**Octokit.js Setup:**
```typescript
import { Octokit } from '@octokit/rest';

// Initialize with token
const octokit = new Octokit({
  auth: TokenStorage.getToken(),
  userAgent: 'AlmostaCMS/1.0',
  baseUrl: 'https://api.github.com',
  log: {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error
  }
});
```

**Error Handling:**
```typescript
async function safeApiCall<T>(
  apiCall: () => Promise<T>
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await apiCall();
    return { data };
  } catch (error: any) {
    // GitHub API errors
    if (error.status === 401) {
      // Unauthorized - token expired
      TokenStorage.clearToken();
      return { error: 'Please log in again' };
    }

    if (error.status === 403) {
      // Rate limit or permission issue
      if (error.response?.headers?.['x-ratelimit-remaining'] === '0') {
        const resetTime = new Date(
          parseInt(error.response.headers['x-ratelimit-reset']) * 1000
        );
        return { error: `Rate limit exceeded. Resets at ${resetTime}` };
      }
      return { error: 'Permission denied' };
    }

    if (error.status === 404) {
      return { error: 'Resource not found' };
    }

    // Generic error
    return { error: error.message || 'An error occurred' };
  }
}

// Usage
const { data, error } = await safeApiCall(() =>
  octokit.repos.get({ owner: 'username', repo: 'my-portfolio' })
);

if (error) {
  showErrorToUser(error);
} else {
  processData(data);
}
```

### Rate Limiting Strategy

```typescript
// Implement exponential backoff
async function apiCallWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      if (error.status === 429 || error.status === 403) {
        // Rate limit hit - wait and retry
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential: 1s, 2s, 4s

        console.warn(`Rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));

        continue;
      }

      // Not a rate limit error - throw immediately
      throw error;
    }
  }

  throw new Error('Max retries exceeded');
}
```

---

## Deployment Architecture

### Cloudflare Pages Deployment

**Configuration (`wrangler.toml` or Pages dashboard):**
```toml
name = "almostacms"
compatibility_date = "2024-01-01"

[build]
command = "npm run build"
destination = "dist"

[build.environment]
NODE_VERSION = "18"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

**Environment Variables:**
```bash
# Production (.env.production)
VITE_GITHUB_CLIENT_ID=your_oauth_client_id_here
VITE_APP_URL=https://almostacms.com
VITE_OAUTH_REDIRECT_URI=https://almostacms.com/auth/callback
VITE_TEMPLATE_OWNER=almostacms
VITE_TEMPLATE_REPO=vcard-portfolio-template

# Note: Client secret should NEVER be in frontend
# Use Cloudflare Workers if you need server-side token exchange
```

**Build Process:**
```bash
# Local build
npm run build

# Output structure (dist/)
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── vendor-[hash].js
└── favicon.ico
```

### GitHub Actions Workflow (For Template Repo)

**`.github/workflows/deploy.yml`:**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install Python dependencies
        run: |
          pip install jinja2

      - name: Generate HTML from JSON
        run: |
          python index_html_generator.py

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

  deploy:
    needs: build
    runs-on: ubuntu-latest

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## Scalability Considerations

### Performance Optimization

**1. Code Splitting:**
```typescript
// Lazy load heavy components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Editor = lazy(() => import('./components/editor/JsonEditor'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/edit/:section" element={<Editor />} />
      </Routes>
    </Suspense>
  );
}
```

**2. API Response Caching:**
```typescript
// Use React Query for caching
import { useQuery } from '@tanstack/react-query';

function useRepoContent(owner: string, repo: string, path: string) {
  return useQuery({
    queryKey: ['content', owner, repo, path],
    queryFn: () => fetchContent(owner, repo, path),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000  // 10 minutes
  });
}
```

**3. Asset Optimization:**
```bash
# Vite automatically handles:
- Tree shaking (removes unused code)
- Minification (reduces file size)
- Code splitting (loads only what's needed)
- Asset hashing (cache busting)
```

### Monitoring & Analytics

**Error Tracking:**
```typescript
// Integrate Sentry (free tier: 5,000 events/month)
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 0.1,
  environment: import.meta.env.MODE
});
```

**Usage Analytics:**
```typescript
// Simple privacy-friendly analytics
class Analytics {
  static track(event: string, properties?: object) {
    // Option 1: Cloudflare Web Analytics (free, privacy-friendly)
    // Option 2: Plausible Analytics (privacy-friendly, paid)
    // Option 3: Custom Cloudflare Workers endpoint

    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ event, properties })
    });
  }
}

// Usage
Analytics.track('repo_created', { template: 'vcard-portfolio' });
Analytics.track('content_saved', { section: 'about' });
Analytics.track('site_deployed', { has_custom_domain: true });
```

### Cost Projections

**At 1,000 monthly active users:**
- Cloudflare Pages: $0 (within free tier)
- Cloudflare Workers: $0 (within free tier)
- Domain: $10/year
- **Total: ~$1/month**

**At 10,000 monthly active users:**
- Cloudflare Pages: $0 (unlimited bandwidth)
- Cloudflare Workers: $5/month (bundled workers plan if needed)
- Domain: $10/year
- **Total: ~$5-6/month**

**At 100,000+ users:**
- Consider Cloudflare Enterprise ($200+/month) for support
- Still no per-user costs
- GitHub API limits become main concern (5,000 req/hour per user)

---

## Future Enhancements

### Phase 2 Features
- **Template Marketplace**: Multiple portfolio themes
- **Live Preview**: Real-time preview pane while editing
- **Team Collaboration**: Share editing access with others
- **Version History**: Visual diff of changes over time
- **Import/Export**: Migrate from other platforms

### Phase 3 Features
- **Custom Components**: Drag-and-drop page builder
- **Analytics Dashboard**: Visitor stats integration
- **SEO Optimizer**: Built-in SEO recommendations
- **Media Library**: Image upload and management
- **Form Builder**: Contact forms with backend integration

### Technical Debt to Address
- Add comprehensive unit tests (Jest + React Testing Library)
- Implement E2E tests (Playwright)
- Set up CI/CD pipeline for automated testing
- Create Storybook for component documentation
- Implement progressive web app (PWA) features

---

## Success Metrics

### Key Performance Indicators (KPIs)

**User Acquisition:**
- Monthly signups
- Activation rate (created first repo)
- Retention rate (30-day active users)

**User Engagement:**
- Average time to first deployment
- Number of content edits per user
- Deploy frequency

**Technical Health:**
- API error rate (target: <1%)
- Page load time (target: <2s)
- Time to interactive (target: <3s)
- Uptime (target: 99.9%)

**Business Metrics:**
- Cost per active user (target: <$0.01)
- GitHub API quota usage
- Cloudflare bandwidth usage

---

## Compliance & Legal

### Data Privacy
- **No personal data storage**: All data lives in user's GitHub account
- **GDPR compliant**: User has full control and portability
- **No cookies**: (except auth tokens, with clear consent)
- **Privacy policy**: Transparent about GitHub API usage

### Terms of Service
- Free tier limitations (if any)
- Acceptable use policy
- GitHub API rate limit disclaimers
- Service availability disclaimers

### Open Source
- **License**: MIT (permissive, allows commercial use)
- **Source code**: Public repository on GitHub
- **Contribution guidelines**: CONTRIBUTING.md
- **Code of conduct**: Community standards

---

## Conclusion

This architecture enables **almostacms.com** to operate as a fully serverless, scalable, and cost-effective SaaS platform. By leveraging GitHub's infrastructure for data storage and GitHub Pages for user hosting, we eliminate traditional backend costs while providing users with full ownership and portability of their content.

The system is designed for:
- **Zero marginal cost scaling** (users bring their own infrastructure)
- **Minimal operational overhead** (no servers to manage)
- **Maximum user value** (free, open-source, portable)
- **Sustainable business model** (optional premium features in future)

Next steps: Proceed to implementation following the component architecture and workflows defined in this document.
