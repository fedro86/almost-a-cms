# AlmostaCMS Project Configuration

This document describes the `.almostacms.json` configuration file used to identify and configure AlmostaCMS projects.

## Purpose

The `.almostacms.json` file serves multiple purposes:

1. **Project Identification** - Marks a repository as an AlmostaCMS project
2. **Deployment Configuration** - Defines where the site and admin are deployed
3. **Project Metadata** - Stores project type, version, creation date
4. **Feature Flags** - Controls which premium features are enabled

## File Location

```
my-portfolio/
├── .almostacms.json    ← Root of repository
├── data/
├── assets/
└── index.html
```

## Schema

### Basic Structure

```json
{
  "version": "1.0.0",
  "generator": "almostacms",
  "projectType": "personal-website",
  "created": "2024-01-20T12:00:00.000Z",
  "lastModified": "2024-01-20T12:00:00.000Z",
  "config": {
    "template": "vcard-portfolio",
    "templateVersion": "1.0.0",
    "customDomain": null,
    "theme": "default"
  },
  "metadata": {
    "title": "My Portfolio",
    "description": "Personal portfolio website",
    "author": "John Doe",
    "tags": ["portfolio", "resume", "personal"]
  }
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | string | Yes | AlmostaCMS config version (semver) |
| `generator` | string | Yes | Always `"almostacms"` - used for identification |
| `projectType` | string | Yes | `"personal-website"` or `"landing-page"` |
| `created` | string | Yes | ISO 8601 timestamp of project creation |
| `lastModified` | string | Yes | ISO 8601 timestamp of last modification |
| `deployment` | object | Yes | Deployment configuration |
| `deployment.path` | string | Yes | Deployment path: `"/"` or `"/docs"` |
| `deployment.adminPath` | string | Yes | Admin path (usually `"/admin"` or `"/docs/admin"`) |
| `deployment.githubPages` | object | Yes | GitHub Pages configuration |
| `config` | object | Yes | Project configuration |
| `config.template` | string | Yes | Template name used |
| `config.templateVersion` | string | Yes | Template version (semver) |
| `config.customDomain` | string/null | No | Custom domain if configured |
| `config.theme` | string | No | Theme variant (if applicable) |
| `metadata` | object | No | Additional project metadata |
| `metadata.title` | string | No | Project title |
| `metadata.description` | string | No | Project description |
| `metadata.author` | string | No | Author name |
| `metadata.tags` | string[] | No | Project tags |
| `features` | object | No | Feature flags (premium features) |
| `features.payments` | boolean | No | Payment integration enabled (premium) |
| `features.analytics` | boolean | No | Analytics integration enabled (premium) |

## Project Types

### 1. Personal Website

```json
{
  "projectType": "personal-website",
  "config": {
    "template": "vcard-portfolio",
    "sections": ["about", "resume", "portfolio", "blog", "contact"]
  }
}
```

**Characteristics:**
- Contains: `data/about.json`, `data/resume.json`, `data/portfolio.json`, etc.
- Focus: Personal branding, portfolio showcase, resume

### 2. Landing Page

```json
{
  "projectType": "landing-page",
  "config": {
    "template": "landing-page-basic",
    "sections": ["hero", "features", "pricing", "testimonials", "faq"]
  }
}
```

**Characteristics:**
- Contains: `data/hero.json`, `data/features.json`, `data/pricing.json`, etc.
- Focus: Product marketing, lead generation, conversions

## Detection Algorithm

When scanning a user's repositories for AlmostaCMS projects:

```typescript
async function isAlmostaCMSProject(owner: string, repo: string): Promise<boolean> {
  try {
    // Try to fetch .almostacms.json from root
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: '.almostacms.json'
    });

    if (response.data.type !== 'file') return false;

    // Decode and parse
    const content = Buffer.from(response.data.content, 'base64').toString();
    const config = JSON.parse(content);

    // Verify it's an AlmostaCMS project
    return config.generator === 'almostacms' && config.version;
  } catch (error) {
    return false; // File doesn't exist or is invalid
  }
}
```

## Updating the Config

The `.almostacms.json` should be updated:

1. **On project creation** - Initial values set
2. **When content is modified** - Update `lastModified` timestamp
3. **When settings change** - Update relevant `config` fields
4. **When custom domain is configured** - Update `config.customDomain`

### Auto-update Example

```typescript
async function updateLastModified(owner: string, repo: string): Promise<void> {
  // Fetch current config
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path: '.almostacms.json'
  });

  const currentConfig = JSON.parse(
    Buffer.from(data.content, 'base64').toString()
  );

  // Update timestamp
  currentConfig.lastModified = new Date().toISOString();

  // Commit back
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: '.almostacms.json',
    message: 'Update AlmostaCMS config',
    content: Buffer.from(JSON.stringify(currentConfig, null, 2)).toString('base64'),
    sha: data.sha
  });
}
```

## GitHub Repository Topics

In addition to `.almostacms.json`, we also recommend adding GitHub topics for better discoverability:

```typescript
await octokit.repos.replaceAllTopics({
  owner,
  repo,
  names: ['almostacms', 'portfolio', 'github-pages']
});
```

**Standard Topics:**
- `almostacms` - Always added
- `portfolio` - For personal websites
- `landing-page` - For landing pages
- `github-pages` - Since we deploy to GitHub Pages

## Migration

For existing projects created before this feature:

1. Check if `.almostacms.json` exists
2. If not, create it with default values:

```json
{
  "version": "1.0.0",
  "generator": "almostacms",
  "projectType": "personal-website",
  "created": "<repo creation date>",
  "lastModified": "<current date>",
  "config": {
    "template": "vcard-portfolio",
    "templateVersion": "1.0.0"
  }
}
```

## Example Configs

### Minimal Config

```json
{
  "version": "1.0.0",
  "generator": "almostacms",
  "projectType": "personal-website",
  "created": "2024-01-20T12:00:00.000Z",
  "lastModified": "2024-01-20T12:00:00.000Z",
  "config": {
    "template": "vcard-portfolio",
    "templateVersion": "1.0.0"
  }
}
```

### Full Config (Personal Website)

```json
{
  "version": "1.0.0",
  "generator": "almostacms",
  "projectType": "personal-website",
  "created": "2024-01-20T12:00:00.000Z",
  "lastModified": "2024-01-25T15:30:00.000Z",
  "config": {
    "template": "vcard-portfolio",
    "templateVersion": "1.0.0",
    "customDomain": "johndoe.com",
    "theme": "dark",
    "sections": ["about", "resume", "portfolio", "blog", "contact"],
    "features": {
      "analytics": true,
      "comments": false,
      "rss": true
    }
  },
  "metadata": {
    "title": "John Doe - Software Engineer",
    "description": "Personal portfolio and blog of John Doe",
    "author": "John Doe",
    "tags": ["portfolio", "software-engineer", "react", "typescript"],
    "language": "en",
    "timezone": "America/New_York"
  },
  "deployment": {
    "url": "https://johndoe.github.io/portfolio",
    "customUrl": "https://johndoe.com",
    "lastDeploy": "2024-01-25T15:32:00.000Z",
    "status": "success"
  }
}
```

### Full Config (Landing Page)

```json
{
  "version": "1.0.0",
  "generator": "almostacms",
  "projectType": "landing-page",
  "created": "2024-01-20T12:00:00.000Z",
  "lastModified": "2024-01-22T10:15:00.000Z",
  "config": {
    "template": "landing-page-basic",
    "templateVersion": "1.0.0",
    "customDomain": "myproduct.com",
    "theme": "light",
    "sections": ["hero", "features", "pricing", "testimonials", "faq", "cta"],
    "features": {
      "analytics": true,
      "newsletter": true,
      "payments": false
    }
  },
  "metadata": {
    "title": "MyProduct - The Best Product Ever",
    "description": "Revolutionary product that solves all your problems",
    "author": "MyProduct Team",
    "tags": ["saas", "product", "landing-page"],
    "language": "en"
  },
  "deployment": {
    "url": "https://mycompany.github.io/myproduct",
    "customUrl": "https://myproduct.com",
    "lastDeploy": "2024-01-22T10:17:00.000Z",
    "status": "success"
  }
}
```

## Versioning

The config file version follows semantic versioning (semver):

- **Major** (1.x.x): Breaking changes to schema
- **Minor** (x.1.x): New optional fields
- **Patch** (x.x.1): Bug fixes, clarifications

**Current Version:** `1.0.0`

## Security

**Important:** Do not store sensitive information in `.almostacms.json`:
- ❌ API keys
- ❌ Passwords
- ❌ Personal access tokens
- ❌ Private user data

This file is **public** if the repository is public.

## Future Extensions

Planned fields for future versions:

```json
{
  "integrations": {
    "analytics": {
      "provider": "plausible",
      "siteId": "mysite.com"
    },
    "comments": {
      "provider": "giscus",
      "repo": "username/comments"
    }
  },
  "build": {
    "generator": "static",
    "outputDir": "dist",
    "assetsDir": "assets"
  },
  "seo": {
    "sitemap": true,
    "robots": true,
    "ogImage": "./assets/og-image.png"
  }
}
```

---

**See Also:**
- [Project Structure](./PROJECT_STRUCTURE.md)
- [Architecture](./ARCHITECTURE.md)
- [Template Repository Setup](./TEMPLATE_REPO_SETUP.md)
