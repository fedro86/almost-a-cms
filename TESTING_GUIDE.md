# Phase 2 Testing Guide

Quick guide to test the repository management features.

---

## ⚠️ Prerequisites

Before you can test Phase 2, you need:

### 1. **Template Repository**

You must have a template repository on GitHub. Choose one option:

#### **Option A: Use This Repo as Template (Quick Test)**

Update `react-cms/.env`:
```bash
VITE_TEMPLATE_OWNER=YOUR_GITHUB_USERNAME
VITE_TEMPLATE_REPO=almost-a-cms
```

#### **Option B: Create Proper Template Repo (Recommended)**

Follow the full guide: [docs/TEMPLATE_REPO_SETUP.md](docs/TEMPLATE_REPO_SETUP.md)

Quick steps:
```bash
# 1. Create new repo on GitHub: vcard-portfolio-template
# 2. Enable "Template repository" in Settings
# 3. Copy files and push
# 4. Update .env with your template repo name
```

### 2. **OAuth Proxy Running**

```bash
cd oauth-proxy
npm start
```

Should see:
```
🚀 OAuth proxy server running on http://localhost:3001
✅ GitHub credentials loaded from .env
```

### 3. **React App Running**

```bash
cd react-cms
npm run dev
```

Should see:
```
➜  Local:   http://localhost:3000/
```

---

## 🧪 Test Scenarios

### **Test 1: New User - First Time Setup**

**Steps:**
1. Clear browser storage (F12 → Application → Clear)
2. Go to http://localhost:3000
3. Click "Login with GitHub"
4. Complete OAuth authorization
5. You should be redirected to `/setup`

**Expected:**
- Beautiful onboarding wizard appears
- Default repo name: "my-portfolio"
- Form validates repo name
- "Create Portfolio" button is enabled

**Actions:**
1. Change repo name to something unique (e.g., `test-portfolio-${Date.now()}`)
2. Click "Create Portfolio"

**Expected Progress:**
1. "Creating Repository..." (2-3 seconds)
2. "Enabling GitHub Pages..." (1-2 seconds)
3. "Portfolio Created Successfully!" screen

**Verify Success Screen Shows:**
- ✅ Repository Created (with GitHub URL)
- ✅ GitHub Pages Enabled (with Pages URL)
- "Go to Dashboard" button

**Verify on GitHub:**
1. Go to https://github.com/YOUR_USERNAME
2. New repository should exist
3. Repository should have all template files
4. Actions tab should show a workflow run
5. Settings → Pages should show:
   - Source: GitHub Actions
   - Status: Building or Live

**Actions:**
1. Click "Go to Dashboard"

**Expected:**
- Redirected to `/dashboard`
- Dashboard loads (may show legacy content for now)

---

### **Test 2: Returning User**

**Steps:**
1. Stay logged in (or log in again)
2. Go to http://localhost:3000
3. Click "Login with GitHub" (if logged out)

**Expected:**
- Redirected directly to `/dashboard`
- NO redirect to `/setup`
- Dashboard loads immediately

**Why:** useRepo hook loads active repo from localStorage

---

### **Test 3: Error Handling - Duplicate Repo**

**Steps:**
1. Log out and clear browser storage
2. Log in again
3. On `/setup`, enter the **same repo name** as Test 1
4. Click "Create Portfolio"

**Expected:**
- Shows error message
- Returns to name input screen
- User can try again with different name

---

### **Test 4: Error Handling - Invalid Repo Name**

**Steps:**
1. On `/setup`, enter invalid repo names:
   - `my portfolio` (spaces)
   - `my@portfolio` (invalid chars)
   - `` (empty)

**Expected:**
- "Create Portfolio" button disabled
- (Optionally add red border on input for better UX)

---

### **Test 5: Manual Setup Redirect**

**Steps:**
1. As logged-in user with active repo
2. Manually navigate to http://localhost:3000/setup

**Expected:**
- Allowed to access /setup
- Can create another portfolio
- Creates new repo but doesn't override active repo

**Note:** Current behavior allows this. Future: Add multi-repo management.

---

## 🐛 Troubleshooting

### **Issue: "Cannot connect to OAuth proxy"**

**Solution:**
```bash
cd oauth-proxy
npm start
```

Check: http://localhost:3001/health

---

### **Issue: "Template repository not found"**

**Error:** API returns 404 when creating repo

**Solutions:**
1. Check `.env` has correct `VITE_TEMPLATE_OWNER` and `VITE_TEMPLATE_REPO`
2. Verify template repo exists: https://github.com/YOUR_USERNAME/TEMPLATE_REPO
3. Ensure template repo is **public**
4. Verify "Template repository" is enabled in repo Settings

---

### **Issue: Stuck on "Creating Repository..."**

**Possible Causes:**
- Network timeout
- GitHub API rate limit
- Invalid OAuth token

**Solutions:**
1. Check browser console for errors
2. Check OAuth proxy logs
3. Check GitHub API rate limit:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.github.com/rate_limit
   ```
4. Try again (button should re-enable after error)

---

### **Issue: GitHub Pages Not Enabling**

**Error:** Repo created but Pages fails to enable

**Possible Causes:**
- Repo created too recently (wait 2 seconds)
- Pages already enabled (harmless error)
- Insufficient permissions

**Debug:**
1. Manually enable Pages on GitHub:
   - Go to repo Settings → Pages
   - Source: GitHub Actions
   - Save
2. Check if it was already enabled (check success message)

---

### **Issue: Workflow Not Running**

**Symptoms:**
- Repo created
- Pages enabled
- But no Actions workflow ran

**Solutions:**
1. Verify template repo has `.github/workflows/deploy.yml`
2. Check Actions tab on new repo for errors
3. Manually trigger workflow:
   - Actions tab → Select workflow → "Run workflow"

---

### **Issue: Site Not Loading**

**Symptoms:**
- Repo created ✅
- Pages enabled ✅
- Workflow succeeded ✅
- But site shows 404

**Reasons:**
- DNS propagation (wait 1-2 minutes)
- HTTPS cert provisioning (wait up to 10 minutes)
- Incorrect Pages source (should be GitHub Actions)

**Solutions:**
1. Wait 5 minutes
2. Hard refresh: Ctrl+Shift+R / Cmd+Shift+R
3. Check repo Settings → Pages for actual URL
4. Try HTTP instead of HTTPS (temporarily)

---

## ✅ Test Completion Checklist

- [ ] Test 1: New user first-time setup works
- [ ] New repo appears on GitHub
- [ ] GitHub Pages is enabled
- [ ] Success screen shows correct URLs
- [ ] Can navigate to dashboard
- [ ] Test 2: Returning user skips setup
- [ ] Dashboard loads immediately
- [ ] Test 3: Duplicate repo name shows error
- [ ] Test 4: Invalid repo names are prevented
- [ ] Test 5: Can manually access /setup

---

## 📊 Test Results Template

Copy this template to record your test results:

```markdown
## Test Results - Phase 2

**Date:** YYYY-MM-DD
**Tester:** Your Name
**Environment:** localhost / production

### Test 1: First Time Setup
- [ ] PASS / FAIL
- Notes:

### Test 2: Returning User
- [ ] PASS / FAIL
- Notes:

### Test 3: Duplicate Repo Error
- [ ] PASS / FAIL
- Notes:

### Test 4: Invalid Repo Name
- [ ] PASS / FAIL
- Notes:

### Test 5: Manual Setup Access
- [ ] PASS / FAIL
- Notes:

### Overall Result
- [ ] ALL TESTS PASSED
- [ ] SOME TESTS FAILED (document below)

### Issues Found:
1.
2.
3.

### Screenshots:
(attach screenshots of success/failures)
```

---

## 🚀 After Testing

Once all tests pass:

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Implement Phase 2: Repository Management"
   git push
   ```

2. **Create a test repository** on GitHub to verify

3. **Ready for Phase 3!** Content editing via GitHub API

---

## 📞 Need Help?

- Check [PHASE2_COMPLETE.md](PHASE2_COMPLETE.md) for implementation details
- Review [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design
- Read [docs/TEMPLATE_REPO_SETUP.md](docs/TEMPLATE_REPO_SETUP.md) for template setup

---

**Happy Testing! 🧪**
