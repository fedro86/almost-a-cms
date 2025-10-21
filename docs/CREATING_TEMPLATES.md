# Creating Templates for AlmostaCMS

This guide explains how to create website templates that work with AlmostaCMS.

---

## Table of Contents

- [What is a Template?](#what-is-a-template)
- [Template Requirements](#template-requirements)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Testing](#testing)
- [Publishing](#publishing)

---

## What is a Template?

An AlmostaCMS template is a GitHub repository that users clone to create their website. Each template includes:

- **Static website files** (HTML, CSS, JS)
- **Embedded admin panel** at `/admin`
- **Data folder** with JSON content files
- **GitHub Actions workflow** for automatic deployment
- **Configuration file** (`.almostacms.json`)

When users create a site from your template, they get a complete, ready-to-edit website with a built-in CMS.

---

## Template Requirements

### Must Have ✅

1. **Admin Bundle** in `/admin` directory
2. **Data folder** (`/data` or `/docs/data`) with JSON files
3. **`.almostacms.json`** configuration file
4. **GitHub Actions workflow** for deployment
5. **README.md** with user instructions
6. **Public repository** marked as "Template repository"

### Should Have ⭐

- Responsive design (mobile-friendly)
- Accessible (WCAG 2.1)
- Fast loading (<3s)
- SEO-friendly
- Clear documentation
- Live demo URL

### Must NOT Have 🚫

- Hardcoded personal information
- Sensitive credentials or API keys
- Large binary files (>100MB)
- Proprietary code without license
- Broken links or images

---

## Quick Start

### Option 1: Use Reference Template

```bash
# Clone the vCard portfolio template (coming soon)
git clone https://github.com/almostacms/vcard-portfolio-template.git my-template
cd my-template

# Customize it
# - Edit HTML/CSS
# - Update data/*.json structure
# - Modify README

# Test locally
# - Edit content via /admin
# - Verify everything works

# Publish
# - Push to GitHub
# - Enable "Template repository" in settings
```

### Option 2: Start from Scratch

See [Detailed Setup](#detailed-setup) below for step-by-step instructions.

---

## Detailed Setup

### Step 1: Create Repository Structure

Choose your deployment path:

**Option A: Root Deployment** (`username.github.io/repo-name`)
```
my-template/
├── admin/              # Admin panel (embedded)
├── data/               # Content JSON files
├── assets/             # CSS, JS, images
├── index.html          # Main website
├── .almostacms.json    # Config file
├── .github/workflows/  # Deployment workflow
└── README.md
```

**Option B: Docs Deployment** (`username.github.io/repo-name` with source in `/docs`)
```
my-template/
├── docs/
│   ├── admin/          # Admin panel
│   ├── data/           # Content JSON files
│   ├── assets/         # CSS, JS, images
│   └── index.html      # Main website
├── src/                # Source code (optional)
├── .almostacms.json    # Config file
├── .github/workflows/  # Deployment workflow
└── README.md
```

### Step 2: Get the Admin Bundle

Build the latest admin bundle from the AlmostaCMS repository:

```bash
# Clone AlmostaCMS
git clone https://github.com/your-username/almost-a-cms.git
cd almost-a-cms

# Build admin bundle
./scripts/prepare-admin-bundle.sh 1.0.0

# Copy to your template
cp -r admin-bundle/* ../my-template/admin/
```

Or download a pre-built release from GitHub Releases.

### Step 3: Create Data Structure

Create JSON files for your content. Example for a portfolio:

**`data/about.json`**
```json
{
  "name": "John Doe",
  "title": "Full Stack Developer",
  "bio": "I build amazing web applications...",
  "avatar": "./assets/images/avatar.jpg",
  "skills": ["React", "Node.js", "Python"],
  "interests": ["Open Source", "AI", "Music"]
}
```

**`data/projects.json`**
```json
{
  "projects": [
    {
      "id": "project-1",
      "title": "AlmostaCMS",
      "description": "A decentralized CMS",
      "image": "./assets/images/almostacms.png",
      "url": "https://github.com/almostacms/almost-a-cms",
      "tags": ["React", "GitHub API"],
      "featured": true
    }
  ]
}
```

**Common data files:**
- `about.json` - Personal/company info
- `projects.json` / `portfolio.json` - Work examples
- `experience.json` / `resume.json` - Work history
- `blog.json` - Blog posts
- `contact.json` - Contact information
- `navbar.json` - Navigation menu
- `settings.json` - Site settings

### Step 4: Create Configuration File

**`.almostacms.json`** (root of repository):

```json
{
  "version": "1.0",
  "name": "My Awesome Template",
  "description": "A beautiful portfolio template",
  "author": "Your Name",

  "deployment": {
    "path": "/",
    "adminPath": "/admin/",
    "source": {
      "branch": "main",
      "path": "/"
    }
  },

  "content": {
    "dataPath": "data/",
    "schemas": {
      "about": {
        "file": "data/about.json",
        "schema": {
          "name": "string",
          "title": "string",
          "bio": "string",
          "avatar": "string",
          "skills": "array",
          "interests": "array"
        }
      },
      "projects": {
        "file": "data/projects.json",
        "schema": {
          "projects": "array"
        }
      }
    }
  },

  "features": {
    "darkMode": false,
    "analytics": false,
    "search": false
  }
}
```

For `/docs` deployment, use:
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

### Step 5: Create GitHub Actions Workflow

**`.github/workflows/deploy.yml`**:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'  # For root deployment
          # path: 'docs/'  # For /docs deployment

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Step 6: Create User README

**`README.md`** for template users:

```markdown
# My Awesome Portfolio

A beautiful portfolio website powered by [AlmostaCMS](https://github.com/almostacms/almost-a-cms).

## 🌐 Live Site

Your site: https://username.github.io/repo-name

## ✏️ Edit Content

Visit: https://username.github.io/repo-name/admin

1. Login with GitHub
2. Edit your content
3. Save - changes deploy automatically!

## 📁 Content Files

- `data/about.json` - Your bio and info
- `data/projects.json` - Your portfolio projects
- `data/contact.json` - Contact information

## 🎨 Customization

### Colors
Edit `assets/css/style.css` to change colors.

### Layout
Edit `index.html` to modify structure.

### Images
Upload to `assets/images/` and reference in JSON files.

## 📝 Local Development

```bash
# Clone your repository
git clone https://github.com/username/repo-name.git

# Open index.html in browser
open index.html
```

## 🚀 Deployment

Changes deploy automatically via GitHub Actions when you commit to `main`.

## 🤝 Credits

- Template: [Template Name](https://github.com/author/template)
- CMS: [AlmostaCMS](https://github.com/almostacms/almost-a-cms)
```

---

## Configuration

### Deployment Paths

**Root Deployment (`/`):**
- Site root: `username.github.io/repo-name/`
- Admin: `username.github.io/repo-name/admin/`
- Data files in `/data`

**Docs Deployment (`/docs`):**
- Site root: `username.github.io/repo-name/`
- Admin: `username.github.io/repo-name/admin/`
- Data files in `/docs/data`

### Data Path Resolution

The admin automatically detects the deployment path and adjusts file paths:

- Root: reads `data/about.json`
- Docs: reads `docs/data/about.json`

Configure in `.almostacms.json`:
```json
{
  "deployment": {
    "source": {
      "path": "/"  // or "/docs"
    }
  }
}
```

---

## Deployment

### GitHub Pages Setup

Users will need to:

1. Go to repository Settings → Pages
2. Source: "GitHub Actions"
3. Wait for workflow to complete
4. Visit the deployed site

The workflow runs automatically on every push to `main`.

### Custom Domains

Users can add custom domains in GitHub Pages settings. The admin will work at `customdomain.com/admin`.

---

## Testing

### Before Publishing

Test your template thoroughly:

1. **Create test repository:**
   ```bash
   gh repo create my-template-test --template username/my-template --public
   ```

2. **Clone and setup:**
   ```bash
   git clone https://github.com/username/my-template-test.git
   cd my-template-test
   ```

3. **Enable GitHub Pages** (Settings → Pages → GitHub Actions)

4. **Wait for deployment** (check Actions tab)

5. **Test the admin:**
   - Visit `username.github.io/my-template-test/admin`
   - Login with GitHub
   - Edit content
   - Save changes
   - Verify deployment

6. **Test the public site:**
   - Visit `username.github.io/my-template-test`
   - Check responsiveness
   - Test all links
   - Verify content displays correctly

### Checklist

- [ ] Admin loads at `/admin`
- [ ] Login with GitHub Device Flow works
- [ ] Can load all data files
- [ ] Can edit and save content
- [ ] Changes commit to GitHub
- [ ] GitHub Actions deploys successfully
- [ ] Public site reflects changes
- [ ] Mobile responsive
- [ ] No console errors
- [ ] All images load
- [ ] Links work
- [ ] README is clear

---

## Publishing

### 1. Prepare Repository

```bash
# Clean up
rm -rf .git
git init
git add .
git commit -m "Initial template commit"
```

### 2. Push to GitHub

```bash
gh repo create my-awesome-template --public --source=. --push
```

### 3. Enable Template Repository

- Go to repository Settings
- Check "Template repository" under "General"

### 4. Add Topics

Add relevant topics for discoverability:
- `almostacms`
- `almostacms-template`
- `portfolio-template`
- `github-pages`
- `static-site`

### 5. Create Release

```bash
gh release create v1.0.0 --title "v1.0.0 - Initial Release" --notes "First stable release"
```

### 6. Add to AlmostaCMS

Open an issue in the main AlmostaCMS repository with:
- Template name and description
- Repository URL
- Live demo URL
- Screenshots

We'll feature it in our template gallery!

---

## Template Ideas

**Needed templates:**
- Developer portfolio
- Designer portfolio
- Photography site
- Product landing page
- SaaS landing page
- Personal blog
- Documentation site
- Link-in-bio page
- Event page
- Restaurant/cafe site

**Get creative!** Any static site that can be managed via JSON works great.

---

## Best Practices

### Performance
- Optimize images (use WebP, compress)
- Minify CSS/JS
- Use CDN for libraries
- Lazy load images

### Accessibility
- Use semantic HTML
- Include alt text for images
- Proper heading hierarchy
- Keyboard navigation support
- ARIA labels where needed

### SEO
- Meta tags (title, description)
- Open Graph tags
- Structured data (JSON-LD)
- Sitemap (optional)

### User Experience
- Fast load times (<3s)
- Mobile responsive
- Clear navigation
- Good contrast ratios
- Meaningful error messages

---

## Resources

- [AlmostaCMS Admin Bundle](https://github.com/almostacms/almost-a-cms/tree/main/admin-bundle)
- [GitHub Pages Documentation](https://pages.github.com/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Template Repositories](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository)

---

## Getting Help

- Open an issue in the AlmostaCMS repository
- Ask in GitHub Discussions
- Check existing templates for examples

---

**Happy template creating!** 🚀 We can't wait to see what you build!
