# Contributing to AlmostaCMS

Thank you for your interest in contributing to AlmostaCMS! This guide covers everything you need to know.

---

## Table of Contents

- [Ways to Contribute](#ways-to-contribute)
- [Development Setup](#development-setup)
- [Architecture Overview](#architecture-overview)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Configuration Reference](#configuration-reference)
- [Getting Help](#getting-help)

---

## Ways to Contribute

### 1. Code Contributions (Admin Panel Development)
Improve the React admin interface:
- Fix bugs
- Add new features
- Improve performance
- Enhance UI/UX
- Write tests

### 2. Template Contributions (Create New Templates)
Design and build new website templates using the **Template Development Kit**. The kit includes everything you need: setup wizard, validation tools, boilerplate code, and complete documentation.

**Quick start:**
```bash
cd template-dev-kit
./scripts/setup-template.sh
```

See [template-dev-kit/README.md](template-dev-kit/README.md) for the complete guide.

### 3. Documentation
- Fix typos and errors
- Add examples
- Clarify confusing sections
- Update guides

### 4. Bug Reports & Feature Requests
- Report bugs with detailed reproduction steps
- Suggest new features
- Share use cases and ideas

---

## Development Setup

### Prerequisites

**Required:**
- Node.js 18+ and npm
- Git
- GitHub Account (to create OAuth Apps)

**Recommended:**
- VS Code or your preferred editor
- GitHub CLI (`gh`)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/almost-a-cms.git
cd almost-a-cms

# 2. Install dependencies
cd react-cms
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your GitHub OAuth App Client ID

# 4. Start development server
npm run dev

# 5. Open http://localhost:5173
```

### GitHub OAuth Setup

AlmostaCMS uses **GitHub Device Flow** for authentication (no backend needed!).

**Create a GitHub OAuth App:**

1. Go to: https://github.com/settings/developers
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in:
   ```
   Application name: AlmostaCMS (Local Dev)
   Homepage URL: http://localhost:5173
   Authorization callback URL: http://localhost:5173/auth/callback
   ```
4. Copy the **Client ID** to `.env`:
   ```env
   VITE_GITHUB_CLIENT_ID=Ov23liAbC1234567890
   ```

**How Device Flow works:**
1. User clicks "Login with GitHub"
2. Admin shows a code (e.g., `WDJB-MJHT`)
3. User enters code on GitHub
4. Admin receives token (stored in localStorage)
5. User is authenticated!

No backend server needed - everything happens client-side.

### Development Commands

```bash
cd react-cms

# Development
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build standard version (base: /)
npm run build:embed  # Build for templates (base: /admin/)
npm run preview      # Preview production build

# Type checking
npx tsc --noEmit     # Check TypeScript errors
```

### Building the Admin Bundle

The admin bundle gets embedded into template repositories:

```bash
# From repository root
./scripts/prepare-admin-bundle.sh 1.0.0
```

This creates `admin-bundle/` directory (~950KB, ~180KB gzipped) ready to copy to templates.

---

## Architecture Overview

### Core Concept

AlmostaCMS is **fully decentralized** - each user site is completely independent:

```
User's Site: username.github.io/my-site
                    ↓
         /admin (embedded React app)
                    ↓
    GitHub Device Flow Login (no backend!)
                    ↓
         GitHub API (edits data/*.json)
                    ↓
       Commits to repository
                    ↓
    GitHub Actions auto-deploys
                    ↓
         Live in 30 seconds
```

**Key Point:** Zero centralized infrastructure. Each site has its own embedded admin.

### Directory Structure

```
react-cms/src/
├── components/          # React UI components
│   ├── auth/           # DeviceFlowLogin, AuthCallback
│   ├── common/         # Reusable components
│   ├── content/        # Content editor forms
│   └── dashboard/      # Dashboard widgets
│
├── services/           # Core business logic
│   ├── github-api.ts           # GitHub API wrapper (Octokit)
│   ├── device-flow-auth.ts     # Device Flow OAuth service
│   └── repo-context.ts         # Auto-detect repo from URL
│
├── hooks/              # Custom React hooks
│   ├── useApi.ts       # GitHub API operations
│   ├── useAuth.ts      # Authentication state
│   └── useRepo.ts      # Repository management
│
├── contexts/
│   └── AuthContext.tsx # Global auth state
│
└── pages/              # Route pages
```

### Key Technical Decisions

**Dual Build Modes:**
- **Standard** (`npm run build`): Development, base path `/`
- **Embed** (`npm run build:embed`): Production templates, base path `/admin/`

**Repository Auto-Detection:**
Admin automatically detects which repo it's editing from:
1. URL pattern (`username.github.io/repo-name/admin`)
2. Config file (`.almostacms.json`)
3. localStorage (dev override)

**Deployment Path Support:**
- **Root**: Files in `/`, admin at `/admin`, data at `/data`
- **Docs**: Files in `/docs`, admin at `/docs/admin`, data at `/docs/data`

---

## Development Workflow

### Making Changes

1. **Fork and create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in `react-cms/src/`

3. **Test locally:**
   ```bash
   npm run dev
   ```

4. **Verify both build modes:**
   ```bash
   npm run build        # Standard build
   npm run build:embed  # Embed build
   npx tsc --noEmit     # TypeScript check
   ```

5. **Commit with conventional format:**
   ```bash
   git commit -m "feat: add your feature description"
   ```

   Commit types:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation
   - `style:` Code formatting
   - `refactor:` Code refactoring
   - `test:` Tests
   - `chore:` Maintenance

6. **Push and create a Pull Request:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Before Submitting a PR

**Checklist:**
- [ ] Both builds work (`npm run build` && `npm run build:embed`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Code follows existing patterns
- [ ] Complex logic has comments
- [ ] Documentation updated if needed

---

## Code Style Guidelines

### TypeScript
- Use strict mode
- Avoid `any` - use proper types
- Type all function parameters and returns

### Components
- Functional components with hooks
- PascalCase naming (e.g., `DeviceFlowLogin.tsx`)
- Keep files under 300 lines
- Extract complex logic to hooks

### Hooks
- camelCase with `use` prefix (e.g., `useApi.ts`)
- Single responsibility
- Document complex hooks

### Services
- kebab-case file names (e.g., `device-flow-auth.ts`)
- Class-based or functional
- Clear, descriptive function names

### Code Comments
- Explain **why**, not **what**
- Document non-obvious decisions
- Add TODO comments for future improvements

---

## Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Device Flow login works
- [ ] Device code displays correctly
- [ ] Token stored in localStorage
- [ ] Logout clears token

**Repository Detection:**
- [ ] Auto-detects from URL
- [ ] Falls back to config file
- [ ] localStorage override works

**Content Management:**
- [ ] Can load JSON files from `data/`
- [ ] Can edit and save content
- [ ] Commits show up on GitHub
- [ ] File paths work for both deployment modes

**Build Verification:**
- [ ] Standard build works
- [ ] Embed build works
- [ ] Bundle size reasonable (~950KB)
- [ ] No console errors in production

### Automated Tests

(Coming soon: Vitest unit tests, Playwright E2E tests)

---

## Configuration Reference

### `.almostacms.json`

Configuration file at repository root (for template repositories):

```json
{
  "version": "1.0",
  "deployment": {
    "path": "/",                  // or "/repo-name/" for project pages
    "adminPath": "/admin/",
    "source": {
      "branch": "main",
      "path": "/"                 // "/" for root, "/docs" for docs
    }
  },
  "content": {
    "dataPath": "data/"           // or "docs/data/"
  }
}
```

### `.env` (react-cms/)

```env
# GitHub OAuth App Client ID (public, safe to expose)
VITE_GITHUB_CLIENT_ID=Ov23liAbC1234567890

# Optional: Custom GitHub API URL
VITE_GITHUB_API_BASE_URL=https://api.github.com
```

### Build Outputs

**Standard Build** (`dist/`):
- Base path: `/`
- For development and testing

**Embed Build** (`dist-embed/`):
- Base path: `/admin/`
- For production templates
- ~950KB JS, ~58KB CSS

**Admin Bundle** (`admin-bundle/`):
- Prepared by `./scripts/prepare-admin-bundle.sh`
- Includes version marker (`.almostacms-admin`)
- Ready to copy to template repos

---

## Troubleshooting

### "Module not found" errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### OAuth redirect not working

- Check GitHub OAuth App callback URL matches
- Verify `.env` has correct Client ID
- Ensure running on port 5173

### Build fails

```bash
npx tsc --noEmit    # Check TypeScript errors
rm -rf dist dist-embed
npm run build
```

### Device Flow not working

- Verify `VITE_GITHUB_CLIENT_ID` is set
- Check browser console for errors
- Clear browser cache/storage
- Ensure OAuth App configured correctly

---

## Getting Help

**Questions?**
- GitHub Discussions: Ask questions and discuss ideas
- Issues: Report bugs or request features

**Review Process:**
1. Automated checks must pass
2. Code review by maintainers
3. Feedback and improvements
4. Approval and merge!

**Response Time:** We aim to respond within 2-3 days.

---

## Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Focus on constructive feedback
- Assume good intentions

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Recognition

Contributors will be:
- Listed in the README
- Credited in release notes
- Featured in our showcase (for template creators)

---

## Additional Resources

- **Template Development Kit:** [template-dev-kit/README.md](template-dev-kit/README.md)
- **Template Creation Guide:** [docs/CREATING_TEMPLATES.md](docs/CREATING_TEMPLATES.md)
- **GitHub Device Flow:** https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow
- **React Docs:** https://react.dev/
- **Vite Docs:** https://vitejs.dev/

---

**Thank you for contributing!** Every contribution makes AlmostaCMS better. 🚀

**Questions?** Open an issue or start a discussion!
