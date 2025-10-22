# AlmostaCMS Landing Page Template

**A simple, modern landing page template for AlmostaCMS**

This template demonstrates the AlmostaCMS approach - data-driven, editable content with React + TypeScript.

---

## Features

- ✨ **Modern Design** - Clean, responsive layout with gradients
- 📝 **3 Sections** - Hero, Features, CTA
- 🎨 **Tailwind CSS** - Utility-first styling
- ⚡ **Fast** - Built with Vite
- 📱 **Responsive** - Mobile-first design
- 🔧 **Editable** - All content in JSON files

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 3. Edit Content

All content is in `public/data/`:

- `hero.json` - Headline, subheadline, CTA buttons
- `features.json` - Feature cards (emoji, title, description)
- `cta.json` - Bottom call-to-action section

### 4. Build for Production

```bash
npm run build
```

Outputs to `dist/`

---

## Project Structure

```
almostacms-landing/
├── public/
│   └── data/              # ⭐ Edit these JSON files
│       ├── hero.json
│       ├── features.json
│       └── cta.json
│
├── src/
│   ├── App.tsx            # Main component (loads data)
│   ├── types.ts           # TypeScript interfaces
│   ├── components/        # Section components
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   └── CTA.tsx
│   └── hooks/
│       └── useData.ts     # Generic data loader
│
└── admin/                 # Admin panel (at /admin)
```

---

## Data Schemas

### hero.json

```json
{
  "headline": "Your Headline",
  "subheadline": "Your subheadline text",
  "ctaPrimary": {
    "text": "Button Text",
    "url": "https://example.com"
  },
  "ctaSecondary": {
    "text": "Secondary Button",
    "url": "https://example.com"
  }
}
```

### features.json

```json
{
  "sectionTitle": "Section Title",
  "features": [
    {
      "id": "unique-id",
      "emoji": "💰",
      "title": "Feature Title",
      "description": "Feature description"
    }
  ]
}
```

### cta.json

```json
{
  "headline": "CTA Headline",
  "subheadline": "CTA subheadline",
  "buttonText": "Button Text",
  "buttonUrl": "https://example.com"
}
```

---

## Customization

### Colors

Edit `src/components/` files to change colors:

```tsx
// Current: Blue & Purple
className="bg-blue-600"
className="from-blue-50 to-purple-50"

// Change to any Tailwind color
className="bg-green-600"
className="from-green-50 to-teal-50"
```

### Add More Sections

1. Create component in `src/components/YourSection.tsx`
2. Add interface to `src/types.ts`
3. Create data file in `public/data/your-section.json`
4. Import and use in `src/App.tsx`:

```tsx
import YourSection from './components/YourSection'
const { data: yourData } = useData<YourDataType>('your-section.json')
// ...
{yourData && <YourSection data={yourData} />}
```

---

## Deployment

### GitHub Pages

1. Copy the admin bundle:
   ```bash
   cp -r ../../admin-bundle admin
   ```

2. Push to GitHub

3. Enable GitHub Pages (Settings → Pages → GitHub Actions)

4. Your site will be live at `https://username.github.io/repo-name/`

### Custom Domain

Add a `CNAME` file with your domain and configure DNS.

---

## Admin Panel

Once deployed, visit `/admin` to edit content:

```
https://yoursite.com/admin
```

1. Login with GitHub
2. Edit JSON files visually
3. Save changes
4. Site rebuilds automatically
5. Live in ~30 seconds

---

## Built With

- [React 19](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite 7](https://vitejs.dev/) - Build tool
- [Tailwind CSS 4](https://tailwindcss.com/) - Styling
- [AlmostaCMS](https://github.com/fedro86/almost-a-cms) - CMS

---

## License

MIT - Use freely for any project!

---

**Built with AlmostaCMS** 🚀
