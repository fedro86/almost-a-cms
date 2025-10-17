# OAuth Proxy Server (Development Only)

This is a simple Node.js server that handles GitHub OAuth token exchange for local development.

**⚠️ WARNING:** This server is for **development only**. Do not use in production!

For production, use Cloudflare Workers or another serverless solution.

---

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Create a new OAuth App with these settings:
   - **Application name:** AlmostaCMS Development
   - **Homepage URL:** http://localhost:3000
   - **Authorization callback URL:** http://localhost:3000/auth/callback
3. Copy the **Client ID** and **Client Secret**

### 3. Create .env File

Copy the example and add your credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your GitHub OAuth credentials:

```bash
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
```

---

## Usage

### Start the Server

```bash
npm start
```

Or directly:

```bash
node server.js
```

The server will start on **http://localhost:3001**

### Test the Server

Check if it's running:

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "OAuth proxy server is running"
}
```

---

## How It Works

1. React app redirects user to GitHub OAuth
2. User authorizes the app
3. GitHub redirects back to React app with authorization `code`
4. React app sends `code` to this proxy server
5. Proxy exchanges `code` for `access_token` using GitHub API
6. Proxy returns `access_token` to React app
7. React app stores token and makes authenticated requests

---

## Security Notes

- **Never commit `.env` file** (it contains your client secret)
- The `.gitignore` file is configured to exclude `.env`
- This proxy uses CORS to only allow requests from `http://localhost:3000`
- Client secret is kept server-side and never exposed to the browser

---

## Endpoints

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "message": "OAuth proxy server is running"
}
```

### POST /auth/token
Exchange OAuth code for access token

**Request:**
```json
{
  "code": "github_authorization_code"
}
```

**Response (Success):**
```json
{
  "access_token": "gho_xxxxxxxxxxxxx",
  "token_type": "bearer",
  "scope": "repo,workflow"
}
```

**Response (Error):**
```json
{
  "error": "Token exchange failed",
  "details": "error message"
}
```

---

## Troubleshooting

### Server won't start

**Check Node.js version:**
```bash
node --version  # Should be 16+ or higher
```

**Reinstall dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### "GitHub credentials not found" warning

Make sure your `.env` file exists and contains valid credentials:

```bash
cat .env
```

Should show:
```
GITHUB_CLIENT_ID=your_actual_client_id
GITHUB_CLIENT_SECRET=your_actual_client_secret
```

### Token exchange fails

**Check GitHub OAuth App settings:**
- Callback URL must be: `http://localhost:3000/auth/callback`
- Client ID and secret must match your `.env` file

**Check server logs:**
The server logs all requests and errors. Look for error messages in the terminal.

---

## Development Workflow

1. Start the OAuth proxy server (this directory):
   ```bash
   npm start
   ```

2. In another terminal, start the React app:
   ```bash
   cd ../react-cms
   npm run dev
   ```

3. Visit http://localhost:3000 and test the login flow

---

## Production Migration

When moving to production, replace this proxy with:

### Option 1: Cloudflare Workers (Recommended)

See [`docs/OAUTH_SETUP.md`](../docs/OAUTH_SETUP.md) for instructions.

Benefits:
- Free tier: 100,000 requests/day
- Serverless, no maintenance
- Global edge network
- Automatic scaling

### Option 2: Other Serverless Options

- AWS Lambda + API Gateway
- Vercel Serverless Functions
- Netlify Functions

---

## Files

- `server.js` - Main server code
- `package.json` - Dependencies and scripts
- `.env` - Your GitHub OAuth credentials (git-ignored)
- `.env.example` - Template for environment variables
- `.gitignore` - Ensures secrets aren't committed
- `README.md` - This file
