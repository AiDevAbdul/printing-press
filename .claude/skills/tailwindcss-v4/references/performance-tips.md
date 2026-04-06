# Performance Tips for Tailwind v4

Optimization strategies and best practices for building fast, efficient Tailwind v4 projects.

## Build Performance

### Tip 1: Minimize Theme Variables

Only define theme variables you actually use:

```css
/* ❌ Bloated */
@theme {
  --color-red-50: #FEF2F2;
  --color-red-100: #FEE2E2;
  --color-red-200: #FECACA;
  /* ... 50+ unused colors ... */
}

/* ✅ Lean */
@theme {
  --color-primary: #3B82F6;
  --color-secondary: #8B5CF6;
  --color-success: #10B981;
  --color-error: #EF4444;
}
```

### Tip 2: Use Production Build for Testing

Production builds automatically purge unused CSS:

```bash
# Development (includes all utilities)
npm run dev

# Production (purges unused CSS)
npm run build
```

### Tip 3: Avoid Unnecessary Custom CSS

Use Tailwind utilities instead of custom CSS when possible:

```css
/* ❌ Unnecessary custom CSS */
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: #3B82F6;
  color: white;
  transition: all 0.3s ease;
}

/* ✅ Use Tailwind utilities */
<button className="px-4 py-2 rounded-md bg-primary text-white transition-all">
  Button
</button>
```

### Tip 4: Leverage CSS Custom Properties

Use CSS variables for dynamic values instead of generating multiple utilities:

```css
/* ❌ Generates many utilities */
@theme {
  --color-primary-50: #EFF6FF;
  --color-primary-100: #DBEAFE;
  --color-primary-200: #BFDBFE;
  /* ... many more ... */
}

/* ✅ Use CSS variables for variations */
@theme {
  --color-primary: #3B82F6;
}

.button {
  background-color: var(--color-primary);
  opacity: 0.9;
}
```

---

## Runtime Performance

### Tip 1: Minimize Class Name Strings

Use template literals efficiently:

```tsx
/* ❌ Inefficient - long strings */
<div className="flex flex-col items-center justify-center gap-4 p-6 rounded-lg bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
  Content
</div>

/* ✅ Efficient - use components */
<Card hoverable>
  Content
</Card>
```

### Tip 2: Use CSS Classes Over Inline Styles

Inline styles prevent caching and increase bundle size:

```tsx
/* ❌ Inline styles */
<div style={{ backgroundColor: '#3B82F6', padding: '1rem' }}>
  Content
</div>

/* ✅ CSS classes */
<div className="bg-primary p-4">
  Content
</div>
```

### Tip 3: Avoid Dynamic Class Names

Dynamic class names can't be purged:

```tsx
/* ❌ Dynamic - not purged */
<div className={`bg-${color}-500`}>
  Content
</div>

/* ✅ Static - properly purged */
<div className={color === 'primary' ? 'bg-primary' : 'bg-secondary'}>
  Content
</div>
```

### Tip 4: Use CSS Variables for Theming

CSS variables are faster than JavaScript theme switching:

```tsx
/* ❌ Slow - JavaScript updates */
const toggleTheme = () => {
  document.querySelectorAll('[data-theme]').forEach(el => {
    el.style.backgroundColor = isDark ? '#0F0F0F' : '#FFFFFF'
  })
}

/* ✅ Fast - CSS class toggle */
const toggleTheme = () => {
  document.documentElement.classList.toggle('dark')
}
```

---

## CSS File Size Optimization

### Tip 1: Monitor CSS File Size

Check generated CSS size in production:

```bash
# Build and check size
npm run build

# Check CSS file size
ls -lh .next/static/css/
```

Target: < 50KB for typical projects

### Tip 2: Use PurgeCSS (Automatic in v4)

Tailwind v4 automatically removes unused utilities:

```bash
# Production build automatically purges
npm run build

# Development includes all utilities (larger file)
npm run dev
```

### Tip 3: Lazy Load Heavy Components

Code-split components to reduce initial CSS:

```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <div>Loading...</div>
})

export default function Page() {
  return <HeavyComponent />
}
```

### Tip 4: Remove Unused Theme Variables

Audit and remove unused variables:

```css
/* Before: 50+ variables */
@theme {
  --color-primary: #3B82F6;
  --color-secondary: #8B5CF6;
  --color-unused-1: #FF0000;
  --color-unused-2: #00FF00;
  /* ... many unused ... */
}

/* After: Only used variables */
@theme {
  --color-primary: #3B82F6;
  --color-secondary: #8B5CF6;
}
```

---

## Component Performance

### Tip 1: Memoize Components

Prevent unnecessary re-renders:

```tsx
import { memo } from 'react'

const Card = memo(function Card({ children }) {
  return (
    <div className="rounded-lg border p-6 bg-white dark:bg-dark-bg">
      {children}
    </div>
  )
})

export default Card
```

### Tip 2: Use Server Components

Server components reduce JavaScript bundle:

```tsx
// ✅ Server component (default in Next.js 13+)
export default function Page() {
  return <div className="bg-primary">Content</div>
}

// ❌ Client component (only when needed)
'use client'

export default function InteractiveComponent() {
  const [state, setState] = useState(false)
  return <div className="bg-primary">{state}</div>
}
```

### Tip 3: Optimize Images

Use `next/image` for automatic optimization:

```tsx
import Image from 'next/image'

export function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={1200}
      height={600}
      className="w-full h-auto"
    />
  )
}
```

### Tip 4: Lazy Load Below-the-Fold Content

Use Intersection Observer for lazy loading:

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'

export function LazySection() {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.unobserve(entry.target)
      }
    })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-16">
      {isVisible && <ExpensiveComponent />}
    </section>
  )
}
```

---

## Animation Performance

### Tip 1: Use GPU-Accelerated Properties

Only animate properties that don't trigger layout recalculation:

```css
/* ✅ GPU-accelerated (fast) */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* ❌ Not GPU-accelerated (slow) */
@keyframes slideIn {
  from {
    left: -100%;
    opacity: 0;
  }
  to {
    left: 0;
    opacity: 1;
  }
}
```

### Tip 2: Use `will-change` Sparingly

Only use for elements that will actually animate:

```css
/* ✅ Use for animated elements */
.animated-element {
  will-change: transform, opacity;
  animation: slideIn 0.3s ease-out;
}

/* ❌ Don't use on static elements */
.static-element {
  will-change: transform;
}
```

### Tip 3: Reduce Animation Duration

Shorter animations feel faster:

```css
/* ✅ Fast animations (200-300ms) */
.button {
  transition: all 0.2s ease-out;
}

/* ❌ Slow animations (1000ms+) */
.button {
  transition: all 1s ease-out;
}
```

### Tip 4: Use `prefers-reduced-motion`

Respect user preferences for animations:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Dark Mode Performance

### Tip 1: Use CSS Class Toggle

Faster than JavaScript theme switching:

```tsx
/* ✅ Fast - single class toggle */
const toggleTheme = () => {
  document.documentElement.classList.toggle('dark')
}

/* ❌ Slow - multiple DOM updates */
const toggleTheme = () => {
  document.querySelectorAll('[data-theme]').forEach(el => {
    el.classList.toggle('dark')
  })
}
```

### Tip 2: Avoid Unnecessary Dark Mode Variants

Only add `dark:` variants where needed:

```tsx
/* ❌ Unnecessary variants */
<div className="
  bg-white dark:bg-dark-bg
  text-black dark:text-white
  border-gray-200 dark:border-gray-800
  shadow-sm dark:shadow-md
  rounded-lg dark:rounded-lg
">
  Content
</div>

/* ✅ Only necessary variants */
<div className="
  bg-white dark:bg-dark-bg
  text-black dark:text-white
  border-gray-200 dark:border-gray-800
  rounded-lg
">
  Content
</div>
```

### Tip 3: Use CSS Variables for Dark Mode

CSS variables are faster than multiple class variants:

```css
/* ✅ Fast - CSS variables */
@theme {
  --color-bg: #FFFFFF;
  --color-dark-bg: #0F0F0F;
}

body {
  background-color: var(--color-bg);
}

html.dark body {
  background-color: var(--color-dark-bg);
}

/* ❌ Slower - many class variants */
.element {
  background-color: #FFFFFF;
}

html.dark .element {
  background-color: #0F0F0F;
}

.element-secondary {
  background-color: #F9F9F9;
}

html.dark .element-secondary {
  background-color: #1A1A1A;
}
```

---

## Monitoring & Profiling

### Tip 1: Use Lighthouse for Performance Audits

```bash
# Run Lighthouse audit
npm run build
npm run start

# Open http://localhost:3000 in Chrome
# DevTools → Lighthouse → Generate report
```

### Tip 2: Monitor CSS File Size

Track CSS size over time:

```bash
# Check CSS file size
ls -lh .next/static/css/

# Compare with previous builds
git diff HEAD~1 .next/static/css/
```

### Tip 3: Profile Runtime Performance

Use Chrome DevTools Performance tab:

1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Interact with page
5. Click Stop
6. Analyze results

### Tip 4: Use Web Vitals

Monitor Core Web Vitals:

```tsx
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

## Deployment Optimization

### Tip 1: Enable Compression

Compress CSS in production:

```javascript
// next.config.js
module.exports = {
  compress: true,
  swcMinify: true,
}
```

### Tip 2: Use CDN for Static Assets

Serve CSS from CDN for faster delivery:

```bash
# Deploy to Vercel (automatic CDN)
npm run build
vercel deploy
```

### Tip 3: Enable Caching

Set appropriate cache headers:

```javascript
// next.config.js
module.exports = {
  headers: async () => [
    {
      source: '/static/css/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
}
```

### Tip 4: Monitor Production Performance

Use real user monitoring (RUM):

```tsx
// src/app/layout.tsx
import { useReportWebVitals } from 'next/web-vitals'

export function RootLayout({ children }) {
  useReportWebVitals((metric) => {
    console.log(metric)
    // Send to analytics service
  })

  return <html>{children}</html>
}
```

---

## Performance Checklist

- [ ] CSS file size < 50KB (production)
- [ ] No unused theme variables
- [ ] No unnecessary custom CSS
- [ ] Dynamic class names avoided
- [ ] Server components used by default
- [ ] Images optimized with `next/image`
- [ ] Animations use GPU-accelerated properties
- [ ] Dark mode uses CSS class toggle
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing
- [ ] CSS cached with long TTL
- [ ] Compression enabled in production
