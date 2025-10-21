# AlmostaCMS Template Development Kit

**Create beautiful AlmostaCMS templates in minutes, not hours.**

This toolkit provides everything you need to build high-quality website templates for AlmostaCMS - the decentralized, zero-cost website builder.

---

## What's Inside

- ✅ **Latest Admin Bundle** - Pre-built admin panel ready to embed
- ✅ **GitHub Actions Workflows** - Automated deployment to GitHub Pages
- ✅ **Data Schema Examples** - Common patterns for content structure
- ✅ **Responsive Boilerplate** - Mobile-first HTML/CSS/JS foundation
- ✅ **Interactive Setup Wizard** - Create templates in < 5 minutes
- ✅ **Validation Script** - Ensure template quality before publishing
- ✅ **Complete Documentation** - Guides for every aspect

---

## Quick Start

### Create Your First Template

```bash
# 1. Run the setup wizard
cd template-dev-kit
./scripts/setup-template.sh

# Answer the prompts:
# - Template name: my-awesome-portfolio
# - Description: A beautiful portfolio template
# - Author: Your Name
# - Deployment mode: root
# - Data schemas: all

# 2. Customize your template
cd ../my-awesome-portfolio
# Edit index.html, CSS, and data files

# 3. Test locally
python -m http.server 8000
# Visit http://localhost:8000

# 4. Validate
../template-dev-kit/scripts/validate-template.sh

# 5. Publish to GitHub
git add .
git commit -m "Initial template"
gh repo create my-awesome-portfolio --public --source=. --push

# 6. Enable "Template repository" in GitHub settings
```

**That's it!** Your template is ready for others to use.

---

## Directory Structure

```
template-dev-kit/
├── admin/                        # Latest admin bundle (~950KB)
│   ├── assets/                   # JS/CSS bundles
│   ├── index.html                # Admin entry point
│   └── .almostacms-admin         # Version marker
│
├── .github/workflows/            # Deployment workflows
│   ├── deploy-root.yml           # For root deployment
│   └── deploy-docs.yml           # For /docs deployment
│
├── data/                         # Example data schemas
│   ├── about.json.example        # Personal/company info
│   ├── projects.json.example     # Portfolio items
│   ├── blog.json.example         # Blog posts
│   ├── contact.json.example      # Contact information
│   ├── navbar.json.example       # Navigation menu
│   └── settings.json.example     # Site settings
│
├── boilerplate/                  # Base template files
│   ├── index.html                # Responsive HTML structure
│   ├── css/
│   │   ├── reset.css             # CSS reset
│   │   └── base.css              # Base responsive styles
│   └── js/
│       ├── data-loader.js        # JSON loading utility
│       └── main.js               # Template initialization
│
├── scripts/                      # Development utilities
│   ├── setup-template.sh         # Interactive setup wizard
│   └── validate-template.sh      # Template validator
│
├── docs/                         # Documentation
│   ├── QUICKSTART.md             # 5-minute template creation
│   ├── DATA_SCHEMAS.md           # How to design data structures
│   ├── DEPLOYMENT.md             # Root vs Docs deployment
│   └── BEST_PRACTICES.md         # Performance, accessibility, SEO
│
├── .almostacms.json.template     # Config template
├── .gitignore.template           # Standard gitignore
├── LICENSE                       # MIT License
└── README.md                     # This file
```

---

## Usage Guide

### Setup Wizard

The interactive wizard guides you through template creation:

```bash
./scripts/setup-template.sh
```

**What it does:**
- ✅ Creates directory structure (root or docs mode)
- ✅ Copies admin bundle
- ✅ Generates configuration file
- ✅ Sets up GitHub Actions workflow
- ✅ Initializes git repository
- ✅ Creates README for template users

**Output:**
```
../your-template-name/
├── admin/                  # Embedded admin panel
├── data/                   # JSON content files
├── assets/                 # CSS, JS, images
├── index.html              # Your template
├── .almostacms.json        # Configuration
├── .github/workflows/      # Auto-deployment
└── README.md               # User guide
```

### Validation Script

Check template completeness before publishing:

```bash
./scripts/validate-template.sh
```

**What it checks:**
- ✅ Admin bundle exists and is complete
- ✅ Configuration file is valid JSON
- ✅ GitHub Actions workflow configured
- ✅ Data files exist and are valid JSON
- ✅ Required assets present (HTML, CSS, JS)
- ⚠️ Warns about hardcoded content
- ⚠️ Recommends .gitignore and README

**Example output:**
```
Checking admin bundle exists... ✓ PASS
Checking admin version marker... ✓ PASS
  ℹ Admin version: 1.0.0
Checking .almostacms.json exists... ✓ PASS
Checking data files... ✓ PASS
  ℹ Found 6 JSON file(s)

======================================
  Validation Summary
======================================

  Passed:  15
  Failed:  0
  Warnings: 0

✓ Template validation PASSED!
```

---

## Deployment Modes

AlmostaCMS supports two deployment modes:

### Root Deployment

**Structure:**
```
my-template/
├── admin/          # Admin at /admin
├── data/           # Data files
├── assets/
└── index.html      # Site root
```

**URLs:**
- Site: `username.github.io/my-template/`
- Admin: `username.github.io/my-template/admin/`

**Use when:**
- Simple template structure
- Single-purpose sites
- Maximum simplicity

### Docs Deployment

**Structure:**
```
my-template/
├── docs/
│   ├── admin/      # Admin at /admin
│   ├── data/       # Data files
│   ├── assets/
│   └── index.html  # Site in /docs
├── src/            # Source code (optional)
└── README.md       # Development docs
```

**URLs:**
- Site: `username.github.io/my-template/`
- Admin: `username.github.io/my-template/admin/`

**Use when:**
- Separating site from source code
- Using build tools
- Need development docs at repo root

---

## Data Schemas

The kit includes 6 example data schemas:

| Schema | Purpose | Example Fields |
|--------|---------|----------------|
| **about.json** | Personal/company info | name, title, bio, avatar, skills |
| **projects.json** | Portfolio items | title, description, image, tags, URL |
| **blog.json** | Blog posts | title, excerpt, content, date, author |
| **contact.json** | Contact info | email, phone, social links, location |
| **navbar.json** | Navigation menu | logo, menu items, mobile config |
| **settings.json** | Site settings | theme colors, fonts, SEO, features |

**Each schema is:**
- Well-documented with realistic data
- Ready to use or customize
- Follows best practices
- Compatible with the data loader utility

See [`docs/DATA_SCHEMAS.md`](docs/DATA_SCHEMAS.md) for detailed guidance.

---

## Boilerplate Code

### HTML Template

- Semantic HTML5 structure
- Responsive meta tags
- SEO-friendly (title, description, Open Graph)
- Accessible (ARIA labels, proper headings)
- Data-driven (hooks for JSON population)

### CSS

**reset.css:**
- Modern CSS reset (based on Andy Bell's)
- Accessibility-focused (focus-visible)
- Motion preferences support

**base.css:**
- CSS custom properties for theming
- Mobile-first responsive design
- Flexbox and Grid utilities
- Common component styles
- Dark mode ready (optional)

### JavaScript

**data-loader.js:**
- Fetch JSON files from `data/`
- Populate HTML elements automatically
- Support for nested data (dot notation)
- Error handling and caching
- Vanilla JS, no dependencies

**main.js:**
- Template initialization
- Custom population logic
- Mobile menu handler
- Example implementations

---

## Best Practices

### Performance
- Optimize images (WebP, compression)
- Lazy load images
- Minify CSS/JS for production
- Use CDN for external libraries

### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Sufficient color contrast
- Alt text for all images

### SEO
- Descriptive meta tags
- Open Graph tags
- Structured data (future)
- Meaningful headings (H1-H6)
- Sitemap (optional)

### User Experience
- Mobile-first design
- Fast load times (<3s)
- Clear error messages
- Intuitive navigation
- Responsive to all screen sizes

See [`docs/BEST_PRACTICES.md`](docs/BEST_PRACTICES.md) for complete guide.

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
- Resume/CV

**Get creative!** Any static site that can be managed via JSON works great.

---

## Updating Admin Bundle

When a new admin version is released:

```bash
# In almost-a-cms repo
./scripts/prepare-admin-bundle.sh 1.1.0

# Copy to template-dev-kit
cp -r admin-bundle/* template-dev-kit/admin/

# Update all existing templates
# (Create update script in future)
```

---

## Publishing Your Template

### 1. Create Repository

```bash
cd your-template
git add .
git commit -m "Initial template"
gh repo create your-template-name --public --source=. --push
```

### 2. Enable Template Repository

- Go to repository **Settings**
- Under "General", check **"Template repository"**

### 3. Add Topics

Add these topics for discoverability:
- `almostacms`
- `almostacms-template`
- `portfolio-template` (or relevant type)
- `github-pages`
- `static-site`

### 4. Create Release

```bash
gh release create v1.0.0 \
  --title "v1.0.0 - Initial Release" \
  --notes "First stable release of the template"
```

### 5. Submit to AlmostaCMS

Open an issue in the main AlmostaCMS repository with:
- Template name and description
- Repository URL
- Live demo URL
- Screenshots

We'll feature it in our template gallery!

---

## Documentation

- **[QUICKSTART.md](docs/QUICKSTART.md)** - 5-minute walkthrough
- **[DATA_SCHEMAS.md](docs/DATA_SCHEMAS.md)** - Data structure design
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Deployment configuration
- **[BEST_PRACTICES.md](docs/BEST_PRACTICES.md)** - Quality guidelines

---

## Requirements

**For template creation:**
- Bash (Linux/macOS/Git Bash on Windows)
- Git
- Python 3 (for JSON validation)

**For template users:**
- GitHub account
- Web browser (for admin panel)
- Git (optional, for local development)

---

## Troubleshooting

### "Template name must contain only lowercase..."

Template names must be:
- Lowercase letters
- Numbers
- Hyphens only
- Example: `my-portfolio-template`

### Validation fails with "Invalid JSON"

Check your JSON files:
```bash
python3 -m json.tool data/about.json
```

Fix syntax errors (missing commas, brackets, quotes).

### Admin panel doesn't load

Ensure:
1. Admin bundle is complete (`admin/` directory)
2. GitHub Pages is enabled (Settings → Pages)
3. Deployment source is "GitHub Actions"
4. Workflow has run successfully (Actions tab)

### Data doesn't load

Check:
1. Data files are valid JSON
2. File paths match deployment mode
3. `.almostacms.json` has correct `dataPath`
4. Browser console for errors

---

## Support

- **Issues:** [GitHub Issues](https://github.com/almostacms/almost-a-cms/issues)
- **Discussions:** [GitHub Discussions](https://github.com/almostacms/almost-a-cms/discussions)
- **Templates:** Share yours with the community!

---

## License

MIT License - Use freely for personal and commercial projects.

---

## Contributing

Found a bug? Have an idea? Contributions welcome!

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Test thoroughly
5. Submit pull request

---

**Happy template creating! 🚀**

Built with ❤️ by the AlmostaCMS community.
