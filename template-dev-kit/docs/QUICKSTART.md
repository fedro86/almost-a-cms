# Template Development Quick Start

**Create an AlmostaCMS template in 5 minutes.**

---

## Prerequisites

- Bash shell (Linux/macOS/Git Bash on Windows)
- Git installed
- Python 3 (for validation)
- GitHub account

---

## Step-by-Step Walkthrough

### 1. Run Setup Wizard

```bash
cd template-dev-kit
./scripts/setup-template.sh
```

### 2. Answer Prompts

```
Template name: portfolio-minimal
Description: A minimal, elegant portfolio template
Author: Your Name
Deployment mode: 1 (root)
Data schemas: all
Create template? Y
```

### 3. Navigate to Template

```bash
cd ../portfolio-minimal
ls
```

You'll see:
```
admin/          # Admin panel
data/           # JSON content files
assets/         # CSS, JS, images
index.html      # Your template
.almostacms.json
.github/
README.md
```

### 4. Customize Content

**Edit data files:**
```bash
# Edit about.json with your info
nano data/about.json  # or your preferred editor

# Update other data files
nano data/projects.json
nano data/contact.json
```

**Customize design:**
```bash
# Edit HTML structure
nano index.html

# Customize colors and styles
nano assets/css/base.css
```

### 5. Test Locally

```bash
# Start local server
python -m http.server 8000

# Visit http://localhost:8000
```

**Test checklist:**
- [ ] Page loads without errors
- [ ] All sections display correctly
- [ ] Responsive on mobile (resize browser)
- [ ] All links work
- [ ] Images load (add test images to assets/images/)

### 6. Validate Template

```bash
../template-dev-kit/scripts/validate-template.sh
```

Fix any errors before publishing.

### 7. Publish to GitHub

```bash
# Commit changes
git add .
git commit -m "Customize template"

# Create repository
gh repo create portfolio-minimal --public --source=. --push

# Or push to existing repo
git remote add origin https://github.com/username/portfolio-minimal.git
git push -u origin main
```

### 8. Enable Template Repository

1. Go to repository **Settings**
2. Scroll to "Template repository"
3. Check the box ✅

### 9. Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Wait 1-2 minutes for deployment

### 10. Test Live Site

Visit:
- Site: `https://username.github.io/portfolio-minimal/`
- Admin: `https://username.github.io/portfolio-minimal/admin/`

**Test admin:**
1. Click "Login with GitHub"
2. Enter device code on GitHub
3. Edit content
4. Save
5. Check site updates (refresh after 30 seconds)

---

## Next Steps

### Add Topics

Make your template discoverable:
1. Go to repository main page
2. Click gear icon next to "About"
3. Add topics:
   - `almostacms`
   - `almostacms-template`
   - `portfolio-template`
   - `github-pages`

### Create Release

```bash
gh release create v1.0.0 \
  --title "v1.0.0 - Initial Release" \
  --notes "First stable version"
```

### Submit to Gallery

Open issue in [almostacms/almost-a-cms](https://github.com/almostacms/almost-a-cms) with:
- Template name
- Description
- Repository URL
- Live demo URL
- Screenshot

---

## Common Issues

**Q: Validation fails with "Invalid JSON"**

A: Check JSON syntax:
```bash
python3 -m json.tool data/about.json
```

**Q: Admin doesn't load on GitHub Pages**

A: Ensure:
- GitHub Pages source is "GitHub Actions"
- Workflow has run (check Actions tab)
- Wait 2-3 minutes after push

**Q: Template name error**

A: Use only:
- Lowercase letters
- Numbers
- Hyphens
- Example: `my-portfolio-2024`

---

**That's it!** You've created and published an AlmostaCMS template. 🎉
