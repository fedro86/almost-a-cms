# AlmostaCMS Project Detection

This document explains how AlmostaCMS identifies and manages your existing projects.

## Overview

When you log in to AlmostaCMS, the system automatically scans your GitHub repositories to find existing AlmostaCMS projects. This allows you to:

- View all your AlmostaCMS websites in one place
- Switch between different projects easily
- Create new projects or continue editing existing ones
- See deployment status and links for each project

## How It Works

### 1. Project Marker File

Each AlmostaCMS project contains a `.almostacms.json` file in the repository root. This file serves as:

- **Project identifier** - Marks the repo as an AlmostaCMS project
- **Configuration store** - Contains project settings and metadata
- **Detection mechanism** - Enables automatic project discovery

**Example `.almostacms.json`:**

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
    "tags": ["portfolio", "resume"]
  }
}
```

### 2. Detection Process

When you log in, AlmostaCMS:

1. **Fetches your repositories** - Gets list of all your GitHub repos
2. **Checks each repo** - Looks for `.almostacms.json` in the root
3. **Validates config** - Verifies it's a valid AlmostaCMS project
4. **Loads metadata** - Reads project type, title, description, etc.
5. **Checks deployment** - Gets GitHub Pages status and URL
6. **Displays dashboard** - Shows all found projects in a grid

### 3. Project Dashboard

After authentication, you're taken to `/projects` where you can:

- **View all projects** - See cards for each AlmostaCMS project
- **Create new project** - Click the "+" card to start fresh
- **Open existing project** - Click any project to edit it
- **View live site** - Click the link to see the deployed site
- **See project info** - View type, last modified, and description

## Project Types

### Personal Website

**Identifier:** `projectType: "personal-website"`

**Features:**
- Portfolio showcase
- Resume/CV sections
- Blog posts
- About me
- Contact form

**Icon:** 👤

### Landing Page

**Identifier:** `projectType: "landing-page"`

**Features:**
- Hero section
- Features grid
- Pricing tables
- Testimonials
- FAQ
- Call-to-action

**Icon:** 🚀

## User Flow

```
Login with GitHub OAuth
        ↓
Scan repositories for .almostacms.json
        ↓
[Projects Found?]
   ↙         ↘
 Yes         No
  ↓           ↓
Show         Show empty
Projects     state + Create
Dashboard    New button
  ↓
Select existing OR Create new
        ↓
Load project in admin panel
```

## API Methods

### Check if Repo is AlmostaCMS Project

```typescript
await githubApi.isAlmostaCMSProject(owner, repo);
// Returns: boolean
```

### Get Project Configuration

```typescript
await githubApi.getProjectConfig(owner, repo);
// Returns: { success: true, data: { config, sha } }
```

### List All User's Projects

```typescript
await githubApi.listAlmostaCMSProjects();
// Returns: Array of project objects with config and deployment info
```

### Initialize New Project

```typescript
await githubApi.initializeProject(
  owner,
  repo,
  'personal-website',
  {
    title: 'My Portfolio',
    description: 'My awesome website',
    author: 'John Doe'
  }
);
```

## GitHub Repository Topics

In addition to `.almostacms.json`, projects are also tagged with GitHub topics:

**Standard Topics:**
- `almostacms` - Always added
- `portfolio` or `landing-page` - Based on project type
- `github-pages` - Since we deploy to GitHub Pages

This makes projects discoverable on GitHub and helps with organization.

## Migration Guide

### For Existing Projects (Without .almostacms.json)

If you have an older AlmostaCMS project created before this feature:

1. **Manual Migration:**
   - Copy `.almostacms.json` from the template
   - Update `projectType`, `metadata.title`, and `metadata.description`
   - Commit to your repository
   - Refresh the projects dashboard

2. **Automatic Migration** (future feature):
   - AlmostaCMS will detect old-format projects
   - Offer to migrate them automatically
   - Add `.almostacms.json` with inferred settings

### For New Projects

All new projects created through AlmostaCMS automatically include `.almostacms.json`.

## Security & Privacy

**What's stored:**
- Project metadata (title, description, type)
- Configuration (template, theme, domain)
- Timestamps (created, last modified)

**What's NOT stored:**
- Personal data
- API keys or secrets
- User content (that's in your data/ folder)

**Visibility:**
- `.almostacms.json` is committed to your repo
- If repo is public, the file is public
- No sensitive data should be in this file

## Troubleshooting

### Project Not Showing Up?

**Check:**
1. Is `.almostacms.json` in the repository root?
2. Is the file valid JSON?
3. Does it have `generator: "almostacms"`?
4. Do you have read access to the repository?
5. Try refreshing the projects dashboard

### Can't Edit Project?

**Check:**
1. Do you have write access to the repository?
2. Is your GitHub token still valid?
3. Are you logged in as the repository owner?

### Multiple Projects with Same Name?

- Projects are identified by `owner/repo-name`
- You can have multiple projects with same repo name if owned by different GitHub accounts
- Use descriptive `metadata.title` to distinguish them

## Future Enhancements

Planned features:

1. **Search and filter** - Find projects by name, type, or tag
2. **Sort options** - By date, name, or project type
3. **Archive projects** - Hide inactive projects
4. **Share projects** - Invite collaborators to edit
5. **Project templates** - Save custom configurations
6. **Bulk operations** - Update multiple projects at once
7. **Analytics** - View visitor stats for each project

## Technical Details

**Performance:**
- Scanning is done in parallel for speed
- Results are cached in browser session
- Typical scan time: 2-5 seconds for 100 repositories

**Rate Limiting:**
- GitHub API: 5,000 requests/hour
- Scanning 100 repos ≈ 300-400 requests
- Safely scan 12-15 times per hour

**Data Storage:**
- Selected project stored in `localStorage`
- Used to remember which project you're editing
- Cleared on logout

---

**See Also:**
- [AlmostaCMS Config Specification](./ALMOSTACMS_CONFIG.md)
- [Architecture](./ARCHITECTURE.md)
- [Getting Started](./GETTING_STARTED.md)
