---
name: tailwindcss-v4
description: |
  Master Tailwind CSS v4 with CSS-first configuration, dark mode, and component patterns.
  This skill should be used when implementing Tailwind v4 in new projects, migrating from v3, building components, or troubleshooting v4-specific issues.
allowed-tools: Read, Glob, Grep, Write, Edit
---

# Tailwind CSS v4 Guide

Tailwind v4 is a complete rewrite with **CSS-first configuration** replacing JavaScript config files. This skill provides workflows for setup, migration, and component building.

## Before Implementation

Gather context to ensure successful implementation:

| Source | Gather |
|--------|--------|
| **Codebase** | Existing Tailwind version, current config structure, component patterns |
| **Conversation** | Your specific use case (new project, migration, component building) |
| **Skill References** | v4 patterns, best practices, migration strategies from `references/` |
| **User Guidelines** | Project conventions, design system, brand colors |

Only ask user for THEIR specific requirements (domain expertise is in this skill).

---

## Quick Start

### New Project with Tailwind v4

```bash
npm install -D tailwindcss
```

Create `src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  /* Define your theme variables here */
  --color-primary: #3B82F6;
  --color-secondary: #8B5CF6;
  --font-family-heading: 'Inter', sans-serif;
}
```

That's it. No `tailwind.config.ts` needed.

### Verify Installation

```bash
npm run build
```

Tailwind will generate utility classes from your `@theme` block automatically.

---

## Core Concepts

### CSS-First Configuration

**v3 (JavaScript config)**:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    colors: { primary: '#3B82F6' },
    fontFamily: { heading: 'Inter' }
  }
}
```

**v4 (CSS-first)**:
```css
@theme {
  --color-primary: #3B82F6;
  --font-family-heading: 'Inter', sans-serif;
}
```

**Why CSS-first?**
- Faster builds (no JavaScript parsing)
- Simpler configuration (one file, one language)
- CSS custom properties available at runtime
- Better IDE support for theme values

### Theme Namespaces

Tailwind v4 uses CSS custom property naming conventions. Prefix determines utility class generation:

| Prefix | Generates | Example |
|--------|-----------|---------|
| `--color-*` | Color utilities | `--color-primary` → `bg-primary`, `text-primary`, `border-primary` |
| `--font-family-*` | Font utilities | `--font-family-heading` → `font-heading` |
| `--spacing-*` | Spacing utilities | `--spacing-lg` → `p-lg`, `m-lg`, `gap-lg` |
| `--breakpoint-*` | Responsive breakpoints | `--breakpoint-tablet` → `@tablet:` |
| `--shadow-*` | Shadow utilities | `--shadow-lg` → `shadow-lg` |
| `--radius-*` | Border radius utilities | `--radius-lg` → `rounded-lg` |
| `--duration-*` | Animation durations | `--duration-300` → `duration-300` |
| `--z-index-*` | Z-index utilities | `--z-index-modal` → `z-modal` |

### Override vs Extend

**Override** (redefine variable):
```css
@theme {
  --color-primary: #FF0000;  /* Replaces default */
}
```

**Extend** (add new variable):
```css
@theme {
  --color-brand-lime: #86C620;  /* New utility: bg-brand-lime */
  --color-brand-purple: #A16CCB;
}
```

### CSS Custom Properties at Runtime

Theme variables compile to `:root` CSS custom properties, usable in custom CSS:

```css
@theme {
  --color-primary: #3B82F6;
}

/* In custom CSS */
.custom-element {
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}
```

---

## Setup Workflows

### Workflow 1: New Project Setup

**Step 1: Install Tailwind**
```bash
npm install -D tailwindcss
```

**Step 2: Create globals.css**
```css
@import "tailwindcss";

@theme {
  /* Brand colors */
  --color-primary: #3B82F6;
  --color-secondary: #8B5CF6;

  /* Fonts */
  --font-family-heading: 'Inter', sans-serif;
  --font-family-body: 'Inter', sans-serif;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}
```

**Step 3: Import in layout**
```typescript
// src/app/layout.tsx
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

**Step 4: Use utilities**
```tsx
<button className="bg-primary text-white px-md py-sm rounded-lg">
  Click me
</button>
```

**Step 5: Build and verify**
```bash
npm run build
```

### Workflow 2: Dark Mode Setup

**Step 1: Enable dark mode in globals.css**
```css
@import "tailwindcss";

@theme {
  /* Light mode colors */
  --color-bg: #FFFFFF;
  --color-text: #1A1A1A;
  --color-accent: #3B82F6;

  /* Dark mode colors */
  --color-dark-bg: #0F0F0F;
  --color-dark-text: #FAFAFA;
  --color-dark-accent: #60A5FA;
}

/* Light mode (default) */
body {
  background-color: var(--color-bg);
  color: var(--color-text);
}

/* Dark mode */
html.dark body {
  background-color: var(--color-dark-bg);
  color: var(--color-dark-text);
}
```

**Step 2: Create ThemeProvider component**
```tsx
// src/components/ThemeProvider.tsx
'use client'

import { useEffect, useState } from 'react'

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const stored = localStorage.getItem('theme')

    const shouldBeDark = stored ? stored === 'dark' : prefersDark
    setIsDark(shouldBeDark)

    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)

    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <>
      {children}
      <button onClick={toggleTheme} className="fixed bottom-4 right-4">
        {isDark ? '☀️' : '🌙'}
      </button>
    </>
  )
}
```

**Step 3: Wrap layout with ThemeProvider**
```tsx
// src/app/layout.tsx
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

**Step 4: Use dark mode utilities**
```tsx
<div className="bg-bg dark:bg-dark-bg text-text dark:text-dark-text">
  Content adapts to theme
</div>
```

### Workflow 3: Migration from v3 to v4

**Step 1: Identify breaking changes**

| v3 | v4 | Action |
|----|----|--------|
| `tailwind.config.js` | `globals.css @theme` | Delete config file, move theme to CSS |
| `theme.extend` | `@theme { }` | Add new variables to `@theme` block |
| `colors: { }` | `--color-*` variables | Convert color objects to CSS variables |
| `fontFamily: { }` | `--font-family-*` variables | Convert font objects to CSS variables |

**Step 2: Convert tailwind.config.js to @theme**

v3 config:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6'
    },
    fontFamily: {
      heading: 'Inter',
      body: 'Inter'
    }
  }
}
```

v4 equivalent:
```css
/* globals.css */
@import "tailwindcss";

@theme {
  --color-primary: #3B82F6;
  --color-secondary: #8B5CF6;
  --font-family-heading: 'Inter', sans-serif;
  --font-family-body: 'Inter', sans-serif;
}
```

**Step 3: Update component classes**

v3:
```tsx
<button className="bg-primary text-white">Button</button>
```

v4 (same syntax, but utilities generated from CSS variables):
```tsx
<button className="bg-primary text-white">Button</button>
```

**Step 4: Remove tailwind.config.js**
```bash
rm tailwind.config.js
```

**Step 5: Test build**
```bash
npm run build
```

---

## Component Building Patterns

### Pattern 1: Reusable Component with Theme Variables

```tsx
// src/components/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  children
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-300'

  const variantStyles = {
    primary: 'bg-primary text-white hover:opacity-90',
    secondary: 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
  }

  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {children}
    </button>
  )
}
```

### Pattern 2: Dark Mode Component

```tsx
// src/components/Card.tsx
export function Card({ children, className = '' }) {
  return (
    <div className={`
      rounded-lg border p-6
      bg-white dark:bg-dark-bg-secondary
      border-gray-200 dark:border-dark-border
      text-text dark:text-dark-text
      transition-colors duration-200
      ${className}
    `}>
      {children}
    </div>
  )
}
```

### Pattern 3: Responsive Layout

```tsx
// src/components/Grid.tsx
export function Grid({ children, cols = 3 }) {
  return (
    <div className={`
      grid gap-6
      grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols}
    `}>
      {children}
    </div>
  )
}
```

### Pattern 4: Custom CSS with Theme Variables

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  --color-primary: #3B82F6;
  --color-secondary: #8B5CF6;
}

/* Custom component using theme variables */
.badge {
  @apply inline-block px-3 py-1 rounded-full text-sm font-medium;
  background-color: var(--color-primary);
  color: white;
}

.badge:hover {
  background-color: var(--color-secondary);
}
```

---

## Best Practices

### 1. Organize Theme Variables

Group related variables in `@theme`:

```css
@theme {
  /* Colors */
  --color-primary: #3B82F6;
  --color-secondary: #8B5CF6;
  --color-success: #10B981;
  --color-error: #EF4444;

  /* Fonts */
  --font-family-heading: 'Inter', sans-serif;
  --font-family-body: 'Inter', sans-serif;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### 2. Use Semantic Color Names

Instead of:
```css
--color-blue-500: #3B82F6;
```

Use:
```css
--color-primary: #3B82F6;
--color-secondary: #8B5CF6;
--color-success: #10B981;
--color-error: #EF4444;
```

### 3. Maintain Light/Dark Mode Consistency

Define both variants for every color:

```css
@theme {
  /* Light mode */
  --color-bg: #FFFFFF;
  --color-text: #1A1A1A;

  /* Dark mode */
  --color-dark-bg: #0F0F0F;
  --color-dark-text: #FAFAFA;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
}

html.dark body {
  background-color: var(--color-dark-bg);
  color: var(--color-dark-text);
}
```

### 4. Avoid Hardcoded Colors in Components

❌ Bad:
```tsx
<div className="bg-blue-500">Content</div>
```

✅ Good:
```tsx
<div className="bg-primary">Content</div>
```

### 5. Use Utility Classes Over Custom CSS

❌ Bad:
```css
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: #3B82F6;
}
```

✅ Good:
```tsx
<button className="px-4 py-2 rounded-md bg-primary">Button</button>
```

### 6. Keep Custom CSS Minimal

Only use custom CSS for:
- Complex animations
- Pseudo-elements (::before, ::after)
- Media queries beyond Tailwind's breakpoints
- Vendor-specific properties

---

## Common Issues & Solutions

### Issue 1: Theme Variables Not Generating Utilities

**Problem**: `--color-primary` defined but `bg-primary` not working

**Solution**: Ensure `@import "tailwindcss"` is at the top of globals.css:
```css
@import "tailwindcss";

@theme {
  --color-primary: #3B82F6;
}
```

### Issue 2: Dark Mode Not Toggling

**Problem**: Adding `dark` class to `<html>` doesn't change styles

**Solution**: Verify CSS selectors use `html.dark`:
```css
/* ✅ Correct */
html.dark body {
  background-color: #0F0F0F;
}

/* ❌ Wrong */
.dark body {
  background-color: #0F0F0F;
}
```

### Issue 3: Build Fails After Migration

**Problem**: Build errors after removing `tailwind.config.js`

**Solution**:
1. Verify `@import "tailwindcss"` is in globals.css
2. Check for any remaining references to config file
3. Clear build cache: `rm -rf .next && npm run build`

### Issue 4: CSS Variables Not Available in Custom CSS

**Problem**: `var(--color-primary)` returns undefined in custom CSS

**Solution**: Ensure variables are defined in `@theme` block:
```css
@theme {
  --color-primary: #3B82F6;
}

/* Now available */
.custom {
  color: var(--color-primary);
}
```

---

## References

See `references/` directory for:
- **v4-api-reference.md** — Complete Tailwind v4 API
- **migration-checklist.md** — Step-by-step migration guide
- **component-patterns.md** — Reusable component examples
- **dark-mode-guide.md** — Advanced dark mode patterns
- **performance-tips.md** — Optimization strategies
- **troubleshooting.md** — Common errors and fixes
