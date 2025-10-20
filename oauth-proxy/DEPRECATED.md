# OAuth Proxy - DEPRECATED

**Status:** ⚠️ DEPRECATED as of 2025-10-20

## Why Deprecated?

AlmostaCMS has transitioned to **GitHub Device Flow** authentication, which eliminates the need for a backend OAuth proxy server. This change is part of our move to a fully decentralized architecture.

### Old Architecture (Centralized - Deprecated)
```
User Browser → AlmostaCMS Admin → OAuth Proxy → GitHub
                                      ↑
                            Cost + Complexity
```

### New Architecture (Decentralized - Current)
```
User Browser → GitHub Device Flow → Access Token
                     ↓
              Zero infrastructure cost
```

## Migration Path

### For Development

**Before (OAuth with Proxy):**
```bash
# Terminal 1: Start OAuth proxy
cd oauth-proxy
npm start

# Terminal 2: Start React app
cd react-cms
npm run dev
```

**After (Device Flow):**
```bash
# Just start React app - no proxy needed!
cd react-cms
npm run dev
```

### Configuration Changes

**Old `.env` (Deprecated):**
```bash
VITE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
VITE_OAUTH_PROXY_URL=http://localhost:3001/auth/token
```

**New `.env` (Current):**
```bash
# Just the client ID - no proxy URL needed!
VITE_GITHUB_CLIENT_ID=your_client_id_here
```

## What Changed?

1. **Authentication Flow:**
   - Old: OAuth App flow with callback + proxy
   - New: Device Flow with user code

2. **Infrastructure:**
   - Old: Required oauth-proxy server (Node.js)
   - New: No backend server needed

3. **User Experience:**
   - Old: OAuth redirect flow
   - New: Show code → user enters on GitHub

4. **Security:**
   - Old: Client secret on server
   - New: No client secret needed (Device Flow doesn't use it)

5. **Costs:**
   - Old: Server costs scale with users
   - New: Zero cost forever

## For Production Deployments

If you were planning to deploy the OAuth proxy to production (Cloudflare Workers, etc.), you can **skip it entirely**. Device Flow works directly from the browser.

## Removal Timeline

- ✅ **2025-10-20:** Device Flow implemented, OAuth proxy deprecated
- **2025-11-20:** OAuth proxy will be removed from repository (30 days notice)
- **Future:** Complete removal of oauth-proxy directory

## Need Help?

See the new authentication documentation:
- [Device Flow Setup](../docs/DEVICE_FLOW_SETUP.md)
- [Architecture](../docs/ARCHITECTURE.md) - ADR-002: GitHub Device Flow

## Can I Still Use This?

The oauth-proxy will continue to work if you prefer the old OAuth flow, but:
- ⚠️ Not recommended for new projects
- ⚠️ Will not receive updates or bug fixes
- ⚠️ Scheduled for removal in 30 days
- ⚠️ Requires manual deployment and maintenance

**We strongly recommend migrating to Device Flow.**

---

**Questions?** Check the [migration guide](../docs/DEVICE_FLOW_SETUP.md#migration-from-old-oauth)
