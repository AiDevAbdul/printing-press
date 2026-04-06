# Dark Mode Guide for Tailwind v4

Advanced patterns and strategies for implementing dark mode in Tailwind v4 projects.

## Dark Mode Fundamentals

### Class-Based Dark Mode (Recommended)

Add `dark` class to `<html>` element to enable dark mode:

```tsx
// Light mode (default)
<html>
  <body>Content</body>
</html>

// Dark mode
<html class="dark">
  <body>Content</body>
</html>
```

### CSS Implementation

Define light and dark variants in `globals.css`:

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

### Using Dark Mode Utilities

Apply `dark:` prefix to utilities for dark mode:

```tsx
<div className="
  bg-white dark:bg-dark-bg
  text-black dark:text-white
  border-gray-200 dark:border-gray-800
">
  Content adapts to theme
</div>
```

---

## Theme Provider Implementation

### Step 1: Create ThemeProvider Component

```tsx
// src/components/ThemeProvider.tsx
'use client'

import { useEffect, useState } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check localStorage first
    const stored = localStorage.getItem('theme')
    if (stored) {
      const shouldBeDark = stored === 'dark'
      setIsDark(shouldBeDark)
      applyTheme(shouldBeDark)
      return
    }

    // Fall back to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(prefersDark)
    applyTheme(prefersDark)
  }, [])

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    applyTheme(newIsDark)
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Context for accessing theme state
import { createContext, useContext } from 'react'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

### Step 2: Create ThemeToggle Component

```tsx
// src/components/ThemeToggle.tsx
'use client'

import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="
        p-2 rounded-lg
        bg-light-bg-secondary dark:bg-dark-bg-secondary
        border border-light-border dark:border-dark-border
        text-text dark:text-dark-text
        hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary
        transition-colors duration-200
        focus-visible:ring-2 focus-visible:ring-primary
      "
      aria-label="Toggle theme"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
```

### Step 3: Wrap Layout with ThemeProvider

```tsx
// src/app/layout.tsx
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

### Step 4: Add ThemeToggle to Navbar

```tsx
// src/components/Navbar.tsx
import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4">
      <div>Logo</div>
      <ThemeToggle />
    </nav>
  )
}
```

---

## Color Palette Strategy

### Semantic Color Naming

Define colors semantically rather than by hue:

```css
@theme {
  /* Semantic colors */
  --color-primary: #3B82F6;
  --color-secondary: #8B5CF6;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;

  /* Background & text */
  --color-bg: #FFFFFF;
  --color-bg-secondary: #F9F9F9;
  --color-bg-tertiary: #F3F3F3;
  --color-text: #1A1A1A;
  --color-text-secondary: #666666;
  --color-text-tertiary: #999999;
  --color-border: #E5E5E5;

  /* Dark mode equivalents */
  --color-dark-bg: #0F0F0F;
  --color-dark-bg-secondary: #1A1A1A;
  --color-dark-bg-tertiary: #2D2D2D;
  --color-dark-text: #FAFAFA;
  --color-dark-text-secondary: #D1D5DB;
  --color-dark-text-tertiary: #9CA3AF;
  --color-dark-border: #333333;
}
```

### Light/Dark Mode Variants

Always define both light and dark variants:

```tsx
<div className="
  bg-bg dark:bg-dark-bg
  text-text dark:text-dark-text
  border-border dark:border-dark-border
">
  Content
</div>
```

---

## Component Dark Mode Patterns

### Pattern 1: Simple Dark Mode Component

```tsx
export function Card({ children }) {
  return (
    <div className="
      rounded-lg border p-6
      bg-bg dark:bg-dark-bg-secondary
      border-border dark:border-dark-border
      text-text dark:text-dark-text
    ">
      {children}
    </div>
  )
}
```

### Pattern 2: Interactive Dark Mode Component

```tsx
export function Button({ children, variant = 'primary' }) {
  const variantStyles = {
    primary: `
      bg-primary text-white
      hover:opacity-90
      dark:bg-blue-600 dark:hover:opacity-90
    `,
    secondary: `
      border-2 border-primary text-primary
      hover:bg-primary hover:text-white
      dark:border-blue-400 dark:text-blue-400
      dark:hover:bg-blue-400 dark:hover:text-dark-bg
    `
  }

  return (
    <button className={`
      px-4 py-2 rounded-lg font-medium
      transition-all duration-300
      ${variantStyles[variant]}
    `}>
      {children}
    </button>
  )
}
```

### Pattern 3: Gradient Dark Mode Component

```tsx
export function Hero() {
  return (
    <div className="
      bg-gradient-to-br from-primary to-secondary
      dark:from-blue-900 dark:to-purple-900
      text-white p-12 rounded-lg
    ">
      <h1>Hero Section</h1>
    </div>
  )
}
```

### Pattern 4: Shadow Dark Mode Component

```tsx
export function ElevatedCard({ children }) {
  return (
    <div className="
      rounded-lg p-6
      bg-bg dark:bg-dark-bg-secondary
      shadow-md dark:shadow-lg
      dark:shadow-black/50
    ">
      {children}
    </div>
  )
}
```

---

## Advanced Dark Mode Techniques

### Technique 1: Conditional Styling with useTheme

```tsx
'use client'

import { useTheme } from '@/components/ThemeProvider'

export function AdaptiveComponent() {
  const { isDark } = useTheme()

  return (
    <div className={`
      p-6 rounded-lg
      ${isDark ? 'bg-dark-bg-secondary' : 'bg-bg-secondary'}
    `}>
      {isDark ? 'Dark mode content' : 'Light mode content'}
    </div>
  )
}
```

### Technique 2: Custom CSS with Dark Mode

```css
/* globals.css */
@import "tailwindcss";

@theme {
  --color-primary: #3B82F6;
  --color-dark-primary: #60A5FA;
}

/* Custom component with dark mode */
.custom-badge {
  @apply inline-block px-3 py-1 rounded-full text-sm font-medium;
  background-color: var(--color-primary);
  color: white;
}

html.dark .custom-badge {
  background-color: var(--color-dark-primary);
}
```

### Technique 3: System Preference Detection

```tsx
'use client'

import { useEffect, useState } from 'react'

export function SystemThemeDetector() {
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light')

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return <div>System preference: {systemPreference}</div>
}
```

### Technique 4: Smooth Theme Transitions

```css
/* globals.css */
* {
  @apply transition-colors duration-300;
}

button, a, input, select, textarea {
  @apply transition-all duration-300;
}
```

---

## Testing Dark Mode

### Manual Testing Checklist

- [ ] Toggle theme and verify all colors change
- [ ] Refresh page and verify theme persists
- [ ] Clear localStorage and verify system preference is used
- [ ] Test all components in both light and dark modes
- [ ] Test all interactive states (hover, focus, active) in both modes
- [ ] Test responsive design in both modes
- [ ] Test animations and transitions in both modes
- [ ] Test accessibility (contrast ratios) in both modes

### Automated Testing Example

```tsx
// __tests__/ThemeToggle.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/components/ThemeProvider'
import { ThemeToggle } from '@/components/ThemeToggle'

function TestComponent() {
  const { isDark } = useTheme()
  return (
    <div>
      <ThemeToggle />
      <div data-testid="theme-status">{isDark ? 'dark' : 'light'}</div>
    </div>
  )
}

describe('ThemeToggle', () => {
  it('toggles theme on click', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const button = screen.getByRole('button')
    const status = screen.getByTestId('theme-status')

    expect(status).toHaveTextContent('light')

    fireEvent.click(button)
    expect(status).toHaveTextContent('dark')

    fireEvent.click(button)
    expect(status).toHaveTextContent('light')
  })

  it('persists theme to localStorage', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
```

---

## Common Dark Mode Issues

### Issue 1: Flash of Wrong Theme on Page Load

**Problem**: Page loads in light mode, then switches to dark mode

**Solution**: Add `suppressHydrationWarning` to `<html>` and initialize theme before render:

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

### Issue 2: Dark Mode Not Applying to All Elements

**Problem**: Some elements don't have dark mode styles

**Solution**: Ensure all color utilities have `dark:` variants:

```tsx
// ❌ Wrong
<div className="bg-white text-black">Content</div>

// ✅ Correct
<div className="bg-white dark:bg-dark-bg text-black dark:text-white">
  Content
</div>
```

### Issue 3: Contrast Issues in Dark Mode

**Problem**: Text is hard to read in dark mode

**Solution**: Use semantic color variables with sufficient contrast:

```css
@theme {
  /* Ensure sufficient contrast */
  --color-text: #1A1A1A;        /* Light mode: 18:1 on white */
  --color-dark-text: #FAFAFA;   /* Dark mode: 18:1 on #0F0F0F */
}
```

### Issue 4: Custom CSS Not Respecting Dark Mode

**Problem**: Custom CSS doesn't change in dark mode

**Solution**: Use CSS custom properties or `html.dark` selector:

```css
/* ✅ Correct */
html.dark .custom-element {
  background-color: var(--color-dark-bg);
}

/* Or use CSS variables */
.custom-element {
  background-color: var(--color-bg);
}

html.dark .custom-element {
  background-color: var(--color-dark-bg);
}
```

---

## Performance Optimization

### Minimize Repaints

Use CSS variables instead of JavaScript for theme switching:

```tsx
// ❌ Inefficient: Causes repaints
const toggleTheme = () => {
  document.querySelectorAll('[data-theme]').forEach(el => {
    el.style.backgroundColor = isDark ? '#0F0F0F' : '#FFFFFF'
  })
}

// ✅ Efficient: Single class toggle
const toggleTheme = () => {
  document.documentElement.classList.toggle('dark')
}
```

### Lazy Load Theme Provider

```tsx
import dynamic from 'next/dynamic'

const ThemeProvider = dynamic(() => import('@/components/ThemeProvider'), {
  ssr: false
})

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
