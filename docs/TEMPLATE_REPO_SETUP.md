# Template Repository Setup Guide

This guide explains how to create the template repository that users will use to generate their portfolio websites.

---

## Overview

The template repository (`vcard-portfolio-template`) contains:
- Complete vCard portfolio HTML/CSS/JS
- Data folder with JSON content files
- GitHub Actions workflow for automatic deployment
- README with setup instructions

---

## Quick Setup

### Option 1: Create from Existing Files (Recommended)

Since you already have the working vCard portfolio files in this repository, you can create the template repository directly:

```bash
# 1. Create a new repository on GitHub
# Go to: https://github.com/new
# Name: vcard-portfolio-template
# Description: Portfolio website template for AlmostaCMS
# Public repository
# Check "Template repository" option

# 2. Clone and populate it
git clone https://github.com/YOUR_USERNAME/vcard-portfolio-template.git
cd vcard-portfolio-template

# 3. Copy files from your current almost-a-cms repository
cp -r /path/to/almost-a-cms/assets ./
cp -r /path/to/almost-a-cms/data ./
cp /path/to/almost-a-cms/index.html ./
cp /path/to/almost-a-cms/template_index.html ./templates/
cp /path/to/almost-a-cms/index_html_generator.py ./

# 4. Create GitHub Actions workflow (see below)
mkdir -p .github/workflows

# 5. Add README (see below)

# 6. Commit and push
git add .
git commit -m "Initial template setup"
git push origin main

# 7. Enable as template
# Go to repository Settings → Check "Template repository"
```

### Option 2: Use This Repository Directly

For testing, you can temporarily configure AlmostaCMS to use this repository as the template:

```bash
# In react-cms/.env
VITE_TEMPLATE_OWNER=YOUR_GITHUB_USERNAME
VITE_TEMPLATE_REPO=almost-a-cms
```

**Note:** This is only for testing. For production, create a dedicated template repository.

---

## Template Repository Structure

```
vcard-portfolio-template/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Auto-deployment workflow
│
├── assets/
│   ├── css/
│   │   └── style.css              # Portfolio styles
│   ├── js/
│   │   └── script.js              # Portfolio JavaScript
│   └── images/
│       └── (user images)
│
├── data/                           # Content JSON files
│   ├── about.json                 # About section
│   ├── resume.json                # Resume/experience
│   ├── portfolio.json             # Portfolio projects
│   ├── blog.json                  # Blog posts
│   ├── contact.json               # Contact info
│   ├── navbar.json                # Navigation
│   └── sidebar.json               # Sidebar content
│
├── templates/
│   └── template_index.html        # Jinja2 template
│
├── index_html_generator.py        # Build script
├── index.html                     # Generated HTML (initial)
├── README.md                      # User instructions
└── .gitignore
```

---

## Required Files

### 1. GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Portfolio to GitHub Pages

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
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: |
          pip install jinja2

      - name: Generate HTML from JSON
        run: |
          python index_html_generator.py

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 2. README.md for Template

Create `README.md`:

```markdown
# My Portfolio

A beautiful personal portfolio website created with [AlmostaCMS](https://almostacms.com).

## 🌐 Live Site

Your site is published at: https://YOUR_USERNAME.github.io/REPO_NAME

## ✏️ Editing Content

1. Go to [AlmostaCMS](https://almostacms.com)
2. Log in with GitHub
3. Select this repository
4. Edit your content in the visual editor
5. Changes are automatically deployed!

## 📁 Content Files

All content is stored in the `data/` folder as JSON files:

- `about.json` - Your bio and introduction
- `resume.json` - Work experience and education
- `portfolio.json` - Your projects and work
- `blog.json` - Blog posts (optional)
- `contact.json` - Contact information
- `navbar.json` - Navigation menu
- `sidebar.json` - Sidebar info (name, role, social links)

## 🚀 Manual Deployment

The site auto-deploys on every commit. To manually trigger:
1. Go to Actions tab
2. Select "Deploy Portfolio to GitHub Pages"
3. Click "Run workflow"

## 🎨 Customization

### Change Template
Edit `templates/template_index.html` to modify the HTML structure.

### Change Styles
Edit `assets/css/style.css` to customize colors, fonts, and layout.

### Add Images
Upload images to `assets/images/` and reference them in your JSON files.

## 📝 Local Development

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/REPO_NAME.git
cd REPO_NAME

# Install Python dependencies
pip install jinja2

# Generate HTML
python index_html_generator.py

# Open index.html in browser
open index.html
```

## 🤝 Credits

- Template: [vCard Personal Portfolio](https://github.com/codewithsadee/vcard-personal-portfolio)
- CMS: [AlmostaCMS](https://almostacms.com)

## 📄 License

MIT License - Feel free to use and modify!
```

### 3. .gitignore

Create `.gitignore`:

```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv/
*.egg-info/

# OS
.DS_Store
Thumbs.db
.Spotlight-V100
.Trashes

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
*.log

# Don't ignore index.html (we want the generated file in repo)
!index.html
```

---

## Testing the Template

### 1. Manual Test

```bash
# Create a test repo from template
gh repo create test-portfolio --template YOUR_USERNAME/vcard-portfolio-template --public

# Clone and test
git clone https://github.com/YOUR_USERNAME/test-portfolio.git
cd test-portfolio

# Run generator
python index_html_generator.py

# Open in browser
open index.html
```

### 2. Test with AlmostaCMS

1. Update `react-cms/.env`:
   ```
   VITE_TEMPLATE_OWNER=YOUR_USERNAME
   VITE_TEMPLATE_REPO=vcard-portfolio-template
   ```

2. Start the app:
   ```bash
   cd react-cms
   npm run dev
   ```

3. Log in and create a portfolio
4. Verify repository is created
5. Check GitHub Pages is enabled
6. Wait for workflow to complete
7. Visit the live site

---

## Template Requirements

For a repository to work as a template with AlmostaCMS:

### ✅ Must Have

1. **Public repository** with "Template repository" enabled
2. **data/ folder** with JSON files:
   - about.json
   - resume.json
   - portfolio.json
   - blog.json
   - contact.json
   - navbar.json
   - sidebar.json

3. **GitHub Actions workflow** for deployment
4. **index_html_generator.py** build script
5. **templates/template_index.html** Jinja2 template

### ✨ Should Have

- **README.md** with instructions
- **Initial index.html** (pre-generated)
- **assets/** folder with CSS/JS/images
- **.gitignore** file

### 🚫 Must NOT Have

- Sensitive credentials or keys
- Large binary files (>100MB)
- Hardcoded personal information

---

## Updating the Template

When you update the template:

1. **Make changes** to your template repository
2. **Test locally** with `python index_html_generator.py`
3. **Commit and push** changes
4. **New users** will get the updated template
5. **Existing users** keep their version (can manually update)

---

## Multiple Templates (Future)

To support multiple templates:

1. Create separate template repositories:
   - `vcard-portfolio-template` (default)
   - `minimal-portfolio-template`
   - `creative-portfolio-template`

2. Update AlmostaCMS to let users choose
3. Store template choice in config

---

## Troubleshooting

### Template not found
- Verify repository is public
- Check "Template repository" is enabled in Settings
- Confirm repository name matches config

### Workflow fails
- Check Python syntax in generator script
- Verify all JSON files exist
- Ensure Jinja2 templates are valid

### Pages not deploying
- Enable GitHub Pages in repo settings
- Source: GitHub Actions
- Check Actions tab for errors

---

## Next Steps

Once template is ready:

1. ✅ Create template repository
2. ✅ Test template creation
3. ✅ Update AlmostaCMS config
4. ✅ Test end-to-end flow
5. ✅ Document for users

---

## Resources

- [GitHub Template Repositories](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository)
- [GitHub Actions](https://docs.github.com/en/actions)
- [GitHub Pages](https://pages.github.com/)
- [Jinja2 Documentation](https://jinja.palletsprojects.com/)
