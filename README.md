# Almost-a-CMS - Portfolio Website Manager

A modern, GitHub-powered CMS for creating and managing beautiful portfolio websites. Edit content through an intuitive web interface and deploy automatically to GitHub Pages - all while maintaining full ownership of your code.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## About the Project

**Almost-a-CMS** simplifies portfolio website creation by combining:
- **Modern React interface** for content editing
- **GitHub API integration** for data storage (no backend database needed)
- **OAuth authentication** for secure GitHub access
- **Automatic deployment** via GitHub Actions
- **Static site generation** from JSON content files

Based on the beautiful [vCard – Personal Portfolio](https://github.com/codewithsadee/vcard-personal-portfolio) template.

---

## Features

- **GitHub OAuth Login** - Secure authentication with your GitHub account
- **Repository Management** - Create portfolios from template or connect existing repos
- **Visual Content Editor** - Edit portfolio content through React forms
- **Live Preview** - See changes in real-time
- **Automatic Deployment** - GitHub Actions builds and deploys your site
- **Zero Server Costs** - Fully serverless architecture
- **You Own Your Data** - Everything lives in your GitHub repository
- **GitHub Pages Hosting** - Free hosting for your portfolio

---

## Architecture

### Modern Stack (Current)

```
┌─────────────────┐
│   React CMS     │ ← Edit content via web interface
│  (react-cms/)   │
└────────┬────────┘
         │ OAuth
         ↓
┌─────────────────┐
│  OAuth Proxy    │ ← Token exchange server
│ (oauth-proxy/)  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   GitHub API    │ ← Content stored in repo data/ folder
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ GitHub Actions  │ ← Auto-build & deploy on changes
│   (.github/)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  GitHub Pages   │ ← Static portfolio site (index.html)
└─────────────────┘
```

### Static Site Generation

```
data/*.json  →  index_html_generator.py  →  index.html
                        ↑
                  template_index.html
```

**Key Components:**
- **React CMS** - Modern web interface for editing
- **OAuth Proxy** - Secure token exchange (Node.js/Express)
- **GitHub API** - Storage and version control
- **Python Generator** - Converts JSON → HTML using Jinja2
- **GitHub Actions** - Automated build/deploy pipeline

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Poetry** (for Python dependencies)
- **GitHub Account** with OAuth App configured

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/almost-a-cms.git
   cd almost-a-cms
   ```

2. **Set up OAuth Proxy Server**
   ```bash
   cd oauth-proxy
   npm install
   cp .env.example .env
   # Edit .env with your GitHub OAuth credentials
   ```

3. **Set up React CMS**
   ```bash
   cd ../react-cms
   npm install
   cp .env.example .env
   # Configure GitHub OAuth client ID
   ```

4. **Install Python dependencies** (for static site generation)
   ```bash
   cd ..
   poetry install
   ```

For detailed setup instructions, see [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) and [docs/OAUTH_SETUP.md](docs/OAUTH_SETUP.md).

---

## Usage

### Running the Application

You need **two terminal windows**:

**Terminal 1: OAuth Proxy Server**
```bash
cd oauth-proxy
npm start
# Server runs on http://localhost:3001
```

**Terminal 2: React CMS**
```bash
cd react-cms
npm run dev
# App runs on http://localhost:3000
```

### Workflow

1. **Login** - Authenticate with your GitHub account
2. **Create/Select Repository** - Create new portfolio or connect existing one
3. **Edit Content** - Use the web interface to update portfolio sections
4. **Save Changes** - Each save commits directly to your GitHub repository
5. **Auto-Deploy** - GitHub Actions automatically rebuilds and deploys your site

### Static Site Generation (Manual)

If you want to generate the static site locally:

```bash
poetry run python index_html_generator.py
```

This reads `data/*.json` files and generates `index.html` using `template_index.html`.

---

## Project Structure

```
.
├── react-cms/              # React CMS interface (main application)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks (useApi, useRepo, etc.)
│   │   ├── contexts/       # Auth context
│   │   ├── services/       # GitHub API service
│   │   └── pages/          # App pages
│   └── package.json
│
├── oauth-proxy/            # OAuth token exchange server
│   ├── server.js           # Express server
│   ├── .env.example        # Environment template
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── deploy.yml      # Auto-deployment workflow
│
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md     # System architecture
│   ├── GETTING_STARTED.md  # Setup guide
│   ├── OAUTH_SETUP.md      # OAuth configuration
│   └── TEMPLATE_REPO_SETUP.md
│
├── data/                   # Portfolio content (JSON files)
│   ├── about.json
│   ├── blog.json
│   ├── contact.json
│   ├── portfolio.json
│   ├── resume.json
│   ├── navbar.json
│   └── sidebar.json
│
├── assets/                 # Static site assets (CSS, JS, images)
│   ├── css/
│   ├── js/
│   └── images/
│
├── index_html_generator.py # Generates static site from JSON
├── template_index.html     # Jinja2 template for static site
├── index.html              # Generated portfolio site
├── pyproject.toml          # Python dependencies
└── README.md               # This file
```

---

## Documentation

Comprehensive documentation available in [docs/](docs/):

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture and design decisions
- **[GETTING_STARTED.md](docs/GETTING_STARTED.md)** - Detailed setup guide
- **[OAUTH_SETUP.md](docs/OAUTH_SETUP.md)** - OAuth configuration walkthrough
- **[TEMPLATE_REPO_SETUP.md](docs/TEMPLATE_REPO_SETUP.md)** - Template repository setup

Additional guides in [docs/temp/](docs/temp/):
- Phase completion notes
- Quick start guides
- Testing guides

---

## Contributing

Contributions are welcome! Feel free to check the [Issues](https://github.com/your-username/almost-a-cms/issues) page.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. You're free to use, modify, and distribute it as needed.

---

## Acknowledgments

- Original portfolio template by [codewithsadee/vcard-personal-portfolio](https://github.com/codewithsadee/vcard-personal-portfolio)
- Built as part of the GitHub Copilot Challenge: New Beginnings

---

**Questions or feedback?** Open an issue or pull request!
