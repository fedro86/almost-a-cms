# Getting Started with AlmostaCMS v2.0

Welcome to AlmostaCMS! This guide will help you get the GitHub OAuth-enabled version up and running.

---

## What's New in v2.0

The project now includes:
- ✨ **GitHub OAuth Authentication** - Secure login with GitHub
- 🚀 **Multi-tenant Architecture** - Each user manages their own portfolio repo
- 🔒 **Repository Isolation** - Content lives in user's GitHub account
- 🌐 **Serverless Design** - Ready for Cloudflare Pages deployment
- 📱 **Modern Landing Page** - Beautiful marketing page
- 🎯 **Protected Routes** - Auth-gated dashboard access

---

## Quick Start

### Prerequisites

- **Node.js** 16+ and npm
- **GitHub Account** (for OAuth setup)
- **Git** installed

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/almost-a-cms.git
cd almost-a-cms/react-cms
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up GitHub OAuth

**Important:** You need a GitHub OAuth App to enable authentication.

Follow the detailed guide: **[docs/OAUTH_SETUP.md](./OAUTH_SETUP.md)**

Quick version:
1. Go to https://github.com/settings/developers
2. Create a new OAuth App
3. Copy the Client ID
4. Create `.env` file in `react-cms/`:
   ```bash
   cp .env.example .env
   ```
5. Add your Client ID:
   ```
   VITE_GITHUB_CLIENT_ID=your_client_id_here
   VITE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
   ```

### 4. Set Up Token Exchange Backend

**⚠️ Critical Step:** The frontend cannot complete OAuth without a backend to exchange tokens.

Choose one option from [docs/OAUTH_SETUP.md](./OAUTH_SETUP.md):
- **Option A:** Cloudflare Workers (recommended for production)
- **Option B:** Node.js proxy (easy for development)
- **Option C:** GitHub Device Flow (coming soon)

For quick testing, use **Option B** (Node.js proxy):

```bash
# Create oauth-proxy directory
mkdir oauth-proxy
cd oauth-proxy

# Create server.js (see OAUTH_SETUP.md for code)
# Install dependencies
npm init -y
npm install express cors axios dotenv

# Create .env with your GitHub credentials
echo "GITHUB_CLIENT_ID=your_client_id" > .env
echo "GITHUB_CLIENT_SECRET=your_client_secret" >> .env

# Run proxy
node server.js
```

### 5. Update Frontend Code

Edit `react-cms/src/services/auth.ts` and update the `exchangeCodeForToken` method:

```typescript
private static async exchangeCodeForToken(code: string): Promise<string | null> {
  const response = await fetch('http://localhost:3001/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });

  if (!response.ok) {
    throw new Error('Token exchange failed');
  }

  const data = await response.json();
  return data.access_token;
}
```

### 6. Start the Application

```bash
# Terminal 1: React app
cd react-cms
npm run dev

# Terminal 2: OAuth proxy
cd oauth-proxy
node server.js
```

### 7. Open in Browser

Visit **http://localhost:3000**

You should see:
- Beautiful landing page
- "Login with GitHub" button
- Features showcase
- How it works section

---

## Testing the OAuth Flow

### Step-by-Step Test

1. **Click "Login with GitHub"**
   - You'll be redirected to `github.com/login/oauth/authorize`
   - GitHub asks you to authorize the app

2. **Authorize the Application**
   - Review the permissions (repo, workflow)
   - Click "Authorize"

3. **Callback Processing**
   - You'll be redirected to `/auth/callback`
   - See a loading spinner
   - Token exchange happens in background

4. **Dashboard Redirect**
   - Once authenticated, redirected to `/dashboard`
   - You'll see the content management interface

5. **Test Logout**
   - Click your avatar in top bar
   - Click "Logout"
   - You should return to landing page

### Troubleshooting

**"Token exchange not configured" error:**
- You haven't implemented the backend proxy yet
- See Step 4 above

**"redirect_uri_mismatch" error:**
- Your `.env` callback URL doesn't match GitHub OAuth App settings
- Check both and make sure they're identical

**"Invalid OAuth state" error:**
- CSRF protection failed
- Clear browser storage and try again
- Ensure you're using HTTPS in production

**401 Unauthorized:**
- Token is invalid or expired
- Log out and log in again

---

## Project Structure

```
react-cms/
├── src/
│   ├── components/
│   │   ├── auth/                    # Authentication components
│   │   │   ├── LoginButton.tsx      # GitHub login button
│   │   │   ├── AuthCallback.tsx     # OAuth callback handler
│   │   │   └── ProtectedRoute.tsx   # Route protection
│   │   ├── forms/                   # Content editing forms
│   │   └── Layout.tsx               # App shell
│   │
│   ├── pages/
│   │   ├── Landing.tsx              # Public landing page
│   │   ├── Dashboard.tsx            # Content dashboard
│   │   └── DashboardWrapper.tsx     # Authenticated dashboard
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx          # Authentication state
│   │
│   ├── hooks/
│   │   ├── useAuth.ts               # Auth hook
│   │   ├── useGitHub.ts             # GitHub API hook
│   │   └── useApi.ts                # Legacy API hook
│   │
│   ├── services/
│   │   ├── auth.ts                  # OAuth service
│   │   └── github-api.ts            # GitHub API client
│   │
│   ├── utils/
│   │   └── tokenStorage.ts          # Secure token storage
│   │
│   ├── config/
│   │   ├── github.ts                # GitHub OAuth config
│   │   └── constants.ts             # App constants
│   │
│   ├── App.tsx                      # Root component with routing
│   └── main.tsx                     # Entry point
│
├── .env.example                     # Environment template
├── .env                             # Your config (git-ignored)
└── package.json
```

---

## Current Features

### ✅ Implemented

- GitHub OAuth authentication flow
- Secure token storage (sessionStorage)
- CSRF protection (state parameter)
- Protected routes (dashboard requires auth)
- User profile display
- Beautiful landing page
- Logout functionality
- Error handling and loading states

### 🚧 In Progress / TODO

The following features are **designed** but need implementation:

1. **Repository Management**
   - Create portfolio repo from template
   - List user's repositories
   - Select active portfolio

2. **Content Editing via GitHub API**
   - Load JSON files from GitHub repo
   - Edit content in React interface
   - Commit changes back to repo

3. **One-Click Deployment**
   - Enable GitHub Pages automatically
   - Trigger workflow builds
   - Show deployment status

4. **Custom Domain Configuration**
   - Add custom domain to GitHub Pages
   - Show DNS configuration instructions

5. **Template System**
   - Create template repository
   - Multiple template options
   - Template customization

---

## Development Workflow

### Running Tests

```bash
# Unit tests (not yet implemented)
npm test

# E2E tests (not yet implemented)
npm run test:e2e
```

### Building for Production

```bash
npm run build

# Preview production build
npm run preview
```

### Code Quality

```bash
# Type checking
npx tsc --noEmit

# Linting (if configured)
npm run lint
```

---

## Architecture Overview

The application follows a **serverless, multi-tenant architecture**:

1. **Frontend:** React SPA hosted on Cloudflare Pages
2. **Authentication:** GitHub OAuth with backend token exchange
3. **Data Storage:** User's GitHub repository (no database!)
4. **Deployment:** GitHub Pages (user's own infrastructure)

For detailed architecture information, see:
- **[docs/ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system design
- **[docs/OAUTH_SETUP.md](./OAUTH_SETUP.md)** - OAuth implementation guide

---

## Next Steps

### Phase 1: Complete OAuth Implementation

1. ✅ Set up GitHub OAuth App
2. ✅ Implement token exchange backend
3. ✅ Test authentication flow
4. ⬜ Implement error recovery
5. ⬜ Add token refresh logic

### Phase 2: Repository Management

1. ⬜ Create template repository (vcard-portfolio-template)
2. ⬜ Implement "Create Portfolio" flow
3. ⬜ Add repository selection UI
4. ⬜ Test repo creation from template
5. ⬜ Enable GitHub Pages automatically

### Phase 3: Content Editing

1. ⬜ Load JSON files via GitHub API
2. ⬜ Update useApi hook to use GitHub API
3. ⬜ Commit changes to user's repo
4. ⬜ Show commit history
5. ⬜ Add preview functionality

### Phase 4: Deployment

1. ⬜ Deploy frontend to Cloudflare Pages
2. ⬜ Deploy OAuth proxy to Cloudflare Workers
3. ⬜ Configure custom domain (almostacms.com)
4. ⬜ Set up monitoring and analytics
5. ⬜ Launch! 🚀

---

## Contributing

We welcome contributions! Here's how to help:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit your changes:** `git commit -m 'Add amazing feature'`
4. **Push to branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style (TypeScript + functional components)
- Add comments for complex logic
- Update documentation when adding features
- Test OAuth flow thoroughly
- Keep security in mind (never expose secrets)

---

## Resources

### Documentation
- [Architecture Design](./ARCHITECTURE.md)
- [OAuth Setup Guide](./OAUTH_SETUP.md)
- [GitHub OAuth Docs](https://docs.github.com/en/apps/oauth-apps)
- [Octokit.js Docs](https://octokit.github.io/rest.js/)

### Tech Stack
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)

### Deployment
- [Cloudflare Pages](https://pages.cloudflare.com/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [GitHub Pages](https://pages.github.com/)

---

## Support

- **Issues:** https://github.com/almostacms/almost-a-cms/issues
- **Discussions:** https://github.com/almostacms/almost-a-cms/discussions
- **Documentation:** https://github.com/almostacms/almost-a-cms/tree/main/docs

---

## License

MIT License - see [LICENSE](../LICENSE) for details

---

**Happy coding! 🚀**
