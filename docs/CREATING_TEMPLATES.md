# Creating Templates for AlmostaCMS

**Want to create a beautiful AlmostaCMS template?**

We've built a complete **Template Development Kit** that makes template creation fast and easy!

---

## Quick Start

```bash
# Navigate to the template development kit
cd template-dev-kit

# Run the interactive setup wizard
./scripts/setup-template.sh

# Follow the prompts - you'll have a complete template in < 5 minutes!
```

---

## Template Development Kit

The kit includes everything you need:

- ✅ **Latest Admin Bundle** - Pre-built admin panel ready to embed
- ✅ **Interactive Setup Wizard** - Create templates in minutes
- ✅ **Data Schema Examples** - 6 common patterns (about, projects, blog, etc.)
- ✅ **Responsive Boilerplate** - HTML5, CSS, JavaScript starter code
- ✅ **Validation Script** - 17 quality checks before publishing
- ✅ **Complete Documentation** - Guides for every aspect

---

## Documentation

All template creation docs are now in the **template-dev-kit**:

📖 **[Template Dev Kit README](../template-dev-kit/README.md)** - Complete overview

📖 **[Quick Start Guide](../template-dev-kit/docs/QUICKSTART.md)** - 5-minute walkthrough

📖 **[Data Schemas Guide](../template-dev-kit/docs/DATA_SCHEMAS.md)** - How to structure JSON data

📖 **[Deployment Guide](../template-dev-kit/docs/DEPLOYMENT.md)** - Root vs Docs deployment

📖 **[Best Practices](../template-dev-kit/docs/BEST_PRACTICES.md)** - Performance, accessibility, SEO

---

## What You'll Get

Running the setup wizard creates a complete template with:

```
your-template/
├── admin/              # Embedded admin panel
├── data/               # JSON content files
├── assets/             # CSS, JS, images
├── index.html          # Your template
├── .almostacms.json    # Configuration
├── .github/workflows/  # Auto-deployment
└── README.md           # User guide
```

---

## Example Usage

```bash
# 1. Create template
cd template-dev-kit
./scripts/setup-template.sh

# Answer prompts:
# - Template name: my-portfolio
# - Description: A clean portfolio template
# - Author: Your Name
# - Deployment mode: root
# - Data schemas: all

# 2. Customize
cd ../my-portfolio
# Edit index.html, CSS, and data files

# 3. Validate
../template-dev-kit/scripts/validate-template.sh

# 4. Publish
git add .
git commit -m "Initial template"
gh repo create my-portfolio --public --source=. --push

# 5. Enable "Template repository" in GitHub settings
```

---

## Template Requirements

Your template must include:

- ✅ Admin bundle in `/admin` directory
- ✅ Data folder with JSON files
- ✅ `.almostacms.json` configuration
- ✅ GitHub Actions workflow
- ✅ README.md for users

**The setup wizard handles all of this automatically!**

---

## Need Help?

- **Template Dev Kit README**: [../template-dev-kit/README.md](../template-dev-kit/README.md)
- **Quick Start**: [../template-dev-kit/docs/QUICKSTART.md](../template-dev-kit/docs/QUICKSTART.md)
- **GitHub Issues**: [Report issues or ask questions](https://github.com/almostacms/almost-a-cms/issues)
- **Discussions**: [Community discussions](https://github.com/almostacms/almost-a-cms/discussions)

---

## Template Ideas

Looking for inspiration?

- Developer portfolio
- Designer portfolio
- Photography showcase
- Product landing page
- SaaS landing page
- Personal blog
- Link-in-bio page
- Resume/CV site
- Event page
- Restaurant/cafe site

**The template-dev-kit makes any of these easy to build!**

---

**Ready to create?** Head to the [template-dev-kit](../template-dev-kit/) and run the setup wizard! 🚀
