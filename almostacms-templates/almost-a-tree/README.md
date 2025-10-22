# Almost-a-Tree

**A modern, colorful link-in-bio template for AlmostaCMS** 🌳

Create your own beautiful link-in-bio page (like Linktree) with full customization via an embedded CMS.

## Features

- ✨ **Modern & Colorful Design** - Eye-catching gradients and smooth animations
- 🎨 **Fully Customizable** - Edit everything from colors to content via CMS
- 📱 **Mobile-First & Responsive** - Looks perfect on all devices
- ⚡ **Lightning Fast** - Built with React + Vite + Tailwind CSS
- 🔒 **Privacy-Friendly** - No tracking, no cookies, your data stays on GitHub
- 🎯 **Zero Setup** - Clone, customize, deploy in minutes

## Quick Start

### Option 1: Use This Template (GitHub)

1. Click "Use this template" above
2. Name your repository (e.g., `my-links`)
3. Clone and install:
   ```bash
   git clone https://github.com/YOUR_USERNAME/my-links
   cd my-links
   npm install
   ```

### Option 2: Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173 to see your site!

## Customization

All content is managed through JSON files in `public/data/`:

### `profile.json` - Your Info
```json
{
  "name": "Your Name",
  "title": "Your Title",
  "bio": "Your bio description",
  "avatar": "/assets/images/avatar.svg",
  "verified": true
}
```

### `links.json` - Your Links
```json
{
  "links": [
    {
      "id": "linkedin",
      "title": "LinkedIn Profile",
      "description": "Connect with me professionally",
      "url": "https://linkedin.com/in/yourname",
      "icon": "linkedin",
      "color": "#0A66C2",
      "featured": true
    }
  ]
}
```

### `theme.json` - Visual Style
```json
{
  "colors": {
    "primary": "#6366F1",
    "background": "#0F172A",
    "text": "#F8FAFC"
  },
  "gradients": {
    "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  }
}
```

### Available Icons

- `linkedin`, `medium`, `github`, `twitter`, `email`
- `scholar`, `researchgate`
- `link` (default for unknown icons)

Add more icons by editing `src/utils/icons.tsx`!

## Deployment

### GitHub Pages

1. Push your code to GitHub
2. Go to Settings → Pages
3. Set source to "GitHub Actions"
4. Push changes - your site deploys automatically!

Your site will be live at: `https://YOUR_USERNAME.github.io/REPO_NAME/`

### Custom Domain

1. Add `CNAME` file with your domain
2. Configure DNS (see GitHub docs)

## CMS Integration

Once deployed, visit `/admin` to edit your content visually:

```
https://YOUR_USERNAME.github.io/REPO_NAME/admin
```

Login with GitHub to unlock the CMS!

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
almost-a-tree/
├── public/
│   ├── data/              # JSON content files
│   │   ├── profile.json
│   │   ├── links.json
│   │   ├── social.json
│   │   ├── theme.json
│   │   └── settings.json
│   └── assets/            # Images and files
│
├── src/
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utilities (icons, etc.)
│   ├── types.ts           # TypeScript types
│   └── App.tsx            # Main app
│
├── admin/                 # CMS (coming soon)
└── .github/workflows/     # Auto-deployment
```

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 7** - Build tool
- **Tailwind CSS 4** - Styling
- **GitHub Pages** - Free hosting
- **AlmostaCMS** - Content management

## Customization Tips

### Change Colors
Edit `public/data/theme.json` to match your brand:
```json
{
  "colors": {
    "primary": "#YOUR_COLOR",
    "background": "#YOUR_BG"
  }
}
```

### Add More Links
Add items to `links.json`:
```json
{
  "id": "unique-id",
  "title": "My Link",
  "url": "https://example.com",
  "icon": "link",
  "color": "#FF6B6B"
}
```

### Replace Avatar
Add your image to `public/assets/images/` and update:
```json
{
  "avatar": "/assets/images/your-photo.jpg"
}
```

## License

MIT - Use freely for personal and commercial projects!

## Support

- Issues: [GitHub Issues](https://github.com/almostacms/almost-a-cms/issues)
- Docs: [AlmostaCMS Documentation](https://github.com/almostacms/almost-a-cms)

---

**Built with ❤️ using AlmostaCMS**

[View Live Demo](#) | [Report Bug](#) | [Request Feature](#)
