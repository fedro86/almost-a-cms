# GitHub Device Flow Setup

**Last Updated:** 2025-10-20
**Status:** Implemented

## Overview

AlmostaCMS uses GitHub Device Flow for authentication - a decentralized OAuth method that requires **no backend server**. This eliminates infrastructure costs and enables truly distributed authentication.

## Why Device Flow?

### Traditional OAuth Problems
```
User → AlmostaCMS Server → GitHub
       ↑
    Your infrastructure cost
    Client secret exposure risk
    Single point of failure
```

### Device Flow Benefits
```
User → GitHub (direct)
  ↓
Access Token (no intermediary)
```

**Advantages:**
- ✅ Zero backend/proxy server needed
- ✅ No client secret to secure
- ✅ Works from any device
- ✅ Better for CLI and embedded scenarios
- ✅ Scales infinitely at zero cost
- ✅ More secure (no token proxy)

## Setup Instructions

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"** (or edit existing)
3. Fill in the form:
   ```
   Application name: AlmostaCMS
   Homepage URL: http://localhost:3000 (dev) or https://almostacms.com (prod)
   Authorization callback URL: http://localhost:3000
   ```
   *Note: Callback URL is not used with Device Flow but GitHub requires it*

4. After creation, note your **Client ID**

### 2. Enable Device Flow

This is the critical step that makes decentralized auth possible:

1. In your OAuth App settings, scroll down to **"Device Authorization"**
2. Check **"Enable Device Flow"**
3. Save changes

### 3. Configure Your Project

Update `.env` file in `react-cms/`:

```bash
# GitHub Device Flow Configuration
VITE_GITHUB_CLIENT_ID=your_client_id_here

# App URL (reference only)
VITE_APP_URL=http://localhost:3000

# Template repository
VITE_TEMPLATE_OWNER=almostacms
VITE_TEMPLATE_REPO=vcard-portfolio-template
```

**That's it!** No OAuth proxy, no client secret, no backend server needed.

## How It Works

### Authentication Flow

```
1. User clicks "Login with GitHub"
   ↓
2. App requests device code from GitHub
   POST https://github.com/login/device/code
   Response: { user_code: "ABCD-1234", device_code: "...", verification_uri: "github.com/login/device" }
   ↓
3. User sees the code (ABCD-1234) on screen
   ↓
4. User visits github.com/login/device in browser
   ↓
5. User enters code ABCD-1234 and authorizes
   ↓
6. App polls GitHub for token
   POST https://github.com/login/oauth/access_token
   Initially: { error: "authorization_pending" }
   After auth: { access_token: "gho_..." }
   ↓
7. Token stored in localStorage
   ↓
8. User authenticated! 🎉
```

### User Experience

1. User clicks "Login with GitHub" on AlmostaCMS
2. New page shows a 8-character code (e.g., `WDJB-MJHT`)
3. GitHub authorization page opens automatically
4. User enters the code on GitHub
5. User reviews and approves permissions (repo, workflow)
6. AlmostaCMS automatically detects authorization
7. User redirected to projects dashboard

**Time:** ~15-30 seconds

### Security Model

```typescript
// Client-side only (no server)
const token = localStorage.getItem('github_access_token');

// Direct GitHub API calls
const response = await fetch('https://api.github.com/user/repos', {
  headers: {
    'Authorization': `token ${token}`
  }
});
```

**Security features:**
- No client secret to leak (Device Flow doesn't use it)
- Token stored locally in user's browser only
- Each user has their own token with their permissions
- Tokens scoped to `repo` and `workflow` only
- User can revoke access anytime at github.com/settings/applications

## Implementation Details

### Service: `DeviceFlowAuthService`

```typescript
// File: react-cms/src/services/device-flow-auth.ts

// Initiate flow
const status = await DeviceFlowAuthService.initiateDeviceFlow(clientId);
// Returns: { status: 'pending', userCode: 'ABCD-1234', verificationUri: '...' }

// Start polling
DeviceFlowAuthService.startPolling(
  clientId,
  (token) => console.log('Success!', token),
  (error) => console.error('Error:', error)
);

// Stop polling
DeviceFlowAuthService.stopPolling();
```

### Component: `DeviceFlowLogin`

```tsx
// File: react-cms/src/components/auth/DeviceFlowLogin.tsx

// Shows user code in large font
// Opens GitHub in new tab automatically
// Polls for authorization
// Redirects to dashboard on success
```

### Storage

```typescript
// Token storage (sessionStorage for security)
TokenStorage.setToken(accessToken);
TokenStorage.getToken(); // Returns token or null if expired

// Device flow state (during auth only)
TokenStorage.setDeviceFlowState({ deviceCode, userCode, ... });
TokenStorage.getDeviceFlowState();
TokenStorage.clearDeviceFlowState();
```

## Testing Locally

1. **Start the dev server:**
   ```bash
   cd react-cms
   npm run dev
   ```

2. **Open http://localhost:3000**

3. **Click "Login with GitHub"**

4. **You'll be redirected to `/auth/device-flow`**

5. **See the user code and follow instructions**

6. **GitHub will open - enter the code**

7. **Authorize AlmostaCMS**

8. **You'll be automatically redirected to projects dashboard**

## Production Deployment

### For almostacms.com (centralized - temporary)

1. Update `.env` in production:
   ```bash
   VITE_GITHUB_CLIENT_ID=prod_client_id
   VITE_APP_URL=https://almostacms.com
   ```

2. Update OAuth App callback URL to `https://almostacms.com`

3. Deploy to GitHub Pages or Cloudflare Pages:
   ```bash
   npm run build
   # Upload dist/ folder
   ```

### For embedded admin (decentralized - future)

Once we implement embedded admin, each site will have its own admin at:
```
username.github.io/my-site/admin
```

Users will authenticate directly from their site - no centralized service needed.

**This is the ultimate goal** - fully decentralized CMS with zero infrastructure.

## Troubleshooting

### "Device code expired"

**Problem:** User took too long to authorize
**Solution:** Refresh the page and try again. Device codes expire after 15 minutes.

### "Authorization pending" forever

**Problem:** User didn't complete authorization on GitHub
**Solution:** Check if GitHub tab is open, enter the code, and click Authorize.

### "Failed to start authentication"

**Problem:** Client ID not configured or invalid
**Solution:** Check `.env` file has correct `VITE_GITHUB_CLIENT_ID`

### "Polling too fast"

**Problem:** App polling GitHub faster than allowed
**Solution:** Our implementation respects GitHub's rate limits automatically. If you see this, GitHub is telling us to slow down - we handle it gracefully.

## API Endpoints Used

All endpoints are GitHub's public API - no AlmostaCMS backend:

```
POST https://github.com/login/device/code
→ Initiate device flow

POST https://github.com/login/oauth/access_token
→ Poll for access token

GET https://api.github.com/user
→ Get user info

GET https://api.github.com/user/repos
→ List repositories

GET https://api.github.com/repos/:owner/:repo/contents/:path
→ Read/write file contents
```

## Migration from Old OAuth

If you were using the old OAuth App flow with proxy server:

### Before (centralized)
```
User → AlmostaCMS → oauth-proxy → GitHub
        ↑
     COST + COMPLEXITY
```

### After (decentralized)
```
User → GitHub (direct)
  ↓
Zero cost forever
```

**To migrate:**
1. Enable Device Flow in your OAuth App settings
2. Update `.env` to remove `VITE_OAUTH_PROXY_URL`
3. Restart dev server
4. Test login flow

**No code changes needed** - Device Flow is now the default.

The old `oauth-proxy` server is deprecated and will be removed in future versions.

## Rate Limits

GitHub Device Flow has generous rate limits:

- **Device code requests:** 50 per hour per client ID
- **Access token polling:** Once per interval (5 seconds typically)
- **API requests (with token):** 5,000 per hour per user

These limits are per-user, not per-app, so they scale perfectly.

## Security Best Practices

1. **Never commit .env files** - Add to .gitignore
2. **Use different OAuth Apps for dev/prod** - Separate credentials
3. **Token storage** - Uses sessionStorage (cleared on tab close) for better security
4. **Scope minimization** - Only request `repo` and `workflow` scopes
5. **User education** - Users should revoke unused authorizations at github.com/settings/applications

## Future Enhancements

1. **QR Code Support** - Show QR code for easy mobile authorization
2. **Token Refresh** - Implement token refresh to avoid re-auth
3. **Remember Me** - Option to use localStorage for persistent sessions
4. **Multi-account** - Support switching between multiple GitHub accounts
5. **Offline Mode** - Handle offline gracefully with cached data

---

**See Also:**
- [Architecture](./ARCHITECTURE.md) - ADR-002: GitHub Device Flow
- [Business Model](./BUSINESS_MODEL.md) - Zero infrastructure costs
- [GitHub Device Flow Docs](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow)
