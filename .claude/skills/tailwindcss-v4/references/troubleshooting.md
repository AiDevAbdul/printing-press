# Troubleshooting Guide for Tailwind v4

Common errors, issues, and solutions when working with Tailwind CSS v4.

## Build & Configuration Issues

### Issue: "Unknown at rule @theme"

**Error Message**:
```
PostCSS plugin tailwindcss requires PostCSS 8. Update PostCSS or downgrade this plugin.
```

**Cause**: PostCSS not properly configured or outdated version

**Solution**:
1. Verify `postcss.config.js` exists:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

2. Update PostCSS:
```bash
npm install -D postcss@latest tailwindcss@latest
```

3. Clear cache and rebuild:
```bash
rm -rf .next node_modules/.cache
npm run build
```

---

### Issue: Utilities Not Generating from @theme

**Problem**: Variables defined in `@theme` but utilities not available

**Example**:
```css
@theme {
  --color-primary: #3B82F6;
}

/* bg-primary not working */
```

**Cause**: Missing `@import "tailwindcss"` or incorrect variable naming

**Solution**:
```css
/* ✅ Correct */
@import "tailwindcss";

@theme {
  --color-primary: #3B82F6;  /* Generates bg-primary, text-primary, etc. */
}

/* ❌ Wrong - missing import */
@theme {
  --color-primary: #3B82F6;
}
```

**Variable Naming Rules**:
- `--color-*` → generates color utilities (bg-, text-, border-, etc.)
- `--font-family-*` → generates font utilities
- `--spacing-*` → generates spacing utilities
- `--radius-*` → generates border-radius utilities
- `--shadow-*` → generates shadow utilities
- `--duration-*` → generates animation duration utilities
- `--z-index-*` → generates z-index utilities

---

### Issue: Build Fails After Removing tailwind.config.js

**Error**: Build completes but styles missing

**Cause**: Tailwind not finding configuration

**Solution**:
1. Verify `globals.css` has `@import "tailwindcss"`:
```css
@import "tailwindcss";

@theme {
  /* Your theme here */
}
```

2. Verify `globals.css` is imported in layout:
```tsx
// src/app/layout.tsx
import './globals.css'
```

3. Clear build cache:
```bash
rm -rf .next
npm run build
```

---

### Issue: CSS File Size Unexpectedly Large

**Problem**: Generated CSS is much larger than expected

**Cause**: Unused utilities being generated or duplicate imports

**Solution**:
1. Check for duplicate `@import "tailwindcss"` statements
2. Verify no unused theme variables
3. Use PurgeCSS in production build (automatic in v4)
4. Check for unused CSS in components

---

## Dark Mode Issues

### Issue: Dark Mode Not Toggling

**Problem**: Adding `dark` class to `<html>` doesn't change styles

**Cause**: Incorrect CSS selector or missing dark mode CSS

**Solution**:
```css
/* ✅ Correct */
html.dark body {
  background-color: var(--color-dark-bg);
}

/* ❌ Wrong - missing html selector */
.dark body {
  background-color: var(--color-dark-bg);
}

/* ❌ Wrong - using body.dark */
body.dark {
  background-color: var(--color-dark-bg);
}
```

---

### Issue: Flash of Wrong Theme on Page Load

**Problem**: Page loads in light mode, then switches to dark mode

**Cause**: Theme initialization happens after render

**Solution**:
1. Add `suppressHydrationWarning` to `<html>`:
```tsx
<html suppressHydrationWarning>
  <body>
    <ThemeProvider>{children}</ThemeProvider>
  </body>
</html>
```

2. Initialize theme before render in ThemeProvider:
```tsx
useEffect(() => {
  const stored = localStorage.getItem('theme')
  const shouldBeDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches

  if (shouldBeDark) {
    document.documentElement.classList.add('dark')
  }
}, [])
```

---

### Issue: Dark Mode Utilities Not Working

**Problem**: `dark:bg-primary` not applying in dark mode

**Cause**: Theme variables not defined for dark mode

**Solution**:
```css
@theme {
  /* Light mode */
  --color-primary: #3B82F6;

  /* Dark mode - must be defined */
  --color-dark-primary: #60A5FA;
}

/* Use in components */
<div className="bg-primary dark:bg-dark-primary">Content</div>
```

---

## Component & Styling Issues

### Issue: CSS Variables Not Available in Custom CSS

**Problem**: `var(--color-primary)` returns undefined

**Cause**: Variables defined outside `@theme` block

**Solution**:
```css
/* ✅ Correct */
@theme {
  --color-primary: #3B82F6;
}

.custom {
  color: var(--color-primary);  /* Works */
}

/* ❌ Wrong */
:root {
  --color-primary: #3B82F6;
}

.custom {
  color: var(--color-primary);  /* Doesn't work with Tailwind */
}
```

---

### Issue: Inline Styles Not Overriding Tailwind Classes

**Problem**: Inline styles ignored when Tailwind classes present

**Cause**: Tailwind specificity is higher

**Solution**: Use `!important` or Tailwind utilities:

```tsx
/* ❌ Wrong */
<div className="bg-primary" style={{ backgroundColor: 'red' }}>
  Still blue (Tailwind wins)
</div>

/* ✅ Correct - use Tailwind */
<div className={isDynamic ? 'bg-red-500' : 'bg-primary'}>
  Correct color
</div>

/* ✅ Correct - use !important if necessary */
<div className="bg-primary" style={{ backgroundColor: 'red !important' }}>
  Red (inline wins)
</div>
```

---

### Issue: Responsive Classes Not Working

**Problem**: `md:text-lg` not applying at medium breakpoint

**Cause**: Incorrect breakpoint syntax or missing responsive prefix

**Solution**:
```tsx
/* ✅ Correct */
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

/* ❌ Wrong - missing breakpoint prefix */
<div className="text-sm text-base lg:text-lg">
  Not responsive at md
</div>

/* ❌ Wrong - incorrect syntax */
<div className="text-sm @md:text-base">
  Wrong syntax
</div>
```

**Breakpoint Reference**:
- `sm:` (640px)
- `md:` (768px)
- `lg:` (1024px)
- `xl:` (1280px)
- `2xl:` (1536px)

---

### Issue: Hover/Focus States Not Working

**Problem**: `hover:bg-primary` not applying on hover

**Cause**: State variant not supported or incorrect syntax

**Solution**:
```tsx
/* ✅ Correct */
<button className="bg-primary hover:opacity-90 focus:ring-2">
  Button
</button>

/* ❌ Wrong - missing state prefix */
<button className="bg-primary bg-opacity-90">
  Not interactive
</button>

/* ❌ Wrong - incorrect syntax */
<button className="bg-primary :hover:opacity-90">
  Wrong syntax
</button>
```

**Available State Variants**:
- `hover:` — Mouse over
- `focus:` — Any focus
- `focus-visible:` — Keyboard focus
- `active:` — Pressed
- `disabled:` — Disabled state
- `group-hover:` — Parent hover
- `first:` — First child
- `last:` — Last child
- `odd:` — Odd child
- `even:` — Even child

---

## Performance Issues

### Issue: Slow Build Times

**Problem**: Build takes longer than expected

**Cause**: Large theme or many custom utilities

**Solution**:
1. Audit `@theme` block for unused variables
2. Remove unused custom CSS
3. Check for duplicate imports
4. Use production build for testing:
```bash
npm run build  # Production build
```

---

### Issue: Large CSS File Size

**Problem**: Generated CSS is larger than expected

**Cause**: Unused utilities or duplicate code

**Solution**:
1. Verify PurgeCSS is enabled (automatic in v4)
2. Check for unused theme variables
3. Remove unused custom CSS
4. Verify no duplicate `@import` statements

---

## Migration Issues

### Issue: v3 Utilities Not Working After Migration

**Problem**: Utilities that worked in v3 don't work in v4

**Cause**: Breaking changes in v4 API

**Solution**: Check v4 migration guide for deprecated utilities

**Common Changes**:
| v3 | v4 | Notes |
|----|----|----|
| `ring-offset-white` | `ring-offset-bg` | Use theme variable |
| `from-blue-500` | `from-primary` | Use theme color |
| `via-blue-500` | `via-primary` | Use theme color |
| `to-blue-500` | `to-primary` | Use theme color |

---

### Issue: Custom Config Not Migrating

**Problem**: Custom theme values from v3 config not working

**Cause**: Not converted to `@theme` block

**Solution**:
```javascript
// v3: tailwind.config.js
module.exports = {
  theme: {
    colors: { primary: '#3B82F6' },
    fontFamily: { heading: 'Inter' }
  }
}
```

```css
/* v4: globals.css */
@theme {
  --color-primary: #3B82F6;
  --font-family-heading: 'Inter', sans-serif;
}
```

---

## Debugging Techniques

### Technique 1: Inspect Generated CSS

Check what utilities Tailwind generated:

```bash
# Build and inspect output
npm run build

# Check generated CSS in .next/static/css/
ls -la .next/static/css/
```

### Technique 2: Enable Debug Mode

Add debug class to see which utilities apply:

```tsx
<div className="debug bg-primary text-white">
  Debug element
</div>
```

Then inspect in browser DevTools to see applied styles.

### Technique 3: Check Theme Variables

Verify theme variables are available:

```tsx
// In browser console
getComputedStyle(document.documentElement).getPropertyValue('--color-primary')
```

### Technique 4: Validate CSS Syntax

Use CSS validator to check for syntax errors:

```bash
# Install CSS validator
npm install -D stylelint

# Run validation
npx stylelint src/app/globals.css
```

---

## Getting Help

### Resources

- **Official Docs**: https://tailwindcss.com/docs
- **v4 Upgrade Guide**: https://tailwindcss.com/docs/upgrade-guide
- **GitHub Issues**: https://github.com/tailwindlabs/tailwindcss/issues
- **Discord Community**: https://discord.gg/tailwindcss

### When Reporting Issues

Include:
1. Minimal reproduction (CodeSandbox or GitHub repo)
2. Tailwind version: `npm list tailwindcss`
3. Node version: `node --version`
4. `globals.css` content
5. Error message or screenshot
6. Expected vs actual behavior
