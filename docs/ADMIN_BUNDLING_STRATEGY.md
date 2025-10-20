# Admin Bundling Strategy

**Last Updated:** 2025-10-20
**Status:** Design Phase

## Overview

This document defines how the AlmostaCMS admin panel (React app) is bundled and embedded into each generated site, enabling fully decentralized content management.

## Core Requirement

**Each generated site must have its own embedded admin panel:**

```
username.github.io/my-portfolio/        ← The portfolio site
username.github.io/my-portfolio/admin   ← The admin panel
```

**NOT:**
```
almostacms.com/admin                    ← Centralized (bad)
```

## Bundling Approaches Comparison

### Option 1: Pre-built Admin Bundle (Recommended)

```
Template Repository:
├── index.html          ← Portfolio site
├── data/
│   ├── about.json
│   └── ...
└── admin/              ← Pre-built admin SPA
    ├── index.html
    ├── assets/
    │   ├── index-abc123.js
    │   └── index-xyz789.css
    └── .almostacms-admin

Site Generation Flow:
1. User creates site from template
2. Template already has /admin built-in
3. User navigates to /admin
4. Admin auto-detects repo context
5. User edits content directly
```

**Pros:**
- ✅ Simple implementation
- ✅ No build step during site creation
- ✅ Admin works immediately after site creation
- ✅ Easy to test and debug
- ✅ Users can inspect admin code if curious

**Cons:**
- ❌ Admin bundle (~850KB) in every template
- ❌ Updates require template updates
- ❌ Different templates might have different admin versions

### Option 2: Dynamic Admin Injection

```
Site Creation Flow:
1. User creates site from template (no /admin yet)
2. Site creation script:
   a. Builds admin from source
   b. Injects into /admin directory
   c. Commits to user's repo
```

**Pros:**
- ✅ Templates stay lean
- ✅ Always latest admin version
- ✅ Centralized admin updates

**Cons:**
- ❌ Requires build step (slow, dependencies)
- ❌ Complex error handling
- ❌ Harder to debug failures
- ❌ Requires Node.js environment

### Option 3: Admin CDN + Local Storage

```
Site has minimal /admin/index.html:
<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdn.almostacms.com/admin/v1.0.0/admin.js"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

**Pros:**
- ✅ Tiny footprint in templates
- ✅ Easy global updates
- ✅ Shared caching across user sites

**Cons:**
- ❌ Requires CDN infrastructure (cost)
- ❌ Single point of failure
- ❌ Privacy concerns (admin loading from external source)
- ❌ Version compatibility issues
- ❌ Goes against decentralized philosophy

## Recommended Approach: Option 1 (Pre-built Bundle)

### Why Option 1 Wins

1. **Simplicity** - No complex build orchestration
2. **Reliability** - No network dependencies, no build failures
3. **Speed** - Site creation is instant
4. **Transparency** - Users can see exactly what code is running
5. **Alignment with Philosophy** - Fully decentralized, no external dependencies

### Implementation Strategy

#### Step 1: Build Admin for Embedding

Create a production build optimized for embedding:

```bash
# react-cms/package.json
{
  "scripts": {
    "build": "vite build",
    "build:embed": "vite build --base=/admin/ --mode embed"
  }
}
```

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  const isEmbed = mode === 'embed';

  return {
    base: isEmbed ? '/admin/' : '/',
    build: {
      outDir: isEmbed ? 'dist-embed' : 'dist',
      // Optimize for embedding
      rollupOptions: {
        output: {
          // Single chunk for easier deployment
          manualChunks: undefined,
        },
      },
    },
  };
});
```

#### Step 2: Admin Context Detection

The admin needs to know which repository it's managing:

```typescript
// Admin auto-detects context from URL
const repoContext = detectRepoFromURL();

// Example detections:
// https://username.github.io/my-portfolio/admin
//   → owner: username, repo: my-portfolio

// http://localhost:8000/admin (local development)
//   → read from localStorage or .almostacms-admin file

function detectRepoFromURL(): RepoContext | null {
  const url = new URL(window.location.href);

  // GitHub Pages pattern: username.github.io/repo-name/admin
  const match = url.hostname.match(/^(.+?)\.github\.io$/);
  if (match) {
    const username = match[1];
    const pathParts = url.pathname.split('/').filter(Boolean);

    // Remove 'admin' from path
    const repoPath = pathParts.slice(0, -1);

    if (repoPath.length > 0) {
      return {
        owner: username,
        repo: repoPath.join('/'), // Handles nested paths
        deployPath: `/${repoPath.join('/')}/`,
        adminPath: `/${repoPath.join('/')}/admin/`
      };
    } else {
      // Root deployment: username.github.io/admin
      return {
        owner: username,
        repo: `${username}.github.io`,
        deployPath: '/',
        adminPath: '/admin/'
      };
    }
  }

  // Custom domain pattern
  // Check for .almostacms.json at /data/.almostacms.json
  const config = await loadAlmostaCMSConfig();
  if (config) {
    return {
      owner: config.github.owner,
      repo: config.github.repo,
      deployPath: config.deployment.path,
      adminPath: config.deployment.adminPath
    };
  }

  // Local development fallback
  return loadLocalContext();
}
```

#### Step 3: Template Repository Structure

```
vcard-portfolio-template/
├── .almostacms.json          ← Project config
├── index.html                ← Portfolio homepage
├── assets/
│   ├── css/
│   └── images/
├── data/
│   ├── about.json
│   ├── resume.json
│   └── ...
└── admin/                    ← PRE-BUILT ADMIN
    ├── index.html
    ├── assets/
    │   ├── index-abc123.js   (~850KB minified)
    │   ├── index-xyz789.css  (~60KB)
    │   └── ...
    └── .almostacms-admin     ← Admin version marker
```

**`.almostacms-admin` file:**
```json
{
  "version": "1.0.0",
  "buildDate": "2025-10-20T12:00:00Z",
  "adminVersion": "1.0.0"
}
```

#### Step 4: Site Creation Process

```typescript
// Site creation using GitHub template repo
async function createSiteFromTemplate(
  owner: string,
  repoName: string,
  template: 'vcard-portfolio' | 'landing-page'
) {
  // 1. Create repo from template
  await octokit.repos.createUsingTemplate({
    template_owner: 'almostacms',
    template_repo: `${template}-template`,
    owner: owner,
    name: repoName,
    description: `AlmostaCMS ${template}`,
    include_all_branches: false,
    private: false
  });

  // 2. Enable GitHub Pages
  await octokit.repos.createPagesSite({
    owner,
    repo: repoName,
    source: {
      branch: 'main',
      path: '/'
    }
  });

  // 3. Update .almostacms.json with deployment info
  await updateAlmostaCMSConfig(owner, repoName, {
    deployment: {
      url: `https://${owner}.github.io/${repoName}`,
      adminUrl: `https://${owner}.github.io/${repoName}/admin`,
      path: '/',
      adminPath: '/admin/'
    }
  });

  // DONE! Admin is already in the repo from template
  // User can immediately visit /admin and start editing
}
```

#### Step 5: Admin Update Strategy

When we release a new admin version:

1. **Build new admin bundle:**
   ```bash
   cd react-cms
   npm run build:embed
   ```

2. **Update all template repositories:**
   ```bash
   # Script to update templates
   ./scripts/update-template-admin.sh v1.1.0
   ```

   This script:
   - Clones each template repo
   - Replaces `/admin` directory with new build
   - Updates `.almostacms-admin` version
   - Commits and pushes

3. **New sites automatically get latest version**

4. **Existing sites can update via admin UI:**
   ```
   Admin → Settings → Check for Updates
   → "New admin version available: v1.1.0"
   → Click "Update" → Admin updates itself via GitHub API
   ```

## Deployment Path Support

Support both deployment paths:

### Root Deployment (`/`)

```
Repository:
├── index.html           ← Site at username.github.io/repo-name/
└── admin/
    └── index.html       ← Admin at username.github.io/repo-name/admin

.almostacms.json:
{
  "deployment": {
    "path": "/",
    "adminPath": "/admin/",
    "githubPages": {
      "source": { "branch": "main", "path": "/" }
    }
  }
}
```

### Docs Deployment (`/docs`)

```
Repository:
├── src/                 ← Source code (not deployed)
├── README.md
└── docs/                ← Site at username.github.io/repo-name/
    ├── index.html
    └── admin/
        └── index.html   ← Admin at username.github.io/repo-name/admin

.almostacms.json:
{
  "deployment": {
    "path": "/docs/",
    "adminPath": "/docs/admin/",
    "githubPages": {
      "source": { "branch": "main", "path": "/docs" }
    }
  }
}
```

Admin context detection handles both automatically.

## Bundle Size Optimization

Current admin bundle: ~850KB (minified)

### Optimization Strategies

1. **Code Splitting** (Future)
   ```javascript
   // Lazy load sections
   const AboutForm = lazy(() => import('./forms/AboutForm'));
   ```
   Could reduce initial load to ~300KB

2. **Remove Development Dependencies**
   - Tree-shake unused libraries
   - Minimize dependencies in production build

3. **Compression**
   - GitHub Pages serves with gzip
   - 850KB → ~170KB over network

4. **Service Worker Caching** (Future)
   - Cache admin bundle locally
   - Loads instantly on subsequent visits

### Acceptable Trade-off

850KB is acceptable because:
- ✅ Loads once, cached forever
- ✅ Only admin users load it (not site visitors)
- ✅ Smaller than most WordPress dashboards
- ✅ Eliminates ongoing server costs
- ✅ Worth it for complete independence

## Security Considerations

### Content Security Policy

```html
<!-- admin/index.html -->
<meta http-equiv="Content-Security-Policy"
      content="
        default-src 'self';
        script-src 'self';
        style-src 'self' 'unsafe-inline';
        connect-src https://api.github.com https://github.com;
        img-src 'self' https://*.githubusercontent.com data:;
      ">
```

### Token Security

- Tokens stored in `sessionStorage` (cleared on tab close)
- Never expose tokens in URLs or logs
- Validate all GitHub API responses

### Admin Integrity

- Include `.almostacms-admin` version file
- Admin can verify its own integrity
- Warn if admin files are modified

## Testing Strategy

### Local Testing

```bash
# 1. Build admin for embedding
cd react-cms
npm run build:embed

# 2. Copy to test site
cp -r dist-embed/* ../test-site/admin/

# 3. Serve test site
cd ../test-site
python -m http.server 8000

# 4. Open http://localhost:8000/admin
```

### Template Testing

```bash
# Test with actual template repo
./scripts/test-template-creation.sh vcard-portfolio my-test-site
```

### E2E Testing

1. Create site from template via GitHub API
2. Wait for GitHub Pages deployment
3. Visit /admin URL
4. Verify admin loads and detects context
5. Edit content via admin
6. Verify changes saved to repo

## Migration Path

### Phase 1: Dual Mode (Current → Transition)

Support both centralized and embedded admin:
- Keep almostacms.com/admin working
- Add embedded admin to templates
- Users can choose either

### Phase 2: Embedded Default (Transition → Future)

- New sites get embedded admin by default
- Centralized admin shows migration prompt
- Existing users guided to switch

### Phase 3: Fully Decentralized (Future)

- Remove centralized admin completely
- All sites self-hosted
- AlmostaCMS.com becomes pure documentation/landing page

## Implementation Checklist

- [ ] Create `build:embed` script in react-cms
- [ ] Implement repo context detection
- [ ] Update admin to work with base path
- [ ] Create admin update mechanism
- [ ] Add /docs deployment path support
- [ ] Update template repositories with bundled admin
- [ ] Create template update script
- [ ] Test end-to-end flow
- [ ] Update documentation
- [ ] Migrate existing users

## Future Enhancements

1. **Self-Updating Admin**
   - Admin checks for updates on launch
   - One-click update via GitHub API

2. **Admin Plugins**
   - Extend admin with custom plugins
   - Community-created admin extensions

3. **Offline Support**
   - Service Worker for offline admin
   - Sync changes when back online

4. **Multi-Site Management**
   - Manage multiple sites from one admin
   - Switch between sites easily

---

**See Also:**
- [Architecture](./ARCHITECTURE.md) - ADR-003: Embedded admin
- [Device Flow Setup](./DEVICE_FLOW_SETUP.md) - Authentication
- [Business Model](./BUSINESS_MODEL.md) - Decentralized = sustainable
