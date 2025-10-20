# OAuth Production Deployment Guide

This guide covers deploying the OAuth proxy to production and making your authentication system production-ready.

## Current Status: Development Only

Your current setup has these limitations:
- ✅ Works locally with `http://localhost:3000` and `http://localhost:3001`
- ❌ CORS hardcoded to localhost (oauth-proxy/server.js:11)
- ❌ No production backend deployed
- ❌ Missing security features (rate limiting, validation)
- ❌ No environment-based configuration

---

## Production Deployment Options

### **Option 1: Cloudflare Workers (Recommended)**

**Pros:**
- Completely free (100K requests/day)
- Serverless edge computing (fast globally)
- Zero maintenance
- Built-in DDoS protection
- HTTPS by default

**Cons:**
- Requires Cloudflare account
- Slightly different code structure

---

## Step 1: Create Production GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in **production** details:

```
Application name: AlmostaCMS
Homepage URL: https://yourdomain.com
Authorization callback URL: https://yourdomain.com/auth/callback
```

4. Save your **Client ID** and **Client Secret**
5. **Important:** Keep these separate from your dev credentials!

---

## Step 2: Deploy OAuth Proxy to Cloudflare Workers

### 2.1 Install Wrangler CLI

```bash
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### 2.2 Create Worker Project

```bash
# Create new directory for worker
mkdir cloudflare-oauth-proxy
cd cloudflare-oauth-proxy

# Initialize worker
npm init -y
npm install --save-dev wrangler
```

### 2.3 Create Worker Code

Create `src/index.ts`:

```typescript
export interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  ALLOWED_ORIGINS: string; // Comma-separated: "https://yourdomain.com,https://www.yourdomain.com"
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    // Parse allowed origins
    const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim());

    // CORS headers (dynamic based on origin)
    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    // Only add origin if it's allowed
    if (allowedOrigins.includes(origin)) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
      corsHeaders['Access-Control-Allow-Credentials'] = 'true';
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Health check endpoint
    if (request.method === 'GET' && url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          message: 'OAuth proxy is running',
          timestamp: new Date().toISOString()
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
        }
      );
    }

    // Token exchange endpoint
    if (request.method === 'POST' && url.pathname === '/auth/token') {
      try {
        // Validate origin
        if (!allowedOrigins.includes(origin)) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized origin' }),
            {
              status: 403,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
        }

        // Parse request body
        const body = await request.json() as { code?: string };
        const { code } = body;

        if (!code || typeof code !== 'string') {
          return new Response(
            JSON.stringify({ error: 'Authorization code is required' }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
        }

        // Validate code format (basic sanity check)
        if (code.length < 10 || code.length > 100) {
          return new Response(
            JSON.stringify({ error: 'Invalid authorization code format' }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
        }

        // Exchange code for token with GitHub
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'AlmostaCMS/1.0',
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error(`GitHub API error: ${tokenResponse.status}`);
        }

        const tokenData = await tokenResponse.json() as any;

        // Check for errors from GitHub
        if (tokenData.error) {
          return new Response(
            JSON.stringify({
              error: 'Token exchange failed',
              details: tokenData.error_description || tokenData.error
            }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
        }

        // Return access token
        return new Response(
          JSON.stringify({
            access_token: tokenData.access_token,
            token_type: tokenData.token_type || 'bearer',
            scope: tokenData.scope || 'repo,workflow'
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            },
          }
        );

      } catch (error) {
        console.error('Token exchange error:', error);

        return new Response(
          JSON.stringify({
            error: 'Token exchange failed',
            message: error instanceof Error ? error.message : 'Unknown error'
          }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        );
      }
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  },
};
```

### 2.4 Create wrangler.toml

```toml
name = "almostacms-oauth-proxy"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# Worker will be available at: https://almostacms-oauth-proxy.YOUR_USERNAME.workers.dev

# Environment variables (configure via dashboard or wrangler secret)
# [vars]
# These are NOT secrets, so they can be in the config
# ALLOWED_ORIGINS = "https://yourdomain.com,https://www.yourdomain.com"

# Secrets (configure via: wrangler secret put SECRET_NAME)
# GITHUB_CLIENT_ID
# GITHUB_CLIENT_SECRET
```

### 2.5 Create tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020"],
    "types": ["@cloudflare/workers-types"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

### 2.6 Update package.json

```json
{
  "name": "almostacms-oauth-proxy",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20241127.0",
    "wrangler": "^3.94.0",
    "typescript": "^5.7.2"
  }
}
```

### 2.7 Deploy Worker

```bash
# Install dependencies
npm install

# Set secrets (will prompt you to enter values)
wrangler secret put GITHUB_CLIENT_ID
# Paste your PRODUCTION Client ID

wrangler secret put GITHUB_CLIENT_SECRET
# Paste your PRODUCTION Client Secret

# Set allowed origins as environment variable
# Option 1: Via command line
wrangler secret put ALLOWED_ORIGINS
# Enter: https://yourdomain.com

# Option 2: Via dashboard (Cloudflare Workers > Settings > Variables)

# Deploy to production
wrangler deploy
```

**Your worker will be available at:**
`https://almostacms-oauth-proxy.YOUR_USERNAME.workers.dev`

---

## Step 3: Update React App for Production

### 3.1 Update Environment Variables

Create `react-cms/.env.production`:

```bash
# Production GitHub OAuth App
VITE_GITHUB_CLIENT_ID=your_production_client_id_here

# Production URLs
VITE_APP_URL=https://yourdomain.com
VITE_OAUTH_REDIRECT_URI=https://yourdomain.com/auth/callback

# Cloudflare Worker URL
VITE_OAUTH_PROXY_URL=https://almostacms-oauth-proxy.YOUR_USERNAME.workers.dev/auth/token

# Template repo
VITE_TEMPLATE_OWNER=almostacms
VITE_TEMPLATE_REPO=vcard-portfolio-template
```

### 3.2 Update react-cms/src/services/auth.ts

Find the `exchangeCodeForToken` method and update it:

```typescript
private static async exchangeCodeForToken(code: string): Promise<string | null> {
  try {
    // Use environment variable for proxy URL
    const proxyUrl = import.meta.env.VITE_OAUTH_PROXY_URL || 'http://localhost:3001/auth/token';

    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Token exchange failed');
    }

    const data = await response.json();

    if (!data.access_token) {
      throw new Error('No access token received');
    }

    return data.access_token;
  } catch (error) {
    console.error('Token exchange error:', error);
    return null;
  }
}
```

### 3.3 Add Proxy URL to .env.example

Update `react-cms/.env.example`:

```bash
# GitHub OAuth Configuration
VITE_GITHUB_CLIENT_ID=your_github_oauth_client_id_here
VITE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
VITE_APP_URL=http://localhost:3000

# OAuth Proxy URL
VITE_OAUTH_PROXY_URL=http://localhost:3001/auth/token

# Template Repository
VITE_TEMPLATE_OWNER=almostacms
VITE_TEMPLATE_REPO=vcard-portfolio-template
```

---

## Step 4: Improve Development OAuth Proxy

### 4.1 Make Local Proxy Environment-Aware

Update `oauth-proxy/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Environment-based CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'OAuth proxy server is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Token exchange endpoint
app.post('/auth/token', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Basic validation
    if (typeof code !== 'string' || code.length < 10 || code.length > 100) {
      return res.status(400).json({ error: 'Invalid authorization code format' });
    }

    console.log('Exchanging code for access token...');

    // Exchange authorization code for access token
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'AlmostaCMS/1.0'
        },
      }
    );

    // Check for GitHub errors
    if (response.data.error) {
      console.error('GitHub OAuth error:', response.data);
      return res.status(400).json({
        error: 'Token exchange failed',
        details: response.data.error_description || response.data.error
      });
    }

    console.log('Token exchange successful');

    // Return only necessary data
    res.json({
      access_token: response.data.access_token,
      token_type: response.data.token_type || 'bearer',
      scope: response.data.scope || 'repo,workflow'
    });

  } catch (error) {
    console.error('Token exchange failed:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Token exchange failed',
      message: error.response?.data?.error_description || error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n🚀 OAuth proxy server running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Token exchange endpoint: http://localhost:${PORT}/auth/token`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Allowed origins: ${allowedOrigins.join(', ')}\n`);

  // Verify environment variables
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    console.warn('⚠️  WARNING: GitHub credentials not found in .env file!');
    console.warn('   Please create a .env file with:');
    console.warn('   GITHUB_CLIENT_ID=your_client_id');
    console.warn('   GITHUB_CLIENT_SECRET=your_client_secret\n');
  } else {
    console.log('✅ GitHub credentials loaded from .env\n');
  }
});
```

### 4.2 Update oauth-proxy/.env.example

```bash
# GitHub OAuth App Credentials (Development)
# Get these from: https://github.com/settings/developers
GITHUB_CLIENT_ID=your_github_dev_client_id_here
GITHUB_CLIENT_SECRET=your_github_dev_client_secret_here

# Allowed origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Server port
PORT=3001

# Node environment
NODE_ENV=development
```

---

## Step 5: Deploy React App to Production

### 5.1 Build React App

```bash
cd react-cms
npm run build
```

### 5.2 Deploy to Cloudflare Pages

```bash
# Option 1: Using Wrangler
wrangler pages deploy dist --project-name=almostacms

# Option 2: Using Cloudflare Dashboard
# Go to Workers & Pages > Create application > Pages > Connect to Git
```

### 5.3 Configure Environment Variables in Cloudflare Pages

In Cloudflare Pages dashboard:
1. Go to **Settings** > **Environment variables**
2. Add production variables:

```
VITE_GITHUB_CLIENT_ID = your_production_client_id
VITE_OAUTH_REDIRECT_URI = https://yourdomain.com/auth/callback
VITE_APP_URL = https://yourdomain.com
VITE_OAUTH_PROXY_URL = https://almostacms-oauth-proxy.YOUR_USERNAME.workers.dev/auth/token
VITE_TEMPLATE_OWNER = almostacms
VITE_TEMPLATE_REPO = vcard-portfolio-template
```

---

## Step 6: Testing Production Setup

### 6.1 Test Worker Health Check

```bash
curl https://almostacms-oauth-proxy.YOUR_USERNAME.workers.dev/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "OAuth proxy is running",
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

### 6.2 Test Full OAuth Flow

1. Visit your production site: `https://yourdomain.com`
2. Click "Login with GitHub"
3. Authorize on GitHub
4. Verify redirect to dashboard

### 6.3 Monitor for Errors

Check Cloudflare Workers logs:
```bash
wrangler tail almostacms-oauth-proxy
```

---

## Alternative: Deploy to Railway/Render (Node.js)

If you prefer traditional hosting over Cloudflare Workers:

### **Railway**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init

# Add environment variables via dashboard
railway variables set GITHUB_CLIENT_ID=xxx
railway variables set GITHUB_CLIENT_SECRET=xxx
railway variables set ALLOWED_ORIGINS=https://yourdomain.com

# Deploy
railway up
```

### **Render**

1. Create account at render.com
2. Click "New Web Service"
3. Connect GitHub repo
4. Configure:
   - Build Command: `cd oauth-proxy && npm install`
   - Start Command: `cd oauth-proxy && npm start`
   - Add environment variables in dashboard

---

## Security Checklist

- [ ] Separate dev and production GitHub OAuth apps
- [ ] Client secret stored as Cloudflare secret (never in code)
- [ ] CORS restricted to production domain only
- [ ] HTTPS enforced (automatic with Cloudflare)
- [ ] Request validation (code format, origin)
- [ ] Error messages don't leak sensitive info
- [ ] Health check doesn't expose secrets
- [ ] Rate limiting considered (Cloudflare provides basic protection)

---

## Cost Breakdown

**Cloudflare Workers (Free Tier):**
- 100,000 requests/day free
- Unlimited bandwidth
- Zero maintenance

**Expected costs at scale:**
- 0-100K requests/day: **$0/month**
- 100K-1M requests/day: **$5/month** (Workers Paid plan)
- Custom domain: **$10-15/year** (if needed)

---

## Troubleshooting

**Error: "Worker exceeded CPU time limit"**
- Your worker is timing out. Optimize token exchange logic.

**Error: "CORS policy: No 'Access-Control-Allow-Origin'"**
- Check ALLOWED_ORIGINS includes your frontend domain
- Verify frontend is using HTTPS in production

**Error: "Token exchange failed: 401"**
- Wrong GitHub client credentials
- Check secrets are set correctly: `wrangler secret list`

**Error: "redirect_uri_mismatch"**
- Callback URL doesn't match GitHub OAuth app
- Update GitHub OAuth app settings

---

## Next Steps

Once deployed:
1. Monitor Cloudflare Workers analytics
2. Set up error logging (Sentry integration)
3. Consider adding rate limiting for high traffic
4. Document the production URLs for your team

Your OAuth is now production-ready! 🚀
