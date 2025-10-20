# AlmostaCMS OAuth Proxy (Cloudflare Worker)

Production-ready OAuth proxy for securely exchanging GitHub authorization codes for access tokens.

## Features

- Serverless edge computing (Cloudflare Workers)
- Environment-based CORS configuration
- Request validation and error handling
- Free tier: 100,000 requests/day
- Global edge deployment (low latency)
- HTTPS by default

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Login to Cloudflare

```bash
npx wrangler login
```

### 3. Configure Secrets

Set your GitHub OAuth credentials as secrets:

```bash
# Production GitHub OAuth App Client ID
npx wrangler secret put GITHUB_CLIENT_ID

# Production GitHub OAuth App Client Secret
npx wrangler secret put GITHUB_CLIENT_SECRET

# Allowed origins (comma-separated)
npx wrangler secret put ALLOWED_ORIGINS
# Example: https://yourdomain.com,https://www.yourdomain.com
```

### 4. Test Locally

```bash
npm run dev
```

Visit: http://localhost:8787/health

### 5. Deploy to Production

```bash
npm run deploy
```

Your worker will be available at:
`https://almostacms-oauth-proxy.YOUR_USERNAME.workers.dev`

## API Endpoints

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "OAuth proxy is running",
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

### POST /auth/token

Exchange GitHub authorization code for access token.

**Request:**
```json
{
  "code": "github_authorization_code_here"
}
```

**Response (Success):**
```json
{
  "access_token": "gho_xxxxxxxxxxxx",
  "token_type": "bearer",
  "scope": "repo,workflow"
}
```

**Response (Error):**
```json
{
  "error": "Token exchange failed",
  "details": "error description"
}
```

## Security

- Client secret stored as Cloudflare secret (never in code)
- CORS restricted to allowed origins only
- Request validation (origin, code format)
- No sensitive data in error messages
- HTTPS enforced automatically

## Monitoring

View real-time logs:

```bash
npm run tail
```

## Cost

**Free Tier:**
- 100,000 requests/day
- Unlimited bandwidth
- 10ms CPU time per request

**Paid (if needed):**
- $5/month for 10M requests
- Additional requests: $0.50 per million

## Troubleshooting

**Error: "Worker exceeded CPU time limit"**
- Worker timing out. Check GitHub API response time.

**Error: "Unauthorized origin"**
- Frontend domain not in ALLOWED_ORIGINS
- Update secret: `wrangler secret put ALLOWED_ORIGINS`

**Error: "Token exchange failed"**
- Invalid GitHub credentials
- Check secrets: `wrangler secret list`

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_CLIENT_ID` | Production GitHub OAuth Client ID | `Ov23liABCDEF123456` |
| `GITHUB_CLIENT_SECRET` | Production GitHub OAuth Client Secret | `abc123def456...` |
| `ALLOWED_ORIGINS` | Comma-separated allowed origins | `https://almostacms.com` |

## Related Documentation

- [docs/OAUTH_PRODUCTION.md](../docs/OAUTH_PRODUCTION.md) - Full production deployment guide
- [docs/OAUTH_SETUP.md](../docs/OAUTH_SETUP.md) - OAuth configuration guide
