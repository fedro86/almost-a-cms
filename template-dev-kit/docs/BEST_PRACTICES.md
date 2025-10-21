# Best Practices for Template Development

**Create high-quality, performant, accessible templates.**

---

## Performance

### Image Optimization

**Use modern formats:**
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>
```

**Compress images:**
- Tools: TinyPNG, Squoosh, ImageOptim
- Target: < 100KB per image
- Use appropriate dimensions (don't serve 4K for thumbnails)

**Lazy load images:**
```html
<img src="image.jpg" loading="lazy" alt="Description">
```

### CSS Optimization

**Minimize CSS:**
```css
/* Development: Use separate files with comments */
/* Production: Minify with cssnano or similar */
```

**Critical CSS:**
- Inline critical above-the-fold CSS
- Load rest asynchronously

**Use CSS variables:**
```css
:root {
  --primary: #2563eb;
}
.button { background: var(--primary); }
```

### JavaScript Optimization

**Defer non-critical JS:**
```html
<script src="main.js" defer></script>
```

**Minimize dependencies:**
- Use vanilla JS when possible
- Avoid large libraries for simple tasks

**Code splitting (future):**
```javascript
// Load features on demand
const feature = await import('./feature.js');
```

### Loading Performance Targets

- **First Contentful Paint:** < 1.8s
- **Largest Contentful Paint:** < 2.5s
- **Time to Interactive:** < 3.8s
- **Total page size:** < 1MB
- **JavaScript size:** < 300KB

---

## Accessibility

### Semantic HTML

**Use proper elements:**
```html
✓ <button>Click me</button>
✗ <div onclick="...">Click me</div>

✓ <nav><ul><li><a href="...">Link</a></li></ul></nav>
✗ <div class="nav"><span>Link</span></div>
```

### Heading Hierarchy

**Maintain proper order:**
```html
<h1>Page Title</h1>
  <h2>Section</h2>
    <h3>Subsection</h3>
  <h2>Another Section</h2>

✗ Don't skip levels: h1 → h3
```

### ARIA Labels

**When needed:**
```html
<button aria-label="Close menu">×</button>
<nav aria-label="Main navigation">...</nav>
```

**Don't overuse:**
```html
✗ <button aria-label="Submit">Submit</button>
  <!-- Redundant, button text is sufficient -->
```

### Keyboard Navigation

**Test without mouse:**
- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close modals/menus

**Focus indicators:**
```css
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Alt Text

**Descriptive alt text:**
```html
✓ <img src="screenshot.jpg" alt="Dashboard showing 3 project cards with images and titles">
✗ <img src="screenshot.jpg" alt="Image">
```

**Decorative images:**
```html
<img src="decoration.svg" alt="" role="presentation">
```

### Color Contrast

**Minimum ratios:**
- Normal text: 4.5:1
- Large text (18pt+): 3:1
- Interactive elements: 3:1

**Test with:**
- Chrome DevTools (Lighthouse)
- WebAIM Contrast Checker
- axe DevTools

---

## SEO

### Meta Tags

**Essential meta tags:**
```html
<title>Jane Developer - Full Stack Developer Portfolio</title>
<meta name="description" content="Portfolio showcasing web development projects...">
<meta name="keywords" content="web developer, portfolio, react, javascript">
```

**Length limits:**
- Title: 50-60 characters
- Description: 150-160 characters

### Open Graph

**Social media previews:**
```html
<meta property="og:title" content="Jane Developer - Portfolio">
<meta property="og:description" content="Portfolio showcasing...">
<meta property="og:image" content="https://example.com/og-image.jpg">
<meta property="og:url" content="https://example.com">
<meta property="og:type" content="website">
```

**Image requirements:**
- Size: 1200×630px
- Format: JPG or PNG
- File size: < 200KB

### Twitter Cards

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Jane Developer - Portfolio">
<meta name="twitter:description" content="Portfolio showcasing...">
<meta name="twitter:image" content="https://example.com/twitter-image.jpg">
```

### Structured Data (Future)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Jane Developer",
  "jobTitle": "Full Stack Developer",
  "url": "https://janedeveloper.com"
}
</script>
```

---

## Responsive Design

### Mobile-First Approach

**Start with mobile:**
```css
/* Base styles for mobile */
.container {
  padding: 1rem;
}

/* Enhance for larger screens */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}
```

### Breakpoints

**Standard breakpoints:**
```css
/* Mobile: default */
/* Tablet: 768px */
/* Desktop: 1024px */
/* Large: 1280px */
```

**Use in CSS:**
```css
@media (min-width: 768px) { ... }
@media (min-width: 1024px) { ... }
```

### Viewport Meta Tag

**Required:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Responsive Images

```html
<img src="small.jpg"
     srcset="small.jpg 400w,
             medium.jpg 800w,
             large.jpg 1200w"
     sizes="(max-width: 768px) 100vw, 50vw"
     alt="Description">
```

### Test on Real Devices

- iPhone (Safari)
- Android (Chrome)
- Tablet (iPad)
- Desktop (various browsers)

---

## Browser Compatibility

### Target Browsers

**Support:**
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- iOS Safari (last 2 versions)

### Feature Detection

**Use @supports:**
```css
@supports (display: grid) {
  .container {
    display: grid;
  }
}
```

**JavaScript feature detection:**
```javascript
if ('IntersectionObserver' in window) {
  // Use IntersectionObserver
} else {
  // Fallback
}
```

### Avoid

- CSS filters without fallbacks
- Bleeding-edge JS features without transpiling
- Vendor-prefixed properties (use autoprefixer)

---

## Code Quality

### HTML

✓ Valid HTML5 (validate with W3C validator)
✓ Semantic elements
✓ No inline styles (use CSS)
✓ Proper indentation (2 or 4 spaces)

### CSS

✓ Consistent naming (BEM, or simple classes)
✓ No !important (except rare cases)
✓ Mobile-first media queries
✓ CSS variables for theming

### JavaScript

✓ No global variables
✓ Use const/let (not var)
✓ Handle errors (try/catch)
✓ Clear function names

---

## User Experience

### Loading States

**Show loading indicators:**
```javascript
element.innerHTML = 'Loading...';
const data = await loadData();
element.innerHTML = renderData(data);
```

### Error Messages

**User-friendly errors:**
```
✗ "Error: ENOTFOUND"
✓ "Unable to load projects. Please check your connection."
```

### Empty States

**Handle no data:**
```javascript
if (projects.length === 0) {
  return '<p>No projects yet. Check back soon!</p>';
}
```

### Navigation

✓ Clear menu structure
✓ Active page indicator
✓ Breadcrumbs (for deep sites)
✓ Back to top button (long pages)

---

## Security

### Content Security Policy

**Add CSP header (future):**
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'">
```

### External Links

**Use rel="noopener":**
```html
<a href="https://external.com" target="_blank" rel="noopener noreferrer">
  External Link
</a>
```

### Input Validation

**Validate data:**
```javascript
// Even though admin edits, validate JSON structure
if (!data.name || typeof data.name !== 'string') {
  console.warn('Invalid name field');
}
```

---

## Testing Checklist

### Before Publishing

- [ ] HTML validates (W3C validator)
- [ ] CSS has no errors
- [ ] JavaScript has no console errors
- [ ] All images load
- [ ] All links work (including social links)
- [ ] Mobile responsive (test on real device)
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Alt text on all images
- [ ] Page title descriptive
- [ ] Meta description present
- [ ] Open Graph tags present
- [ ] Loads in < 3 seconds
- [ ] Works without JavaScript (graceful degradation)
- [ ] Tested in Chrome, Firefox, Safari
- [ ] Lighthouse score > 90

### Lighthouse Audit

Run in Chrome DevTools:
```
Lighthouse → Generate report
```

**Target scores:**
- Performance: > 90
- Accessibility: 100
- Best Practices: > 95
- SEO: 100

---

## Template-Specific Best Practices

### Data Loading

✓ Show loading state
✓ Handle missing data gracefully
✓ Cache loaded data
✓ Validate JSON structure

### Customization

✓ Document CSS variables
✓ Comment complex selectors
✓ Provide color palette
✓ Explain layout grid

### Documentation

✓ Clear README for users
✓ Explain how to customize
✓ Link to example data
✓ Provide troubleshooting tips

---

## Resources

**Performance:**
- [web.dev/performance](https://web.dev/performance)
- PageSpeed Insights
- WebPageTest

**Accessibility:**
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [a11y Project](https://www.a11yproject.com/)
- axe DevTools

**SEO:**
- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)

**Tools:**
- Chrome DevTools (Lighthouse)
- Firefox Accessibility Inspector
- WAVE (Web Accessibility Evaluation Tool)

---

**Quality templates = Happy users!** 🎉
