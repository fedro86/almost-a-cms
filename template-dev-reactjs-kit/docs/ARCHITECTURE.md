# React Template Kit Architecture

**How the AlmostaCMS React template system works**

---

## Core Philosophy

**Configuration over Code, Data over Logic**

Templates should be:
- ✅ **Data-driven** - Content in JSON, not hardcoded
- ✅ **Type-safe** - TypeScript catches errors before runtime
- ✅ **Simple** - No complex state management needed
- ✅ **Portable** - Easy to copy, customize, and deploy

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User's Browser                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  React App (src/App.tsx)                                    │
│       ↓                                                      │
│  useData<T>('file.json')  ← Generic Hook                   │
│       ↓                                                      │
│  fetch('/data/file.json')  ← Vite serves from public/      │
│       ↓                                                      │
│  TypeScript validates      ← Type safety                    │
│       ↓                                                      │
│  Component renders         ← React magic                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Admin Panel (/admin)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User edits content via forms                               │
│       ↓                                                      │
│  GitHub API updates data/*.json                             │
│       ↓                                                      │
│  Commits to repository                                      │
│       ↓                                                      │
│  GitHub Actions rebuilds site                               │
│       ↓                                                      │
│  Live in ~30 seconds                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## The useData<T> Hook

**The single most important piece of the system**

### Source Code

```tsx
import { useState, useEffect } from 'react';

export function useData<T>(filename: string): {
  data: T | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/data/${filename}`);

        if (!response.ok) {
          throw new Error(`Failed to load ${filename}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filename]);

  return { data, loading, error };
}
```

### Why It's Genius

1. **Generic Type Parameter** - `<T>` makes it work with ANY data structure
2. **One Hook, Infinite Uses** - Works for profiles, links, posts, products, anything
3. **Built-in State Management** - No Redux/Zustand needed for simple templates
4. **Automatic Re-renders** - React updates UI when data loads
5. **Error Handling** - Gracefully handles network failures
6. **Zero Configuration** - Just works out of the box

### Usage Examples

```tsx
// Simple data
const { data } = useData<SiteData>('site.json')

// Array data
const { data: posts } = useData<PostsData>('posts.json')

// Multiple files in parallel
const { data: profile } = useData<Profile>('profile.json')
const { data: links } = useData<Links>('links.json')
const { data: theme } = useData<Theme>('theme.json')
// All three fetch simultaneously!
```

---

## Build System

### Vite Configuration

```typescript
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',  // ← Dynamic base path
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  publicDir: 'public',  // ← Serves data/ folder
})
```

**Key Features:**
- **Fast HMR** - Changes appear instantly during development
- **Optimized Builds** - Tree-shaking, code-splitting, minification
- **Dynamic Base Path** - Adapts to user vs project GitHub Pages
- **Public Directory** - Serves `data/` folder as static files

### GitHub Actions Workflow

```yaml
- name: Build
  run: npm run build
  env:
    # Automatically detects user site vs project site
    VITE_BASE_PATH: ${{ github.event.repository.name != github.repository_owner.github.io && format('/{0}/', github.event.repository.name) || '/' }}

- name: Copy admin to dist
  run: cp -r admin dist/admin

- name: Copy .almostacms.json to dist
  run: cp .almostacms.json dist/.almostacms.json
```

**Smart Path Detection:**
- `username.github.io` → Base path: `/`
- `username.github.io/my-site` → Base path: `/my-site/`

---

## Data Flow

### Development (npm run dev)

```
1. Vite starts dev server (localhost:5173)
2. Serves public/ folder at /
3. React app loads
4. useData() fetches from /data/file.json
5. Vite HMR updates on file changes
```

### Production Build (npm run build)

```
1. TypeScript compiles (type checking)
2. Vite bundles React app
3. Outputs to dist/
4. Copies public/ → dist/ (includes data/)
5. Copies admin/ → dist/admin/
6. Result: dist/ contains everything
```

### Deployment (GitHub Actions)

```
1. Push to main branch
2. GitHub Actions triggers
3. Installs dependencies (npm ci)
4. Builds with correct base path
5. Copies admin + config
6. Deploys dist/ to GitHub Pages
7. Live in ~30 seconds
```

---

## Type System

### Type Flow

```
src/types.ts (TypeScript interfaces)
      ↓
useData<InterfaceType>('file.json')
      ↓
Fetch + parse JSON
      ↓
TypeScript validates structure
      ↓
Component gets typed data
```

### Example Type Definition

```tsx
// src/types.ts
export interface Profile {
  name: string
  title: string
  bio: string
  avatar: string
  verified?: boolean
}

export interface Link {
  id: string
  title: string
  description: string
  url: string
  icon: string
  color: string
  featured: boolean
}

export interface LinksData {
  links: Link[]
}
```

### Runtime vs Compile Time

**Compile Time (TypeScript):**
- Checks property names
- Validates types
- Catches typos
- Enables autocomplete

**Runtime (JavaScript):**
- Fetch might fail (error state)
- JSON might be invalid (error state)
- Data structure might not match types (⚠️ trust your data)

**Important:** TypeScript doesn't validate the actual JSON content at runtime. Ensure your JSON files match your TypeScript types!

---

## Component Patterns

### Container Pattern

```tsx
// App.tsx - Container component
function App() {
  const { data, loading, error } = useData<SiteData>('site.json')

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  if (!data) return null

  return <MainLayout data={data} />
}
```

### Presentational Pattern

```tsx
// components/Profile.tsx - Presentational component
interface ProfileProps {
  name: string
  title: string
  avatar: string
}

export function Profile({ name, title, avatar }: ProfileProps) {
  return (
    <div>
      <img src={avatar} alt={name} />
      <h1>{name}</h1>
      <p>{title}</p>
    </div>
  )
}
```

### List Pattern

```tsx
const { data } = useData<LinksData>('links.json')

return (
  <div>
    {data?.links.map(link => (
      <LinkCard key={link.id} {...link} />
    ))}
  </div>
)
```

---

## Styling Architecture

### Tailwind Utility-First

```tsx
// Inline utilities for one-off styles
<div className="bg-blue-500 text-white px-4 py-2 rounded-lg">
  Button
</div>

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Cards */}
</div>

// State variants
<button className="bg-blue-500 hover:bg-blue-700 active:bg-blue-800">
  Click me
</button>
```

### Custom Components

```css
/* src/index.css */
@layer components {
  .card {
    @apply rounded-lg shadow-lg p-6 bg-white;
  }

  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
  }
}
```

```tsx
<div className="card">
  <button className="btn-primary">
    Click me
  </button>
</div>
```

---

## File Organization

### Minimal Template

```
src/
├── App.tsx           # Main component
├── types.ts          # Data interfaces
└── hooks/
    └── useData.ts    # Data loader
```

### Medium Template

```
src/
├── App.tsx           # Main layout
├── types.ts          # All interfaces
├── components/       # Reusable components
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── Footer.tsx
│   └── Card.tsx
└── hooks/
    └── useData.ts    # Data loader
```

### Large Template

```
src/
├── App.tsx
├── types.ts
├── components/
│   ├── layout/       # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── sections/     # Page sections
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   └── CTA.tsx
│   └── ui/           # UI primitives
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Badge.tsx
├── hooks/
│   └── useData.ts
└── utils/            # Helper functions
    ├── icons.tsx
    └── formatters.ts
```

---

## Performance Considerations

### Bundle Size

- **React 19** + **React DOM**: ~130KB gzipped
- **Your code**: Usually 10-50KB gzipped
- **Total**: Typically < 200KB gzipped

### Optimization Strategies

1. **Code Splitting** (if using routing)
```tsx
const Blog = lazy(() => import('./pages/Blog'))
```

2. **Image Optimization**
```tsx
<img loading="lazy" src={url} alt={alt} />
```

3. **Memoization** (for expensive computations)
```tsx
const sortedLinks = useMemo(() =>
  links.sort((a, b) => a.order - b.order),
  [links]
)
```

4. **Tailwind Purging** (automatic in production)
- Only includes classes you actually use
- Drastically reduces CSS size

---

## Admin Panel Integration

### How It Works

1. Admin panel lives at `/admin`
2. User visits `yoursite.com/admin`
3. Logs in with GitHub (Device Flow)
4. Admin detects repository from URL
5. Loads JSON files from `data/`
6. Shows forms for editing
7. Saves changes via GitHub API
8. Commits to repository
9. GitHub Actions rebuilds site
10. Changes live in ~30 seconds

### Configuration

`.almostacms.json` tells the admin:
- Where data files live (`data/`)
- Where admin is located (`/admin/`)
- Template metadata

```json
{
  "version": "1.0",
  "templateName": "my-template",
  "content": {
    "dataPath": "data/"
  },
  "deployment": {
    "adminPath": "/admin/"
  }
}
```

---

## Best Practices

### ✅ DO

- Use TypeScript strict mode
- Define interfaces for all data
- Handle loading and error states
- Use semantic HTML
- Make it responsive (mobile-first)
- Keep components small and focused
- Use Tailwind utilities
- Add loading skeletons
- Test with npm run build

### ❌ DON'T

- Hardcode content in components
- Use `any` type
- Ignore error states
- Make assumptions about data
- Overcomplicate things
- Skip type definitions
- Forget to copy admin panel
- Deploy without testing

---

## Debugging

### Common Issues

**Data not loading?**
```
1. Check browser console for errors
2. Verify file exists in public/data/
3. Check filename spelling in useData()
4. Ensure JSON is valid (use jsonlint.com)
```

**TypeScript errors?**
```
1. Run: tsc -b
2. Check types.ts matches JSON structure
3. Ensure all required fields present
```

**Build fails?**
```
1. Run: npm run build
2. Check console output for errors
3. Fix TypeScript errors first
4. Ensure all imports valid
```

**Admin not working?**
```
1. Check admin/ directory exists
2. Verify .almostacms.json present
3. Check GitHub Pages is enabled
4. Ensure correct base path
```

---

## Advanced Topics

### Adding Routing

```bash
npm install react-router-dom
```

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### Dynamic Theming

```tsx
const { data: theme } = useData<Theme>('theme.json')

useEffect(() => {
  if (theme) {
    document.body.style.setProperty('--primary', theme.colors.primary)
    document.body.style.setProperty('--background', theme.colors.background)
  }
}, [theme])
```

### SEO Optimization

```tsx
useEffect(() => {
  if (data) {
    document.title = data.title
    document.querySelector('meta[name="description"]')
      ?.setAttribute('content', data.description)
  }
}, [data])
```

---

## Summary

The React Template Kit provides:

1. **Modern Stack** - React 19 + TypeScript + Vite + Tailwind
2. **Simple Pattern** - useData<T>() hook for data loading
3. **Type Safety** - Full TypeScript support
4. **Auto Deployment** - GitHub Actions workflow
5. **Admin Integration** - Works seamlessly with AlmostaCMS admin

**Just focus on building your UI - the rest is handled for you!**

---

**Next:** Read the [README](../README.md) for practical examples and quickstart guide.
