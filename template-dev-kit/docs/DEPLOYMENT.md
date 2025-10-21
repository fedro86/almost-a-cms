# Deployment Guide

**Understanding deployment modes and GitHub Pages setup.**

---

## Deployment Modes

AlmostaCMS supports two deployment modes:

### Root Deployment

Files served from repository root.

**Directory structure:**
```
my-template/
├── admin/              # Admin at /admin
├── data/               # Data files
├── assets/             # CSS, JS, images
├── index.html          # Site root
├── .almostacms.json
└── .github/workflows/
```

**URLs:**
- Site: `username.github.io/repo-name/`
- Admin: `username.github.io/repo-name/admin/`
- Data: `username.github.io/repo-name/data/about.json`

**Configuration (`.almostacms.json`):**
```json
{
  "deployment": {
    "path": "/",
    "adminPath": "/admin/",
    "source": {
      "branch": "main",
      "path": "/"
    }
  },
  "content": {
    "dataPath": "data/"
  }
}
```

**GitHub Actions (`.github/workflows/deploy.yml`):**
```yaml
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: '.'
```

**Use when:**
- Simple template structure
- Single-purpose site
- Maximum simplicity

---

### Docs Deployment

Files served from `/docs` folder.

**Directory structure:**
```
my-template/
├── docs/
│   ├── admin/          # Admin at /admin
│   ├── data/           # Data files
│   ├── assets/
│   └── index.html      # Site in /docs
├── src/                # Source code (optional)
├── .almostacms.json    # At repo root
└── .github/workflows/
```

**URLs:**
- Site: `username.github.io/repo-name/`
- Admin: `username.github.io/repo-name/admin/`
- Data: `username.github.io/repo-name/data/about.json`

**Configuration (`.almostacms.json`):**
```json
{
  "deployment": {
    "path": "/",
    "adminPath": "/admin/",
    "source": {
      "branch": "main",
      "path": "/docs"
    }
  },
  "content": {
    "dataPath": "docs/data/"
  }
}
```

**GitHub Actions:**
```yaml
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: 'docs/'
```

**Use when:**
- Separating site from source code
- Using build tools (future)
- Development docs at repo root

---

## GitHub Pages Setup

### For Template Users

When users clone your template:

**1. Enable GitHub Pages:**
- Go to repo **Settings** → **Pages**
- Source: **GitHub Actions** (not branch)
- Save

**2. Wait for deployment:**
- Check **Actions** tab
- Wait for workflow to complete (1-2 minutes)
- Green checkmark = deployed ✓

**3. Visit site:**
- Click deployment URL in Pages settings
- Or: `https://username.github.io/repo-name/`

### For Template Creators

Your template must include:

**Required:**
- `.github/workflows/deploy.yml` (created by setup script)
- `.almostacms.json` (config file)
- `admin/` directory (admin bundle)
- `data/` directory (content files)

**Workflow checks:**
```yaml
on:
  push:
    branches: [main]  # Deploy on push to main
  workflow_dispatch:   # Allow manual trigger

permissions:
  contents: read
  pages: write
  id-token: write
```

---

## Project vs User Pages

### User/Organization Page

**Repository name:** `username.github.io`

**URLs:**
- Site: `https://username.github.io/`
- Admin: `https://username.github.io/admin/`

**Config:**
```json
{
  "deployment": {
    "path": "/"
  }
}
```

### Project Page

**Repository name:** `my-portfolio`

**URLs:**
- Site: `https://username.github.io/my-portfolio/`
- Admin: `https://username.github.io/my-portfolio/admin/`

**Config:**
```json
{
  "deployment": {
    "path": "/my-portfolio/"
  }
}
```

**Note:** For templates, use `/` - users can adjust if needed.

---

## Custom Domains

Users can use custom domains:

**Setup:**
1. Add CNAME file: `echo "example.com" > CNAME`
2. Configure DNS:
   ```
   Type: CNAME
   Name: @
   Value: username.github.io
   ```
3. Enable in GitHub Pages settings

**URLs with custom domain:**
- Site: `https://example.com/`
- Admin: `https://example.com/admin/`

**Config remains the same:**
```json
{
  "deployment": {
    "path": "/"
  }
}
```

---

## Troubleshooting

### "404 - Page Not Found"

**Check:**
1. GitHub Pages enabled? (Settings → Pages)
2. Source is "GitHub Actions"? (not "Deploy from branch")
3. Workflow completed? (Actions tab, green checkmark)
4. Files in correct location? (root or docs/)

### "Admin doesn't load"

**Check:**
1. Admin bundle exists? (`admin/` directory)
2. Path matches deployment mode?
   - Root: `/admin/`
   - Docs: `/admin/` (same, but files in `docs/admin/`)
3. Browser console for errors (F12)

### "Data files not loading"

**Check:**
1. `.almostacms.json` has correct `dataPath`:
   - Root: `"data/"`
   - Docs: `"docs/data/"`
2. Data files are valid JSON
3. File names match (case-sensitive on Linux)

### "Workflow fails"

**Common causes:**
- Missing permissions in workflow file
- Invalid YAML syntax
- Concurrent deployments (wait for previous to finish)

**Debug:**
1. Go to **Actions** tab
2. Click failed workflow
3. Expand failed step
4. Read error message

---

## Deployment Path Reference

| Mode | Files Location | Admin Path | Data Path | Workflow Upload Path |
|------|---------------|------------|-----------|---------------------|
| Root | `/` | `admin/` | `data/` | `'.'` |
| Docs | `/docs` | `docs/admin/` | `docs/data/` | `'docs/'` |

---

## Best Practices

### For Template Creators

✓ Test both deployment modes
✓ Include complete admin bundle
✓ Validate `.almostacms.json` structure
✓ Test workflow before publishing
✓ Document deployment mode in README

### For Template Users

✓ Don't modify admin bundle
✓ Don't change `.almostacms.json` unless needed
✓ Check Actions tab after push
✓ Wait 30-60 seconds for changes to appear
✓ Hard refresh browser (Ctrl+F5) to see updates

---

## Migration

### Switching from Root to Docs

```bash
# Create docs directory
mkdir -p docs

# Move site files
mv admin data assets index.html docs/

# Update .almostacms.json
# Change:
#   "path": "/docs"
#   "dataPath": "docs/data/"

# Update workflow
# Change:
#   path: 'docs/'

# Commit and push
git add .
git commit -m "Switch to docs deployment"
git push
```

### Switching from Docs to Root

```bash
# Move files to root
mv docs/* .

# Update .almostacms.json
# Change:
#   "path": "/"
#   "dataPath": "data/"

# Update workflow
# Change:
#   path: '.'

# Commit and push
git add .
git commit -m "Switch to root deployment"
git push
```

---

**Deployment is automatic!** Just push to main and GitHub does the rest. ✨
