# React Template Development Kit

**Build AlmostaCMS templates with React + TypeScript + Vite + Tailwind CSS**

This kit provides a complete, production-ready boilerplate for creating AlmostaCMS templates using modern React patterns.

---

## What's Included

### 🎯 Complete Boilerplate (13 files)
- **Build System**: Vite 7 + TypeScript 5.9
- **Styling**: Tailwind CSS 4 + PostCSS + Autoprefixer
- **Quality**: ESLint with React + TypeScript rules
- **Deployment**: GitHub Actions workflow (auto-deploys to GitHub Pages)
- **Core Hook**: `useData<T>()` - Generic data loader for any JSON schema

### 📚 Documentation
- `QUICKSTART.md` - Get started in 5 minutes
- `ARCHITECTURE.md` - How everything works
- `DATA_PATTERNS.md` - Data loading patterns and best practices

### 💡 Examples
- `almost-a-tree` - Link-in-bio template (reference implementation)
- `almostacms-landing` - Landing page template

---

## Quick Start

### 1. Copy the Boilerplate

```bash
# Create your new template directory
mkdir almostacms-templates/my-template
cd almostacms-templates/my-template

# Copy all boilerplate files
cp -r ../../template-dev-reactjs-kit/boilerplate/* .
cp -r ../../template-dev-reactjs-kit/boilerplate/.* . 2>/dev/null || true
```

### 2. Customize Configuration

**Update `package.json`:**
```json
{
  "name": "my-template",
  "description": "My awesome template description"
}
```

**Update `.almostacms.json`:**
```json
{
  "templateName": "my-template",
  "templateVersion": "1.0.0"
}
```

**Update `index.html`:**
```html
<title>My Template</title>
<meta name="description" content="My awesome template">
```

### 3. Create Your Components

**Create `src/App.tsx`:**
```tsx
import { useData } from './hooks/useData'
import { SiteData } from './types'

function App() {
  const { data, loading, error } = useData<SiteData>('site.json')

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!data) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold">{data.title}</h1>
      <p>{data.description}</p>
    </div>
  )
}

export default App
```

**Create `src/types.ts`:**
```tsx
export interface SiteData {
  title: string
  description: string
  // Add more fields...
}
```

### 4. Add Example Data

**Create `public/data/site.json`:**
```json
{
  "title": "My Awesome Site",
  "description": "Built with AlmostaCMS"
}
```

### 5. Copy Admin Panel

```bash
# Copy the latest admin bundle
cp -r ../../admin-bundle admin
```

### 6. Install & Run

```bash
npm install
npm run dev
```

Your template will be running at `http://localhost:5173`!

---

## The Magic: useData<T> Hook

The `useData<T>()` hook is the key to the entire system. It provides:

✅ **Type-safe data loading** for any JSON schema
✅ **Automatic error handling**
✅ **Loading states**
✅ **Works with any data structure**

### Example Usage

```tsx
import { useData } from './hooks/useData'

// Load any JSON file with full type safety
const { data: profile, loading, error } = useData<ProfileType>('profile.json')
const { data: links } = useData<LinksType>('links.json')
const { data: theme } = useData<ThemeType>('theme.json')
```

### How It Works

1. Fetches from `/data/{filename}` (your `public/data/` folder)
2. Returns typed data with loading/error states
3. React automatically re-renders when data loads
4. No configuration needed - just define types and use it

---

## Project Structure

```
my-template/
├── index.html              # Entry point (customize title/description)
├── package.json            # Dependencies (customize name/description)
├── vite.config.ts          # Build configuration (no changes needed)
├── tsconfig.*.json         # TypeScript config (no changes needed)
├── tailwind.config.js      # Tailwind config (extend as needed)
├── .almostacms.json        # Template metadata (customize)
│
├── src/
│   ├── main.tsx            # React bootstrap (no changes needed)
│   ├── index.css           # Global styles (extend as needed)
│   ├── App.tsx             # YOUR MAIN COMPONENT ⭐
│   ├── types.ts            # YOUR DATA TYPES ⭐
│   ├── components/         # YOUR COMPONENTS ⭐
│   └── hooks/
│       └── useData.ts      # Generic data loader (no changes needed)
│
├── public/
│   └── data/               # YOUR JSON DATA ⭐
│       ├── site.json
│       └── ...
│
├── admin/                  # Admin panel (copy from admin-bundle)
│
└── .github/workflows/
    └── deploy.yml          # Auto-deploy config (no changes needed)
```

**⭐ = Files you customize for your template**

---

## Data Loading Patterns

### Pattern 1: Single Data File

```tsx
interface SiteData {
  title: string
  tagline: string
}

function App() {
  const { data } = useData<SiteData>('site.json')
  return <h1>{data?.title}</h1>
}
```

### Pattern 2: Multiple Data Files

```tsx
function App() {
  const { data: site } = useData<SiteData>('site.json')
  const { data: links } = useData<LinksData>('links.json')
  const { data: theme } = useData<ThemeData>('theme.json')

  // All load in parallel automatically!
  return (...)
}
```

### Pattern 3: Array Data (Lists)

```tsx
interface Link {
  id: string
  title: string
  url: string
}

interface LinksData {
  links: Link[]
}

const { data } = useData<LinksData>('links.json')

return (
  <div>
    {data?.links.map(link => (
      <a key={link.id} href={link.url}>{link.title}</a>
    ))}
  </div>
)
```

---

## Deployment

### GitHub Pages (Automatic)

1. Push your template to GitHub
2. Enable GitHub Pages in Settings → Pages
3. Set source to "GitHub Actions"
4. Push a commit → Site auto-deploys!

The workflow automatically:
- Detects user vs project site
- Sets correct base path
- Builds with Vite
- Copies admin panel
- Deploys to GitHub Pages

### Base Path Handling

The workflow automatically handles base paths:

- **User site** (`username.github.io`): Base path = `/`
- **Project site** (`username.github.io/repo-name`): Base path = `/repo-name/`

No configuration needed - it just works!

---

## Styling with Tailwind

### Utility-First Approach

```tsx
<div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-600 p-8">
  <h1 className="text-5xl font-bold text-white mb-4">
    Hello World
  </h1>
</div>
```

### Extending Theme

Edit `tailwind.config.js`:

```js
export default {
  theme: {
    extend: {
      colors: {
        'brand': '#FF6B6B',
      },
      fontFamily: {
        'display': ['Inter', 'sans-serif'],
      },
    },
  },
}
```

### Custom CSS

Add to `src/index.css`:

```css
@layer components {
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
  }
}
```

---

## TypeScript Best Practices

### Define Data Schemas

```tsx
// src/types.ts
export interface Profile {
  name: string
  title: string
  bio: string
  avatar: string
  verified?: boolean  // Optional field
}

export interface Link {
  id: string
  title: string
  url: string
  icon?: string
  color?: string
  featured?: boolean
}

export interface LinksData {
  links: Link[]
}
```

### Use Strict Types

```tsx
// ✅ Good - Strict types
const { data } = useData<ProfileData>('profile.json')
if (data) {
  console.log(data.name)  // TypeScript knows 'name' exists
}

// ❌ Bad - Using 'any'
const { data } = useData<any>('profile.json')
```

---

## Common Patterns

### Loading State

```tsx
const { data, loading, error } = useData<SiteData>('site.json')

if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  )
}
```

### Error State

```tsx
if (error) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Data</h1>
        <p className="text-red-500">{error}</p>
      </div>
    </div>
  )
}
```

### Conditional Rendering

```tsx
{data?.featured && (
  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
    Featured
  </span>
)}
```

---

## Examples

### Link-in-Bio Template

See `examples/almost-a-tree/` for a complete reference implementation:
- Multiple data files (profile, links, social, theme, settings)
- Component organization
- Icon system
- Theme customization
- Responsive design

### Landing Page Template

See `examples/almostacms-landing/` for a marketing page implementation:
- Hero section
- Features grid
- Call-to-action sections
- Footer

---

## FAQ

**Q: Can I use a different styling solution?**
A: Yes! Remove Tailwind and use CSS Modules, styled-components, or plain CSS.

**Q: Can I add routing?**
A: Yes! Install `react-router-dom` and set up routes. Update the admin path to `/admin`.

**Q: How do I add more data files?**
A: Just create new `.json` files in `public/data/` and load them with `useData<YourType>('filename.json')`.

**Q: Can I use this for a blog?**
A: Absolutely! Create `posts.json` with an array of post objects and map over them.

**Q: How do I customize the admin panel?**
A: The admin panel is separate - it edits your JSON files. Just ensure your data structure matches what the admin expects.

---

## Validation Checklist

Before deploying your template:

- [ ] `npm install` succeeds
- [ ] `npm run dev` runs without errors
- [ ] `npm run build` succeeds
- [ ] All data files in `public/data/` load correctly
- [ ] No TypeScript errors (`tsc -b`)
- [ ] Admin panel copied to `admin/`
- [ ] `.almostacms.json` has correct template name
- [ ] `index.html` has correct title/description
- [ ] README.md documents your template
- [ ] GitHub Actions workflow present

---

## Next Steps

1. **Study the examples** - See `examples/` for complete implementations
2. **Read the architecture docs** - Understand how everything fits together
3. **Build your template** - Start with a simple layout, iterate
4. **Test thoroughly** - Test loading, errors, responsive design
5. **Share it** - Publish to GitHub and share with the community!

---

**Questions?** Check the [AlmostaCMS Documentation](https://github.com/fedro86/almost-a-cms) or open an issue.

**Happy building!** 🚀
