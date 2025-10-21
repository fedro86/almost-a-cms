# Data Schema Design Guide

**How to structure JSON data for AlmostaCMS templates.**

---

## Philosophy

AlmostaCMS templates are **data-driven**:
- Content lives in JSON files (`data/*.json`)
- HTML is populated dynamically via JavaScript
- Users edit JSON via admin panel
- Changes auto-deploy to GitHub Pages

**Benefits:**
- Separation of content and presentation
- Version control for content
- Easy content updates without code changes
- No database needed

---

## Schema Design Principles

### 1. Keep It Flat (When Possible)

**Good:**
```json
{
  "name": "Jane Developer",
  "email": "jane@example.com",
  "location": "San Francisco, CA"
}
```

**Avoid (unless necessary):**
```json
{
  "person": {
    "identity": {
      "name": {
        "first": "Jane",
        "last": "Developer"
      }
    }
  }
}
```

### 2. Use Arrays for Lists

**Projects, blog posts, skills:**
```json
{
  "projects": [
    {"id": "proj-1", "title": "..."},
    {"id": "proj-2", "title": "..."}
  ]
}
```

### 3. Consistent Naming

- Use `camelCase` for field names
- Be descriptive: `projectTitle` not `pt`
- Boolean fields: `isPublished`, `hasComments`

### 4. Include Metadata

```json
{
  "id": "unique-id",
  "createdDate": "2024-10-21",
  "featured": true,
  "order": 1
}
```

---

## Standard Schemas

### about.json - Personal/Company Info

```json
{
  "name": "Jane Developer",
  "title": "Full Stack Developer",
  "bio": "Passionate about...",
  "avatar": "./assets/images/avatar.jpg",
  "email": "hello@example.com",
  "location": "San Francisco, CA",
  "social": {
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username",
    "twitter": "https://twitter.com/username"
  },
  "skills": ["JavaScript", "React", "Node.js"],
  "interests": ["Open Source", "AI", "Photography"]
}
```

**Fields:**
- `name` (string, required) - Full name
- `title` (string) - Job title or tagline
- `bio` (string) - Short bio paragraph
- `avatar` (string) - Path to profile image
- `social` (object) - Social media URLs
- `skills` (array) - Technical skills
- `interests` (array) - Personal interests

### projects.json - Portfolio Items

```json
{
  "projects": [
    {
      "id": "almostacms",
      "title": "AlmostaCMS",
      "description": "A decentralized CMS...",
      "image": "./assets/images/projects/almostacms.png",
      "url": "https://github.com/almostacms/almost-a-cms",
      "demoUrl": "https://demo.almostacms.com",
      "tags": ["React", "GitHub API", "TypeScript"],
      "featured": true,
      "date": "2024-10"
    }
  ]
}
```

**Array item fields:**
- `id` (string, unique) - Project identifier
- `title` (string, required) - Project name
- `description` (string) - 1-2 sentence summary
- `image` (string) - Screenshot or logo
- `url` (string) - Repository or project URL
- `demoUrl` (string) - Live demo URL
- `tags` (array) - Technologies used
- `featured` (boolean) - Show on homepage
- `date` (string) - YYYY-MM format

### blog.json - Blog Posts

```json
{
  "posts": [
    {
      "id": "building-almostacms",
      "title": "Building a Decentralized CMS",
      "excerpt": "How I built...",
      "content": "Full post content...",
      "author": "Jane Developer",
      "date": "2024-10-15",
      "readTime": "8 min read",
      "image": "./assets/images/blog/post-1.jpg",
      "tags": ["Web Development", "GitHub"],
      "featured": true
    }
  ]
}
```

### contact.json - Contact Information

```json
{
  "email": "hello@example.com",
  "phone": "+1 (555) 123-4567",
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "country": "USA"
  },
  "social": {
    "github": {
      "url": "https://github.com/username",
      "handle": "@username"
    }
  },
  "availability": {
    "status": "available",
    "message": "Currently accepting new projects"
  }
}
```

### navbar.json - Navigation Menu

```json
{
  "logo": {
    "text": "JD",
    "image": "./assets/images/logo.svg"
  },
  "items": [
    {"id": "home", "label": "Home", "url": "#home", "active": true},
    {"id": "about", "label": "About", "url": "#about"},
    {"id": "projects", "label": "Projects", "url": "#projects"}
  ],
  "mobileMenu": {"enabled": true, "breakpoint": "768px"},
  "sticky": true
}
```

### settings.json - Site Configuration

```json
{
  "site": {
    "title": "Jane Developer - Portfolio",
    "tagline": "Building beautiful web experiences",
    "description": "Portfolio and blog...",
    "url": "https://janedeveloper.com"
  },
  "seo": {
    "keywords": ["web developer", "portfolio"],
    "ogImage": "./assets/images/og-image.jpg"
  },
  "theme": {
    "primaryColor": "#2563eb",
    "secondaryColor": "#7c3aed",
    "fontFamily": "'Inter', sans-serif"
  },
  "features": {
    "blog": true,
    "projects": true,
    "contact": true
  }
}
```

---

## Best Practices

### Image Paths

**Use relative paths:**
```json
"avatar": "./assets/images/avatar.jpg"
```

**Not absolute:**
```json
"avatar": "https://example.com/avatar.jpg"  // ❌ Harder to test locally
```

### Dates

**Use ISO 8601 format:**
```json
"date": "2024-10-21"          // ✓ YYYY-MM-DD
"publishedAt": "2024-10-21T14:30:00Z"  // ✓ Full timestamp
```

**Not:**
```json
"date": "October 21, 2024"    // ❌ Harder to parse
```

### URLs

**Always use full URLs for external links:**
```json
"github": "https://github.com/username"  // ✓
"github": "github.com/username"          // ❌ Missing protocol
```

### Optional Fields

**Use null or omit:**
```json
{
  "phone": null,           // ✓ Explicit absence
  "demoUrl": ""            // ❌ Empty string is confusing
}
```

Or better:
```json
{
  // Omit field if not applicable
}
```

---

## Custom Schemas

### When to Create Custom Schema

Create a new schema when you have:
- Distinct content type (testimonials, team members, etc.)
- 5+ fields that belong together
- Content that updates independently

### Example: testimonials.json

```json
{
  "testimonials": [
    {
      "id": "testimonial-1",
      "author": "John Client",
      "company": "Acme Corp",
      "role": "CEO",
      "avatar": "./assets/images/testimonials/john.jpg",
      "quote": "Working with Jane was amazing...",
      "rating": 5,
      "date": "2024-09-15"
    }
  ]
}
```

---

## How Users Edit Data

Users edit JSON via the admin panel:

1. Visit `/admin`
2. Login with GitHub
3. Select file (e.g., "About")
4. Edit in visual forms (not raw JSON)
5. Save → commits to GitHub
6. Auto-deploys in 30 seconds

**You don't edit JSON manually in production!**

---

## Validation

### Manual Validation

```bash
python3 -m json.tool data/about.json
```

### In Template

Use try/catch when loading:
```javascript
try {
  const data = await loader.load('about');
} catch (error) {
  console.error('Invalid JSON:', error);
}
```

---

## Migration

If you change schema structure:

1. **Add new fields** - no breaking change
2. **Rename fields** - breaking, needs migration
3. **Remove fields** - check usage first

**Example migration:**
```javascript
// Old: data.fullName
// New: data.name

const name = data.name || data.fullName;  // Backward compatible
```

---

## Summary

**Good schema design:**
- ✓ Flat when possible
- ✓ Arrays for lists
- ✓ Consistent naming
- ✓ Relative paths for assets
- ✓ ISO dates
- ✓ Full URLs for external links

**Your users will thank you!** 🎉
