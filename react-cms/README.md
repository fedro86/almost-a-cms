# Almost-a-CMS React Application

The modern React-based CMS interface for managing portfolio websites via GitHub API.

---

## Features

### GitHub Integration
- **OAuth Authentication** - Secure login with GitHub
- **Direct API Integration** - No backend database needed
- **Repository Management** - Create and manage portfolio repos
- **Live Updates** - Changes commit directly to GitHub
- **Auto-deployment** - GitHub Actions rebuilds site on save

### User Experience
- **Intuitive Dashboard** - Content section cards with visual icons
- **Form-based Editing** - No JSON manipulation required
- **Real-time Validation** - Instant feedback on data format
- **Loading States** - Progress indicators for async operations
- **Error Handling** - User-friendly error messages

### Design
- **Modern Interface** - Built with Tailwind CSS
- **Fully Responsive** - Optimized for all screen sizes
- **Mobile-First** - Touch-friendly interactions
- **Smooth Animations** - Professional transitions
- **Dark Mode Ready** - Easily extendable theme system

---

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Heroicons** for consistent iconography
- **Octokit/GitHub API** for repository operations
- **React Router** for navigation

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **OAuth Proxy Server** running (see [../oauth-proxy/README.md](../oauth-proxy/README.md))
- **GitHub OAuth App** configured (see [../docs/OAUTH_SETUP.md](../docs/OAUTH_SETUP.md))

### Installation

1. **Install dependencies:**
   ```bash
   cd react-cms
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your GitHub OAuth Client ID:
   ```bash
   VITE_GITHUB_CLIENT_ID=your_client_id_here
   VITE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
   VITE_APP_URL=http://localhost:3000
   VITE_TEMPLATE_OWNER=almostacms
   VITE_TEMPLATE_REPO=vcard-portfolio-template
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

---

## Development Workflow

### Running the Full Stack

You need **two terminal windows**:

**Terminal 1: OAuth Proxy**
```bash
cd oauth-proxy
npm start
# Server runs on http://localhost:3001
```

**Terminal 2: React App**
```bash
cd react-cms
npm run dev
# App runs on http://localhost:3000
```

### Project Structure

```
react-cms/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── setup/          # First-time setup wizard
│   │   └── Layout.tsx      # Main layout component
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication state
│   ├── hooks/              # Custom React hooks
│   │   ├── useApi.ts       # GitHub API operations
│   │   ├── useGitHub.ts    # GitHub repository management
│   │   └── useRepo.ts      # Active repository state
│   ├── pages/              # Route pages
│   │   ├── Landing.tsx     # Landing/marketing page
│   │   └── DashboardWrapper.tsx # Main dashboard
│   ├── services/           # Service layer
│   │   ├── auth.ts         # OAuth authentication
│   │   └── github-api.ts   # GitHub API wrapper
│   ├── utils/              # Utility functions
│   │   └── tokenStorage.ts # Secure token storage
│   ├── config/             # Configuration
│   │   ├── constants.ts    # App constants
│   │   └── github.ts       # GitHub API config
│   └── App.tsx             # Main app with routing
├── public/                 # Static assets
├── .env.example            # Environment template
└── package.json
```

---

## Available Scripts

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

---

## Key Components

### Authentication Flow
1. User clicks "Login with GitHub" on Landing page
2. Redirected to GitHub OAuth authorization
3. GitHub redirects back with authorization code
4. Code exchanged for access token via OAuth proxy
5. Token stored securely in sessionStorage
6. User authenticated and redirected to dashboard

### Content Editing Flow
1. User selects content section (About, Resume, etc.)
2. React form loads current data from GitHub repository
3. User edits content in form fields
4. On save, creates commit with changes to GitHub
5. GitHub Actions workflow triggered automatically
6. Static site rebuilt and deployed to GitHub Pages

### Repository Management
- **First-time users:** Guided through repository creation wizard
- **Returning users:** Auto-loads previously selected repository
- **Repository switching:** Can manage multiple portfolio repos

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | `Ov23litiAP9ip6g2JQGv` |
| `VITE_OAUTH_REDIRECT_URI` | OAuth callback URL | `http://localhost:3000/auth/callback` |
| `VITE_APP_URL` | Application base URL | `http://localhost:3000` |
| `VITE_TEMPLATE_OWNER` | Template repo owner | `almostacms` |
| `VITE_TEMPLATE_REPO` | Template repo name | `vcard-portfolio-template` |

---

## Security Notes

- **Client Secret:** Never exposed to frontend (handled by oauth-proxy)
- **Access Tokens:** Stored in sessionStorage (cleared on browser close)
- **CSRF Protection:** OAuth state parameter validates callback
- **Scope Limitation:** Only requests necessary GitHub permissions

---

## Documentation

For comprehensive guides, see:
- [Getting Started Guide](../docs/GETTING_STARTED.md)
- [OAuth Setup](../docs/OAUTH_SETUP.md)
- [Architecture Documentation](../docs/ARCHITECTURE.md)
- [OAuth Proxy Setup](../oauth-proxy/README.md)

---

## Troubleshooting

### "Cannot connect to OAuth proxy"
**Solution:** Ensure oauth-proxy is running on port 3001
```bash
cd oauth-proxy && npm start
```

### "Authentication failed"
**Solution:** Check your `.env` has correct GitHub Client ID

### "Repository creation failed"
**Solution:** Verify template repository exists and is accessible

### CORS errors
**Solution:** OAuth proxy must be running on localhost:3001

---

## Contributing

This is the main application interface for Almost-a-CMS. When contributing:

1. Follow TypeScript best practices
2. Maintain responsive design patterns
3. Add proper error handling
4. Update this README if adding new features
5. Test OAuth flow thoroughly

---

## License

MIT License - See [../LICENSE](../LICENSE) for details
