# GitHub OAuth Setup Guide

This guide walks you through setting up GitHub OAuth authentication for AlmostaCMS.

---

## Overview

GitHub OAuth allows users to authenticate with their GitHub accounts and grants AlmostaCMS permission to:
- Create repositories in their account
- Read and update repository files
- Enable GitHub Pages
- Configure workflows

**Important Note:** The current implementation requires a backend proxy or Cloudflare Worker to exchange the OAuth authorization code for an access token securely. This guide shows you three options.

---

## Step 1: Create a GitHub OAuth App

### 1.1 Navigate to GitHub Developer Settings

1. Log in to GitHub
2. Go to **Settings** → **Developer settings** → **OAuth Apps**
3. Or visit directly: https://github.com/settings/developers

### 1.2 Register a New OAuth Application

Click **"New OAuth App"** and fill in the following:

**For Development (localhost):**
```
Application name: AlmostaCMS Development
Homepage URL: http://localhost:3000
Authorization callback URL: http://localhost:3000/auth/callback
Application description: (optional) Local development instance of AlmostaCMS
```

**For Production (almostacms.com):**
```
Application name: AlmostaCMS
Homepage URL: https://almostacms.com
Authorization callback URL: https://almostacms.com/auth/callback
Application description: (optional) Create beautiful portfolio websites with GitHub Pages
```

### 1.3 Save Your Credentials

After creating the app, you'll see:
- **Client ID**: A public identifier (safe to expose in frontend code)
- **Client Secret**: A private key (MUST be kept secret, server-side only)

Click **"Generate a new client secret"** and save both values securely.

---

## Step 2: Configure Your React App

### 2.1 Create Environment File

In the `react-cms/` directory, create a `.env` file:

```bash
cd react-cms
cp .env.example .env
```

### 2.2 Add Your Client ID

Edit `.env` and add your OAuth credentials:

```bash
# Development
VITE_GITHUB_CLIENT_ID=your_client_id_here
VITE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
VITE_APP_URL=http://localhost:3000
VITE_TEMPLATE_OWNER=almostacms
VITE_TEMPLATE_REPO=vcard-portfolio-template
```

**Important:**
- ✅ `VITE_GITHUB_CLIENT_ID` is **safe** to commit (it's public)
- ❌ **NEVER** add `VITE_GITHUB_CLIENT_SECRET` to `.env` (frontend code is public!)

### 2.3 Update `.gitignore`

Ensure `.env` is ignored (it should already be):

```bash
# In react-cms/.gitignore
.env
.env.local
.env.*.local
```

---

## Step 3: Token Exchange Backend (Choose One Option)

The frontend cannot securely exchange the OAuth code for a token because it would expose the client secret. You **must** implement one of these backend solutions:

### **Option A: Cloudflare Workers (Recommended for Production)**

**Pros:** Free tier (100k requests/day), serverless, edge computing
**Cons:** Requires Cloudflare account

#### Create Worker

```bash
# Install Wrangler CLI
npm install -g wrangler

# Create worker
wrangler init oauth-proxy
cd oauth-proxy
```

#### Worker Code (`src/index.ts`):

```typescript
export interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://almostacms.com', // Or your domain
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Handle token exchange
    if (request.method === 'POST' && new URL(request.url).pathname === '/auth/token') {
      try {
        const { code } = await request.json();

        // Exchange code for token
        const response = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
          }),
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Token exchange failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};
```

#### Deploy Worker

```bash
# Set secrets
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET

# Deploy
wrangler publish
```

#### Update Frontend Code

In `react-cms/src/services/auth.ts`, update `exchangeCodeForToken`:

```typescript
private static async exchangeCodeForToken(code: string): Promise<string | null> {
  const response = await fetch('https://oauth-proxy.your-username.workers.dev/auth/token', {
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

---

### **Option B: Simple Node.js Proxy (Development Only)**

**Pros:** Easy setup, works locally
**Cons:** Requires running a local server, not suitable for production

#### Create Proxy Server

Create `oauth-proxy/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/auth/token', async (req, res) => {
  try {
    const { code } = req.body;

    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Token exchange failed' });
  }
});

app.listen(3001, () => {
  console.log('OAuth proxy running on http://localhost:3001');
});
```

#### Install Dependencies & Run

```bash
npm init -y
npm install express cors axios dotenv

# Create .env
echo "GITHUB_CLIENT_ID=your_client_id" >> .env
echo "GITHUB_CLIENT_SECRET=your_client_secret" >> .env

# Run
node server.js
```

#### Update Frontend

```typescript
private static async exchangeCodeForToken(code: string): Promise<string | null> {
  const response = await fetch('http://localhost:3001/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });

  const data = await response.json();
  return data.access_token;
}
```

---

### **Option C: GitHub Device Flow (No Backend Needed)**

**Pros:** No backend required, GitHub handles everything
**Cons:** Different UX (user enters a code), requires implementing device flow

**Status:** Not yet implemented. See [GitHub Device Flow Docs](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow) for details.

---

## Step 4: Test the OAuth Flow

### 4.1 Start the Application

```bash
# Terminal 1: Start React app
cd react-cms
npm run dev

# Terminal 2 (if using Node.js proxy): Start OAuth proxy
cd oauth-proxy
node server.js
```

### 4.2 Test Authentication

1. Visit `http://localhost:3000`
2. Click **"Login with GitHub"**
3. You should be redirected to GitHub
4. Authorize the app
5. You'll be redirected back to `http://localhost:3000/auth/callback`
6. If successful, you'll land on the dashboard

### 4.3 Troubleshooting

**Error: "Invalid OAuth state"**
- Your state parameter might be expired or tampered with
- Clear browser storage and try again

**Error: "Token exchange not configured"**
- You haven't implemented a token exchange backend yet
- Choose Option A, B, or C above

**Error: "redirect_uri_mismatch"**
- Your callback URL doesn't match GitHub OAuth App settings
- Check both `.env` and GitHub OAuth App settings

**Error: "Unauthorized (401)"**
- Token might be invalid or expired
- Log out and log in again

---

## Step 5: Production Deployment

### 5.1 Create Production OAuth App

Follow Step 1 again but use production URLs:
- Homepage: `https://almostacms.com`
- Callback: `https://almostacms.com/auth/callback`

### 5.2 Deploy to Cloudflare Pages

```bash
# Build the app
cd react-cms
npm run build

# Deploy to Cloudflare Pages (or use dashboard)
wrangler pages publish dist
```

### 5.3 Set Environment Variables

In Cloudflare Pages dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add production variables:
   ```
   VITE_GITHUB_CLIENT_ID=prod_client_id_here
   VITE_OAUTH_REDIRECT_URI=https://almostacms.com/auth/callback
   VITE_APP_URL=https://almostacms.com
   ```

### 5.4 Configure Custom Domain

1. In Cloudflare Pages, go to **Custom domains**
2. Add `almostacms.com`
3. Update DNS (CNAME to `<your-pages>.pages.dev`)

---

## Security Best Practices

### ✅ Do's

- **Use HTTPS** in production (required by GitHub)
- **Validate state parameter** (CSRF protection)
- **Store tokens securely** (sessionStorage, not localStorage)
- **Implement token expiration** (refresh after 8 hours)
- **Use minimal scopes** (`repo` and `workflow` only)
- **Rate limit requests** (GitHub allows 5,000/hour)

### ❌ Don'ts

- **Never expose client secret** in frontend code
- **Never commit `.env`** to version control
- **Never use `localStorage`** for sensitive tokens (prefer sessionStorage)
- **Never skip state validation** (CSRF attacks)
- **Never hardcode credentials** anywhere

---

## Testing OAuth Locally with HTTPS

GitHub OAuth requires HTTPS in production. To test locally:

### Option 1: Use `ngrok`

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Update OAuth App callback to ngrok URL
# e.g., https://abc123.ngrok.io/auth/callback
```

### Option 2: Use `mkcert`

```bash
# Install mkcert
brew install mkcert  # macOS
# or apt install mkcert  # Linux

# Create local CA
mkcert -install

# Create certificate
mkcert localhost

# Update Vite config (vite.config.ts)
server: {
  https: {
    key: fs.readFileSync('./localhost-key.pem'),
    cert: fs.readFileSync('./localhost.pem'),
  },
}
```

---

## FAQ

**Q: Do I need a backend for production?**
A: Yes, you need a token exchange endpoint. Cloudflare Workers (Option A) is recommended.

**Q: Can I use the same OAuth App for dev and prod?**
A: You can, but it's better to create separate apps for security and easier testing.

**Q: What scopes do I need?**
A: `repo` (create/update repos) and `workflow` (enable GitHub Actions). These are the minimum required.

**Q: How long do tokens last?**
A: GitHub OAuth tokens don't expire by default, but you should implement your own expiration for security (we use 8 hours).

**Q: Can users revoke access?**
A: Yes, users can revoke access anytime at https://github.com/settings/applications

---

## Next Steps

Once OAuth is working:
1. ✅ Test creating a repository from template
2. ✅ Test editing and committing files via GitHub API
3. ✅ Test enabling GitHub Pages
4. ✅ Implement error handling for rate limits
5. ✅ Add loading states for better UX

See [docs/ARCHITECTURE.md](./ARCHITECTURE.md) for the complete system design.
